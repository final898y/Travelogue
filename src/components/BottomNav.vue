<script setup lang="ts">
/**
 * BottomNav Component
 * Follows 'Floating Navbar' guideline: space from edges, clear active states.
 */
import { ref } from "vue";

const navItems = [
  {
    id: "schedule",
    label: "行程",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    id: "booking",
    label: "預訂",
    icon: "M15 5v2m0 4v2m0 4v2M5 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  }, // Simplified Ticket-like icon usage logic
  {
    id: "expense",
    label: "記帳",
    icon: "M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z M12 2v2 M12 20v2 M4.22 4.22l1.42 1.42 M18.36 18.36l1.42 1.42 M1 12h2 M21 12h2 M4.22 19.78l1.42-1.42 M18.36 5.64l1.42-1.42",
  },
  {
    id: "journal",
    label: "日誌",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  },
  { id: "more", label: "更多", icon: "M4 6h16M4 12h16M4 18h16" },
];

const activeTab = ref("schedule");
</script>

<template>
  <nav class="fixed bottom-6 left-6 right-6 z-50">
    <div
      class="max-w-md mx-auto bg-white/90 backdrop-blur-xl border border-forest-100/50 rounded-2xl shadow-soft-lg px-2 py-2 flex justify-around items-center"
    >
      <button
        v-for="item in navItems"
        :key="item.id"
        @click="activeTab = item.id"
        class="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 cursor-pointer"
        :class="
          activeTab === item.id
            ? 'text-forest-500 scale-110'
            : 'text-forest-200 hover:text-forest-300'
        "
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
          class="transition-transform"
        >
          <path
            :d="item.icon"
            v-if="
              item.id !== 'booking' &&
              item.id !== 'journal' &&
              item.id !== 'more' &&
              item.id !== 'expense'
            "
          ></path>
          <path
            d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
            v-if="item.id === 'schedule'"
          ></path>
          <path d="M12 3v1" v-if="item.id === 'schedule'"></path>
          <path d="M12 7v1" v-if="item.id === 'schedule'"></path>
          <path d="M12 11v1" v-if="item.id === 'schedule'"></path>

          <path d="M3 10h18" v-if="item.id === 'booking'"></path>
          <path d="M7 15h0" v-if="item.id === 'booking'"></path>
          <path d="M11 15h0" v-if="item.id === 'booking'"></path>
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
            v-if="item.id === 'booking'"
          ></rect>

          <path d="M12 1v22" v-if="item.id === 'expense'"></path>
          <path
            d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
            v-if="item.id === 'expense'"
          ></path>

          <path
            d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"
            v-if="item.id === 'journal'"
          ></path>
          <path
            d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
            v-if="item.id === 'journal'"
          ></path>

          <line x1="3" y1="12" x2="21" y2="12" v-if="item.id === 'more'"></line>
          <line x1="3" y1="6" x2="21" y2="6" v-if="item.id === 'more'"></line>
          <line x1="3" y1="18" x2="21" y2="18" v-if="item.id === 'more'"></line>
        </svg>
        <span class="text-[10px] mt-1 font-bold">{{ item.label }}</span>

        <!-- Active Dot Indicator -->
        <div
          v-if="activeTab === item.id"
          class="absolute -bottom-1 w-1 h-1 bg-forest-400 rounded-full animate-pulse"
        ></div>
      </button>
    </div>
  </nav>
</template>
