<script setup lang="ts">
/**
 * BaseBottomSheet (UI Component)
 * A reusable mobile-first bottom sheet drawer.
 */
import { onMounted, onUnmounted } from "vue";

defineProps<{
  isOpen: boolean;
  title?: string;
}>();

const emit = defineEmits(["close"]);

// 防止背景捲動
const toggleScroll = (disable: boolean) => {
  document.body.style.overflow = disable ? "hidden" : "";
};

onMounted(() => {
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") emit("close");
  });
});

onUnmounted(() => {
  toggleScroll(false);
});
</script>

<template>
  <Teleport to="body">
    <!-- Overlay Backdrop -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-forest-900/40 backdrop-blur-[2px] z-[100]"
        @click="emit('close')"
      ></div>
    </Transition>

    <!-- Bottom Sheet Content -->
    <Transition
      name="slide-up"
      @before-enter="toggleScroll(true)"
      @after-leave="toggleScroll(false)"
    >
      <div
        v-if="isOpen"
        class="fixed bottom-0 left-0 right-0 bg-cream-light rounded-t-[32px] shadow-2xl z-[101] max-h-[92vh] overflow-hidden flex flex-col"
      >
        <!-- Handlebar -->
        <div
          class="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
          @click="emit('close')"
        >
          <div class="w-12 h-1.5 bg-forest-100 rounded-full"></div>
        </div>

        <!-- Header -->
        <div
          v-if="title"
          class="px-6 pb-4 flex justify-between items-center border-b border-forest-50"
        >
          <h3 class="text-lg font-rounded font-bold text-forest-800">
            {{ title }}
          </h3>
          <button
            @click="emit('close')"
            class="w-8 h-8 flex items-center justify-center rounded-full bg-forest-50 text-forest-400 hover:bg-forest-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <!-- Body Content -->
        <div class="flex-1 overflow-y-auto custom-scrollbar p-6">
          <slot></slot>
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

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
