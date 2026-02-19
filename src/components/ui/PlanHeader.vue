<script setup lang="ts">
/**
 * PlanHeader Component
 * Displays trip title, countdown, and current weather.
 */
interface Props {
  title: string;
  daysToTrip: number;
  weather: {
    temp: number;
    condition: string;
    icon: string;
  };
}

defineProps<Props>();

const emit = defineEmits(["click-back"]);
</script>

<template>
  <div class="space-y-4 animate-slide-up">
    <!-- Back Button & Title Area -->

    <div class="flex items-center justify-between">
      <button
        @click="emit('click-back')"
        class="p-2 -ml-2 text-forest-500 hover:bg-forest-50 rounded-full transition-colors cursor-pointer"
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
          class="lucide lucide-arrow-left"
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
      </button>
      <div class="flex gap-2">
        <button
          class="p-2 text-forest-500 hover:bg-forest-50 rounded-full transition-colors cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
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
        </button>
        <button
          class="p-2 text-forest-500 hover:bg-forest-50 rounded-full transition-colors cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-more-vertical"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Trip Info Card -->
    <div
      class="card-base bg-white/60 backdrop-blur-sm border border-white/40 !p-5 flex justify-between items-center"
    >
      <div class="space-y-1">
        <h2 class="text-xs font-bold text-forest-300 uppercase tracking-widest">
          Upcoming Trip
        </h2>
        <p class="text-xl font-rounded font-bold text-forest-900">
          {{ title }}
        </p>
        <div
          class="flex items-center gap-1.5 text-honey-orange font-bold text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-clock"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>距離出發還有 {{ daysToTrip }} 天</span>
        </div>
      </div>

      <!-- Weather Badge -->

      <div class="flex flex-col items-end gap-1">
        <div class="text-forest-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-sun"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        </div>

        <div class="text-right">
          <p
            class="text-lg font-rounded font-bold text-forest-800 leading-none"
          >
            {{ weather.temp }}°C
          </p>
          <p class="text-[10px] font-medium text-forest-400">
            {{ weather.condition }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
