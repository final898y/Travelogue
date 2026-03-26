<script setup lang="ts">
/**
 * BaseImageLightbox Component
 * Full-screen image viewer with support for multiple images and swipe gestures.
 */
import { ref, onMounted, onUnmounted, watch } from "vue";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "../../assets/icons";
import type { Image } from "../../types/trip";

const props = defineProps<{
  isOpen: boolean;
  images: Image[];
  initialIndex?: number;
}>();

const emit = defineEmits(["close"]);

const currentIndex = ref(props.initialIndex || 0);

// Watch for initialIndex changes when opening
watch(
  () => props.initialIndex,
  (newVal) => {
    if (newVal !== undefined) currentIndex.value = newVal;
  },
);

const next = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0; // Loop back
  }
};

const prev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  } else {
    currentIndex.value = props.images.length - 1; // Loop to end
  }
};

// Keyboard support
const handleKeyDown = (e: KeyboardEvent) => {
  if (!props.isOpen) return;
  if (e.key === "Escape") emit("close");
  if (e.key === "ArrowRight") next();
  if (e.key === "ArrowLeft") prev();
};

onMounted(() => window.addEventListener("keydown", handleKeyDown));
onUnmounted(() => window.removeEventListener("keydown", handleKeyDown));

// Prevent body scroll when open
watch(
  () => props.isOpen,
  (isOpen) => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  },
);
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <!-- Close Button -->
        <button
          @click="emit('close')"
          class="absolute top-6 right-6 z-50 p-2 text-white/70 hover:text-white transition-colors bg-white/10 rounded-full hover:bg-white/20 active:scale-90"
        >
          <X :size="28" />
        </button>

        <!-- Image Counter -->
        <div
          v-if="images.length > 1"
          class="absolute top-8 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-xs font-bold font-mono tracking-widest border border-white/10"
        >
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>

        <!-- Navigation Buttons -->
        <template v-if="images.length > 1">
          <button
            @click="prev"
            class="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 p-3 text-white/50 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-2xl hidden md:block"
          >
            <ChevronLeft :size="32" />
          </button>
          <button
            @click="next"
            class="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 p-3 text-white/50 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-2xl hidden md:block"
          >
            <ChevronRight :size="32" />
          </button>
        </template>

        <!-- Image Container -->
        <div
          class="relative w-full h-full flex items-center justify-center p-4 md:p-12"
        >
          <Transition name="slide" mode="out-in">
            <div
              :key="currentIndex"
              class="relative max-w-full max-h-full group"
            >
              <img
                :src="images[currentIndex]?.url"
                class="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm md:rounded-lg select-none"
                alt="Full Size View"
                @click.stop
              />

              <!-- Image Metadata / Label (Optional) -->
              <div class="absolute bottom-[-40px] left-0 right-0 text-center">
                <p
                  class="text-white/40 text-[10px] flex items-center justify-center gap-1"
                >
                  <Maximize2 :size="10" />
                  {{ images[currentIndex]?.path.split("/").pop() }}
                </p>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Mobile Swipe Area (Simulated by clicking left/right half) -->
        <div class="absolute inset-x-0 inset-y-20 md:hidden flex">
          <div class="flex-1" @click="prev"></div>
          <div class="flex-1" @click="next"></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from {
  opacity: 0;
  transform: scale(0.95) translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: scale(0.95) translateX(-20px);
}
</style>
