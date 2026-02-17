<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useTripStore } from "../stores/tripStore";
import type { Trip, ChecklistItem } from "../types/trip";

const route = useRoute();
const tripStore = useTripStore();
const tripId = route.params.id as string;

const activeTab = ref("todo");
const trip = ref<Trip | null>(null);

onMounted(async () => {
  if (tripId) {
    trip.value = await tripStore.fetchTripById(tripId);
  }
});

const preparation = computed(() => trip.value?.preparation || []);
const todos = computed(() => preparation.value.filter(item => item.category !== '行李'));
const luggages = computed(() => preparation.value.filter(item => item.category === '行李'));

// toggle 邏輯暫不涉及更新資料庫，待後續擴充
const toggleItem = (id: string) => {
  const item = preparation.value.find(i => i.id === id);
  if (item) item.isCompleted = !item.isCompleted;
};
</script>

<template>
  <div class="min-h-screen pb-32 animate-fade-in">
    <header class="px-6 pt-8 pb-4">
      <h1 class="text-2xl font-rounded font-bold text-forest-800">準備清單</h1>
      <p class="text-gray-500 text-sm">出發前的萬全準備</p>
    </header>

    <main class="px-6 mt-4">
      <div class="flex bg-forest-50 p-1 rounded-2xl mb-8">
        <button v-for="tab in [{ id: 'todo', label: '待辦' }, { id: 'luggage', label: '行李' }]" :key="tab.id" @click="activeTab = tab.id" class="flex-1 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer" :class="activeTab === tab.id ? 'bg-white text-forest-500 shadow-soft-sm' : 'text-gray-400'">
          {{ tab.label }}
        </button>
      </div>

      <div v-if="activeTab === 'todo'" class="space-y-4">
        <div v-for="todo in todos" :key="todo.id" @click="toggleItem(todo.id)" class="card-base !p-4 flex items-center gap-4 transition-all" :class="todo.isCompleted ? 'opacity-50' : ''">
          <div class="w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all" :class="todo.isCompleted ? 'bg-forest-400 border-forest-400 text-white' : 'border-forest-200 bg-white'">
            <svg v-if="todo.isCompleted" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          </div>
          <div class="flex-1">
            <h4 class="font-bold text-forest-800" :class="todo.isCompleted ? 'line-through' : ''">{{ todo.title }}</h4>
            <span class="text-[9px] bg-forest-100 text-forest-500 px-2 py-0.5 rounded-full font-bold">{{ todo.category }}</span>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'luggage'" class="space-y-4">
        <div v-for="item in luggages" :key="item.id" @click="toggleItem(item.id)" class="card-base !p-4 flex items-center gap-4" :class="item.isCompleted ? 'opacity-50' : ''">
          <div class="w-6 h-6 rounded-lg border-2 flex items-center justify-center" :class="item.isCompleted ? 'bg-earth-400 border-earth-400 text-white' : 'border-forest-200 bg-white'">
            <svg v-if="item.isCompleted" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          </div>
          <h4 class="font-bold text-forest-800" :class="item.isCompleted ? 'line-through' : ''">{{ item.title }}</h4>
        </div>
      </div>

      <div v-if="(activeTab === 'todo' && todos.length === 0) || (activeTab === 'luggage' && luggages.length === 0)" class="py-12 flex flex-col items-center text-center">
        <div class="w-20 h-20 bg-forest-50 rounded-full flex items-center justify-center text-4xl mb-4">📝</div>
        <p class="text-gray-400 text-sm mt-1">清單還是空的</p>
      </div>
    </main>

    <button class="fixed bottom-28 right-6 w-14 h-14 bg-forest-400 text-white rounded-2xl shadow-soft-lg hover:bg-forest-500 hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer z-50">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5v14" /></svg>
    </button>
  </div>
</template>
