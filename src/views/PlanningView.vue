<script setup lang="ts">
import { ref } from "vue";

const activeTab = ref("todo");

const todos = ref([
  { id: 1, title: "辦理日本簽證", done: true, priority: "high", user: "小美" },
  {
    id: 2,
    title: "預約藍瓶咖啡",
    done: false,
    priority: "medium",
    user: "小美",
  },
  { id: 3, title: "購買 JR Pass", done: false, priority: "high", user: "阿強" },
  {
    id: 4,
    title: "換日幣 (5萬台幣)",
    done: false,
    priority: "medium",
    user: "小美",
  },
]);

const luggages = ref([
  { id: 1, title: "護照、簽證影本", done: true },
  { id: 2, title: "行動電源 & 充電線", done: false },
  { id: 3, title: "換洗衣物 (5套)", done: false },
  { id: 4, title: "雨具 (摺疊傘)", done: false },
]);

const toggleTodo = (id: number) => {
  const item = todos.value.find((t) => t.id === id);
  if (item) item.done = !item.done;
};

const toggleLuggage = (id: number) => {
  const item = luggages.value.find((l) => l.id === id);
  if (item) item.done = !item.done;
};
</script>

<template>
  <div class="min-h-screen pb-32 animate-fade-in">
    <header class="px-6 pt-8 pb-4">
      <h1 class="text-2xl font-rounded font-bold text-forest-800">準備清單</h1>
      <p class="text-gray-500 text-sm">出發前的萬全準備</p>
    </header>

    <main class="px-6 mt-4">
      <!-- Tabs -->
      <div class="flex bg-forest-50 p-1 rounded-2xl mb-8">
        <button
          v-for="tab in [
            { id: 'todo', label: '待辦' },
            { id: 'luggage', label: '行李' },
            { id: 'shopping', label: '購物' },
          ]"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex-1 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer"
          :class="
            activeTab === tab.id
              ? 'bg-white text-forest-500 shadow-soft-sm'
              : 'text-gray-400'
          "
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Todo List -->
      <div v-if="activeTab === 'todo'" class="space-y-4">
        <div
          v-for="todo in todos"
          :key="todo.id"
          @click="toggleTodo(todo.id)"
          class="card-base !p-4 flex items-center gap-4 transition-all"
          :class="todo.done ? 'opacity-50' : ''"
        >
          <div
            class="w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all"
            :class="
              todo.done
                ? 'bg-forest-400 border-forest-400 text-white'
                : 'border-forest-200 bg-white'
            "
          >
            <svg
              v-if="todo.done"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div class="flex-1">
            <h4
              class="font-bold text-forest-800"
              :class="todo.done ? 'line-through' : ''"
            >
              {{ todo.title }}
            </h4>
            <div class="flex gap-2 mt-1">
              <span
                v-if="todo.priority === 'high'"
                class="text-[9px] bg-coral-red/10 text-coral-red px-2 py-0.5 rounded-full font-bold"
                >高優先級</span
              >
              <span
                class="text-[9px] bg-forest-100 text-forest-500 px-2 py-0.5 rounded-full font-bold"
                >👤 {{ todo.user }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Luggage List -->
      <div v-if="activeTab === 'luggage'" class="space-y-4">
        <div
          v-for="item in luggages"
          :key="item.id"
          @click="toggleLuggage(item.id)"
          class="card-base !p-4 flex items-center gap-4"
          :class="item.done ? 'opacity-50' : ''"
        >
          <div
            class="w-6 h-6 rounded-lg border-2 flex items-center justify-center"
            :class="
              item.done
                ? 'bg-earth-400 border-earth-400 text-white'
                : 'border-forest-200 bg-white'
            "
          >
            <svg
              v-if="item.done"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h4
            class="font-bold text-forest-800"
            :class="item.done ? 'line-through' : ''"
          >
            {{ item.title }}
          </h4>
        </div>
      </div>

      <!-- Empty Shopping List -->
      <div
        v-if="activeTab === 'shopping'"
        class="py-12 flex flex-col items-center text-center"
      >
        <div
          class="w-20 h-20 bg-forest-50 rounded-full flex items-center justify-center text-4xl mb-4"
        >
          🛒
        </div>
        <h3 class="text-lg font-bold text-forest-800">清單還是空的</h3>
        <p class="text-gray-400 text-sm mt-1 max-w-[200px]">
          把想買的紀念品或清單寫下來吧！
        </p>
        <button class="btn-primary mt-6 !rounded-2xl">開始新增</button>
      </div>
    </main>

    <!-- FAB: Add Item -->
    <button
      class="fixed bottom-28 right-6 w-14 h-14 bg-forest-400 text-white rounded-2xl shadow-soft-lg hover:bg-forest-500 hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer z-50"
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
        <path d="M5 12h14M12 5v14" />
      </svg>
    </button>
  </div>
</template>
