<script setup lang="ts">
import { useAuthStore } from "../stores/authStore";
import { useUIStore } from "../stores/uiStore";
import { useRouter } from "vue-router";
import { ref, type FunctionalComponent } from "vue";
import { backupService } from "../services/backupService";
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
  DownloadCloud,
  Upload,
  RefreshCcw,
} from "../assets/icons";

interface SettingItem {
  id: string;
  label: string;
  icon: FunctionalComponent;
  action?: () => void | Promise<void>;
}

interface SettingGroup {
  title: string;
  items: SettingItem[];
}

const authStore = useAuthStore();
const uiStore = useUIStore();
const router = useRouter();
const isProcessing = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push("/login");
  } catch (error) {
    console.error("Logout Error:", error);
  }
};

const handleExport = async () => {
  if (!authStore.user) return;
  try {
    isProcessing.value = true;
    await backupService.exportToJSON(authStore.user.uid);
    uiStore.showToast("資料導出成功", "success");
  } catch (error) {
    console.error("Export Error:", error);
    uiStore.showToast("導出失敗", "error");
  } finally {
    isProcessing.value = false;
  }
};

const handleCloudBackup = async () => {
  if (!authStore.user) return;
  try {
    isProcessing.value = true;
    await backupService.createCloudBackup(authStore.user.uid);
    uiStore.showToast("已完成雲端備份", "success");
  } catch (error) {
    console.error("Backup Error:", error);
    uiStore.showToast("備份失敗", "error");
  } finally {
    isProcessing.value = false;
  }
};

const triggerImport = () => {
  fileInput.value?.click();
};

const handleImport = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file || !authStore.user) return;

  const confirmed = await uiStore.showConfirm({
    title: "確定要覆蓋資料嗎？",
    message: "導入操作將會『完全刪除』您目前的旅程資料，並以備份檔內容取代。此動作無法復原。",
    okText: "確定導入",
    cancelText: "取消",
  });

  if (!confirmed) {
    target.value = ""; // 清空檔案選擇
    return;
  }

  try {
    isProcessing.value = true;
    await backupService.importFromJSON(authStore.user.uid, file);
    uiStore.showToast("資料導入完成", "success");
    // 重新整理頁面或導航以更新 Store 狀態 (Optional)
    window.location.reload();
  } catch (error) {
    console.error("Import Error:", error);
    uiStore.showToast("導入失敗，格式不符或權限不足", "error");
  } finally {
    isProcessing.value = false;
    target.value = "";
  }
};

const settingsGroups: SettingGroup[] = [
  {
    title: "旅程管理",
    items: [
      { id: "members", label: "旅伴成員管理", icon: Users as FunctionalComponent },
      { id: "archive", label: "已封存的旅程", icon: Archive as FunctionalComponent },
    ],
  },
  {
    title: "資料安全",
    items: [
      {
        id: "backup",
        label: "建立雲端備份",
        icon: DownloadCloud as FunctionalComponent,
        action: handleCloudBackup,
      },
      {
        id: "export",
        label: "匯出 JSON 檔案",
        icon: Download as FunctionalComponent,
        action: handleExport,
      },
      {
        id: "import",
        label: "從備份檔導入",
        icon: Upload as FunctionalComponent,
        action: triggerImport,
      },
    ],
  },
  {
    title: "系統設定",
    items: [
      { id: "notifications", label: "通知提醒", icon: Bell as FunctionalComponent },
      { id: "currency", label: "預設幣別 (TWD)", icon: Coins as FunctionalComponent },
      { id: "theme", label: "主題風格 (森林綠)", icon: Palette as FunctionalComponent },
    ],
  },
  {
    title: "關於",
    items: [
      { id: "help", label: "使用幫助", icon: HelpCircle as FunctionalComponent },
      { id: "feedback", label: "意見回饋", icon: MessageSquare as FunctionalComponent },
      { id: "version", label: "版本資訊 (v2.0.0)", icon: Info as FunctionalComponent },
    ],
  },
];
</script>

<template>
  <div class="min-h-screen pb-32 animate-fade-in">
    <!-- Hidden File Input -->
    <input
      type="file"
      ref="fileInput"
      class="hidden"
      accept=".json"
      @change="handleImport"
    />

    <header
      class="px-6 pt-12 pb-8 bg-forest-800 text-white rounded-b-[40px] shadow-soft-lg mb-8"
    >
      <!-- ... (Header Content) -->
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
            @click="item.action ? item.action() : null"
            class="w-full card-base !p-4 flex items-center justify-between hover:bg-forest-50 transition-all cursor-pointer text-left"
          >
            <div class="flex items-center gap-4 text-forest-600">
              <component :is="item.icon" :size="20" />
              <span class="font-bold text-forest-800">{{ item.label }}</span>
            </div>
            <div class="flex items-center gap-2">
              <RefreshCcw
                v-if="isProcessing && item.action"
                class="animate-spin text-forest-200"
                :size="16"
              />
              <ChevronRight :size="20" class="text-forest-200" />
            </div>
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

    <!-- Global Processing Overlay -->
    <div
      v-if="isProcessing"
      class="fixed inset-0 bg-white/50 backdrop-blur-sm z-[600] flex flex-col items-center justify-center space-y-4"
    >
      <div
        class="w-12 h-12 border-4 border-forest-100 border-t-forest-400 rounded-full animate-spin"
      ></div>
      <p class="text-forest-800 font-bold font-rounded">正在處理資料...</p>
    </div>
  </div>
</template>
