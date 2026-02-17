<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useTripStore } from "../stores/tripStore";
import type { ResearchCollection, CollectionSource } from "../types/trip";

const route = useRoute();
const tripStore = useTripStore();
const tripId = route.params.id as string;

const collections = ref<ResearchCollection[]>([]);
const activeFilter = ref<CollectionSource | "all">("all");
const isModalOpen = ref(false);

const newCollection = ref<Omit<ResearchCollection, "id" | "createdAt">>({
  title: "",
  url: "",
  source: "web",
  note: "",
  category: "未分類",
});

let unsubscribe: (() => void) | null = null;

onMounted(() => {
  if (tripId) {
    unsubscribe = tripStore.subscribeToCollections(tripId, (data) => {
      collections.value = data;
    });
  }
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

const filteredCollections = computed(() => {
  if (activeFilter.value === "all") return collections.value;
  return collections.value.filter((item) => item.source === activeFilter.value);
});

const getSourceIcon = (source: CollectionSource) => {
  switch (source) {
    case "threads": return "🧵";
    case "instagram": return "📸";
    case "youtube": return "📺";
    case "web": return "🌐";
    default: return "📄";
  }
};

const handleAddCollection = async () => {
  if (!newCollection.value.title || !newCollection.value.url) return;
  
  try {
    await tripStore.addCollection(tripId, {
      ...newCollection.value,
      createdAt: new Date(),
    });
    isModalOpen.value = false;
    newCollection.value = { title: "", url: "", source: "web", note: "", category: "未分類" };
  } catch (err) {
    alert("新增失敗");
  }
};
</script>

<template>
  <div class="min-h-screen pb-32 animate-fade-in">
    <header class="px-6 pt-8 pb-4">
      <h1 class="text-2xl font-rounded font-bold text-forest-800">
        行前收集
      </h1>
      <p class="text-gray-500 text-sm">整理 Threads、IG 與網頁靈感</p>
      
      <!-- Filters -->
      <div class="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-2">
        <button 
          v-for="f in ['all', 'threads', 'instagram', 'web', 'youtube']" 
          :key="f"
          @click="activeFilter = f as any"
          class="px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap"
          :class="activeFilter === f ? 'bg-forest-500 text-white shadow-soft' : 'bg-white text-forest-400 border border-forest-100'"
        >
          {{ f.toUpperCase() }}
        </button>
      </div>
    </header>

    <main class="px-6 mt-2">
      <div v-if="filteredCollections.length === 0" class="py-20 text-center bg-white/50 rounded-3xl border-2 border-dashed border-forest-100">
        <div class="text-4xl mb-3">🔖</div>
        <p class="text-gray-500 font-medium">還沒有收集任何資料<br>點擊下方按鈕開始記錄</p>
      </div>

      <div class="grid gap-4">
        <div v-for="item in filteredCollections" :key="item.id" class="card-base group">
          <div class="flex justify-between items-start mb-2">
            <span class="text-xl">{{ getSourceIcon(item.source) }}</span>
            <a :href="item.url" target="_blank" class="text-forest-400 hover:text-forest-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          </div>
          <h3 class="font-bold text-forest-800 mb-1 leading-tight group-hover:text-forest-500 transition-colors">
            {{ item.title }}
          </h3>
          <p v-if="item.note" class="text-xs text-gray-500 line-clamp-2 mb-2">{{ item.note }}</p>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 bg-forest-50 text-forest-400 rounded text-[10px] font-bold">
              {{ item.category }}
            </span>
          </div>
        </div>
      </div>
    </main>

    <!-- FAB -->
    <button
      @click="isModalOpen = true"
      class="fixed bottom-28 right-6 w-14 h-14 bg-forest-400 text-white rounded-2xl shadow-soft-lg hover:bg-forest-500 hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer z-50"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </button>

    <!-- Simple Add Modal (Portal concept) -->
    <div v-if="isModalOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div class="absolute inset-0 bg-forest-900/40 backdrop-blur-sm" @click="isModalOpen = false"></div>
      <div class="relative w-full max-w-md bg-white rounded-3xl shadow-soft-xl p-6 animate-scale-in">
        <h2 class="text-xl font-bold text-forest-800 mb-4">新增收集</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-400 mb-1">標題</label>
            <input v-model="newCollection.title" type="text" class="w-full px-4 py-2 bg-cream-light border border-forest-100 rounded-xl focus:outline-none focus:border-forest-400" placeholder="例如：築地必吃美食清單">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 mb-1">網址 (URL)</label>
            <input v-model="newCollection.url" type="text" class="w-full px-4 py-2 bg-cream-light border border-forest-100 rounded-xl focus:outline-none focus:border-forest-400" placeholder="https://...">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 mb-1">來源</label>
              <select v-model="newCollection.source" class="w-full px-4 py-2 bg-cream-light border border-forest-100 rounded-xl focus:outline-none focus:border-forest-400">
                <option value="web">網頁文章</option>
                <option value="threads">Threads</option>
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 mb-1">分類</label>
              <input v-model="newCollection.category" type="text" class="w-full px-4 py-2 bg-cream-light border border-forest-100 rounded-xl focus:outline-none focus:border-forest-400" placeholder="美食、景點...">
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 mb-1">筆記</label>
            <textarea v-model="newCollection.note" rows="3" class="w-full px-4 py-2 bg-cream-light border border-forest-100 rounded-xl focus:outline-none focus:border-forest-400" placeholder="寫下你的心得或重點..."></textarea>
          </div>
          <button @click="handleAddCollection" class="w-full py-3 bg-forest-400 text-white font-bold rounded-xl shadow-soft hover:bg-forest-500 transition-colors">
            確認儲存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
</style>
