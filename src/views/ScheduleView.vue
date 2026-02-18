<script setup lang="ts">
/**
 * ScheduleView (Page)
 * The main view for a trip's schedule.
 */
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useTripStore } from "../stores/tripStore";
import { useTripDetails } from "../composables/useTripDetails";
import ScheduleHeader from "../components/ui/ScheduleHeader.vue";
import HorizontalDatePicker from "../components/ui/HorizontalDatePicker.vue";
import TimelineItem from "../components/trip/TimelineItem.vue";
import BaseBottomSheet from "../components/ui/BaseBottomSheet.vue";
import ActivityForm from "../components/trip/ActivityForm.vue";
import type { Activity } from "../types/trip";

const router = useRouter();
const route = useRoute();
const tripStore = useTripStore();

const tripId = route.params.id as string;
const trip = computed(() =>
  tripStore.trips.find((t) => String(t.id) === tripId),
);

const selectedDate = ref("");
const isSheetOpen = ref(false);
const currentActivity = ref<Partial<Activity> | null>(null);

// 使用 Composable 處理邏輯
const { dates, currentDayIndex, scheduleItems } = useTripDetails(
  trip,
  selectedDate,
);

const tripTitle = computed(() => trip.value?.title || "載入中...");
const daysToTrip = ref(15);
const weather = { temp: 22, condition: "晴天", icon: "☀️" };
const isSaving = ref(false);

// Set initial date when trip is loaded
onMounted(async () => {
  if (tripStore.trips.length === 0) {
    await tripStore.fetchTrips();
  }
  if (trip.value && !selectedDate.value) {
    selectedDate.value = trip.value.startDate;
  }
});

const goBack = () => {
  router.push("/");
};

const openEditSheet = (activity?: Activity) => {
  currentActivity.value = activity ? { ...activity } : { time: "09:00" };
  isSheetOpen.value = true;
};

const handleSaveActivity = async (updatedActivity: Activity) => {
  if (!tripId || !selectedDate.value || isSaving.value) return;

  try {
    isSaving.value = true;
    await tripStore.updateTripActivity(
      tripId,
      selectedDate.value,
      updatedActivity,
    );
    isSheetOpen.value = false;
  } catch (error) {
    console.error("儲存活動失敗:", error);
    alert("儲存失敗，請稍後再試");
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

  if (!confirm("確定要刪除此行程嗎？")) return;

  try {
    isSaving.value = true;
    await tripStore.deleteTripActivity(
      tripId,
      selectedDate.value,
      currentActivity.value.id,
    );
    isSheetOpen.value = false;
  } catch (error) {
    console.error("刪除活動失敗:", error);
    alert("刪除失敗，請稍後再試");
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen pb-24 bg-cream-light animate-fade-in">
    <!-- Header -->
    <div class="px-6 pt-6">
      <ScheduleHeader
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
            class="lucide lucide-map"
          >
            <path
              d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"
            />
            <path d="M15 5.764v15" />
            <path d="M9 3.236v15" />
          </svg>
          查看地圖
        </button>
      </div>

      <div class="relative">
        <TimelineItem
          v-for="(item, index) in scheduleItems"
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

    <!-- Edit Activity Sheet -->
    <BaseBottomSheet
      :is-open="isSheetOpen"
      :title="currentActivity?.title ? '編輯行程' : '新增行程'"
      @close="isSheetOpen = false"
    >
      <ActivityForm
        v-if="currentActivity"
        :initial-data="currentActivity"
        @save="handleSaveActivity"
        @delete="handleDeleteActivity"
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
