<script setup lang="ts"></script>

<template>
  <div
    class="min-h-screen p-8 flex flex-col items-center justify-center animate-fade-in"
  >
    <div class="card-base max-w-md w-full text-center space-y-6">
      <div class="space-y-2">
        <h1 class="text-4xl">Travelogue</h1>
        <p class="text-gray-500">溫馨自然風格的旅遊規劃</p>
      </div>

      <div class="py-4">
        <div class="flex flex-wrap gap-2 justify-center mb-6">
          <span class="badge-forest">行程規劃</span>
          <span
            class="px-3 py-1 bg-sky-blue/10 text-sky-blue text-xs font-bold rounded-full"
            >交通資訊</span
          >
          <span
            class="px-3 py-1 bg-lavender/10 text-lavender text-xs font-bold rounded-full"
            >住宿預訂</span
          >
          <span
            class="px-3 py-1 bg-honey-orange/10 text-honey-orange text-xs font-bold rounded-full"
            >美食地圖</span
          >
        </div>

        <input
          type="text"
          placeholder="要去哪裡旅行？"
          class="input-base w-full mb-4"
        />

        <div class="flex gap-4 justify-center">
          <button class="btn-primary">開始規劃</button>
          <button class="btn-secondary">查看日誌</button>
        </div>
      </div>

      <div class="pt-4 border-t border-forest-100">
        <p class="text-xs text-forest-300 font-mono">DESIGN SYSTEM V1.0.0</p>
      </div>
    </div>

    <div class="mt-8 text-forest-400 animate-bounce-soft">
      <span class="text-2xl">🌿</span>
    </div>
  </div>
</template>

<style scoped></style>
