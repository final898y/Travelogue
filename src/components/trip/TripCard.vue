<script setup lang="ts">
/**
 * TripCard Component
 * Follows 'Journal/Cozy' style from DESIGN_BRIEF_FOR_UIUX.md
 * Adheres to UI/UX Pro Max guidelines: SVG icons, cursor-pointer, smooth transitions.
 */
import type { TripUI } from "../../types/trip-ui";
import { MoreHorizontal, Calendar, Clock } from "../../assets/icons";

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
        <button
          class="p-1 text-forest-200 hover:text-forest-400 hover:bg-forest-50 rounded-full transition-all cursor-pointer"
        >
          <MoreHorizontal :size="20" />
        </button>
      </div>

      <!-- Date & Duration Info -->
      <div class="flex items-center text-gray-500 text-sm gap-3 font-medium">
        <div class="flex items-center gap-1.5 text-forest-500">
          <Calendar :size="14" />
          <span class="text-xs">{{ startDate }} - {{ endDate }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <Clock :size="14" />
          <span class="text-xs">{{ days }} Days</span>
        </div>
      </div>
    </div>
  </div>
</template>
