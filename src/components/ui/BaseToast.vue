<script setup lang="ts">
import { computed } from "vue";
import { useUIStore } from "../../stores/uiStore";
import {
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle,
  X,
} from "../../assets/icons";

const uiStore = useUIStore();

const iconComponent = computed(() => {
  switch (uiStore.toastType) {
    case "success":
      return CheckCircle;
    case "error":
      return XCircle;
    case "warning":
      return AlertTriangle;
    default:
      return Info;
  }
});

const toastClasses = computed(() => {
  const baseClasses =
    "fixed top-8 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-3 px-6 py-3.5 rounded-2xl shadow-soft border-2 bg-white animate-slide-down pointer-events-auto transition-all duration-300 font-rounded font-bold";

  switch (uiStore.toastType) {
    case "success":
      return `${baseClasses} border-forest-200 text-forest-800`;
    case "error":
      return `${baseClasses} border-coral-red/30 text-coral-red`;
    case "warning":
      return `${baseClasses} border-honey-orange/30 text-honey-orange`;
    default:
      return `${baseClasses} border-sky-blue/30 text-sky-blue`;
  }
});

const iconColorClass = computed(() => {
  switch (uiStore.toastType) {
    case "success":
      return "text-forest-400";
    case "error":
      return "text-coral-red";
    case "warning":
      return "text-honey-orange";
    default:
      return "text-sky-blue";
  }
});
</script>

<template>
  <Transition name="toast">
    <div v-if="uiStore.isToastVisible" :class="toastClasses">
      <div
        class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        :class="
          iconColorClass
            .replace('text-', 'bg-')
            .replace('400', '50')
            .replace('coral-red', 'coral-red/10')
            .replace('honey-orange', 'honey-orange/10')
            .replace('sky-blue', 'sky-blue/10')
        "
      >
        <component :is="iconComponent" :size="18" :class="iconColorClass" />
      </div>
      <span class="text-sm tracking-tight">{{ uiStore.toastMessage }}</span>
      <button
        @click="uiStore.hideToast"
        class="ml-2 p-1 rounded-lg hover:bg-gray-50 text-gray-300 hover:text-gray-500 transition-all"
      >
        <X :size="16" />
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -20px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px) scale(0.95);
}

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.animate-slide-down {
  animation: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
