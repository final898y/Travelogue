<script setup lang="ts">
/**
 * TripCard Component
 * Follows 'Journal/Cozy' style from DESIGN_BRIEF_FOR_UIUX.md
 * Adheres to UI/UX Pro Max guidelines: SVG icons, cursor-pointer, smooth transitions.
 */
import type { TripUI } from "../../types/trip-ui";

defineProps<TripUI>();
</script>

<template>
  <div
    class="card-base !p-0 overflow-hidden cursor-pointer group relative border-2 border-transparent hover:border-forest-100 transition-all duration-300"
  >
    <!-- Status Badge (Floating) -->
    <div
      v-if="status === 'ongoing'"
      class="absolute top-4 left-4 z-10 px-3 py-1.5 bg-honey-orange text-white text-[10px] font-bold tracking-wider uppercase rounded-full shadow-lg"
    >
      Ongoing
    </div>

    <!-- Cover Image Section -->
    <div class="h-44 overflow-hidden relative">
      <img
        :src="coverImage"
        :alt="title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <!-- Soft Gradient Overlay -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"
      ></div>

      <!-- Countdown Badge -->
      <div
        v-if="countdown !== undefined && countdown > 0"
        class="absolute bottom-3 right-3 px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-medium rounded-lg"
      >
        In {{ countdown }} days
      </div>
    </div>

    <!-- Content Section -->
    <div class="p-5 space-y-3 bg-white">
      <div class="flex justify-between items-start">
        <h3
          class="text-xl font-rounded text-forest-800 leading-tight group-hover:text-forest-600 transition-colors"
        >
          {{ title }}
        </h3>
        <!-- More Actions Button (Lucide-like SVG) -->
        <button
          class="p-1 text-forest-200 hover:text-forest-400 hover:bg-forest-50 rounded-full transition-all cursor-pointer"
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
            class="lucide lucide-more-horizontal"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </button>
      </div>

      <!-- Date & Duration Info -->
      <div class="flex items-center text-gray-500 text-sm gap-3 font-medium">
        <div class="flex items-center gap-1.5 text-forest-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-calendar"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span class="text-xs">{{ startDate }} - {{ endDate }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-clock"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span class="text-xs">{{ days }} Days</span>
        </div>
      </div>
    </div>
  </div>
</template>
