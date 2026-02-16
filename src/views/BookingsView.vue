<script setup lang="ts">
import { ref } from "vue";

const isLocked = ref(true);
const pin = ref("");
const correctPin = "1234";
const error = ref(false);

const handleInput = (num: number) => {
  if (pin.value.length < 4) {
    pin.value += num;
    error.value = false;
  }
  if (pin.value.length === 4) {
    if (pin.value === correctPin) {
      setTimeout(() => {
        isLocked.value = false;
      }, 300);
    } else {
      setTimeout(() => {
        pin.value = "";
        error.value = true;
      }, 300);
    }
  }
};

const bookings = [
  {
    id: 1,
    type: "flight",
    title: "長榮航空 BR-198",
    from: "TPE",
    to: "NRT",
    departure: "13:30",
    arrival: "16:50",
    date: "2024/03/20",
    seat: "23A",
    gate: "B7",
    confirmation: "ABC12345",
  },
  {
    id: 2,
    type: "hotel",
    title: "京王廣場大飯店",
    address: "新宿區西新宿 2-2-1",
    checkIn: "3/20 15:00",
    checkOut: "3/24 11:00",
    confirmation: "KEIO-9988",
  },
];
</script>

<template>
  <div class="min-h-screen pb-32 animate-fade-in">
    <!-- PIN Lock Overlay -->
    <div
      v-if="isLocked"
      class="fixed inset-0 z-40 bg-cream flex flex-col items-center justify-center px-6"
    >
      <div class="mb-12 text-center">
        <div
          class="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center text-forest-500 mx-auto mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 class="text-xl font-rounded font-bold text-forest-800">
          輸入 PIN 碼
        </h2>
        <p class="text-gray-500 text-sm mt-2">請輸入 4 位數字以查看預訂詳情</p>
      </div>

      <!-- PIN Dots -->
      <div class="flex gap-4 mb-12">
        <div
          v-for="i in 4"
          :key="i"
          class="w-4 h-4 rounded-full border-2 transition-all duration-200"
          :class="[
            pin.length >= i
              ? 'bg-forest-400 border-forest-400 scale-110'
              : 'border-forest-200',
            error && pin.length === 0
              ? 'border-coral-red bg-coral-red animate-pulse'
              : '',
          ]"
        ></div>
      </div>

      <!-- Keypad -->
      <div class="grid grid-cols-3 gap-6 w-full max-w-xs">
        <button
          v-for="n in 9"
          :key="n"
          @click="handleInput(n)"
          class="w-full aspect-square flex items-center justify-center text-2xl font-rounded font-bold text-forest-700 bg-white rounded-2xl shadow-soft-sm active:scale-90 transition-all cursor-pointer"
        >
          {{ n }}
        </button>
        <div class="w-full aspect-square"></div>
        <button
          @click="handleInput(0)"
          class="w-full aspect-square flex items-center justify-center text-2xl font-rounded font-bold text-forest-700 bg-white rounded-2xl shadow-soft-sm active:scale-90 transition-all cursor-pointer"
        >
          0
        </button>
        <button
          @click="pin = ''"
          class="w-full aspect-square flex items-center justify-center text-forest-400 active:scale-90 transition-all cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
            <line x1="18" y1="9" x2="12" y2="15" />
            <line x1="12" y1="9" x2="18" y2="15" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Bookings Content -->
    <template v-else>
      <header class="px-6 pt-8 pb-4">
        <h1 class="text-2xl font-rounded font-bold text-forest-800">
          預訂行程
        </h1>
        <p class="text-gray-500 text-sm">管理你的機票、住宿與票券</p>
      </header>

      <main class="px-6 space-y-6 mt-4">
        <!-- Categories -->
        <div class="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 no-scrollbar">
          <button
            class="badge-forest whitespace-nowrap !px-4 !py-2 bg-forest-400 text-white"
          >
            全部
          </button>
          <button class="badge-forest whitespace-nowrap !px-4 !py-2">
            機票
          </button>
          <button class="badge-forest whitespace-nowrap !px-4 !py-2">
            住宿
          </button>
          <button class="badge-forest whitespace-nowrap !px-4 !py-2">
            交通
          </button>
        </div>

        <!-- Boarding Pass Style -->
        <div
          v-for="booking in bookings"
          :key="booking.id"
          class="card-base !p-0 overflow-hidden"
        >
          <div v-if="booking.type === 'flight'" class="flex flex-col">
            <div
              class="bg-forest-400 p-4 text-white flex justify-between items-center"
            >
              <span class="font-bold">{{ booking.title }}</span>
              <span class="text-xs opacity-80">{{ booking.date }}</span>
            </div>
            <div class="p-6">
              <div class="flex justify-between items-center mb-6">
                <div class="text-center">
                  <div class="text-3xl font-bold text-forest-800">
                    {{ booking.from }}
                  </div>
                  <div class="text-xs text-gray-500 uppercase">Taipei</div>
                </div>
                <div class="flex-1 flex flex-col items-center px-4">
                  <div
                    class="w-full border-t-2 border-dashed border-forest-200 relative"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      class="text-forest-400 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90"
                    >
                      <path
                        d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                      />
                    </svg>
                  </div>
                </div>
                <div class="text-center">
                  <div class="text-3xl font-bold text-forest-800">
                    {{ booking.to }}
                  </div>
                  <div class="text-xs text-gray-500 uppercase">Tokyo</div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <div>
                  <div class="text-[10px] text-gray-400 uppercase font-bold">
                    Departure
                  </div>
                  <div class="text-lg font-bold text-forest-700">
                    {{ booking.departure }}
                  </div>
                </div>
                <div>
                  <div class="text-[10px] text-gray-400 uppercase font-bold">
                    Arrival
                  </div>
                  <div class="text-lg font-bold text-forest-700">
                    {{ booking.arrival }}
                  </div>
                </div>
                <div>
                  <div class="text-[10px] text-gray-400 uppercase font-bold">
                    Seat
                  </div>
                  <div class="text-lg font-bold text-forest-700">
                    {{ booking.seat }}
                  </div>
                </div>
                <div>
                  <div class="text-[10px] text-gray-400 uppercase font-bold">
                    Confirmation
                  </div>
                  <div class="text-lg font-bold text-forest-700">
                    {{ booking.confirmation }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="p-6">
            <div class="flex items-start gap-4">
              <div
                class="w-12 h-12 bg-lavender/20 rounded-xl flex items-center justify-center text-lavender flex-shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M2 20h20" />
                  <path d="M7 20v-5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v5" />
                  <path d="M11 17h2" />
                  <path d="M12 4v4" />
                  <path d="M15 8H9a2 2 0 0 0-2 2v10" />
                  <path d="M17 10v10" />
                  <path d="M9 4h6" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="font-bold text-forest-800">{{ booking.title }}</h3>
                <p class="text-sm text-gray-500">{{ booking.address }}</p>
                <div class="mt-4 flex justify-between items-end">
                  <div class="space-y-1">
                    <div class="text-[10px] text-gray-400 uppercase font-bold">
                      Check-in / Out
                    </div>
                    <div class="text-sm font-medium text-forest-700">
                      {{ booking.checkIn }} - {{ booking.checkOut }}
                    </div>
                  </div>
                  <div
                    class="text-xs font-bold text-forest-400 bg-forest-50 px-2 py-1 rounded"
                  >
                    #{{ booking.confirmation }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>
  </div>
</template>
