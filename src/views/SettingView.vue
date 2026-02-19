<script setup lang="ts">
import { useAuthStore } from "../stores/authStore";
import { useRouter } from "vue-router";

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
      { id: "members", label: "旅伴成員管理" },
      { id: "export", label: "匯出旅程資料" },
      { id: "archive", label: "已封存的旅程" },
    ],
  },
  {
    title: "系統設定",
    items: [
      { id: "notifications", label: "通知提醒" },
      { id: "currency", label: "預設幣別 (TWD)" },
      { id: "theme", label: "主題風格 (森林綠)" },
    ],
  },
  {
    title: "關於",
    items: [
      { id: "help", label: "使用幫助" },
      { id: "feedback", label: "意見回饋" },
      { id: "version", label: "版本資訊 (v1.0.0)" },
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
              <!-- Icons based on ID -->
              <svg
                v-if="item.id === 'members'"
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
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <svg
                v-if="item.id === 'export'"
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
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              <svg
                v-if="item.id === 'archive'"
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
                <rect width="20" height="5" x="2" y="3" rx="1" />
                <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
                <path d="M10 12h4" />
              </svg>
              <svg
                v-if="item.id === 'notifications'"
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
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              <svg
                v-if="item.id === 'currency'"
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
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <path d="M8 12h8" />
              </svg>
              <svg
                v-if="item.id === 'theme'"
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
                <path d="M7 20h10" />
                <path d="M10 20c5.5-2.5 8-6.4 8-10" />
                <path
                  d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"
                />
                <path
                  d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"
                />
              </svg>
              <svg
                v-if="item.id === 'help'"
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
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <svg
                v-if="item.id === 'feedback'"
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
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                />
              </svg>
              <svg
                v-if="item.id === 'version'"
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
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>

              <span class="font-bold text-forest-800">{{ item.label }}</span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-forest-200"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div class="pt-4">
        <button
          @click="handleLogout"
          class="w-full py-4 text-coral-red font-bold flex items-center justify-center gap-2 hover:bg-coral-red/5 rounded-2xl transition-all cursor-pointer"
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
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          登出帳號
        </button>
      </div>
    </main>
  </div>
</template>
