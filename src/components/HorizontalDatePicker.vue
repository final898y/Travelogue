<script setup lang="ts">
/**
 * HorizontalDatePicker Component
 * A scrollable list of dates for the trip.
 */

interface DateItem {
  day: string; // e.g., "3/20"
  weekday: string; // e.g., "Wed"
  fullDate: string;
}

interface Props {
  dates: DateItem[];
  modelValue: string; // current selected fullDate
}

defineProps<Props>();
const emit = defineEmits(["update:modelValue"]);

const selectDate = (date: string) => {
  emit("update:modelValue", date);
};
</script>

<template>
  <div class="relative">
    <!-- Scroll Container -->
    <div
      class="flex overflow-x-auto gap-4 py-4 no-scrollbar scroll-smooth px-1"
    >
      <button
        v-for="item in dates"
        :key="item.fullDate"
        @click="selectDate(item.fullDate)"
        class="flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl transition-all duration-300 cursor-pointer"
        :class="
          modelValue === item.fullDate
            ? 'bg-forest-400 text-white shadow-soft-lg scale-110 z-10'
            : 'bg-white text-forest-300 hover:bg-forest-50'
        "
      >
        <span class="text-[10px] font-bold uppercase mb-1">{{
          item.weekday
        }}</span>
        <span class="text-lg font-rounded font-bold">{{ item.day }}</span>

        <!-- Selection Indicator Dot -->
        <div
          v-if="modelValue === item.fullDate"
          class="mt-1 w-1 h-1 bg-white rounded-full"
        ></div>
      </button>
    </div>

    <!-- Fade Gradients for scroll hint -->
    <div
      class="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-cream-light to-transparent pointer-events-none"
    ></div>
    <div
      class="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-cream-light to-transparent pointer-events-none"
    ></div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
