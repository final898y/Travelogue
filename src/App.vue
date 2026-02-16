<script setup lang="ts">
import BottomNav from "./components/ui/BottomNav.vue";
</script>

<template>
  <div class="min-h-screen bg-cream-light font-sans selection:bg-forest-100">
    <!-- View Port -->
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <!-- Global Navigation -->
    <BottomNav />
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
