<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useCollectionStore } from "../stores/collectionStore";
import BaseBottomSheet from "../components/ui/BaseBottomSheet.vue";
import CollectionForm from "../components/trip/CollectionForm.vue";
import type { Collection, CollectionSource } from "../types/trip";

const route = useRoute();
const router = useRouter();
const collectionStore = useCollectionStore();
const { collections } = storeToRefs(collectionStore);
const tripId = route.params.id as string;

const activeFilter = ref<CollectionSource | "all">("all");
const isSheetOpen = ref(false);
const currentCollection = ref<Partial<Collection> | null>(null);
const isSaving = ref(false);

let unsubscribe: (() => void) | null = null;

onMounted(() => {
  if (tripId) {
    unsubscribe = collectionStore.subscribeToCollections(tripId);
  }
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

const filteredCollections = computed(() => {
  if (activeFilter.value === "all") return collections.value;
  return collections.value.filter((item) => item.source === activeFilter.value);
});

const goBack = () => {
  router.push("/");
};

const openEditSheet = (item?: Collection) => {
  currentCollection.value = item
    ? { ...item }
    : { source: "web", category: "未分類" };
  isSheetOpen.value = true;
};

const handleSaveCollection = async (updatedItem: Collection) => {
  if (!tripId || isSaving.value) return;

  try {
    isSaving.value = true;
    if (updatedItem.id) {
      await collectionStore.updateCollection(
        tripId,
        updatedItem.id,
        updatedItem,
      );
    } else {
      await collectionStore.addCollection(tripId, updatedItem);
    }
    isSheetOpen.value = false;
  } catch (error) {
    console.error("儲存收集失敗:", error);
    alert("儲存失敗，請稍後再試");
  } finally {
    isSaving.value = false;
  }
};

const handleDeleteCollection = async () => {
  if (!tripId || !currentCollection.value?.id || isSaving.value) return;

  if (!confirm("確定要刪除此收集項目嗎？")) return;

  try {
    isSaving.value = true;
    await collectionStore.deleteCollection(tripId, currentCollection.value.id);
    isSheetOpen.value = false;
  } catch (error) {
    console.error("刪除收集失敗:", error);
    alert("刪除失敗，請稍後再試");
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen pb-32 animate-fade-in bg-cream-light/30">
    <!-- Header -->
    <header class="px-6 pt-8 pb-4">
      <div class="flex items-center gap-2 mb-1">
        <button
          @click="goBack"
          class="p-1 -ml-1 text-forest-300 hover:text-forest-500 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <h1 class="text-2xl font-rounded font-bold text-forest-800">
          資料收集
        </h1>
      </div>
      <p class="text-gray-500 text-sm ml-8">整理 Threads、IG 與網頁靈感</p>

      <!-- Filters -->
      <div class="flex gap-2 mt-6 overflow-x-auto no-scrollbar pb-2">
        <button
          v-for="f in ['all', 'threads', 'instagram', 'web', 'youtube']"
          :key="f"
          @click="activeFilter = f as any"
          class="px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap"
          :class="
            activeFilter === f
              ? 'bg-forest-500 text-white shadow-soft'
              : 'bg-white text-forest-400 border border-forest-100'
          "
        >
          {{ f.toUpperCase() }}
        </button>
      </div>
    </header>

    <main class="px-6 mt-2">
      <div
        v-if="filteredCollections.length === 0"
        class="py-20 text-center bg-white/50 rounded-3xl border-2 border-dashed border-forest-100"
      >
        <div class="text-4xl mb-3">🔖</div>
        <p class="text-gray-500 font-medium">
          還沒有收集任何資料<br />點擊下方按鈕開始記錄
        </p>
      </div>

      <div class="grid gap-4">
        <div
          v-for="item in filteredCollections"
          :key="item.id"
          @click="openEditSheet(item)"
          class="card-base group cursor-pointer hover:shadow-soft-lg active:scale-[0.98] transition-all"
        >
          <div class="flex justify-between items-start mb-2">
            <div class="text-forest-400">
              <svg
                v-if="item.source === 'threads'"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-at-sign"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
              </svg>
              <svg
                v-if="item.source === 'instagram'"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-instagram"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              <svg
                v-if="item.source === 'web'"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-globe"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20" />
                <path d="M2 12h20" />
              </svg>
              <svg
                v-if="item.source === 'youtube'"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-youtube"
              >
                <path
                  d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"
                />
                <path d="m10 15 5-3-5-3z" />
              </svg>
              <svg
                v-if="item.source === 'other'"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-more-horizontal"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </div>
            <a
              :href="item.url"
              target="_blank"
              @click.stop
              class="text-forest-200 hover:text-forest-500 transition-colors p-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
          <h3
            class="font-bold text-forest-800 mb-1 leading-tight group-hover:text-forest-600 transition-colors"
          >
            {{ item.title }}
          </h3>
          <p
            v-if="item.note"
            class="text-xs text-gray-500 line-clamp-2 mb-2 italic"
          >
            "{{ item.note }}"
          </p>
          <div class="flex items-center gap-2">
            <span
              class="px-2 py-0.5 bg-forest-50 text-forest-400 rounded text-[10px] font-bold"
            >
              {{ item.category }}
            </span>
          </div>
        </div>
      </div>
    </main>

    <!-- FAB -->
    <button
      @click="openEditSheet()"
      class="fixed bottom-28 right-6 w-14 h-14 bg-forest-400 text-white rounded-2xl shadow-soft-lg hover:bg-forest-500 hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer z-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-plus"
      >
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </svg>
    </button>

    <!-- Edit Collection Sheet -->
    <BaseBottomSheet
      :is-open="isSheetOpen"
      :title="currentCollection?.id ? '編輯收集' : '新增收集'"
      @close="isSheetOpen = false"
    >
      <CollectionForm
        v-if="currentCollection"
        :initial-data="currentCollection"
        @save="handleSaveCollection"
        @delete="handleDeleteCollection"
      />
    </BaseBottomSheet>

    <!-- Global Loading Overlay -->
    <div
      v-if="isSaving"
      class="fixed inset-0 bg-white/50 backdrop-blur-sm z-[200] flex items-center justify-center"
    >
      <div
        class="w-12 h-12 border-4 border-forest-100 border-t-forest-400 rounded-full animate-spin"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
