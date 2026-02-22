<script setup lang="ts">
import { useAuthStore } from "../stores/authStore";
import { useUIStore } from "../stores/uiStore";
import { useRouter } from "vue-router";
import { ref, onMounted, type FunctionalComponent } from "vue";
import {
  backupService,
  type ExportDataPackage,
} from "../services/backupService";
import type { Timestamp } from "firebase/firestore";
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
  Github,
  DownloadCloud,
  Upload,
  RefreshCcw,
  Clock,
  RotateCcw,
} from "../assets/icons";

interface SettingItem {
  id: string;
  label: string;
  icon: FunctionalComponent;
  action?: () => void | Promise<void>;
  link?: string;
}

interface SettingGroup {
  title: string;
  items: SettingItem[];
}

interface CloudBackupRecord extends ExportDataPackage {
  id: string;
  createdAt: Timestamp;
}

const authStore = useAuthStore();
const uiStore = useUIStore();
const router = useRouter();
const isProcessing = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const cloudBackups = ref<CloudBackupRecord[]>([]);
const isFetchingBackups = ref(false);

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push("/login");
  } catch (error) {
    console.error("Logout Error:", error);
  }
};

const fetchBackups = async () => {
  if (!authStore.user) return;
  try {
    isFetchingBackups.value = true;
    const records = await backupService.listCloudBackups(authStore.user.uid);
    cloudBackups.value = records as CloudBackupRecord[];
  } catch (error) {
    console.error("Fetch Backups Error:", error);
  } finally {
    isFetchingBackups.value = false;
  }
};

onMounted(() => {
  fetchBackups();
});

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
    await fetchBackups(); // 重新整理列表
  } catch (error) {
    console.error("Backup Error:", error);
    uiStore.showToast("備份失敗", "error");
  } finally {
    isProcessing.value = false;
  }
};

const handleCloudRestore = async (backupId: string, dateLabel: string) => {
  if (!authStore.user) return;

  const confirmed = await uiStore.showConfirm({
    title: "從雲端還原？",
    message: `確定要還原 ${dateLabel} 的備份嗎？這會『完全覆蓋』目前的旅程資料且無法復原。`,
    okText: "開始還原",
    cancelText: "取消",
  });

  if (!confirmed) return;

  try {
    isProcessing.value = true;
    await backupService.restoreFromCloud(authStore.user.uid, backupId);
    uiStore.showToast("雲端還原完成", "success");
    window.location.reload();
  } catch (error) {
    console.error("Restore Error:", error);
    uiStore.showToast("還原失敗，請稍後再試", "error");
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
    message:
      "導入操作將會『完全刪除』您目前的旅程資料，並以備份檔內容取代。此動作無法復原。",
    okText: "確定導入",
    cancelText: "取消",
  });

  if (!confirmed) {
    target.value = "";
    return;
  }

  try {
    isProcessing.value = true;
    await backupService.importFromJSON(authStore.user.uid, file);
    uiStore.showToast("資料導入完成", "success");
    window.location.reload();
  } catch (error) {
    console.error("Import Error:", error);
    uiStore.showToast("導入失敗，格式不符", "error");
  } finally {
    isProcessing.value = false;
    target.value = "";
  }
};

const formatDate = (
  ts: Timestamp | Date | number | string | null | undefined,
) => {
  if (!ts) return "未知時間";

  let date: Date;
  if (ts instanceof Date) {
    date = ts;
  } else if (ts && typeof ts === "object" && "toDate" in ts) {
    date = (ts as Timestamp).toDate();
  } else {
    date = new Date(ts as string | number);
  }

  return date.toLocaleString("zh-TW", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const settingsGroups: SettingGroup[] = [
  {
    title: "旅程管理",
    items: [
      {
        id: "members",
        label: "旅伴成員管理",
        icon: Users as FunctionalComponent,
      },
      {
        id: "archive",
        label: "已封存的旅程",
        icon: Archive as FunctionalComponent,
      },
    ],
  },
  {
    title: "資料安全",
    items: [
      {
        id: "backup",
        label: "立即建立雲端備份",
        icon: DownloadCloud as FunctionalComponent,
        action: handleCloudBackup,
      },
      {
        id: "export",
        label: "匯出本地 JSON 檔案",
        icon: Download as FunctionalComponent,
        action: handleExport,
      },
      {
        id: "import",
        label: "從本地備份檔導入",
        icon: Upload as FunctionalComponent,
        action: triggerImport,
      },
    ],
  },
  {
    title: "系統設定",
    items: [
      {
        id: "notifications",
        label: "通知提醒",
        icon: Bell as FunctionalComponent,
      },
      {
        id: "currency",
        label: "預設幣別 (TWD)",
        icon: Coins as FunctionalComponent,
      },
      {
        id: "theme",
        label: "主題風格 (森林綠)",
        icon: Palette as FunctionalComponent,
      },
    ],
  },
  {
    title: "關於",
    items: [
      {
        id: "github",
        label: "GitHub 專案源碼",
        icon: Github as FunctionalComponent,
        action: () => {
          window.open("https://github.com/final898y/Travelogue", "_blank");
        },
      },
      {
        id: "help",
        label: "使用幫助",
        icon: HelpCircle as FunctionalComponent,
      },
      {
        id: "feedback",
        label: "意見回饋",
        icon: MessageSquare as FunctionalComponent,
      },
      {
        id: "version",
        label: "版本資訊 (v2.1.6)",
        icon: Info as FunctionalComponent,
      },
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

          <!-- Special Section: Cloud Backups List (Only in Data Security Group) -->
          <div v-if="group.title === '資料安全'" class="pt-2">
            <div class="flex justify-between items-center mb-2 px-1">
              <h4 class="text-[10px] font-bold text-forest-300 uppercase">
                最近的雲端備份
              </h4>
              <button
                @click="fetchBackups"
                class="p-1 text-forest-200 hover:text-forest-400 transition-colors cursor-pointer"
              >
                <RefreshCcw
                  :size="12"
                  :class="{ 'animate-spin': isFetchingBackups }"
                />
              </button>
            </div>

            <div v-if="cloudBackups.length > 0" class="space-y-2">
              <div
                v-for="b in cloudBackups.slice(0, 3)"
                :key="b.id"
                class="flex items-center justify-between p-3 bg-white/50 border border-forest-50 rounded-xl"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-lg bg-forest-50 flex items-center justify-center text-forest-300"
                  >
                    <Clock :size="16" />
                  </div>
                  <div>
                    <p class="text-xs font-bold text-forest-800">
                      {{ formatDate(b.createdAt) }}
                    </p>
                    <p class="text-[9px] text-gray-400">
                      包含 {{ b.trips?.length || 0 }} 趟旅程
                    </p>
                  </div>
                </div>
                <button
                  @click="handleCloudRestore(b.id, formatDate(b.createdAt))"
                  class="px-3 py-1.5 bg-forest-100 text-forest-600 rounded-lg text-[10px] font-bold hover:bg-forest-200 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw :size="12" />
                  還原
                </button>
              </div>
            </div>
            <p
              v-else-if="!isFetchingBackups"
              class="text-center py-4 text-[10px] text-gray-400 italic"
            >
              尚無雲端備份紀錄
            </p>
          </div>
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
