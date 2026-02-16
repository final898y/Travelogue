<script setup lang="ts">
const totalExpense = 25680;
const currency = "TWD";

const categories = [
  {
    name: "餐飲",
    amount: 10272,
    percentage: 40,
    color: "bg-earth-300",
    icon: "🍜",
  },
  {
    name: "交通",
    amount: 6420,
    percentage: 25,
    color: "bg-sky-blue",
    icon: "🚗",
  },
  {
    name: "住宿",
    amount: 5136,
    percentage: 20,
    color: "bg-lavender",
    icon: "🏨",
  },
  {
    name: "景點",
    amount: 3852,
    percentage: 15,
    color: "bg-forest-300",
    icon: "🏛️",
  },
];

const transactions = [
  {
    id: 1,
    date: "3/20",
    title: "一蘭拉麵",
    category: "美食",
    amount: 1280,
    currency: "JPY",
    tndAmount: 360,
    icon: "🍜",
  },
  {
    id: 2,
    date: "3/20",
    title: "京王廣場大飯店",
    category: "住宿",
    amount: 15000,
    currency: "JPY",
    tndAmount: 4200,
    icon: "🏨",
  },
  {
    id: 3,
    date: "3/19",
    title: "JR Pass",
    category: "交通",
    amount: 29650,
    currency: "JPY",
    tndAmount: 8300,
    icon: "🚗",
  },
];
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
          <span class="text-4xl font-rounded font-bold"
            >NT$ {{ totalExpense.toLocaleString() }}</span
          >
        </div>

        <!-- Simple Progress Bar Chart -->
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
                >${{ (cat.amount / 1000).toFixed(1) }}k</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Transactions List -->
      <section class="space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-bold text-forest-800">支出明細</h3>
          <button class="text-forest-400 text-sm font-bold cursor-pointer">
            按日期
          </button>
        </div>

        <div class="space-y-3">
          <div
            v-for="tx in transactions"
            :key="tx.id"
            class="card-base !p-4 flex items-center gap-4"
          >
            <div
              class="w-10 h-10 rounded-xl bg-cream flex items-center justify-center text-xl"
            >
              {{ tx.icon }}
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-forest-800 truncate">{{ tx.title }}</h4>
              <p class="text-[10px] text-gray-400 font-medium">
                {{ tx.date }} • {{ tx.category }}
              </p>
            </div>
            <div class="text-right">
              <div class="font-bold text-forest-900">
                NT$ {{ tx.tndAmount }}
              </div>
              <div class="text-[10px] text-gray-400">
                {{ tx.amount }} {{ tx.currency }}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- FAB: Add Expense -->
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
