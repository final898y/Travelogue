<script setup lang="ts">
/**
 * ScheduleView (Page)
 * The main view for a trip's schedule.
 */
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useTripStore } from "../stores/tripStore";
import ScheduleHeader from "../components/ui/ScheduleHeader.vue";
import HorizontalDatePicker from "../components/ui/HorizontalDatePicker.vue";
import TimelineItem from "../components/trip/TimelineItem.vue";
import type { DateItem } from "../types/trip";

const router = useRouter();
const route = useRoute();
const tripStore = useTripStore();

const tripId = route.params.id as string;
const trip = computed(() =>
  tripStore.trips.find((t) => String(t.id) === tripId),
);

const tripTitle = computed(() => trip.value?.title || "載入中...");
const daysToTrip = ref(15);
const weather = { temp: 22, condition: "晴天", icon: "☀️" };

// In a real app, these dates would be calculated from trip.startDate and trip.endDate
const dates: DateItem[] = [
  { day: "3/19", weekday: "Tue", fullDate: "2024-03-19" },
  { day: "3/20", weekday: "Wed", fullDate: "2024-03-20" },
  { day: "3/21", weekday: "Thu", fullDate: "2024-03-21" },
  { day: "3/22", weekday: "Fri", fullDate: "2024-03-22" },
  { day: "3/23", weekday: "Sat", fullDate: "2024-03-23" },
];

const selectedDate = ref("2024-03-20");

const scheduleItems = computed(() => trip.value?.scheduleItems || []);

const goBack = () => {
  router.push("/");
};

onMounted(async () => {
  if (tripStore.trips.length === 0) {
    await tripStore.fetchTrips();
  }
});
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
          Day 2 行程安排
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
          :key="index"
          v-bind="item"
        />
      </div>
    </main>

    <!-- FAB: Add Item -->
    <button
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
  </div>
</template>
