<script setup lang="ts">
/**
 * BottomNav Component
 * Refactored to use router-link for real navigation.
 */
import { computed } from "vue";
import { useRoute } from "vue-router";
import {
  Home,
  Map,
  Ticket,
  Wallet,
  Bookmark,
  CheckSquare,
  Settings,
} from "../../assets/icons";

const route = useRoute();

const navItems = computed(() => {
  // 動態獲取當前的 tripId
  const tripId = route.params.id;

  return [
    { id: "home", label: "首頁", path: "/", icon: Home },
    {
      id: "plan",
      label: "行程",
      path: tripId ? `/plan/${tripId}` : "/",
      disabled: !tripId,
      icon: Map,
    },
    {
      id: "booking",
      label: "預訂",
      path: tripId ? `/trip/${tripId}/booking` : "/",
      disabled: !tripId,
      icon: Ticket,
    },
    {
      id: "expense",
      label: "記帳",
      path: tripId ? `/trip/${tripId}/expense` : "/",
      disabled: !tripId,
      icon: Wallet,
    },
    {
      id: "collection",
      label: "資料",
      path: tripId ? `/trip/${tripId}/collection` : "/",
      disabled: !tripId,
      icon: Bookmark,
    },
    {
      id: "preparation",
      label: "準備",
      path: tripId ? `/trip/${tripId}/preparation` : "/",
      disabled: !tripId,
      icon: CheckSquare,
    },
    {
      id: "setting",
      label: "更多",
      path: tripId ? `/setting/${tripId}` : "/setting",
      disabled: false,
      icon: Settings,
    },
  ];
});

const activeTab = computed(() => {
  const path = route.path;
  if (path === "/") return "home";
  if (path.startsWith("/plan")) return "plan";
  if (path.includes("/booking")) return "booking";
  if (path.includes("/expense")) return "expense";
  if (path.includes("/collection")) return "collection";
  if (path.includes("/preparation")) return "preparation";
  if (path.includes("/setting")) return "setting";
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
        class="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 relative"
        :class="[
          activeTab === item.id
            ? 'text-forest-500 scale-110'
            : 'text-forest-200 hover:text-forest-300',
          item.disabled && route.path === '/'
            ? 'opacity-30 cursor-not-allowed pointer-events-none'
            : 'cursor-pointer',
        ]"
      >
        <component
          :is="item.icon"
          :size="22"
          :stroke-width="2.5"
          class="transition-transform"
        />
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
