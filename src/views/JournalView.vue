<script setup lang="ts">
const journals = [
  {
    id: 1,
    title: "淺草寺初體驗",
    date: "2024.03.20",
    image:
      "https://images.unsplash.com/photo-1542641728-6ca359b085f4?q=80&w=400&auto=format&fit=crop",
    mood: "😊",
    likes: 12,
  },
  {
    id: 2,
    title: "一蘭拉麵：真的排好久",
    date: "2024.03.20",
    image:
      "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?q=80&w=400&auto=format&fit=crop",
    mood: "😋",
    likes: 8,
  },
  {
    id: 3,
    title: "新宿御苑：櫻花還沒全開",
    date: "2024.03.21",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=400&auto=format&fit=crop",
    mood: "🤔",
    likes: 15,
  },
  {
    id: 4,
    title: "夜晚的晴空塔",
    date: "2024.03.21",
    image:
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=400&auto=format&fit=crop",
    mood: "🤩",
    likes: 24,
  },
];
</script>

<template>
  <div class="min-h-screen pb-32 animate-fade-in">
    <header class="px-6 pt-8 pb-4 flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-rounded font-bold text-forest-800">
          旅行日誌
        </h1>
        <p class="text-gray-500 text-sm">記錄下每一刻的感動</p>
      </div>
      <button
        class="w-10 h-10 bg-forest-100 text-forest-500 rounded-full flex items-center justify-center cursor-pointer shadow-soft-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48"
          />
        </svg>
      </button>
    </header>

    <main class="px-6 mt-6">
      <!-- Masonry Grid -->
      <div class="columns-2 gap-4 space-y-4">
        <div v-for="note in journals" :key="note.id" class="break-inside-avoid">
          <div class="card-base !p-0 overflow-hidden relative group">
            <img
              :src="note.image"
              :alt="note.title"
              class="w-full h-auto object-cover"
            />

            <!-- Mood Badge -->
            <div
              class="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-lg shadow-sm"
            >
              {{ note.mood }}
            </div>

            <div class="p-4">
              <h3 class="font-bold text-forest-800 text-sm mb-1 leading-tight">
                {{ note.title }}
              </h3>
              <div class="flex justify-between items-center">
                <span class="text-[10px] text-gray-400">{{ note.date }}</span>
                <div class="flex items-center gap-1 text-[10px] text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="text-coral-red"
                  >
                    <path
                      d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
                    />
                  </svg>
                  {{ note.likes }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- FAB: New Post -->
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
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    </button>
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
