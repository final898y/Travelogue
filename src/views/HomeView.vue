<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useTripStore } from "../stores/tripStore";
import { useAuthStore } from "../stores/authStore";
import { useUIStore } from "../stores/uiStore";
import { importSeedData } from "../services/seed";
import { backupService } from "../services/backupService";
import TripCard from "../components/trip/TripCard.vue";
import BaseBottomSheet from "../components/ui/BaseBottomSheet.vue";
import TripForm from "../components/trip/TripForm.vue";
import Logo from "../assets/Logo.svg";
import { Plus, ChevronRight, MapPin, Upload } from "../assets/icons";
import type { Trip } from "../types/trip";

const router = useRouter();
const tripStore = useTripStore();
const authStore = useAuthStore();
const uiStore = useUIStore();
const isSeeding = ref(false);
const isSheetOpen = ref(false);
const isSaving = ref(false);
const isFormDirty = ref(false);
const editingTrip = ref<Trip | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

let unsubscribe: (() => void) | null = null;

onMounted(() => {
  // Subscribe to real-time updates from Firebase
  unsubscribe = tripStore.subscribeToTrips();
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

const navigateToTrip = (tripId: number | string) => {
  if (!tripId) {
    console.error("導航失敗：tripId 缺失");
    return;
  }
  router.push({ name: "plan", params: { id: tripId } });
};

const handleExportTrip = async (tripId: string | number, title: string) => {
  try {
    isSaving.value = true;
    await backupService.exportSingleTrip(tripId.toString(), title);
    uiStore.showToast("旅程資料匯出成功", "success");
  } catch (error) {
    console.error("Export Error:", error);
    uiStore.showToast("匯出失敗", "error");
  } finally {
    isSaving.value = false;
  }
};

const triggerImport = () => {
  fileInput.value?.click();
};

const handleImportTrip = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file || !authStore.user) return;

  try {
    isSaving.value = true;
    const newTripId = await backupService.importSingleTrip(
      authStore.user.uid,
      file,
    );
    uiStore.showToast("旅程匯入成功！", "success");
    navigateToTrip(newTripId);
  } catch (error) {
    console.error("Import Error:", error);
    uiStore.showToast("匯入失敗，格式不符", "error");
  } finally {
    isSaving.value = false;
    target.value = "";
  }
};

const openAddSheet = () => {
  editingTrip.value = null;
  isFormDirty.value = false;
  isSheetOpen.value = true;
};

const handleEditTrip = (tripId: string | number) => {
  const trip = tripStore.trips.find((t) => t.id === tripId);
  if (trip) {
    editingTrip.value = { ...trip };
    isFormDirty.value = false;
    isSheetOpen.value = true;
  }
};

const handleDeleteTrip = async (tripId: string | number) => {
  const confirmed = await uiStore.showConfirm({
    title: "確定要刪除嗎？",
    message: "這趟旅程及其所有相關行程資料將會永久移除，此動作無法復原。",
    okText: "刪除",
    cancelText: "保留",
  });

  if (confirmed) {
    try {
      isSaving.value = true;
      await tripStore.deleteTrip(tripId.toString());
      uiStore.showToast("旅程已成功刪除", "success");
    } catch (error) {
      console.error("刪除旅程失敗:", error);
      uiStore.showToast("刪除失敗，請稍後再試。", "error");
    } finally {
      isSaving.value = false;
    }
  }
};

const handleCloseSheet = () => {
  isSheetOpen.value = false;
  isFormDirty.value = false;
};

const handleSaveTrip = async (
  tripData: Omit<Trip, "id" | "userId" | "createdAt">,
) => {
  if (!authStore.user || isSaving.value) return;

  try {
    isSaving.value = true;
    if (editingTrip.value) {
      await tripStore.updateTrip(editingTrip.value.id, tripData);
      uiStore.showToast("旅程更新成功", "success");
    } else {
      const newTripId = await tripStore.addTrip(tripData);
      uiStore.showToast("新的旅程已建立！", "success");
      // 成功後自動導航至新旅程的行程頁面 (僅限新增)
      navigateToTrip(newTripId);
    }
    handleCloseSheet();
  } catch (error) {
    console.error("儲存旅程失敗:", error);
    uiStore.showToast("儲存失敗，請檢查網絡連接。", "error");
  } finally {
    isSaving.value = false;
  }
};
const handleSeed = async () => {
  if (!authStore.user) return;

  const confirmed = await uiStore.showConfirm({
    title: "導入預設資料？",
    message: "這將會為您填入多筆精選的範例旅程，幫助您快速上手。",
    okText: "開始導入",
    cancelText: "先不要",
  });

  if (confirmed) {
    isSeeding.value = true;
    try {
      await importSeedData(authStore.user.uid);
      uiStore.showToast("資料導入成功！", "success");
    } catch (err) {
      uiStore.showToast("導入失敗: " + (err as Error).message, "error");
    } finally {
      isSeeding.value = false;
    }
  }
};
</script>

<template>
  <div class="pb-32">
    <!-- Hidden File Input for Single Trip Import -->
    <input
      type="file"
      ref="fileInput"
      class="hidden"
      accept=".json"
      @change="handleImportTrip"
    />

    <!-- Header -->
    <header
      class="sticky top-0 z-40 bg-cream-light/80 backdrop-blur-md px-6 py-5 flex justify-between items-center"
    >
      <div class="flex items-center">
        <img :src="Logo" alt="Travelogue" class="h-10 w-auto" />
      </div>
      <div class="flex gap-2">
        <button
          @click="handleSeed"
          :disabled="isSeeding"
          class="px-3 py-1 text-xs font-bold bg-forest-100 text-forest-600 rounded-full hover:bg-forest-200 transition-colors disabled:opacity-50"
        >
          {{ isSeeding ? "導入中..." : "初始化資料" }}
        </button>
        <button
          @click="triggerImport"
          class="w-10 h-10 flex items-center justify-center bg-forest-50 text-forest-400 rounded-full shadow-soft hover:bg-forest-100 active:scale-90 transition-all cursor-pointer"
          title="匯入行程"
        >
          <Upload :size="20" :stroke-width="2.5" />
        </button>
        <button
          @click="openAddSheet"
          class="w-10 h-10 flex items-center justify-center bg-forest-400 text-white rounded-full shadow-soft hover:bg-forest-500 active:scale-90 transition-all cursor-pointer"
          title="新增旅程"
        >
          <Plus :size="24" :stroke-width="2.5" />
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="px-6 space-y-8 animate-fade-in">
      <!-- Loading State -->
      <section v-if="tripStore.loading" class="py-20 text-center">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-forest-400 border-t-transparent"
        ></div>
        <p class="mt-2 text-gray-500 font-medium">載入旅程中...</p>
      </section>

      <!-- Welcome Message -->
      <section v-else class="mt-4">
        <h2 class="text-gray-400 text-sm font-medium mb-1">Welcome back,</h2>
        <p
          class="text-3xl font-rounded font-bold text-forest-900 leading-tight"
        >
          準備好下一次<br />冒險了嗎？
        </p>
      </section>

      <!-- Active Trips -->
      <section v-if="!tripStore.loading" class="space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-bold text-forest-800">我的旅程</h3>
          <button
            class="text-forest-400 text-sm font-bold hover:text-forest-600 transition-colors cursor-pointer flex items-center gap-1"
          >
            全部旅程
            <ChevronRight :size="16" />
          </button>
        </div>

        <div
          v-if="tripStore.trips.length > 0"
          class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <TripCard
            v-for="trip in tripStore.trips"
            :key="trip.id"
            v-bind="trip"
            @click="navigateToTrip(trip.id)"
            @edit="handleEditTrip"
            @delete="handleDeleteTrip"
            @export="handleExportTrip"
          />
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="py-12 flex flex-col items-center text-center bg-white/50 rounded-3xl border-2 border-dashed border-forest-100"
        >
          <div class="text-4xl mb-3">🗺️</div>
          <p class="text-gray-500 font-medium">
            還沒有任何旅程，<br />點擊上方按鈕開始規劃吧！
          </p>
        </div>
      </section>

      <!-- Quick Action Card -->
      <section
        @click="openAddSheet"
        class="card-base bg-forest-50 border-2 border-dashed border-forest-200 !shadow-none py-8 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer hover:bg-forest-100 transition-all"
      >
        <div
          class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-forest-400 shadow-sm mb-2"
        >
          <MapPin :size="24" />
        </div>
        <h4 class="text-lg font-bold text-forest-800">新增旅程</h4>
        <p class="text-gray-500 text-sm max-w-[200px]">
          開始規劃你的下一個夢想景點
        </p>
      </section>
    </main>

    <!-- Add/Edit Trip Sheet -->
    <BaseBottomSheet
      :is-open="isSheetOpen"
      :has-unsaved-changes="isFormDirty"
      :title="editingTrip ? '編輯旅程' : '規劃新的旅程'"
      @close="handleCloseSheet"
    >
      <TripForm
        :initial-data="editingTrip || undefined"
        @save="handleSaveTrip"
        @cancel="handleCloseSheet"
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
