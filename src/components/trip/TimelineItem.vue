<script setup lang="ts">
/**
 * TimelineItem Component
 * Represents a single activity on the schedule.
 */
import type { ActivityUI } from "../../types/trip-ui";
import { getGoogleMapsUrl } from "../../utils/mapUtils";
import ActivityOptionItem from "./ActivityOptionItem.vue";

const props = defineProps<ActivityUI>();

const categoryStyles = {
  sight: { color: "bg-forest-400", textColor: "text-forest-700" },
  food: { color: "bg-earth-300", textColor: "text-earth-700" },
  transport: { color: "bg-sky-blue", textColor: "text-blue-700" },
  hotel: { color: "bg-lavender", textColor: "text-purple-700" },
};

const openMap = () => {
  const url = getGoogleMapsUrl({
    title: props.title,
    subtitle: props.subtitle || props.title,
    address: props.address,
    placeId: props.placeId,
    coordinates: props.coordinates,
  });
  window.open(url, "_blank");
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
          options && options.length > 0
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

              <div class="flex flex-col">
                <h4 class="font-bold text-forest-800 leading-tight">
                  {{ title }}
                </h4>
                <p
                  v-if="subtitle"
                  class="text-[10px] text-forest-400 font-medium"
                >
                  {{ subtitle }}
                </p>
              </div>
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

          <!-- Action Buttons -->
          <div class="flex items-center gap-1">
            <button
              @click="openMap"
              class="w-8 h-8 flex items-center justify-center rounded-xl bg-forest-50 text-forest-400 hover:bg-forest-100 hover:text-forest-600 transition-all cursor-pointer shadow-sm active:scale-90"
              title="在 Google Maps 開啟"
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
            </button>

            <!-- Drag Handle (Simulated) -->
            <button
              class="text-forest-100 group-hover:text-forest-300 transition-colors cursor-grab active:cursor-grabbing p-1"
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
        </div>

        <!-- Options Block (if any) -->
        <div v-if="options && options.length > 0" class="mt-3 space-y-2">
          <p class="text-[10px] font-bold text-forest-300 uppercase">
            備選方案
          </p>
          <ActivityOptionItem
            v-for="(opt, idx) in options"
            :key="idx"
            :option="opt"
            :index="idx"
          />
        </div>
      </div>
    </div>
  </div>
</template>
