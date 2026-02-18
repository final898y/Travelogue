<script setup lang="ts">
import type { ActivityOptionUI } from "../../types/trip-ui";
import { getGoogleMapsUrl } from "../../utils/mapUtils";

const props = defineProps<{
  option: ActivityOptionUI;
  index: number;
}>();

const openMap = () => {
  const url = getGoogleMapsUrl({
    title: props.option.title,
    subtitle: props.option.subtitle || props.option.title,
    address: props.option.address,
    placeId: props.option.placeId,
    coordinates: props.option.coordinates,
  });
  window.open(url, "_blank");
};
</script>

<template>
  <div
    class="p-2 rounded-lg bg-white/50 border border-forest-100 text-xs text-forest-600 flex items-center justify-between group/opt transition-colors"
  >
    <div class="flex items-center gap-2">
      <span
        class="w-5 h-5 rounded-md bg-forest-100 text-forest-500 flex items-center justify-center font-bold text-[10px]"
      >
        {{ String.fromCharCode(65 + index) }}
      </span>
      <div class="flex flex-col">
        <span class="font-bold leading-tight">{{ option.title }}</span>
        <span
          v-if="option.subtitle"
          class="text-[9px] text-forest-400 font-medium"
          >{{ option.subtitle }}</span
        >
      </div>
    </div>

    <!-- Map Action Button -->
    <button
      @click.stop="openMap"
      class="w-8 h-8 flex items-center justify-center rounded-xl bg-forest-50 text-forest-300 hover:bg-forest-100 hover:text-forest-600 transition-all cursor-pointer shadow-sm active:scale-90"
      title="在 Google Maps 開啟"
    >
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
        class="lucide lucide-map"
      >
        <path
          d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"
        />
        <path d="M15 5.764v15" />
        <path d="M9 3.236v15" />
      </svg>
    </button>
  </div>
</template>
