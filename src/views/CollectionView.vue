<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useCollectionStore } from "../stores/collectionStore";
import { useUIStore } from "../stores/uiStore";
import BaseBottomSheet from "../components/ui/BaseBottomSheet.vue";
import CollectionForm from "../components/trip/CollectionForm.vue";
import {
  ChevronLeft,
  AtSign,
  Instagram,
  Globe,
  Youtube,
  MoreHorizontal,
  Plus,
  MapPin,
  Bookmark,
  ExternalLink,
} from "../assets/icons";
import type { Collection, CollectionSource } from "../types/trip";

const route = useRoute();
const router = useRouter();
const collectionStore = useCollectionStore();
const uiStore = useUIStore();
const { collections, allTags } = storeToRefs(collectionStore);
const tripId = route.params.id as string;

const activeFilter = ref<CollectionSource | "all">("all");
const activeTag = ref<string | null>(null);
const isSheetOpen = ref(false);
const isFormDirty = ref(false);
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
  let result = collections.value;

  // 來源篩選
  if (activeFilter.value !== "all") {
    result = result.filter((item) => item.source === activeFilter.value);
  }

  // 標籤篩選
  if (activeTag.value) {
    result = result.filter((item) => item.tags?.includes(activeTag.value!));
  }

  return result;
});

const toggleTag = (tag: string) => {
  if (activeTag.value === tag) {
    activeTag.value = null;
  } else {
    activeTag.value = tag;
  }
};

const goBack = () => {
  router.push("/");
};

const openEditSheet = (item?: Collection) => {
  isFormDirty.value = false;
  currentCollection.value = item
    ? { ...item, tags: item.tags || [] }
    : { source: "web", category: "未分類", tags: [] };
  isSheetOpen.value = true;
};

const handleCloseSheet = () => {
  isSheetOpen.value = false;
  isFormDirty.value = false;
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
      uiStore.showToast("更新成功", "success");
    } else {
      await collectionStore.addCollection(tripId, updatedItem);
      uiStore.showToast("已加入收藏", "success");
    }
    handleCloseSheet();
  } catch (error) {
    console.error("儲存收集失敗:", error);
    uiStore.showToast("儲存失敗，請稍後再試", "error");
  } finally {
    isSaving.value = false;
  }
};

const handleDeleteCollection = async () => {
  if (!tripId || !currentCollection.value?.id || isSaving.value) return;

  const confirmed = await uiStore.showConfirm({
    title: "移除此收藏？",
    message: "確定要移除這個靈感收集項目嗎？",
    okText: "移除",
    cancelText: "保留",
  });

  if (confirmed) {
    try {
      isSaving.value = true;
      await collectionStore.deleteCollection(
        tripId,
        currentCollection.value.id,
      );
      uiStore.showToast("已移除收藏", "success");
      handleCloseSheet();
    } catch (error) {
      console.error("刪除收集失敗:", error);
      uiStore.showToast("刪除失敗，請稍後再試", "error");
    } finally {
      isSaving.value = false;
    }
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
          <ChevronLeft :size="24" :stroke-width="2.5" />
        </button>
        <h1 class="text-2xl font-rounded font-bold text-forest-800">
          資料收集
        </h1>
      </div>
      <p class="text-gray-500 text-sm ml-8">整理 Threads、IG 與網頁靈感</p>

      <!-- Filters -->
      <div class="space-y-3 mt-6">
        <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
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

        <!-- Tag Filters -->
        <div class="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <template v-if="allTags.length > 0">
            <!-- Reset Tag Filter -->
            <button
              @click="activeTag = null"
              class="px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border-2"
              :class="
                activeTag === null
                  ? 'bg-forest-400 text-white border-forest-400 shadow-soft-sm'
                  : 'bg-white text-forest-300 border-forest-50'
              "
            >
              # 全部
            </button>
            <button
              v-for="tag in allTags"
              :key="tag"
              @click="toggleTag(tag)"
              class="px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border-2"
              :class="
                activeTag === tag
                  ? 'bg-forest-400 text-white border-forest-400 shadow-soft-sm'
                  : 'bg-white text-forest-300 border-forest-50'
              "
            >
              #{{ tag }}
            </button>
          </template>
          <div
            v-else
            class="px-4 py-1.5 rounded-full bg-forest-50/30 text-[10px] text-forest-200 border border-dashed border-forest-100 whitespace-nowrap"
          >
            # 新增標籤即可在此篩選
          </div>
        </div>
      </div>
    </header>

    <main class="px-6 mt-2">
      <div
        v-if="filteredCollections.length === 0"
        class="py-20 text-center bg-white/50 rounded-3xl border-2 border-dashed border-forest-100"
      >
        <div class="text-forest-200 mb-2 flex justify-center">
          <Bookmark :size="40" stroke-width="1.5" />
        </div>
        <p class="text-gray-500 font-medium">
          沒有符合條件的項目<br />調整篩選或新增靈感
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
              <AtSign v-if="item.source === 'threads'" :size="20" />
              <Instagram v-if="item.source === 'instagram'" :size="20" />
              <Globe v-if="item.source === 'web'" :size="20" />
              <Youtube v-if="item.source === 'youtube'" :size="20" />
              <MoreHorizontal v-if="item.source === 'other'" :size="20" />
            </div>
            <div class="flex gap-1">
              <a
                v-if="item.websiteUrl"
                :href="item.websiteUrl"
                target="_blank"
                @click.stop
                class="text-forest-200 hover:text-forest-500 transition-colors p-1"
                title="官方網站/訂餐"
              >
                <ExternalLink :size="18" />
              </a>
              <a
                v-if="item.mapUrl"
                :href="item.mapUrl"
                target="_blank"
                @click.stop
                class="text-forest-200 hover:text-forest-500 transition-colors p-1"
                title="開啟地圖"
              >
                <MapPin :size="18" />
              </a>
            </div>
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
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="px-2 py-0.5 bg-forest-50 text-forest-400 rounded text-[10px] font-bold"
            >
              {{ item.category }}
            </span>
            <!-- Item Tags -->
            <span
              v-for="tag in item.tags"
              :key="tag"
              class="text-[10px] text-forest-300 font-medium"
            >
              #{{ tag }}
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
      <Plus :size="28" :stroke-width="2.5" />
    </button>

    <!-- Edit Collection Sheet -->
    <BaseBottomSheet
      :is-open="isSheetOpen"
      :title="currentCollection?.id ? '編輯收集' : '新增收集'"
      :has-unsaved-changes="isFormDirty"
      @close="handleCloseSheet"
    >
      <CollectionForm
        v-if="currentCollection"
        :initial-data="currentCollection"
        @save="handleSaveCollection"
        @delete="handleDeleteCollection"
        @update:dirty="isFormDirty = $event"
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
