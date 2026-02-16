<script setup lang="ts">
/**
 * BottomNav Component
 * Refactored to use router-link for real navigation.
 */
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const navItems = [
  { id: "home", label: "首頁", path: "/" },
  { id: "schedule", label: "行程", path: "/schedule" },
  { id: "bookings", label: "預訂", path: "/bookings" },
  { id: "expense", label: "記帳", path: "/expense" },
  { id: "journal", label: "日誌", path: "/journal" },
  { id: "planning", label: "準備", path: "/planning" },
  { id: "settings", label: "更多", path: "/settings" },
];

const activeTab = computed(() => {
  const path = route.path;
  if (path === "/") return "home";
  if (path === "/schedule") return "schedule";
  if (path === "/bookings") return "bookings";
  if (path === "/expense") return "expense";
  if (path === "/journal") return "journal";
  if (path === "/planning") return "planning";
  if (path === "/settings") return "settings";
  return "";
});
</script>

<template>
  <nav class="fixed bottom-6 left-6 right-6 z-50">
    <div
      class="max-w-md mx-auto bg-white/90 backdrop-blur-xl border border-forest-100/50 rounded-2xl shadow-soft-lg px-2 py-2 flex justify-around items-center"
    >
      <router-link
        v-for="item in navItems"
        :key="item.id"
        :to="item.path"
        class="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 cursor-pointer relative"
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
          <!-- Home Icon -->
          <template v-if="item.id === 'home'">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </template>

          <!-- Schedule Icon -->
          <template v-if="item.id === 'schedule'">
            <path
              d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
            />
            <path d="M12 3v1" />
            <path d="M12 7v1" />
            <path d="M12 11v1" />
          </template>

          <!-- Bookings Icon -->
          <template v-if="item.id === 'bookings'">
            <path d="M3 10h18" />
            <path d="M7 15h0" />
            <path d="M11 15h0" />
            <rect x="3" y="5" width="18" height="14" rx="2" />
          </template>

          <!-- Expense Icon -->
          <template v-if="item.id === 'expense'">
            <path d="M12 1v22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </template>

          <!-- Journal Icon -->
          <template v-if="item.id === 'journal'">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </template>

          <!-- Planning Icon -->
          <template v-if="item.id === 'planning'">
            <polyline points="9 11 12 14 22 4" />
            <path
              d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
            />
          </template>

          <!-- Settings (More) Icon -->
          <template v-if="item.id === 'settings'">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </template>
        </svg>
        <span class="text-[10px] mt-1 font-bold">{{ item.label }}</span>

        <!-- Active Dot Indicator -->
        <div
          v-if="activeTab === item.id"
          class="absolute -bottom-1 w-1 h-1 bg-forest-400 rounded-full animate-pulse"
        ></div>
      </router-link>
    </div>
  </nav>
</template>
