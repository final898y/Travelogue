<script setup lang="ts">
import BottomNav from "./components/ui/BottomNav.vue";
import BaseToast from "./components/ui/BaseToast.vue";
import BaseConfirmDialog from "./components/ui/BaseConfirmDialog.vue";
import { useAuthStore } from "./stores/authStore";
import { useRoute } from "vue-router";

const authStore = useAuthStore();
const route = useRoute();
</script>

<template>
  <div class="min-h-screen bg-cream-light font-sans selection:bg-forest-100">
    <!-- Global Notifications -->
    <BaseToast />
    <BaseConfirmDialog />

    <!-- Initial Loading Overlay -->
    <div
      v-if="authStore.loading"
      class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream-light"
    >
      <div
        class="w-16 h-16 border-4 border-forest-100 border-t-forest-600 rounded-full animate-spin mb-4"
      ></div>
      <p class="text-forest-700 font-medium font-rounded animate-pulse">
        Travelogue 載入中...
      </p>
    </div>

    <!-- View Port -->
    <template v-else>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>

      <!-- Global Navigation (Hidden on Login page) -->
      <BottomNav v-if="route.name !== 'login'" />
    </template>
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&family=Varela+Round&display=swap");

:root {
  --font-sans: "Noto Sans TC", sans-serif;
  --font-rounded: "Varela Round", "Noto Sans TC", sans-serif;
}

/* Page Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
