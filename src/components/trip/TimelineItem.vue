<script setup lang="ts">
/**
 * TimelineItem Component
 * Represents a single activity on the plan.
 */
import { ref } from "vue";
import type { ActivityUI } from "../../types/trip-ui";
import { getGoogleMapsUrl } from "../../utils/mapUtils";
import ActivityOptionItem from "./ActivityOptionItem.vue";
import BaseImageLightbox from "../ui/BaseImageLightbox.vue";
import {
  Landmark,
  Utensils,
  Car,
  Bed,
  MapPin,
  Map,
  GripVertical,
  ImageIcon,
} from "../../assets/icons";

const props = defineProps<ActivityUI>();

const emit = defineEmits(["click-item"]);

const isLightboxOpen = ref(false);
const categoryStyles = {
  sight: { color: "bg-forest-400", textColor: "text-forest-700" },
  food: { color: "bg-earth-300", textColor: "text-earth-700" },
  transport: { color: "bg-sky-blue", textColor: "text-blue-700" },
  hotel: { color: "bg-lavender", textColor: "text-purple-700" },
};

const openMap = (e: Event) => {
  e.stopPropagation();
  const url = getGoogleMapsUrl({
    title: props.title,
    subtitle: props.subtitle || props.title,
    address: props.address,
    placeId: props.placeId,
    coordinates: props.coordinates,
  });
  window.open(url, "_blank");
};

const handleImageClick = (e: Event) => {
  e.stopPropagation();
  isLightboxOpen.value = true;
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
    <div class="flex-1 pb-8 min-w-0">
      <div
        @click="emit('click-item')"
        class="card-base !p-4 group-hover:shadow-soft-lg transition-all cursor-pointer active:scale-[0.98] w-full"
        :class="
          options && options.length > 0
            ? 'border-2 border-dashed border-forest-100 bg-forest-50/30'
            : ''
        "
      >
        <div class="flex justify-between items-start gap-3">
          <div class="space-y-1 min-w-0 flex-1">
            <div class="flex items-start gap-2">
              <div
                :class="categoryStyles[category].textColor"
                class="mt-0.5 flex-shrink-0"
              >
                <!-- Lucide Icons mapping -->
                <Landmark v-if="category === 'sight'" :size="16" />
                <Utensils v-if="category === 'food'" :size="16" />
                <Car v-if="category === 'transport'" :size="16" />
                <Bed v-if="category === 'hotel'" :size="16" />
              </div>

              <div class="flex flex-col min-w-0">
                <h4 class="font-bold text-forest-800 leading-tight break-words">
                  {{ title }}
                </h4>
                <p
                  v-if="subtitle"
                  class="text-[10px] text-forest-400 font-medium break-words"
                >
                  {{ subtitle }}
                </p>
              </div>
            </div>

            <p
              v-if="location"
              class="text-xs text-gray-400 flex items-center gap-1 truncate"
            >
              <MapPin :size="12" class="flex-shrink-0" />
              {{ location }}
            </p>
          </div>

          <!-- Thumbnail with Enhanced Style -->
          <div
            v-if="images && images.length > 0"
            @click="handleImageClick"
            class="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-soft-sm border border-forest-50 hover:scale-105 active:scale-95 transition-all duration-300 z-20 group/img"
          >
            <img :src="images[0]?.url" class="w-full h-full object-cover" />

            <!-- Multi-image indicator -->
            <div
              v-if="images.length > 1"
              class="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-white backdrop-blur-[1px] opacity-0 group-hover/img:opacity-100 transition-opacity"
            >
              <ImageIcon :size="12" class="mb-0.5" />
              <span class="text-[9px] font-bold">+{{ images.length - 1 }}</span>
            </div>

            <!-- Overlay for single image hover -->
            <div
              v-else
              class="absolute inset-0 bg-white/0 group-hover/img:bg-black/5 transition-colors"
            ></div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-1 flex-shrink-0">
            <button
              @click="openMap"
              class="w-8 h-8 flex items-center justify-center rounded-xl bg-forest-50 text-forest-400 hover:bg-forest-100 hover:text-forest-600 transition-all cursor-pointer shadow-sm active:scale-90"
              title="在 Google Maps 開啟"
            >
              <Map :size="16" />
            </button>

            <!-- Drag Handle (Simulated) -->
            <button
              class="text-forest-100 group-hover:text-forest-300 transition-colors cursor-grab active:cursor-grabbing p-1"
            >
              <GripVertical :size="20" />
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

    <!-- Lightbox for viewing full size -->
    <BaseImageLightbox
      v-if="images && images.length > 0"
      :is-open="isLightboxOpen"
      :images="images"
      @close="isLightboxOpen = false"
    />
  </div>
</template>
