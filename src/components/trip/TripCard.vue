<script setup lang="ts">
/**
 * TripCard Component
 * Follows 'Journal/Cozy' style from DESIGN_BRIEF_FOR_UIUX.md
 * Adheres to UI/UX Pro Max guidelines: SVG icons, cursor-pointer, smooth transitions.
 */
import { ref, onMounted, onUnmounted } from "vue";
import type { TripUI } from "../../types/trip-ui";
import {
  MoreHorizontal,
  Calendar,
  Clock,
  Pencil,
  Trash2,
  Download,
} from "../../assets/icons";

const props = defineProps<TripUI>();
const emit = defineEmits<{
  (e: "edit", id: string | number): void;
  (e: "delete", id: string | number): void;
  (e: "export", id: string | number, title: string): void;
}>();

const isMenuOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);

const toggleMenu = (event: Event) => {
  event.stopPropagation();
  isMenuOpen.value = !isMenuOpen.value;
};

const handleEdit = (event: Event) => {
  event.stopPropagation();
  isMenuOpen.value = false;
  emit("edit", props.id);
};

const handleDelete = (event: Event) => {
  event.stopPropagation();
  isMenuOpen.value = false;
  emit("delete", props.id);
};

const handleExport = (event: Event) => {
  event.stopPropagation();
  isMenuOpen.value = false;
  emit("export", props.id, props.title);
};

const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    isMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div
    class="card-base !p-0 cursor-pointer group relative border-2 border-transparent hover:border-forest-100 transition-all duration-300"
    :class="{ 'z-50': isMenuOpen }"
  >
    <!-- Status Badge (Floating) -->
    <div
      v-if="status === 'ongoing'"
      class="absolute top-4 left-4 z-10 px-3 py-1.5 bg-honey-orange text-white text-[10px] font-bold tracking-wider uppercase rounded-full shadow-lg"
    >
      Ongoing
    </div>

    <!-- Cover Image Section -->
    <div class="h-44 overflow-hidden relative rounded-t-2xl">
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
    <div class="p-5 space-y-3 bg-white rounded-b-2xl">
      <div class="flex justify-between items-start">
        <h3
          class="text-xl font-rounded text-forest-800 leading-tight group-hover:text-forest-600 transition-colors"
        >
          {{ title }}
        </h3>
        <div class="relative" ref="menuRef">
          <button
            @click="toggleMenu"
            class="p-1 text-forest-200 hover:text-forest-400 hover:bg-forest-50 rounded-full transition-all cursor-pointer"
          >
            <MoreHorizontal :size="20" />
          </button>

          <!-- Dropdown Menu -->
          <div
            v-if="isMenuOpen"
            class="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-forest-50 py-1 z-50 animate-fade-in"
          >
            <button
              @click="handleEdit"
              class="w-full px-4 py-2 text-left text-sm font-medium text-forest-600 hover:bg-forest-50 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Pencil :size="14" />
              編輯
            </button>
            <button
              @click="handleExport"
              class="w-full px-4 py-2 text-left text-sm font-medium text-forest-600 hover:bg-forest-50 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Download :size="14" />
              匯出
            </button>
            <button
              @click="handleDelete"
              class="w-full px-4 py-2 text-left text-sm font-medium text-coral-red hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 :size="14" />
              刪除
            </button>
          </div>
        </div>
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
