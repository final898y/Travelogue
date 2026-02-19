<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTripStore } from "../stores/tripStore";
import BaseBottomSheet from "../components/ui/BaseBottomSheet.vue";
import PreparationForm from "../components/trip/PreparationForm.vue";
import type { Trip, ChecklistItem } from "../types/trip";

const route = useRoute();
const router = useRouter();
const tripStore = useTripStore();
const tripId = route.params.id as string;

const activeTab = ref("todo");
const trip = ref<Trip | null>(null);
const isSheetOpen = ref(false);
const currentItem = ref<Partial<ChecklistItem> | null>(null);
const isSaving = ref(false);

const fetchTripData = async () => {
  if (tripId) {
    trip.value = await tripStore.fetchTripById(tripId);
  }
};

onMounted(fetchTripData);

const preparation = computed(() => trip.value?.preparation || []);
const todos = computed(() =>
  preparation.value.filter((item) => item.category !== "行李"),
);
const luggages = computed(() =>
  preparation.value.filter((item) => item.category === "行李"),
);

const goBack = () => {
  router.push("/");
};

const openEditSheet = (item?: ChecklistItem) => {
  currentItem.value = item
    ? { ...item }
    : {
        category: activeTab.value === "luggage" ? "行李" : "其他",
        isCompleted: false,
      };
  isSheetOpen.value = true;
};

const handleToggle = async (id: string) => {
  if (!tripId || isSaving.value) return;
  try {
    // 立即在本地 UI 更新狀態 (Optimistic UI)
    const localItem = preparation.value.find((i) => i.id === id);
    if (localItem) localItem.isCompleted = !localItem.isCompleted;

    await tripStore.togglePreparationItem(tripId, id);
    // 不一定要重新 fetch，因為 onSnapshot 會處理，但在這裏我們用 fetchTripById 模式
    // 為確保資料同步，仍建議 fetch
    await fetchTripData();
  } catch (error) {
    console.error("更新狀態失敗:", error);
  }
};

const handleSaveItem = async (updatedItem: ChecklistItem) => {
  if (!tripId || isSaving.value) return;

  try {
    isSaving.value = true;
    await tripStore.updateTripPreparationItem(tripId, updatedItem);
    await fetchTripData();
    isSheetOpen.value = false;
  } catch (error) {
    console.error("儲存項目失敗:", error);
    alert("儲存失敗");
  } finally {
    isSaving.value = false;
  }
};

const handleDeleteItem = async () => {
  if (!tripId || !currentItem.value?.id || isSaving.value) return;

  if (!confirm("確定要刪除此項目嗎？")) return;

  try {
    isSaving.value = true;
    await tripStore.deleteTripPreparationItem(tripId, currentItem.value.id);
    await fetchTripData();
    isSheetOpen.value = false;
  } catch (error) {
    console.error("刪除項目失敗:", error);
    alert("刪除失敗");
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
          準備清單
        </h1>
      </div>
      <p class="text-gray-500 text-sm ml-8">出發前的萬全準備</p>
    </header>

    <main class="px-6 mt-4">
      <div class="flex bg-forest-50 p-1 rounded-2xl mb-8">
        <button
          v-for="tab in [
            { id: 'todo', label: '待辦' },
            { id: 'luggage', label: '行李' },
          ]"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex-1 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer"
          :class="
            activeTab === tab.id
              ? 'bg-white text-forest-500 shadow-soft-sm'
              : 'text-gray-400'
          "
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Todo List -->
      <div v-if="activeTab === 'todo'" class="space-y-4">
        <div
          v-for="todo in todos"
          :key="todo.id"
          class="card-base !p-4 flex items-center gap-4 transition-all hover:shadow-soft-md group"
          :class="todo.isCompleted ? 'opacity-50' : ''"
        >
          <button
            @click.stop="handleToggle(todo.id)"
            class="w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer"
            :class="
              todo.isCompleted
                ? 'bg-forest-400 border-forest-400 text-white'
                : 'border-forest-200 bg-white'
            "
          >
            <svg
              v-if="todo.isCompleted"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </button>
          <div @click="openEditSheet(todo)" class="flex-1 cursor-pointer">
            <h4
              class="font-bold text-forest-800"
              :class="todo.isCompleted ? 'line-through' : ''"
            >
              {{ todo.title }}
            </h4>
            <span
              class="text-[9px] bg-forest-100 text-forest-500 px-2 py-0.5 rounded-full font-bold"
              >{{ todo.category }}</span
            >
          </div>
          <button
            @click="openEditSheet(todo)"
            class="opacity-0 group-hover:opacity-100 text-forest-200 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-pencil"
            >
              <path
                d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"
              />
              <path d="m15 5 4 4" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Luggage List -->
      <div v-if="activeTab === 'luggage'" class="space-y-4">
        <div
          v-for="item in luggages"
          :key="item.id"
          class="card-base !p-4 flex items-center gap-4 transition-all hover:shadow-soft-md group"
          :class="item.isCompleted ? 'opacity-50' : ''"
        >
          <button
            @click.stop="handleToggle(item.id)"
            class="w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer"
            :class="
              item.isCompleted
                ? 'bg-earth-400 border-earth-400 text-white'
                : 'border-forest-200 bg-white'
            "
          >
            <svg
              v-if="item.isCompleted"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </button>
          <h4
            @click="openEditSheet(item)"
            class="flex-1 font-bold text-forest-800 cursor-pointer"
            :class="item.isCompleted ? 'line-through' : ''"
          >
            {{ item.title }}
          </h4>
          <button
            @click="openEditSheet(item)"
            class="opacity-0 group-hover:opacity-100 text-forest-200 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-pencil"
            >
              <path
                d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"
              />
              <path d="m15 5 4 4" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="
          (activeTab === 'todo' && todos.length === 0) ||
          (activeTab === 'luggage' && luggages.length === 0)
        "
        class="py-12 flex flex-col items-center text-center"
      >
        <div
          class="w-20 h-20 bg-forest-50 rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner"
        >
          📝
        </div>
        <p class="text-gray-400 text-sm mt-1 font-medium">清單還是空的</p>
      </div>
    </main>

    <!-- FAB: Add Item -->
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

    <!-- Edit Item Sheet -->
    <BaseBottomSheet
      :is-open="isSheetOpen"
      :title="currentItem?.id ? '編輯項目' : '新增項目'"
      @close="isSheetOpen = false"
    >
      <PreparationForm
        v-if="currentItem"
        :initial-data="currentItem"
        @save="handleSaveItem"
        @delete="handleDeleteItem"
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
