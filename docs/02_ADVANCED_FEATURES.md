# 旅遊規劃 App - 進階功能技術規格

> Travelogue 進階功能：拖拽排序、多選項行程、Instagram 整合、地圖視圖、資料匯出

**版本**: 2.0.0  
**更新日期**: 2026-02-15  
**依賴文檔**: TECHNICAL_SPEC_V2.md, ARCHITECTURE_UPDATE.md

---

## 📋 進階功能概覽

### 1. 行程拖拽調整

- 支援拖曳改變行程順序
- 自動調整時間軸
- 拖曳時的視覺回饋

### 2. 多選項行程（時間重疊）

- 支援同一時段有多個備選方案
- 「待定」與「已確認」狀態切換
- 視覺化呈現備選方案

### 3. Instagram 連結整合

- 解析 IG 貼文連結
- 自動提取地點資訊
- 儲存貼文內容與圖片

### 4. Google Maps 整合

- 地圖視圖顯示所有行程地點
- 路線規劃
- 與 Google Maps App 互動

### 5. 資料匯出/匯入

- 匯出格式：JSON、Markdown、CSV
- 匯入功能（從備份還原）
- 分享功能（唯讀連結）

---

## 功能 1: 行程拖拽調整

### 資料結構調整

更新 Schedule 資料結構，增加排序欄位：

```typescript
// types/schedule.ts
interface Schedule {
  id: string;
  date: Timestamp;
  time: string; // "09:00" (建議時間)
  timeFlexible: boolean; // 時間是否彈性
  order: number; // 排序用（同一天內的順序）

  // 多選項支援
  status: "confirmed" | "pending" | "option";
  optionGroup?: string; // 相同 optionGroup 表示互斥的選項

  // ... 其他欄位
}
```

### UI 實作 - 使用 VueDraggable

```bash
npm install vuedraggable@next
```

```vue
<!-- views/schedule/components/DraggableTimeline.vue -->
<script setup lang="ts">
import { ref, computed } from "vue";
import draggable from "vuedraggable";
import { useScheduleStore } from "@/stores/schedule";
import type { Schedule } from "@/types/schedule";

const scheduleStore = useScheduleStore();
const selectedDate = ref(new Date());

const schedules = computed({
  get: () => scheduleStore.getSchedulesByDate(selectedDate.value),
  set: (value) => {
    value.forEach((schedule, index) => {
      schedule.order = index;
    });
  },
});

async function handleDragEnd() {
  await scheduleStore.updateScheduleOrders(
    schedules.value.map((s, idx) => ({
      id: s.id,
      order: idx,
    })),
  );
}

function handleCardClick(schedule: Schedule) {
  scheduleStore.setActiveSchedule(schedule);
}

async function handleConfirmOption(schedule: Schedule) {
  await scheduleStore.confirmSchedule(schedule.id);
}
</script>

<template>
  <div class="space-y-4">
    <HorizontalDatePicker
      v-model:selected-date="selectedDate"
      :dates="tripDates"
    />

    <draggable
      v-model="schedules"
      tag="div"
      :component-data="{ class: 'space-y-3' }"
      handle=".drag-handle"
      :animation="200"
      ghost-class="opacity-50"
      @end="handleDragEnd"
    >
      <template #item="{ element: schedule }">
        <ScheduleCard
          :schedule="schedule"
          :is-option="schedule.status === 'option'"
          @click="handleCardClick(schedule)"
          @confirm="handleConfirmOption(schedule)"
        >
          <template #drag-handle>
            <div class="drag-handle cursor-move p-2">
              <i class="fas fa-grip-vertical text-forest-300"></i>
            </div>
          </template>
        </ScheduleCard>
      </template>
    </draggable>

    <Button
      variant="outline"
      icon="plus"
      class="w-full"
      @click="handleAddSchedule"
    >
      新增行程
    </Button>
  </div>
</template>
```

### 拖拽視覺效果

```vue
<!-- components/schedule/ScheduleCard.vue -->
<script setup lang="ts">
import { computed } from "vue";
import type { Schedule } from "@/types/schedule";

interface Props {
  schedule: Schedule;
  isOption?: boolean;
}

const props = defineProps<Props>();

const cardClasses = computed(() => [
  "bg-white rounded-xl shadow-soft hover:shadow-soft-hover",
  "cursor-pointer active:scale-98 transition-all duration-200",
  props.isOption ? "border-2 border-dashed border-earth-300" : "",
]);

const timelineClasses = computed(() => {
  const colors = {
    attraction: "bg-forest-400",
    food: "bg-earth-400",
    transport: "bg-accent-blue",
    hotel: "bg-accent-purple",
  };
  return colors[props.schedule.category] || "bg-forest-200";
});

const categoryIcon = computed(() => {
  const icons = {
    attraction: "landmark",
    food: "utensils",
    transport: "car",
    hotel: "bed",
  };
  return icons[props.schedule.category] || "map-marker-alt";
});
</script>

<template>
  <div :class="cardClasses" class="group relative">
    <!-- 左側時間條 -->
    <div
      :class="timelineClasses"
      class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
    ></div>

    <div class="flex items-center gap-3 p-4 pl-6">
      <slot name="drag-handle" />

      <div class="flex-shrink-0">
        <div class="text-lg font-semibold text-forest-700">
          {{ schedule.time }}
        </div>
        <div v-if="schedule.timeFlexible" class="text-xs text-forest-400">
          彈性時間
        </div>
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <h3 class="text-base font-medium text-forest-800 truncate">
            {{ schedule.title }}
          </h3>
          <Badge v-if="isOption" variant="warning"> 備選 </Badge>
        </div>
        <p class="text-sm text-forest-500 truncate">
          {{ schedule.location?.address }}
        </p>
      </div>

      <div :class="categoryIconClasses" class="flex-shrink-0 p-2 rounded-lg">
        <i :class="`fas fa-${categoryIcon}`"></i>
      </div>
    </div>

    <!-- 選項組指示器 -->
    <div
      v-if="schedule.optionGroup"
      class="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-earth-400 rounded-full border-2 border-cream flex items-center justify-center text-xs text-white font-bold"
    >
      {{ getOptionLabel(schedule.optionGroup) }}
    </div>
  </div>
</template>
```

---

## 功能 2: 多選項行程（時間重疊）

### 設計概念

當同一時段有多個備選方案時：

1. 視覺上用「虛線框」區分
2. 左側標記字母 (A、B、C) 表示互斥選項
3. 點擊可切換為「確認」狀態，其他選項自動變灰

### 資料結構範例

```typescript
// 範例：10:00 有兩個餐廳選項
const schedules: Schedule[] = [
  {
    id: "sch_1",
    date: new Date("2024-03-15"),
    time: "10:00",
    title: "藍瓶咖啡 Blue Bottle",
    category: "food",
    status: "option",
    optionGroup: "option_1",
    order: 0,
  },
  {
    id: "sch_2",
    date: new Date("2024-03-15"),
    time: "10:00",
    title: "猿田彥珈琲",
    category: "food",
    status: "option",
    optionGroup: "option_1",
    order: 1,
  },
  {
    id: "sch_3",
    date: new Date("2024-03-15"),
    time: "14:00",
    title: "淺草寺",
    category: "attraction",
    status: "confirmed",
    order: 2,
  },
];
```

### UI 呈現方式

```vue
<!-- views/schedule/components/ScheduleTimeline.vue -->
<script setup lang="ts">
import { computed } from "vue";
import type { Schedule } from "@/types/schedule";

interface Props {
  schedules: Schedule[];
}

const props = defineProps<Props>();

const groupedSchedules = computed(() => {
  const groups: Array<{
    type: "single" | "options";
    schedule?: Schedule;
    options?: Schedule[];
    time?: string;
  }> = [];

  const schedulesByOptionGroup = new Map<string, Schedule[]>();

  props.schedules.forEach((schedule) => {
    if (schedule.optionGroup) {
      if (!schedulesByOptionGroup.has(schedule.optionGroup)) {
        schedulesByOptionGroup.set(schedule.optionGroup, []);
      }
      schedulesByOptionGroup.get(schedule.optionGroup)!.push(schedule);
    } else {
      groups.push({
        type: "single",
        schedule,
      });
    }
  });

  schedulesByOptionGroup.forEach((options, groupId) => {
    groups.push({
      type: "options",
      options,
      time: options[0]?.time,
    });
  });

  return groups.sort((a, b) => {
    const timeA = a.schedule?.order ?? a.options?.[0]?.order ?? 0;
    const timeB = b.schedule?.order ?? b.options?.[0]?.order ?? 0;
    return timeA - timeB;
  });
});

async function confirmOption(selected: Schedule, allOptions: Schedule[]) {
  const scheduleStore = useScheduleStore();

  await scheduleStore.updateSchedule(selected.id, {
    status: "confirmed",
    optionGroup: null,
  });

  const otherOptions = allOptions.filter((opt) => opt.id !== selected.id);
  await Promise.all(
    otherOptions.map((opt) => scheduleStore.deleteSchedule(opt.id)),
  );
}
</script>

<template>
  <div class="space-y-3">
    <template v-for="(group, index) in groupedSchedules" :key="index">
      <ScheduleCard v-if="group.type === 'single'" :schedule="group.schedule" />

      <div
        v-else-if="group.type === 'options'"
        class="relative bg-cream-dark/50 rounded-2xl p-3 space-y-2"
      >
        <div class="flex items-center gap-2 px-2 mb-2">
          <i class="fas fa-code-branch text-earth-500"></i>
          <span class="text-sm font-medium text-earth-700">
            選擇其中一個 ({{ group.time }})
          </span>
        </div>

        <div class="space-y-2">
          <ScheduleCard
            v-for="option in group.options"
            :key="option.id"
            :schedule="option"
            is-option
          >
            <template #actions>
              <Button
                size="sm"
                variant="primary"
                @click.stop="confirmOption(option, group.options)"
              >
                確認此選項
              </Button>
            </template>
          </ScheduleCard>
        </div>
      </div>
    </template>
  </div>
</template>
```

---

## 功能 3: Instagram 連結整合

### 技術方案（推薦：手動輸入模式）

```typescript
// composables/useInstagramImport.ts
import { ref } from "vue";
import { useScheduleStore } from "@/stores/schedule";

export function useInstagramImport() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function importFromInstagram(url: string, locationName?: string) {
    loading.value = true;
    error.value = null;

    try {
      // 驗證 URL 格式
      if (!isValidInstagramUrl(url)) {
        throw new Error("無效的 Instagram 連結");
      }

      // 提取貼文 ID
      const postId = extractPostId(url);

      // 建立行程草稿
      return createScheduleFromUrl(url, locationName);
    } catch (err) {
      error.value = "無法解析 Instagram 連結";
      return null;
    } finally {
      loading.value = false;
    }
  }

  function isValidInstagramUrl(url: string): boolean {
    const pattern =
      /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+/;
    return pattern.test(url);
  }

  function extractPostId(url: string): string | null {
    const match = url.match(/\/(p|reel)\/([A-Za-z0-9_-]+)/);
    return match ? match[2] : null;
  }

  function createScheduleFromUrl(url: string, locationName?: string) {
    const scheduleStore = useScheduleStore();

    return scheduleStore.createSchedule({
      title: locationName || "從 Instagram 匯入",
      description: "",
      category: "attraction",
      location: locationName
        ? {
            address: locationName,
            lat: 0,
            lng: 0,
            googleMapsUrl: "",
          }
        : undefined,
      source: {
        type: "instagram",
        url: url,
        importedAt: new Date(),
      },
      status: "pending",
    });
  }

  return {
    importFromInstagram,
    loading,
    error,
  };
}
```

### UI 實作

```vue
<!-- components/schedule/InstagramImportButton.vue -->
<script setup lang="ts">
import { ref } from "vue";
import { useInstagramImport } from "@/composables/useInstagramImport";

const showModal = ref(false);
const instagramUrl = ref("");
const manualLocation = ref("");

const { importFromInstagram, loading, error } = useInstagramImport();

async function handleImport() {
  const result = await importFromInstagram(
    instagramUrl.value,
    manualLocation.value,
  );

  if (result) {
    showModal.value = false;
    instagramUrl.value = "";
    manualLocation.value = "";
  }
}
</script>

<template>
  <div>
    <Button variant="secondary" icon="instagram" @click="showModal = true">
      從 Instagram 匯入
    </Button>

    <Modal v-model:show="showModal" title="匯入 Instagram 貼文">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-forest-700 mb-2">
            Instagram 連結
          </label>
          <Input
            v-model="instagramUrl"
            placeholder="https://www.instagram.com/p/..."
            :error="error"
          />
          <p class="text-xs text-forest-500 mt-1">
            支援貼文（/p/）或 Reels（/reel/）連結
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-forest-700 mb-2">
            地點名稱
          </label>
          <Input v-model="manualLocation" placeholder="輸入餐廳或景點名稱" />
        </div>

        <div class="flex gap-2">
          <Button
            variant="primary"
            :loading="loading"
            :disabled="!instagramUrl"
            @click="handleImport"
          >
            匯入
          </Button>
          <Button variant="ghost" @click="showModal = false"> 取消 </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>
```

---

## 功能 4: Google Maps 整合

### 地圖視圖頁面

```vue
<!-- views/map/MapView.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Loader } from "@googlemaps/js-api-loader";
import { useScheduleStore } from "@/stores/schedule";
import type { Schedule } from "@/types/schedule";

const scheduleStore = useScheduleStore();
const map = ref<google.maps.Map | null>(null);
const markers = ref<google.maps.Marker[]>([]);
const showRoutes = ref(true);

const schedulesWithLocation = computed(() =>
  scheduleStore.allSchedules.filter((s) => s.location?.lat && s.location?.lng),
);

onMounted(async () => {
  await initMap();
  addMarkers();
  if (showRoutes.value) {
    calculateRoute();
  }
});

async function initMap() {
  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    version: "weekly",
    libraries: ["places", "geometry"],
  });

  const { Map } = await loader.importLibrary("maps");

  const bounds = new google.maps.LatLngBounds();
  schedulesWithLocation.value.forEach((schedule) => {
    bounds.extend({
      lat: schedule.location!.lat,
      lng: schedule.location!.lng,
    });
  });

  map.value = new Map(document.getElementById("map")!, {
    center: bounds.getCenter(),
    zoom: 13,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    styles: [
      {
        featureType: "all",
        elementType: "geometry",
        stylers: [{ saturation: -20 }],
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#a8d5e2" }],
      },
      {
        featureType: "landscape",
        elementType: "geometry",
        stylers: [{ color: "#f0f4e8" }],
      },
    ],
  });

  map.value.fitBounds(bounds);
}

function addMarkers() {
  schedulesWithLocation.value.forEach((schedule, index) => {
    const marker = new google.maps.Marker({
      position: {
        lat: schedule.location!.lat,
        lng: schedule.location!.lng,
      },
      map: map.value!,
      title: schedule.title,
      label: {
        text: (index + 1).toString(),
        color: "white",
        fontWeight: "bold",
      },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 20,
        fillColor: getCategoryColor(schedule.category),
        fillOpacity: 1,
        strokeColor: "white",
        strokeWeight: 3,
      },
    });

    marker.addListener("click", () => {
      showInfoWindow(marker, schedule);
    });

    markers.value.push(marker);
  });
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    attraction: "#8B9A6D",
    food: "#D4B896",
    transport: "#6B9BD1",
    hotel: "#9B8FB9",
  };
  return colors[category] || "#8B9A6D";
}
</script>

<template>
  <div class="h-screen flex flex-col">
    <div
      class="bg-white border-b border-forest-100 p-4 flex items-center gap-3"
    >
      <Button variant="ghost" icon="arrow-left" @click="goBack"> 返回 </Button>
      <h1 class="text-lg font-semibold text-forest-800">行程地圖</h1>
      <div class="ml-auto flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          icon="route"
          @click="showRoutes = !showRoutes"
        >
          {{ showRoutes ? "隱藏" : "顯示" }}路線
        </Button>
      </div>
    </div>

    <div id="map" class="flex-1"></div>
  </div>
</template>
```

---

## 功能 5: 資料匯出/匯入

### 匯出格式實作

#### JSON 格式（完整備份）

```typescript
// utils/export.ts
import type { Trip } from "@/types/trip";

export async function exportToJSON(trip: Trip): Promise<Blob> {
  const scheduleStore = useScheduleStore();
  const bookingStore = useBookingStore();
  const expenseStore = useExpenseStore();
  const journalStore = useJournalStore();

  const exportData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    trip: {
      ...trip,
      pinCode: undefined, // 移除敏感資訊
    },
    schedules: await scheduleStore.getAllSchedules(trip.id),
    bookings: await bookingStore.getAllBookings(trip.id),
    expenses: await expenseStore.getAllExpenses(trip.id),
    journals: await journalStore.getAllJournals(trip.id),
    todos: await todoStore.getAllTodos(trip.id),
    members: await memberStore.getAllMembers(trip.id),
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  return new Blob([jsonString], { type: "application/json" });
}

export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

#### Markdown 格式（可讀性高）

```typescript
export async function exportToMarkdown(trip: Trip): Promise<Blob> {
  const scheduleStore = useScheduleStore();
  const expenseStore = useExpenseStore();

  let markdown = `# ${trip.name}\n\n`;
  markdown += `**目的地**: ${trip.destination}\n`;
  markdown += `**日期**: ${formatDate(trip.startDate)} ~ ${formatDate(trip.endDate)}\n\n`;
  markdown += `---\n\n`;

  // 行程表
  markdown += `## 📅 行程表\n\n`;
  const schedules = await scheduleStore.getAllSchedules(trip.id);
  const schedulesByDate = groupBy(schedules, (s) => formatDate(s.date));

  Object.entries(schedulesByDate).forEach(([date, daySchedules]) => {
    markdown += `### ${date}\n\n`;
    daySchedules.forEach((schedule, index) => {
      markdown += `${index + 1}. **${schedule.time}** - ${schedule.title}\n`;
      if (schedule.location?.address) {
        markdown += `   📍 ${schedule.location.address}\n`;
      }
      if (schedule.notes) {
        markdown += `   💡 ${schedule.notes}\n`;
      }
      markdown += `\n`;
    });
    markdown += `\n`;
  });

  // 支出統計
  markdown += `## 💰 支出統計\n\n`;
  const expenses = await expenseStore.getAllExpenses(trip.id);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amountInTWD, 0);
  markdown += `**總支出**: NT$ ${totalExpense.toLocaleString()}\n\n`;

  return new Blob([markdown], { type: "text/markdown" });
}
```

#### CSV 格式（支出資料）

```typescript
export async function exportExpensesToCSV(trip: Trip): Promise<Blob> {
  const expenseStore = useExpenseStore();
  const expenses = await expenseStore.getAllExpenses(trip.id);

  let csv = "日期,類別,商家,金額,幣別,台幣金額,付款人,備註\n";

  expenses.forEach((expense) => {
    const row = [
      formatDate(expense.date),
      getCategoryName(expense.category),
      expense.merchant,
      expense.amount,
      expense.currency,
      expense.amountInTWD,
      expense.paidByName,
      expense.description,
    ]
      .map(escapeCSV)
      .join(",");

    csv += row + "\n";
  });

  return new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
}

function escapeCSV(value: any): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
```

### 匯出 UI

```vue
<!-- components/shared/ExportButton.vue -->
<script setup lang="ts">
import { ref } from "vue";
import { useTripStore } from "@/stores/trip";
import {
  exportToJSON,
  exportToMarkdown,
  exportExpensesToCSV,
  downloadFile,
} from "@/utils/export";

const showModal = ref(false);
const tripStore = useTripStore();

async function handleExport(format: "json" | "markdown" | "csv") {
  const trip = tripStore.currentTrip;
  if (!trip) return;

  try {
    let blob: Blob;
    let filename: string;

    switch (format) {
      case "json":
        blob = await exportToJSON(trip);
        filename = `${trip.name}_完整備份_${Date.now()}.json`;
        break;
      case "markdown":
        blob = await exportToMarkdown(trip);
        filename = `${trip.name}_行程表_${Date.now()}.md`;
        break;
      case "csv":
        blob = await exportExpensesToCSV(trip);
        filename = `${trip.name}_支出記錄_${Date.now()}.csv`;
        break;
    }

    downloadFile(blob, filename);
    showModal.value = false;
  } catch (error) {
    console.error("匯出失敗:", error);
  }
}
</script>

<template>
  <div>
    <Button variant="secondary" icon="download" @click="showModal = true">
      匯出資料
    </Button>

    <Modal v-model:show="showModal" title="匯出旅程資料">
      <div class="space-y-4">
        <p class="text-sm text-forest-600">選擇要匯出的格式：</p>

        <div class="space-y-2">
          <ExportOption
            title="JSON 完整備份"
            description="包含所有資料，可用於匯入還原"
            icon="file-code"
            @click="handleExport('json')"
          />

          <ExportOption
            title="Markdown 行程表"
            description="可讀性高的文字格式，適合分享"
            icon="file-alt"
            @click="handleExport('markdown')"
          />

          <ExportOption
            title="CSV 支出記錄"
            description="適合在 Excel 中編輯分析"
            icon="file-excel"
            @click="handleExport('csv')"
          />
        </div>
      </div>
    </Modal>
  </div>
</template>
```

---

## 實作優先序建議

### Phase 1: 基礎拖拽功能（1-2 天）

1. ✅ 安裝 vuedraggable
2. ✅ 實作拖拽排序 UI
3. ✅ 更新 Firestore order 欄位
4. ✅ 視覺回饋與動畫

### Phase 2: 多選項行程（2-3 天）

1. ✅ 選項組資料結構
2. ✅ 多選項 UI（虛線框、字母標記）
3. ✅ 確認選項功能
4. ✅ 選項比較 Modal

### Phase 3: Google Maps（3-4 天）

1. ✅ 地圖視圖頁面
2. ✅ 標記顯示（分類顏色）
3. ✅ 路線規劃
4. ✅ 地圖樣式（溫馨風格）
5. ✅ 與 Google Maps App 互動

### Phase 4: Instagram 匯入（2-3 天）

1. ✅ URL 驗證
2. ✅ 匯入按鈕與 Modal
3. ✅ 手動輸入地點
4. ✅ 建立行程草稿

### Phase 5: 資料匯出/匯入（2 天）

1. ✅ JSON 匯出（完整備份）
2. ✅ Markdown 匯出（行程表）
3. ✅ CSV 匯出（支出記錄）
4. ✅ JSON 匯入（還原備份）
5. ✅ 匯出/匯入 UI

---

## 環境變數更新

在 `.env` 新增：

```bash
# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

**文檔版本**: 2.0.0  
**最後更新**: 2026-02-15  
**維護者**: Feature Development Team
