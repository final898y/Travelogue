<script setup lang="ts">
/**
 * TimelineItem Component
 * Represents a single activity on the schedule.
 */
import type { Activity } from "../../types/trip";

defineProps<Activity>();

const categoryStyles = {
  sight: { color: "bg-forest-400", textColor: "text-forest-700" },

  food: { color: "bg-earth-300", textColor: "text-earth-700" },

  transport: { color: "bg-sky-blue", textColor: "text-blue-700" },

  hotel: { color: "bg-lavender", textColor: "text-purple-700" },
};
</script>

<template>
  <div class="flex gap-4 group">
    <!-- Left Timeline Pillar -->

    <div class="flex flex-col items-center">
      <!-- Time Badge -->

      <div class="text-[10px] font-bold text-forest-300 mb-1 font-mono">
        {{ time }}
      </div>

      <!-- Connector Node -->

      <div
        class="w-4 h-4 rounded-full border-2 border-white shadow-sm z-10"
        :class="categoryStyles[category].color"
      ></div>

      <!-- Vertical Line -->

      <div
        v-if="!isLast"
        class="flex-1 w-0.5 border-l-2 border-dashed border-forest-100 my-1"
      ></div>
    </div>

    <!-- Right Content Card -->

    <div class="flex-1 pb-8">
      <div
        class="card-base !p-4 group-hover:shadow-soft-lg transition-all"
        :class="
          options
            ? 'border-2 border-dashed border-forest-100 bg-forest-50/30'
            : ''
        "
      >
        <div class="flex justify-between items-start">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <div :class="categoryStyles[category].textColor">
                <!-- Lucide Icons mapping -->

                <svg
                  v-if="category === 'sight'"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-landmark"
                >
                  <line x1="3" y1="22" x2="21" y2="22" />
                  <line x1="6" y1="18" x2="6" y2="11" />
                  <line x1="10" y1="18" x2="10" y2="11" />
                  <line x1="14" y1="18" x2="14" y2="11" />
                  <line x1="18" y1="18" x2="18" y2="11" />
                  <polygon points="12 2 20 7 4 7 12 2" />
                </svg>

                <svg
                  v-if="category === 'food'"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-utensils"
                >
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>

                <svg
                  v-if="category === 'transport'"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-car"
                >
                  <path
                    d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"
                  />
                  <circle cx="7" cy="17" r="2" />
                  <path d="M9 17h6" />
                  <circle cx="17" cy="17" r="2" />
                </svg>

                <svg
                  v-if="category === 'hotel'"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-bed"
                >
                  <path d="M2 4v16" />
                  <path d="M2 8h18a2 2 0 0 1 2 2v10" />
                  <path d="M2 17h20" />
                  <path d="M6 8v9" />
                </svg>
              </div>

              <h4 class="font-bold text-forest-800">{{ title }}</h4>
            </div>

            <p
              v-if="location"
              class="text-xs text-gray-400 flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
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
              {{ location }}
            </p>
          </div>

          <!-- Drag Handle (Simulated) -->
          <button
            class="text-forest-100 group-hover:text-forest-300 transition-colors cursor-grab active:cursor-grabbing"
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
              class="lucide lucide-grip-vertical"
            >
              <circle cx="9" cy="12" r="1" />
              <circle cx="9" cy="5" r="1" />
              <circle cx="9" cy="19" r="1" />
              <circle cx="15" cy="12" r="1" />
              <circle cx="15" cy="5" r="1" />
              <circle cx="15" cy="19" r="1" />
            </svg>
          </button>
        </div>

        <!-- Options Block (if any) -->
        <div v-if="options" class="mt-3 space-y-2">
          <p class="text-[10px] font-bold text-forest-300 uppercase">
            備選方案
          </p>
          <div
            v-for="(opt, idx) in options"
            :key="idx"
            class="p-2 rounded-lg bg-white/50 border border-forest-100 text-xs text-forest-600 flex items-center gap-2"
          >
            <span
              class="w-5 h-5 rounded-md bg-forest-100 text-forest-500 flex items-center justify-center font-bold text-[10px]"
            >
              {{ String.fromCharCode(65 + idx) }}
            </span>
            {{ opt }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
