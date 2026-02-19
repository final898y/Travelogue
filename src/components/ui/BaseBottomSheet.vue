<script setup lang="ts">
/**
 * BaseBottomSheet (UI Component)
 * A reusable mobile-first bottom sheet drawer.
 */
import { onMounted, onUnmounted, ref, computed, watch } from "vue";

const props = defineProps<{
  isOpen: boolean;
  title?: string;
  hasUnsavedChanges?: boolean;
}>();

const emit = defineEmits(["close"]);

const contentRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const startY = ref(0);
const dragOffset = ref(0);
const startTime = ref(0);

// 統一關閉邏輯，包含未儲存檢查
const handleClose = () => {
  if (props.hasUnsavedChanges) {
    const confirmClose = window.confirm("您有未儲存的變更，確定要關閉嗎？");
    if (!confirmClose) return;
  }
  emit("close");
};

// 防止背景捲動
const toggleScroll = (disable: boolean) => {
  document.body.style.overflow = disable ? "hidden" : "";
};

// 手勢處理
const onTouchStart = (e: TouchEvent) => {
  if (!e.touches[0]) return;
  startY.value = e.touches[0].clientY;
  startTime.value = Date.now();
  isDragging.value = false;
};

const onTouchMove = (e: TouchEvent) => {
  if (!e.touches[0]) return;
  const currentY = e.touches[0].clientY;
  const deltaY = currentY - startY.value;

  // 1. 只有向下滑動才處理 (deltaY > 0)
  // 2. 判斷是否在頂部：如果在內容區，必須 scrollTop 為 0 才能觸發下滑關閉
  const isAtTop = contentRef.value ? contentRef.value.scrollTop <= 0 : true;

  if (deltaY > 0 && isAtTop) {
    // 防止預設滾動行為（如 iOS 的橡皮筋效果）
    if (e.cancelable) e.preventDefault();
    dragOffset.value = deltaY;
    isDragging.value = true;
  }
};

const onTouchEnd = () => {
  const endTime = Date.now();
  const duration = endTime - startTime.value;
  const velocity = dragOffset.value / duration; // 像素/毫秒

  // 觸發關閉的條件：位移超過 100px 或者 快速下滑 (速度 > 0.5px/ms)
  if (dragOffset.value > 100 || (velocity > 0.5 && dragOffset.value > 20)) {
    handleClose();
  }

  // 重置狀態
  isDragging.value = false;
  dragOffset.value = 0;
};

// 動態樣式
const sheetStyle = computed(() => {
  return {
    transform: `translateY(${dragOffset.value}px)`,
    transition: isDragging.value
      ? "none"
      : "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
  };
});

onMounted(() => {
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && props.isOpen) handleClose();
  });
});

onUnmounted(() => {
  toggleScroll(false);
});

// 當外部強制關閉時（例如 isOpen 變為 false），重置拖動狀態
watch(
  () => props.isOpen,
  (val) => {
    if (!val) {
      isDragging.value = false;
      dragOffset.value = 0;
    }
  },
);
</script>

<template>
  <Teleport to="body">
    <!-- Overlay Backdrop -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-forest-900/40 backdrop-blur-[2px] z-[100]"
        @click="handleClose"
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
        :style="sheetStyle"
      >
        <!-- Handlebar (Always draggable) -->
        <div
          class="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
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
            @click="handleClose"
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

        <!-- Body Content (Draggable only when scrolled to top) -->
        <div
          ref="contentRef"
          class="flex-1 overflow-y-auto custom-scrollbar p-6"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
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
