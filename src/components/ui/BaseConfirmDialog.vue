<script setup lang="ts">
import { useUIStore } from "../../stores/uiStore";
import { AlertCircle } from "../../assets/icons";

const uiStore = useUIStore();

const handleCancel = () => uiStore.handleConfirm(false);
const handleConfirm = () => uiStore.handleConfirm(true);
</script>

<template>
  <Transition name="fade">
    <div
      v-if="uiStore.isConfirmVisible"
      class="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-forest-900/10 backdrop-blur-sm"
      @click.self="handleCancel"
    >
      <Transition name="scale">
        <div
          v-if="uiStore.isConfirmVisible"
          class="w-full max-w-sm bg-white rounded-3xl shadow-soft-lg overflow-hidden border-2 border-forest-100 p-8 space-y-6"
        >
          <div class="flex flex-col items-center text-center space-y-4">
            <div
              class="w-14 h-14 bg-honey-orange/10 rounded-2xl flex items-center justify-center text-honey-orange"
            >
              <AlertCircle :size="32" />
            </div>
            <div class="space-y-1">
              <h3 class="text-xl font-rounded font-bold text-forest-900">
                {{ uiStore.confirmTitle }}
              </h3>
              <p class="text-gray-500 leading-relaxed text-sm">
                {{ uiStore.confirmMessage }}
              </p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <button
              @click="handleCancel"
              class="flex-1 px-4 py-3 rounded-xl font-bold text-forest-400 bg-forest-50 hover:bg-forest-100 transition-all cursor-pointer"
            >
              {{ uiStore.confirmCancelText }}
            </button>
            <button
              @click="handleConfirm"
              class="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-forest-400 shadow-soft-sm hover:bg-forest-500 hover:shadow-soft active:scale-95 transition-all cursor-pointer"
            >
              {{ uiStore.confirmOkText }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
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

.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
