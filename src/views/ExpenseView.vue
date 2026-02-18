<script setup lang="ts">
import { onMounted, onUnmounted, computed, toRefs, ref } from "vue";
import { useRoute } from "vue-router";
import { useTripStore } from "../stores/tripStore";

const route = useRoute();
const tripStore = useTripStore();
const { currentTripExpenses: expenses } = toRefs(tripStore);
const tripId = route.params.id as string;

const currency = ref("TWD");
let unsubscribe: (() => void) | null = null;

onMounted(() => {
  if (tripId) {
    unsubscribe = tripStore.subscribeToExpenses(tripId);
  }
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

const totalExpense = computed(() => {
  return expenses.value.reduce((sum, item) => sum + item.amount, 0);
});

const categoryMap = computed(() => {
  const map: Record<string, number> = {};
  expenses.value.forEach((item) => {
    map[item.category] = (map[item.category] || 0) + item.amount;
  });
  return map;
});

const categories = computed(() => {
  const total = totalExpense.value || 1;
  const colors: Record<string, string> = {
    Food: "bg-earth-300",
    Transport: "bg-sky-blue",
    Hotel: "bg-lavender",
    Sight: "bg-forest-300",
    Other: "bg-forest-100",
  };
  const icons: Record<string, string> = {
    Food: "🍜",
    Transport: "🚗",
    Hotel: "🏨",
    Sight: "🏛️",
    Other: "📦",
  };

  return Object.entries(categoryMap.value).map(([name, amount]) => ({
    name,
    amount,
    percentage: Math.round((amount / total) * 100),
    color: colors[name] || colors.Other,
    icon: icons[name] || icons.Other,
  }));
});

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};
</script>

<template>
  <div class="min-h-screen pb-32 animate-fade-in">
    <header class="px-6 pt-8 pb-4">
      <h1 class="text-2xl font-rounded font-bold text-forest-800">記帳帳本</h1>
      <p class="text-gray-500 text-sm">掌握每一筆旅行支出</p>
    </header>

    <main class="px-6 space-y-6 mt-4">
      <!-- Summary Dashboard -->
      <div class="card-base bg-forest-800 text-white !shadow-soft-lg">
        <div class="flex flex-col items-center text-center space-y-1 mb-6">
          <span class="text-xs opacity-70 uppercase tracking-widest font-bold"
            >總支出 ({{ currency }})</span
          >
          <span class="text-4xl font-rounded font-bold">{{
            totalExpense.toLocaleString()
          }}</span>
        </div>

        <div class="space-y-4">
          <div class="h-3 w-full bg-white/10 rounded-full flex overflow-hidden">
            <div
              v-for="cat in categories"
              :key="cat.name"
              :class="cat.color"
              :style="{ width: cat.percentage + '%' }"
              class="h-full transition-all duration-500"
            ></div>
          </div>

          <div class="grid grid-cols-2 gap-y-3 gap-x-4">
            <div
              v-for="cat in categories"
              :key="cat.name"
              class="flex items-center gap-2"
            >
              <div class="w-2 h-2 rounded-full" :class="cat.color"></div>
              <span class="text-[10px] opacity-80 truncate"
                >{{ cat.name }} {{ cat.percentage }}%</span
              >
              <span class="text-[10px] ml-auto font-bold opacity-60"
                >{{ (cat.amount / 1000).toFixed(1) }}k</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Transactions List -->
      <section class="space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-bold text-forest-800">支出明細</h3>
        </div>

        <div
          v-if="expenses.length === 0"
          class="py-12 text-center bg-white/50 rounded-3xl border-2 border-dashed border-forest-100"
        >
          <p class="text-gray-500">尚無支出記錄</p>
        </div>

        <div class="space-y-3">
          <div
            v-for="tx in expenses"
            :key="tx.id"
            class="card-base !p-4 flex items-center gap-4"
          >
            <div
              class="w-10 h-10 rounded-xl bg-cream flex items-center justify-center text-xl"
            >
              {{ categories.find((c) => c.name === tx.category)?.icon || "💰" }}
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-forest-800 truncate">
                {{ tx.description }}
              </h4>
              <p class="text-[10px] text-gray-400 font-medium">
                {{ formatDate(tx.date) }} • {{ tx.category }}
              </p>
            </div>
            <div class="text-right">
              <div class="font-bold text-forest-900">
                {{ tx.amount.toLocaleString() }}
              </div>
              <div class="text-[10px] text-gray-400">{{ tx.currency }}</div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- FAB: Add Expense (Placeholder logic) -->
    <button
      class="fixed bottom-28 right-6 w-14 h-14 bg-earth-400 text-white rounded-2xl shadow-soft-lg hover:bg-earth-500 hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer z-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  </div>
</template>
