# 技術架構更新 - TypeScript + 可分享 URL 設計

**版本**: 1.2.0  
**更新日期**: 2026-02-14  
**重點**: TypeScript Composition API + 可分享的獨立頁面 URL

---

## 🎯 核心技術決策

### 1. TypeScript + Composition API（強制使用）

所有元件必須使用 `<script setup lang="ts">` 語法：

```vue
<!-- ✅ 正確示範 -->
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { Schedule } from "@/types/schedule";

interface Props {
  schedule: Schedule;
  editable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  editable: false,
});

const emit = defineEmits<{
  update: [schedule: Schedule];
  delete: [id: string];
}>();

const isEditing = ref(false);
const localSchedule = ref<Schedule>({ ...props.schedule });

const formattedTime = computed(() => {
  return new Date(props.schedule.date).toLocaleTimeString("zh-TW");
});

onMounted(() => {
  console.log("Component mounted");
});

function handleSave() {
  emit("update", localSchedule.value);
  isEditing.value = false;
}
</script>

<template>
  <div class="schedule-card">
    <!-- template content -->
  </div>
</template>
```

**禁止使用**：

- ❌ Options API
- ❌ `<script lang="ts">` (非 setup 語法)
- ❌ 任何 `any` 類型（除非絕對必要）

---

### 2. 路由架構：可分享的獨立 URL

**核心需求**：每個頁面都有獨立、可分享的 URL

#### 不是傳統 SPA 的概念

雖然技術上還是使用 Vue Router，但我們的路由設計讓每個頁面都像「獨立頁面」一樣可以直接存取。

#### 路由設計原則

```typescript
// ✅ 好的路由設計 - 可直接分享
/trip/abc123/schedule           // 行程頁
/trip/abc123/schedule/detail/xyz  // 特定行程詳情
/trip/abc123/bookings           // 預訂頁
/trip/abc123/expense            // 記帳頁
/trip/abc123/map                // 地圖視圖

// ❌ 避免的設計 - 無法直接分享
/#/schedule                      // Hash mode
/app?tab=schedule               // Query parameter navigation
```

---

## 📁 完整路由結構

### router/index.ts

```typescript
import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  // 首頁 - 旅程列表
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/Home.vue"),
    meta: {
      title: "Travelogue - Your Travel Planner",
      requiresAuth: false,
    },
  },

  // 建立新旅程
  {
    path: "/trip/new",
    name: "CreateTrip",
    component: () => import("@/views/CreateTrip.vue"),
    meta: {
      title: "Create New Trip",
      requiresAuth: false,
    },
  },

  // 旅程主路由（包含所有子頁面）
  {
    path: "/trip/:tripId",
    component: () => import("@/layouts/TripLayout.vue"),
    children: [
      // 行程管理
      {
        path: "schedule",
        name: "Schedule",
        component: () => import("@/views/schedule/ScheduleView.vue"),
        meta: {
          title: "Schedule",
          icon: "calendar-alt",
        },
      },
      {
        path: "schedule/detail/:scheduleId",
        name: "ScheduleDetail",
        component: () => import("@/views/schedule/ScheduleDetail.vue"),
        meta: {
          title: "Schedule Detail",
          showBack: true,
        },
      },
      {
        path: "schedule/new",
        name: "CreateSchedule",
        component: () => import("@/views/schedule/ScheduleForm.vue"),
        meta: {
          title: "Add Schedule",
          showBack: true,
        },
      },
      {
        path: "schedule/edit/:scheduleId",
        name: "EditSchedule",
        component: () => import("@/views/schedule/ScheduleForm.vue"),
        meta: {
          title: "Edit Schedule",
          showBack: true,
        },
      },

      // 預訂管理
      {
        path: "bookings",
        name: "Bookings",
        component: () => import("@/views/bookings/BookingsView.vue"),
        meta: {
          title: "Bookings",
          icon: "ticket-alt",
          requiresPinUnlock: true,
        },
      },
      {
        path: "bookings/detail/:bookingId",
        name: "BookingDetail",
        component: () => import("@/views/bookings/BookingDetail.vue"),
        meta: {
          title: "Booking Detail",
          showBack: true,
        },
      },

      // 記帳管理
      {
        path: "expense",
        name: "Expense",
        component: () => import("@/views/expense/ExpenseView.vue"),
        meta: {
          title: "Expenses",
          icon: "wallet",
        },
      },
      {
        path: "expense/new",
        name: "AddExpense",
        component: () => import("@/views/expense/ExpenseForm.vue"),
        meta: {
          title: "Add Expense",
          showBack: true,
        },
      },

      // 日誌
      {
        path: "journal",
        name: "Journal",
        component: () => import("@/views/collection/CollectionView.vue"),
        meta: {
          title: "Journal",
          icon: "book",
        },
      },
      {
        path: "journal/detail/:journalId",
        name: "JournalDetail",
        component: () => import("@/views/journal/JournalDetail.vue"),
        meta: {
          title: "Journal Entry",
          showBack: true,
        },
      },
      {
        path: "journal/new",
        name: "CreateJournal",
        component: () => import("@/views/journal/JournalEditor.vue"),
        meta: {
          title: "New Journal",
          showBack: true,
        },
      },

      // 準備清單
      {
        path: "planning",
        name: "Planning",
        component: () => import("@/views/planning/PlanningView.vue"),
        meta: {
          title: "Planning",
          icon: "tasks",
        },
      },

      // 成員管理
      {
        path: "members",
        name: "Members",
        component: () => import("@/views/members/MembersView.vue"),
        meta: {
          title: "Members",
          icon: "users",
        },
      },

      // 地圖視圖
      {
        path: "map",
        name: "MapView",
        component: () => import("@/views/map/MapView.vue"),
        meta: {
          title: "Map View",
          icon: "map",
          fullscreen: true,
        },
      },

      // 設定
      {
        path: "settings",
        name: "Settings",
        component: () => import("@/views/settings/SettingsView.vue"),
        meta: {
          title: "Settings",
          icon: "cog",
        },
      },

      // 預設重定向到行程頁
      {
        path: "",
        redirect: { name: "Schedule" },
      },
    ],
  },

  // 分享頁面（唯讀模式）
  {
    path: "/share/:shareId",
    name: "SharedTrip",
    component: () => import("@/views/share/SharedTripView.vue"),
    meta: {
      title: "Shared Trip",
      requiresAuth: false,
      isReadOnly: true,
    },
  },

  // 404 頁面
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
    meta: {
      title: "404 Not Found",
    },
  },
];

const router = createRouter({
  // 🔥 重點：使用 History Mode（非 Hash Mode）
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // 路由切換時滾動到頂部
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// 全域路由守衛
router.beforeEach(async (to, from, next) => {
  // 設定頁面標題
  document.title = to.meta.title
    ? `${to.meta.title} - Travelogue`
    : "Travelogue";

  // PIN 碼保護檢查
  if (to.meta.requiresPinUnlock) {
    const { isUnlocked } = usePinLock();
    if (!isUnlocked.value) {
      // 導向 PIN 碼輸入頁，完成後再回來
      return next({
        name: "PinLock",
        query: { redirect: to.fullPath },
      });
    }
  }

  next();
});

export default router;
```

---

## 🎨 佈局架構：支援獨立頁面

### layouts/TripLayout.vue

這是所有旅程頁面的共用佈局，但每個子頁面都是獨立的：

```vue
<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTripStore } from "@/stores/trip";
import BottomNav from "@/components/layout/BottomNav.vue";
import Header from "@/components/layout/Header.vue";

const route = useRoute();
const router = useRouter();
const tripStore = useTripStore();

// 從 URL 取得 tripId
const tripId = computed(() => route.params.tripId as string);

// 當 tripId 變化時載入旅程資料
watch(
  tripId,
  async (newTripId) => {
    if (newTripId) {
      await tripStore.loadTrip(newTripId);
    }
  },
  { immediate: true },
);

// 檢查是否為全螢幕頁面（如地圖）
const isFullscreen = computed(() => route.meta.fullscreen === true);

// 檢查是否顯示返回按鈕
const showBackButton = computed(() => route.meta.showBack === true);

function handleBack() {
  router.back();
}
</script>

<template>
  <div class="trip-layout min-h-screen bg-cream">
    <!-- 頂部 Header（非全螢幕頁面才顯示） -->
    <Header
      v-if="!isFullscreen"
      :trip="tripStore.currentTrip"
      :show-back="showBackButton"
      @back="handleBack"
    />

    <!-- 主要內容區 -->
    <main :class="['trip-main', isFullscreen ? 'h-screen' : 'pb-20 pt-16']">
      <!-- 這裡會渲染子路由的內容 -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>

    <!-- 底部導航（非全螢幕頁面才顯示） -->
    <BottomNav v-if="!isFullscreen" :trip-id="tripId" />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

---

## 🔗 可分享 URL 的實際應用

### 1. 分享特定行程

```typescript
// composables/useShare.ts
import { computed } from "vue";
import { useRoute } from "vue-router";

export function useShare() {
  const route = useRoute();

  // 生成當前頁面的完整 URL
  const currentUrl = computed(() => {
    const baseUrl = window.location.origin;
    return `${baseUrl}${route.fullPath}`;
  });

  // 分享功能
  async function shareCurrentPage(title?: string) {
    const shareData = {
      title: title || document.title,
      url: currentUrl.value,
    };

    // 使用 Web Share API（如果支援）
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return true;
      } catch (err) {
        console.log("Share cancelled");
      }
    }

    // Fallback: 複製到剪貼簿
    await navigator.clipboard.writeText(currentUrl.value);
    return true;
  }

  // 生成特定資源的 URL
  function generateScheduleUrl(tripId: string, scheduleId: string) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/trip/${tripId}/schedule/detail/${scheduleId}`;
  }

  function generateExpenseUrl(tripId: string) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/trip/${tripId}/expense`;
  }

  return {
    currentUrl,
    shareCurrentPage,
    generateScheduleUrl,
    generateExpenseUrl,
  };
}
```

### 2. 在元件中使用分享功能

```vue
<script setup lang="ts">
import { useShare } from "@/composables/useShare";
import type { Schedule } from "@/types/schedule";

interface Props {
  schedule: Schedule;
}

const props = defineProps<Props>();
const { shareCurrentPage, generateScheduleUrl } = useShare();

async function handleShare() {
  const url = generateScheduleUrl(props.schedule.tripId, props.schedule.id);

  // 方法 1: 使用當前頁面 URL
  await shareCurrentPage(`Check out: ${props.schedule.title}`);

  // 方法 2: 自訂分享內容
  if (navigator.share) {
    await navigator.share({
      title: props.schedule.title,
      text: `${props.schedule.title} at ${props.schedule.location?.address}`,
      url: url,
    });
  }
}

// 複製連結
async function copyLink() {
  const url = generateScheduleUrl(props.schedule.tripId, props.schedule.id);
  await navigator.clipboard.writeText(url);
  // 顯示提示訊息
}
</script>

<template>
  <div class="schedule-detail">
    <h1>{{ schedule.title }}</h1>

    <!-- 分享按鈕 -->
    <div class="actions">
      <Button icon="share" @click="handleShare"> 分享此行程 </Button>
      <Button icon="link" variant="ghost" @click="copyLink"> 複製連結 </Button>
    </div>
  </div>
</template>
```

---

## 🚀 Firebase Hosting 配置

為了讓可分享的 URL 正常運作，需要正確配置 Firebase Hosting。

### firebase.json

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|webp|svg)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "/index.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      }
    ]
  }
}
```

**重點說明**：

- `rewrites` 規則確保所有路由都返回 `index.html`
- 這樣當使用者直接存取 `/trip/abc123/schedule` 時，會正確載入 Vue 應用
- 然後 Vue Router 會處理路由並渲染對應頁面

---

## 🔍 SEO 與 Meta Tags（重要！）

雖然使用 History Mode，但為了更好的分享體驗，需要動態設定 Meta Tags。

### composables/useMeta.ts

```typescript
import { watch, onUnmounted } from "vue";
import { useRoute } from "vue-router";

export function useMeta(meta: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}) {
  const route = useRoute();

  // 設定 Meta Tags
  function setMetaTags() {
    // Title
    if (meta.title) {
      document.title = `${meta.title} - Travelogue`;
      updateMetaTag("og:title", meta.title);
      updateMetaTag("twitter:title", meta.title);
    }

    // Description
    if (meta.description) {
      updateMetaTag("description", meta.description);
      updateMetaTag("og:description", meta.description);
      updateMetaTag("twitter:description", meta.description);
    }

    // Image
    if (meta.image) {
      updateMetaTag("og:image", meta.image);
      updateMetaTag("twitter:image", meta.image);
    }

    // URL
    const url = meta.url || window.location.href;
    updateMetaTag("og:url", url);
    updateCanonicalLink(url);
  }

  function updateMetaTag(property: string, content: string) {
    let element = document.querySelector(
      `meta[property="${property}"]`,
    ) as HTMLMetaElement;

    if (!element) {
      element = document.querySelector(
        `meta[name="${property}"]`,
      ) as HTMLMetaElement;
    }

    if (!element) {
      element = document.createElement("meta");
      if (property.startsWith("og:") || property.startsWith("twitter:")) {
        element.setAttribute("property", property);
      } else {
        element.setAttribute("name", property);
      }
      document.head.appendChild(element);
    }

    element.setAttribute("content", content);
  }

  function updateCanonicalLink(url: string) {
    let link = document.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement;

    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }

    link.setAttribute("href", url);
  }

  // 初始化
  setMetaTags();

  // 清理
  onUnmounted(() => {
    // 可以選擇是否清除 meta tags
  });

  return {
    setMetaTags,
  };
}
```

### 在頁面中使用

```vue
<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useMeta } from "@/composables/useMeta";
import { useScheduleStore } from "@/stores/schedule";

const route = useRoute();
const scheduleStore = useScheduleStore();

const scheduleId = computed(() => route.params.scheduleId as string);
const schedule = computed(() =>
  scheduleStore.getScheduleById(scheduleId.value),
);

// 動態設定 Meta Tags
watch(
  schedule,
  (newSchedule) => {
    if (newSchedule) {
      useMeta({
        title: newSchedule.title,
        description: `${newSchedule.location?.address} - ${newSchedule.notes}`,
        image: newSchedule.photos[0],
        url: window.location.href,
      });
    }
  },
  { immediate: true },
);
</script>
```

---

## 📱 深層連結支援（Deep Linking）

為了讓分享連結在社群媒體上顯示得更好：

### public/index.html

```html
<!DOCTYPE html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- 基本 Meta -->
    <title>Travelogue - Your Travel Planner</title>
    <meta name="description" content="Plan your perfect trip with Travelogue" />

    <!-- Open Graph (Facebook, LinkedIn) -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Travelogue" />
    <meta property="og:title" content="Travelogue" />
    <meta property="og:description" content="Plan your perfect trip" />
    <meta property="og:image" content="/og-image.jpg" />
    <meta property="og:url" content="https://Travelogue.app" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Travelogue" />
    <meta name="twitter:description" content="Plan your perfect trip" />
    <meta name="twitter:image" content="/twitter-card.jpg" />

    <!-- PWA -->
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#8B9A6D" />

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

---

## 🎯 TypeScript 嚴格模式配置

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",

    /* Linting - 嚴格模式 */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    /* Path Aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },

    /* Vue */
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 🧪 Composition API 最佳實踐

### 1. Composables 範例

```typescript
// composables/useSchedule.ts
import { ref, computed } from "vue";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import type { Schedule } from "@/types/schedule";
import type { Unsubscribe } from "firebase/firestore";

export function useSchedule(tripId: string) {
  const schedules = ref<Schedule[]>([]);
  const loading = ref(true);
  const error = ref<Error | null>(null);

  let unsubscribe: Unsubscribe | null = null;

  // 計算屬性
  const schedulesByDate = computed(() => {
    const grouped: Record<string, Schedule[]> = {};

    schedules.value.forEach((schedule) => {
      const dateKey = schedule.date.toDate().toISOString().split("T")[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(schedule);
    });

    return grouped;
  });

  const upcomingSchedules = computed(() => {
    const now = new Date();
    return schedules.value.filter((s) => s.date.toDate() > now);
  });

  // 訂閱 Firestore 即時更新
  function subscribeToSchedules() {
    loading.value = true;

    const q = query(
      collection(db, `trips/${tripId}/schedules`),
      orderBy("date", "asc"),
      orderBy("order", "asc"),
    );

    unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        schedules.value = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Schedule[];

        loading.value = false;
      },
      (err) => {
        error.value = err;
        loading.value = false;
      },
    );
  }

  // 取消訂閱
  function unsubscribeFromSchedules() {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  }

  // CRUD 操作
  async function addSchedule(schedule: Omit<Schedule, "id">) {
    // 實作...
  }

  async function updateSchedule(id: string, updates: Partial<Schedule>) {
    // 實作...
  }

  async function deleteSchedule(id: string) {
    // 實作...
  }

  return {
    schedules,
    loading,
    error,
    schedulesByDate,
    upcomingSchedules,
    subscribeToSchedules,
    unsubscribeFromSchedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
  };
}
```

### 2. Store 範例（Pinia）

```typescript
// stores/schedule.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Schedule } from "@/types/schedule";

export const useScheduleStore = defineStore("schedule", () => {
  // State
  const schedules = ref<Map<string, Schedule>>(new Map());
  const loading = ref(false);
  const error = ref<Error | null>(null);

  // Getters
  const allSchedules = computed(() => Array.from(schedules.value.values()));

  const getScheduleById = computed(() => {
    return (id: string) => schedules.value.get(id);
  });

  const getSchedulesByDate = computed(() => {
    return (date: Date) => {
      const dateStr = date.toISOString().split("T")[0];
      return allSchedules.value.filter(
        (s) => s.date.toDate().toISOString().split("T")[0] === dateStr,
      );
    };
  });

  // Actions
  async function loadSchedules(tripId: string): Promise<void> {
    loading.value = true;
    try {
      // Firestore 查詢...
      loading.value = false;
    } catch (err) {
      error.value = err as Error;
      loading.value = false;
    }
  }

  async function createSchedule(
    schedule: Omit<Schedule, "id">,
  ): Promise<string> {
    // 實作...
    return "new-schedule-id";
  }

  function setSchedule(schedule: Schedule): void {
    schedules.value.set(schedule.id, schedule);
  }

  function removeSchedule(id: string): void {
    schedules.value.delete(id);
  }

  function $reset(): void {
    schedules.value.clear();
    loading.value = false;
    error.value = null;
  }

  return {
    // State
    schedules,
    loading,
    error,

    // Getters
    allSchedules,
    getScheduleById,
    getSchedulesByDate,

    // Actions
    loadSchedules,
    createSchedule,
    setSchedule,
    removeSchedule,
    $reset,
  };
});
```

---

## 📝 型別定義規範

### types/schedule.ts

```typescript
import type { Timestamp } from "firebase/firestore";

export type ScheduleCategory = "attraction" | "food" | "transport" | "hotel";
export type ScheduleStatus = "confirmed" | "pending" | "option";

export interface Location {
  address: string;
  lat: number;
  lng: number;
  googleMapsUrl: string;
  placeId?: string;
}

export interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  lastUpdated: Timestamp;
}

export interface Schedule {
  id: string;
  tripId: string;

  // 時間資訊
  date: Timestamp;
  time: string;
  timeFlexible: boolean;
  duration?: number;

  // 排序與狀態
  order: number;
  status: ScheduleStatus;
  optionGroup?: string;

  // 基本資訊
  title: string;
  category: ScheduleCategory;
  description: string;
  notes: string;

  // 地點資訊
  location?: Location;

  // 來源追蹤
  source?: {
    type: "manual" | "instagram" | "import";
    url?: string;
    importedAt?: Timestamp;
  };

  // 天氣資訊（快取）
  weather?: WeatherData;

  // 附加資訊
  photos: string[];
  cost?: number;

  // 元數據
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 表單用的型別（不含 id 和時間戳）
export type ScheduleFormData = Omit<Schedule, "id" | "createdAt" | "updatedAt">;

// 更新用的型別（所有欄位都是可選）
export type ScheduleUpdate = Partial<Omit<Schedule, "id" | "tripId">>;
```

---

## 🎨 元件型別定義範例

```vue
<script setup lang="ts">
import type { Schedule, ScheduleCategory } from "@/types/schedule";

// Props with default values
interface Props {
  schedule: Schedule;
  editable?: boolean;
  showWeather?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  editable: true,
  showWeather: true,
});

// Emits
interface Emits {
  update: [schedule: Schedule];
  delete: [id: string];
  share: [url: string];
}

const emit = defineEmits<Emits>();

// Local state with explicit types
const isEditing = ref<boolean>(false);
const localSchedule = ref<Schedule>({ ...props.schedule });

// Computed with explicit return type
const categoryIcon = computed<string>(() => {
  const icons: Record<ScheduleCategory, string> = {
    attraction: "landmark",
    food: "utensils",
    transport: "car",
    hotel: "bed",
  };
  return icons[props.schedule.category];
});

// Methods with explicit types
function handleEdit(): void {
  isEditing.value = true;
}

async function handleSave(): Promise<void> {
  try {
    emit("update", localSchedule.value);
    isEditing.value = false;
  } catch (error) {
    console.error("Save failed:", error);
  }
}
</script>
```

---

## 🚀 本地開發時的 URL 測試

### vite.config.ts

```typescript
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "Travelogue",
        short_name: "Travelogue",
        description: "Your cozy travel planning companion",
        theme_color: "#8B9A6D",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true, // 允許外部訪問
    // 🔥 重點：確保 History Mode 在開發時也能正常運作
    historyApiFallback: true,
  },
});
```

### 測試分享連結

開發時可以用這些 URL 測試：

```
http://localhost:5173/trip/abc123/schedule
http://localhost:5173/trip/abc123/schedule/detail/xyz789
http://localhost:5173/trip/abc123/bookings
http://localhost:5173/trip/abc123/expense
```

直接在瀏覽器貼上這些 URL，應該要能正確載入對應頁面。

---

## ✅ 總結

### TypeScript + Composition API

- ✅ 所有元件使用 `<script setup lang="ts">`
- ✅ 嚴格的型別檢查
- ✅ 明確的 Props 和 Emits 型別
- ✅ Composables 取代 Mixins

### 可分享的 URL

- ✅ 使用 Vue Router History Mode
- ✅ 每個頁面都有獨立、可分享的 URL
- ✅ 正確的 Firebase Hosting 配置
- ✅ 動態 Meta Tags（更好的分享預覽）
- ✅ Web Share API 整合

### 實際效果

使用者可以：

1. 分享行程詳情：`/trip/abc123/schedule/detail/xyz789`
2. 分享記帳頁面：`/trip/abc123/expense`
3. 分享地圖視圖：`/trip/abc123/map`
4. 直接貼上 URL 就能看到對應內容（不需要從首頁進入）

這樣的設計讓你的 App 雖然技術上是 SPA，但使用體驗上像多頁面應用，每個頁面都可以獨立分享！
