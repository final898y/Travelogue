<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useTripStore } from "../stores/tripStore";
import type { Trip } from "../types/trip";

const route = useRoute();
const tripStore = useTripStore();
const tripId = route.params.id as string;

const trip = ref<Trip | null>(null);

onMounted(async () => {
  if (tripId) {
    trip.value = await tripStore.fetchTripById(tripId);
  }
});

const bookings = computed(() => trip.value?.bookings || []);
</script>

<template>
  <div class="min-h-screen pb-32 animate-fade-in">
    <!-- Bookings Content -->
    <header class="px-6 pt-8 pb-4">
      <h1 class="text-2xl font-rounded font-bold text-forest-800">預訂行程</h1>
      <p class="text-gray-500 text-sm">管理你的機票、住宿與票券</p>
    </header>

    <main class="px-6 space-y-6 mt-4">
      <div
        v-if="bookings.length === 0"
        class="py-20 text-center bg-white/50 rounded-3xl border-2 border-dashed border-forest-100"
      >
        <div class="text-4xl mb-3">🎫</div>
        <p class="text-gray-500 font-medium">還沒有任何預訂資料</p>
      </div>

      <div
        v-for="booking in bookings"
        :key="booking.id"
        class="card-base !p-0 overflow-hidden"
      >
        <div v-if="booking.type === 'flight'" class="flex flex-col">
          <div
            class="bg-forest-400 p-4 text-white flex justify-between items-center"
          >
            <span class="font-bold">{{ booking.title }}</span>
            <span class="text-xs opacity-80">{{ booking.dateTime }}</span>
          </div>
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <div class="text-center flex-1">
                <div class="text-3xl font-bold text-forest-800">
                  {{ booking.location?.split("->")?.[0]?.trim() || "---" }}
                </div>
              </div>
              <div class="flex-1 flex flex-col items-center px-4">
                <div
                  class="w-full border-t-2 border-dashed border-forest-200 relative"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="text-forest-400 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90"
                  >
                    <path
                      d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                    />
                  </svg>
                </div>
              </div>
              <div class="text-center flex-1">
                <div class="text-3xl font-bold text-forest-800">
                  {{ booking.location?.split("->")?.[1]?.trim() || "---" }}
                </div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
              <div>
                <div class="text-[10px] text-gray-400 uppercase font-bold">
                  Confirmation
                </div>
                <div class="text-lg font-bold text-forest-700">
                  {{ booking.confirmationNo }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-[10px] text-gray-400 uppercase font-bold">
                  Status
                </div>
                <div
                  class="text-sm font-bold"
                  :class="
                    booking.isConfirmed ? 'text-forest-500' : 'text-coral-red'
                  "
                >
                  {{ booking.isConfirmed ? "已確認" : "處理中" }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="p-6">
          <div class="flex items-start gap-4">
            <div
              class="w-12 h-12 bg-lavender/20 rounded-xl flex items-center justify-center text-lavender flex-shrink-0"
            >
              <svg
                v-if="booking.type === 'hotel'"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M2 20h20" />
                <path d="M7 20v-5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v5" />
                <path d="M11 17h2" />
                <path d="M12 4v4" />
                <path d="M15 8H9a2 2 0 0 0-2 2v10" />
                <path d="M17 10v10" />
                <path d="M9 4h6" />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="1" y="3" width="22" height="18" rx="2" ry="2" />
                <line x1="1" y1="9" x2="23" y2="9" />
                <line x1="1" y1="15" x2="23" y2="15" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-forest-800">{{ booking.title }}</h3>
              <p class="text-sm text-gray-500">{{ booking.location }}</p>
              <div class="mt-4 flex justify-between items-end">
                <div class="space-y-1">
                  <div class="text-[10px] text-gray-400 uppercase font-bold">
                    Time
                  </div>
                  <div class="text-sm font-medium text-forest-700">
                    {{ booking.dateTime }}
                  </div>
                </div>
                <div
                  v-if="booking.confirmationNo"
                  class="text-xs font-bold text-forest-400 bg-forest-50 px-2 py-1 rounded"
                >
                  #{{ booking.confirmationNo }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
