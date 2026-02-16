<script setup lang="ts">
/**
 * BaseCard Component
 * Implements the standard 'Cozy/Nature' card style with soft shadows.
 */
interface Props {
  hoverable?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  background?: "white" | "cream" | "forest-50";
}

withDefaults(defineProps<Props>(), {
  hoverable: false,
  padding: "md",
  background: "white",
});

const paddingClasses = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const bgClasses = {
  white: "bg-white",
  cream: "bg-cream-light",
  "forest-50": "bg-forest-50",
};
</script>

<template>
  <div
    class="rounded-2xl transition-all duration-300"
    :class="[
      bgClasses[background],
      paddingClasses[padding],
      hoverable ? 'card-base cursor-pointer' : 'shadow-soft',
    ]"
  >
    <slot />
  </div>
</template>
