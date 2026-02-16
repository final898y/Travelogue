<script setup lang="ts">
import { ref } from "vue";
import TripCard from "./components/TripCard.vue";
import BottomNav from "./components/BottomNav.vue";

// Mock data for demonstration
const trips = ref([
  {
    id: 1,
    title: "2024 東京賞櫻之旅",
    startDate: "03/20",
    endDate: "03/24",
    days: 5,
    coverImage:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop",
    countdown: 15,
    status: "upcoming" as const,
  },
  {
    id: 2,
    title: "京都古都漫步",
    startDate: "02/15",
    endDate: "02/20",
    days: 6,
    coverImage:
      "https://images.unsplash.com/photo-1493780474015-ba834ff0ce2f?q=80&w=800&auto=format&fit=crop",
    status: "ongoing" as const,
  },
  {
    id: 3,
    title: "北海道冬季祭典",
    startDate: "01/10",
    endDate: "01/15",
    days: 6,
    coverImage:
      "https://images.unsplash.com/photo-1542641728-6ca359b085f4?q=80&w=800&auto=format&fit=crop",
    status: "finished" as const,
  },
]);
</script>

<template>
  <div
    class="min-h-screen pb-32 bg-cream-light font-sans selection:bg-forest-100"
  >
    <!-- Header -->
    <header
      class="sticky top-0 z-40 bg-cream-light/80 backdrop-blur-md px-6 py-5 flex justify-between items-center"
    >
      <div class="flex items-center gap-2">
        <span class="text-2xl">🌿</span>
        <h1
          class="text-2xl font-rounded font-bold text-forest-800 tracking-tight"
        >
          Travelogue
        </h1>
      </div>
      <button
        class="w-10 h-10 flex items-center justify-center bg-forest-400 text-white rounded-full shadow-soft hover:bg-forest-500 active:scale-90 transition-all cursor-pointer"
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
          class="lucide lucide-plus"
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
      </button>
    </header>

    <!-- Main Content -->
    <main class="px-6 space-y-8 animate-fade-in">
      <!-- Welcome Message -->
      <section class="mt-4">
        <h2 class="text-gray-400 text-sm font-medium mb-1">Welcome back,</h2>
        <p
          class="text-3xl font-rounded font-bold text-forest-900 leading-tight"
        >
          準備好下一次<br />冒險了嗎？
        </p>
      </section>

      <!-- Active Trips -->
      <section class="space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-bold text-forest-800">我的旅程</h3>
          <button
            class="text-forest-400 text-sm font-bold hover:text-forest-600 transition-colors cursor-pointer flex items-center gap-1"
          >
            全部旅程
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
              class="lucide lucide-chevron-right"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>

        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <TripCard v-for="trip in trips" :key="trip.id" v-bind="trip" />
        </div>
      </section>

      <!-- Quick Action Card -->
      <section
        class="card-base bg-forest-50 border-2 border-dashed border-forest-200 !shadow-none py-8 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer hover:bg-forest-100 transition-all"
      >
        <div
          class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-forest-400 shadow-sm mb-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-map-pin"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <h4 class="text-lg font-bold text-forest-800">新增旅程</h4>
        <p class="text-gray-500 text-sm max-w-[200px]">
          開始規劃你的下一個夢想景點
        </p>
      </section>
    </main>

    <!-- Navigation -->
    <BottomNav />
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&family=Varela+Round&display=swap");

:root {
  --font-sans: "Noto Sans TC", sans-serif;
  --font-rounded: "Varela Round", "Noto Sans TC", sans-serif;
}
</style>
