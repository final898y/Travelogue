<script setup lang="ts">
/**
 * PlanView (Page)
 * The main view for a trip's plan.
 */
import { ref, computed, onMounted, onUnmounted, toRefs } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useTripStore } from "../stores/tripStore";
import { usePlanStore } from "../stores/planStore";
import { useUIStore } from "../stores/uiStore";
import { useTripDetails } from "../composables/useTripDetails";
import PlanHeader from "../components/ui/PlanHeader.vue";
import HorizontalDatePicker from "../components/ui/HorizontalDatePicker.vue";
import TimelineItem from "../components/trip/TimelineItem.vue";
import BaseBottomSheet from "../components/ui/BaseBottomSheet.vue";
import ActivityForm from "../components/trip/ActivityForm.vue";
import { Map, Plus } from "../assets/icons";
import type { Activity } from "../types/trip";

const router = useRouter();
const route = useRoute();
const tripStore = useTripStore();
const planStore = usePlanStore();
const uiStore = useUIStore();
const { currentTripPlans } = toRefs(planStore);

const tripId = route.params.id as string;
const trip = computed(() =>
  tripStore.trips.find((t) => String(t.id) === tripId),
);

const selectedDate = ref("");
const isSheetOpen = ref(false);
const isFormDirty = ref(false);
const currentActivity = ref<Partial<Activity> | null>(null);

// 使用 Composable 處理邏輯
const { dates, currentDayIndex, planItems } = useTripDetails(
  trip,
  currentTripPlans,
  selectedDate,
);

const tripTitle = computed(() => trip.value?.title || "載入中...");
const daysToTrip = ref(15);
const weather = { temp: 22, condition: "晴天", icon: "☀️" };
const isSaving = ref(false);

let unsubscribePlans: (() => void) | null = null;

// Set initial date when trip is loaded
onMounted(async () => {
  if (tripStore.trips.length === 0) {
    // 若直接進入此頁面，啟動訂閱以獲取旅程清單
    tripStore.subscribeToTrips();
  }
  if (trip.value && !selectedDate.value) {
    selectedDate.value = trip.value.startDate;
  }

  // 監聽行程子集合
  if (tripId) {
    unsubscribePlans = planStore.subscribeToPlans(tripId);
  }
});

onUnmounted(() => {
  if (unsubscribePlans) unsubscribePlans();
});

const goBack = () => {
  router.push("/");
};

const openEditSheet = (activity?: Activity) => {
  isFormDirty.value = false;
  if (activity) {
    currentActivity.value = { ...activity };
  } else {
    // 新增模式：根據現有活動推算預設時間
    let defaultTime = "09:00";
    const items = planItems.value;
    if (items && items.length > 0) {
      const lastActivity = items[items.length - 1];
      if (lastActivity && lastActivity.time) {
        try {
          const parts = lastActivity.time.split(":").map(Number);
          if (
            parts.length >= 1 &&
            typeof parts[0] === "number" &&
            !isNaN(parts[0])
          ) {
            const hours = parts[0];
            const minutes =
              parts.length >= 2 &&
              typeof parts[1] === "number" &&
              !isNaN(parts[1])
                ? parts[1]
                : 0;
            const nextHour = (hours + 1) % 24;
            defaultTime = `${String(nextHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
          }
        } catch (e) {
          console.warn("解析最後活動時間失敗，使用預設值 09:00", e);
        }
      }
    }
    currentActivity.value = { time: defaultTime };
  }
  isSheetOpen.value = true;
};

const handleCloseSheet = () => {
  isSheetOpen.value = false;
  isFormDirty.value = false;
};

const handleSaveActivity = async (updatedActivity: Activity) => {
  if (!tripId || !selectedDate.value || isSaving.value) return;

  try {
    isSaving.value = true;
    await planStore.updateTripActivity(
      tripId,
      selectedDate.value,
      updatedActivity,
    );
    uiStore.showToast("行程儲存成功", "success");
    handleCloseSheet();
  } catch (error) {
    console.error("儲存活動失敗:", error);
    uiStore.showToast("儲存失敗，請稍後再試", "error");
  } finally {
    isSaving.value = false;
  }
};

const handleDeleteActivity = async () => {
  if (
    !tripId ||
    !selectedDate.value ||
    !currentActivity.value?.id ||
    isSaving.value
  )
    return;

  const confirmed = await uiStore.showConfirm({
    title: "確定刪除此行程？",
    message: "此動作將永久移除該行程活動，無法復原。",
    okText: "刪除",
    cancelText: "取消",
  });

  if (confirmed) {
    try {
      isSaving.value = true;
      await planStore.deleteTripActivity(
        tripId,
        selectedDate.value,
        currentActivity.value.id,
      );
      uiStore.showToast("行程已刪除", "success");
      handleCloseSheet();
    } catch (error) {
      console.error("刪除活動失敗:", error);
      uiStore.showToast("刪除失敗，請稍後再試", "error");
    } finally {
      isSaving.value = false;
    }
  }
};
</script>

<template>
  <div class="min-h-screen pb-24 bg-cream-light animate-fade-in">
    <!-- Header -->
    <div class="px-6 pt-6">
      <PlanHeader
        :title="tripTitle"
        :days-to-trip="daysToTrip"
        :weather="weather"
        @click-back="goBack"
      />
    </div>

    <!-- Date Picker -->
    <div class="mt-4 px-5">
      <HorizontalDatePicker :dates="dates" v-model="selectedDate" />
    </div>

    <!-- Timeline Content -->
    <main class="mt-6 px-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-rounded font-bold text-forest-800">
          Day {{ currentDayIndex }} 行程安排
        </h3>
        <button
          class="text-forest-400 text-xs font-bold hover:text-forest-600 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Map :size="16" />
          查看地圖
        </button>
      </div>

      <div class="relative">
        <TimelineItem
          v-for="(item, index) in planItems"
          :key="item.id || index"
          v-bind="item"
          @click-item="openEditSheet(item)"
        />
      </div>
    </main>

    <!-- FAB: Add Item -->
    <button
      @click="openEditSheet()"
      class="fixed bottom-28 right-6 w-14 h-14 bg-forest-400 text-white rounded-2xl shadow-soft-lg hover:bg-forest-500 hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer z-50"
    >
      <Plus :size="28" :stroke-width="2.5" />
    </button>

    <!-- Edit Activity Sheet -->
    <BaseBottomSheet
      :is-open="isSheetOpen"
      :title="currentActivity?.title ? '編輯行程' : '新增行程'"
      :has-unsaved-changes="isFormDirty"
      @close="handleCloseSheet"
    >
      <ActivityForm
        v-if="currentActivity"
        :initial-data="currentActivity"
        @save="handleSaveActivity"
        @delete="handleDeleteActivity"
        @update:dirty="isFormDirty = $event"
      />
    </BaseBottomSheet>

    <!-- Global Loading (Optional) -->
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
