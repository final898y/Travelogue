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
    @click.stop="openMap"
    class="p-2 rounded-lg bg-white/50 border border-forest-100 text-xs text-forest-600 flex items-center justify-between group/opt cursor-pointer hover:bg-forest-100/50 transition-colors"
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
      class="lucide lucide-external-link opacity-0 group-hover/opt:opacity-100 transition-opacity text-forest-300"
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  </div>
</template>
