<script setup lang="ts">
import { useAuthStore } from "../stores/authStore";
import { useRouter } from "vue-router";
import {
  Users,
  Download,
  Archive,
  Bell,
  Coins,
  Palette,
  HelpCircle,
  MessageSquare,
  Info,
  ChevronRight,
  LogOut,
} from "../assets/icons";

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push("/login");
  } catch (error) {
    console.error("Logout Error:", error);
  }
};

const settingsGroups = [
  {
    title: "旅程管理",
    items: [
      { id: "members", label: "旅伴成員管理", icon: Users },
      { id: "export", label: "匯出旅程資料", icon: Download },
      { id: "archive", label: "已封存的旅程", icon: Archive },
    ],
  },
  {
    title: "系統設定",
    items: [
      { id: "notifications", label: "通知提醒", icon: Bell },
      { id: "currency", label: "預設幣別 (TWD)", icon: Coins },
      { id: "theme", label: "主題風格 (森林綠)", icon: Palette },
    ],
  },
  {
    title: "關於",
    items: [
      { id: "help", label: "使用幫助", icon: HelpCircle },
      { id: "feedback", label: "意見回饋", icon: MessageSquare },
      { id: "version", label: "版本資訊 (v1.0.0)", icon: Info },
    ],
  },
];
</script>

<template>
  <div class="min-h-screen pb-32 animate-fade-in">
    <header
      class="px-6 pt-12 pb-8 bg-forest-800 text-white rounded-b-[40px] shadow-soft-lg mb-8"
    >
      <div class="flex items-center gap-6">
        <div
          class="w-20 h-20 rounded-3xl border-4 border-white/20 overflow-hidden shadow-soft bg-forest-700 flex items-center justify-center"
        >
          <img
            v-if="authStore.user?.photoURL"
            :src="authStore.user.photoURL"
            alt="Avatar"
            class="w-full h-full object-cover"
          />
          <span v-else class="text-2xl font-bold">{{
            authStore.user?.displayName?.charAt(0) || "U"
          }}</span>
        </div>
        <div>
          <h1 class="text-2xl font-rounded font-bold">
            {{ authStore.user?.displayName || "未登入" }}
          </h1>
          <p class="text-white/60 text-sm flex items-center gap-1">
            {{ authStore.user?.email || "travelogue@example.com" }}
          </p>
        </div>
      </div>
    </header>

    <main class="px-6 space-y-8">
      <div v-for="group in settingsGroups" :key="group.title" class="space-y-3">
        <h3
          class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1"
        >
          {{ group.title }}
        </h3>
        <div class="space-y-2">
          <button
            v-for="item in group.items"
            :key="item.id"
            class="w-full card-base !p-4 flex items-center justify-between hover:bg-forest-50 transition-all cursor-pointer text-left"
          >
            <div class="flex items-center gap-4 text-forest-600">
              <component :is="item.icon" :size="20" />
              <span class="font-bold text-forest-800">{{ item.label }}</span>
            </div>
            <ChevronRight :size="20" class="text-forest-200" />
          </button>
        </div>
      </div>

      <div class="pt-4">
        <button
          @click="handleLogout"
          class="w-full py-4 text-coral-red font-bold flex items-center justify-center gap-2 hover:bg-coral-red/5 rounded-2xl transition-all cursor-pointer"
        >
          <LogOut :size="20" />
          登出帳號
        </button>
      </div>
    </main>
  </div>
</template>
