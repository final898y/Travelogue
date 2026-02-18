# 旅遊規劃 Web App - 核心技術規格

> Travelogue - 溫馨自然風格的旅遊規劃 PWA

**版本**: 2.0.0  
**更新日期**: 2026-02-15  
**設計風格**: 溫馨手帳風 · 自然系療癒美學

---

## 📋 目錄

- [專案概述](#專案概述)
- [技術棧](#技術棧)
- [系統架構](#系統架構)
- [資料庫設計](#資料庫設計)
- [API 整合方案](#api-整合方案)
- [核心功能模組](#核心功能模組)
- [安全性方案](#安全性方案)
- [效能優化策略](#效能優化策略)

---

## 專案概述

### 核心目標

打造一款具有「溫馨手帳風格」美學的旅遊規劃 PWA，提供行程管理、預訂記錄、記帳分攤、日誌撰寫等功能，主打 Mobile-first 體驗與可分享的獨立頁面 URL。

### 設計理念

- **溫暖舒適**: 米色、綠色、大地色系，圓角設計與柔和陰影
- **簡約清晰**: 資訊層級分明，避免過度裝飾
- **手帳質感**: 受手帳文化與自然系美學啟發
- **觸感回饋**: 每個互動都有明確的視覺與動畫回饋

### 關鍵特性

- ✅ TypeScript + Composition API（強制規範）
- ✅ 可分享的獨立頁面 URL（非傳統 SPA）
- ✅ 單人模式（資料結構支援未來多人擴充）
- ✅ 即時天氣資料整合（OpenWeatherMap）
- ✅ 即時匯率換算（ExchangeRate API）
- ✅ 預訂資料 PIN 碼保護
- ✅ 智慧圖片壓縮（前端處理）
- ✅ 離線查看快取資料
- ✅ PWA 可安裝

---

## 技術棧

### 前端框架

```json
{
  "core": {
    "vue": "^3.4.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  },
  "styling": {
    "tailwindcss": "^3.4.0",
    "@tailwindcss/forms": "^0.5.7"
  },
  "state": {
    "pinia": "^2.1.7"
  },
  "routing": {
    "vue-router": "^4.2.5"
  },
  "icons": {
    "@fortawesome/fontawesome-free": "^6.5.0"
  },
  "utils": {
    "browser-image-compression": "^2.0.2",
    "date-fns": "^3.0.0",
    "vueuse": "^10.7.0",
    "vuedraggable": "^4.1.0"
  }
}
```

### 後端服務（Firebase）

```json
{
  "firebase": {
    "firebase": "^10.7.0",
    "services": ["Firestore Database", "Storage", "Hosting"]
  }
}
```

### PWA 相關

```json
{
  "pwa": {
    "vite-plugin-pwa": "^0.17.0",
    "workbox-window": "^7.0.0"
  }
}
```

### 外部 API

- **天氣**: OpenWeatherMap API (Free tier: 1,000 calls/day)
- **匯率**: ExchangeRate-API (Free tier: 1,500 requests/month)
- **地圖**: Google Maps API (Free tier: $200 USD/month)

---

## 系統架構

### 資料夾結構

```
src/
├── assets/              # 靜態資源
│   ├── images/
│   ├── fonts/
│   └── textures/       # 背景紋理圖
│
├── components/         # 共用元件
│   ├── ui/            # 基礎 UI 元件
│   │   ├── Button.vue
│   │   ├── Card.vue
│   │   ├── Input.vue
│   │   ├── Modal.vue
│   │   ├── Badge.vue
│   │   └── Loading.vue
│   ├── layout/        # 佈局元件
│   │   ├── BottomNav.vue
│   │   ├── Header.vue
│   │   └── Container.vue
│   └── shared/        # 共用業務元件
│       ├── DatePicker.vue
│       ├── ImageUploader.vue
│       ├── PinLock.vue
│       └── CurrencyInput.vue
│
├── views/             # 頁面元件（獨立路由）
│   ├── schedule/
│   │   ├── ScheduleView.vue
│   │   ├── ScheduleDetail.vue
│   │   ├── ScheduleForm.vue
│   │   └── components/
│   ├── bookings/
│   ├── expense/
│   ├── journal/
│   ├── planning/
│   ├── members/
│   ├── map/
│   └── settings/
│
├── composables/       # Vue Composables
│   ├── useFirestore.ts
│   ├── useStorage.ts
│   ├── useWeather.ts
│   ├── useExchangeRate.ts
│   ├── useImageCompression.ts
│   ├── useCache.ts
│   ├── usePinLock.ts
│   ├── useShare.ts
│   └── useMeta.ts
│
├── stores/            # Pinia Stores
│   ├── trip.ts
│   ├── schedule.ts
│   ├── booking.ts
│   ├── expense.ts
│   ├── journal.ts
│   └── user.ts
│
├── services/          # API Services
│   ├── firebase.ts
│   ├── weather.ts
│   └── exchangeRate.ts
│
├── types/             # TypeScript 型別定義
│   ├── trip.ts
│   ├── schedule.ts
│   ├── booking.ts
│   ├── expense.ts
│   └── index.ts
│
├── utils/             # 工具函數
│   ├── date.ts
│   ├── currency.ts
│   ├── image.ts
│   └── validation.ts
│
├── router/
│   └── index.ts
│
├── App.vue
└── main.ts
```

### 狀態管理架構

```
Pinia Stores (集中式狀態)
    ↓
Firebase Firestore (持久化層)
    ↓
LocalStorage Cache (離線快取)
```

---

## 資料庫設計

### Firestore Collection 結構

#### 1. Trips Collection（旅程主文件）

```typescript
trips/{tripId}
{
  // 基本資訊
  name: string                    // 旅程名稱 "2024 日本賞櫻之旅"
  destination: string             // 目的地 "東京、京都"
  startDate: Timestamp            // 開始日期
  endDate: Timestamp              // 結束日期
  coverImage: string              // 封面圖片 URL

  // 預設設定
  defaultCurrency: string         // 預設幣別 "TWD"
  exchangeRates: {                // 固定匯率表（備用）
    [currency: string]: number
  }

  // 權限管理（預留多人擴充）
  ownerId: string                 // 建立者 ID
  members: string[]               // 成員 ID 陣列（目前只有一人）

  // PIN 碼保護
  pinCode: string                 // 加密後的 PIN 碼 (SHA-256)

  // 元數據
  createdAt: Timestamp
  updatedAt: Timestamp
  isDeleted: boolean              // 軟刪除標記
}
```

#### 2. Schedules Subcollection（行程）

```typescript
trips/{tripId}/schedules/{scheduleId}
{
  // 時間資訊
  date: Timestamp                 // 日期
  time: string                    // 時間 "09:00"
  timeFlexible: boolean           // 時間是否彈性
  duration: number                // 預計停留時間（分鐘）

  // 排序 & 狀態
  order: number                   // 同一天內的排序
  status: 'confirmed' | 'pending' | 'option'
  optionGroup?: string            // 選項組 ID（互斥選項）

  // 行程內容
  title: string                   // 標題 "淺草寺參拜"
  category: 'attraction' | 'food' | 'transport' | 'hotel'
  description: string             // 詳細描述

  // 地點資訊
  location: {
    address: string
    lat: number
    lng: number
    googleMapsUrl: string
    placeId?: string              // Google Place ID
  }

  // 來源追蹤
  source?: {
    type: 'manual' | 'instagram' | 'import'
    url?: string                  // Instagram 連結
    importedAt?: Timestamp
  }

  // 天氣資訊（快取用）
  weather?: {
    temp: number
    condition: string             // "sunny", "rainy", "cloudy"
    icon: string
    lastUpdated: Timestamp
  }

  // 附加資訊
  notes: string                   // 備註
  photos: string[]                // 照片 URL 陣列
  cost: number                    // 預估花費

  // 元數據
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 3. Bookings Subcollection（預訂資料）

```typescript
trips/{tripId}/bookings/{bookingId}
{
  // 預訂類型
  type: 'flight' | 'hotel' | 'car' | 'ticket'

  // 通用欄位
  title: string                   // "長榮航空 BR-198"
  confirmationNumber: string      // 確認編號
  totalCost: number
  currency: string

  // 類型特定資料
  details: FlightDetails | HotelDetails | CarDetails | TicketDetails

  // 附件
  attachments: {
    type: 'pdf' | 'image'
    url: string
    fileName: string
    thumbnailUrl?: string         // 縮圖（圖片類型）
  }[]

  // 元數據
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 4. Expenses Subcollection（記帳）

```typescript
trips/{tripId}/expenses/{expenseId}
{
  // 金額資訊
  amount: number                  // 原始金額
  currency: string                // 幣別 "JPY"
  amountInTWD: number            // 自動換算台幣（快取）
  exchangeRate: number            // 當時匯率（快取）

  // 分類資訊
  category: 'food' | 'transport' | 'shopping' | 'activity' | 'accommodation' | 'other'
  subcategory?: string            // 子分類（如: 早餐、晚餐）

  // 付款資訊
  paidBy: string                  // 付款人 ID
  paidByName: string              // 付款人名稱（冗余欄位）

  // 分攤資訊
  splitType: 'equal' | 'custom' | 'none'
  splitWith: string[]             // 參與分攤的成員 ID
  splitDetails?: {                // 自訂分攤金額
    [memberId: string]: number
  }

  // 交易詳情
  merchant: string                // 商家名稱
  description: string             // 說明
  receipt?: string                // 收據照片 URL

  // 時間資訊
  date: Timestamp                 // 消費日期
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 5. Journals Subcollection（日誌）

```typescript
trips/{tripId}/journals/{journalId}
{
  // 內容
  title: string                   // 標題 "第一天的奇妙冒險"
  content: string                 // 內文（支援 Markdown）

  // 照片
  photos: {
    url: string
    thumbnailUrl: string
    order: number
    caption?: string              // 照片說明
  }[]

  // 關聯資訊
  relatedDate: Timestamp          // 相關日期
  relatedScheduleId?: string      // 關聯的行程 ID

  // 元數據
  authorId: string
  authorName: string
  createdAt: Timestamp
  updatedAt: Timestamp
  mood?: 'happy' | 'excited' | 'tired' | 'relaxed'
}
```

#### 6. Todos Subcollection（待辦清單）

```typescript
trips/{tripId}/todos/{todoId}
{
  // 任務內容
  title: string                   // "購買 JR Pass"
  category: 'todo' | 'luggage' | 'shopping'
  description: string

  // 狀態
  isCompleted: boolean
  completedAt?: Timestamp
  completedBy?: string

  // 指派
  assignedTo: string[]            // 成員 ID（空陣列表示全體）

  // 優先級
  priority: 'high' | 'medium' | 'low'

  // 元數據
  order: number
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 7. Members Subcollection（成員）

```typescript
trips/{tripId}/members/{memberId}
{
  // 基本資訊
  name: string                    // 暱稱
  avatar: string                  // 頭像 URL
  email?: string                  // Email（可選）
  phone?: string                  // 電話（可選）

  // 角色
  role: 'owner' | 'member'        // 預留多人擴充

  // 偏好設定
  color: string                   // 代表色 "#FF6B6B"

  // 元數據
  joinedAt: Timestamp
  isActive: boolean
}
```

### 索引建議

在 Firebase Console 建立以下 Composite Indexes：

```javascript
// schedules - 依日期排序
collection: trips/{tripId}/schedules
fields: [date ASC, time ASC, order ASC]

// expenses - 依日期排序
collection: trips/{tripId}/expenses
fields: [date DESC, createdAt DESC]

// journals - 依日期排序
collection: trips/{tripId}/journals
fields: [relatedDate DESC, createdAt DESC]
```

---

## API 整合方案

### 1. OpenWeatherMap API（天氣）

#### 申請流程

1. 前往 https://openweathermap.org/api
2. 註冊免費帳號
3. 取得 API Key
4. 使用 **One Call API 3.0** (每天 1,000 calls 免費)

#### 實作方式

```typescript
// services/weather.ts
import axios from "axios";

const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const WEATHER_BASE_URL = "https://api.openweathermap.org/data/3.0/onecall";

export interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

export async function fetchWeatherByDate(
  lat: number,
  lng: number,
  date: Date,
): Promise<WeatherData | null> {
  try {
    const timestamp = Math.floor(date.getTime() / 1000);
    const response = await axios.get(WEATHER_BASE_URL, {
      params: {
        lat,
        lon: lng,
        dt: timestamp,
        appid: WEATHER_API_KEY,
        units: "metric",
        lang: "zh_tw",
      },
    });

    const data = response.data;
    return {
      temp: Math.round(data.temp),
      feelsLike: Math.round(data.feels_like),
      condition: mapWeatherCondition(data.weather[0].main),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.humidity,
      windSpeed: data.wind_speed,
    };
  } catch (error) {
    console.error("Weather API Error:", error);
    return null;
  }
}

function mapWeatherCondition(condition: string): string {
  const conditionMap: Record<string, string> = {
    Clear: "sunny",
    Clouds: "cloudy",
    Rain: "rainy",
    Drizzle: "rainy",
    Thunderstorm: "stormy",
    Snow: "snowy",
    Mist: "foggy",
  };
  return conditionMap[condition] || "cloudy";
}
```

#### 快取策略

- 每個地點的天氣資料快取 **6 小時**
- 儲存在 Firestore 的 `schedule.weather` 欄位
- 使用 `lastUpdated` 時間戳判斷是否需要更新

---

### 2. ExchangeRate API（匯率）

#### 申請流程

1. 前往 https://www.exchangerate-api.com/
2. 註冊免費帳號（每月 1,500 requests）
3. 取得 API Key

#### 實作方式

```typescript
// services/exchangeRate.ts
import axios from "axios";

const EXCHANGE_RATE_API_KEY = import.meta.env.VITE_EXCHANGE_RATE_API_KEY;
const EXCHANGE_RATE_BASE_URL = "https://v6.exchangerate-api.com/v6";

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  lastUpdated: Date;
}

export async function fetchExchangeRates(
  baseCurrency = "TWD",
): Promise<ExchangeRates | null> {
  try {
    const response = await axios.get(
      `${EXCHANGE_RATE_BASE_URL}/${EXCHANGE_RATE_API_KEY}/latest/${baseCurrency}`,
    );

    return {
      base: response.data.base_code,
      rates: response.data.conversion_rates,
      lastUpdated: new Date(response.data.time_last_update_unix * 1000),
    };
  } catch (error) {
    console.error("Exchange Rate API Error:", error);
    return null;
  }
}

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>,
): number {
  if (fromCurrency === toCurrency) return amount;

  // 透過 TWD 當中間貨幣
  const amountInBase = amount / rates[fromCurrency];
  return amountInBase * rates[toCurrency];
}
```

#### 快取策略

- 匯率資料快取 **24 小時**
- 儲存在 **LocalStorage**
- 背景更新機制

---

## 核心功能模組

### Module 1: 行程管理（Schedule）

#### 功能清單

- ✅ 橫向捲動的日期選擇器
- ✅ 每日行程時間軸（含拖拽排序）
- ✅ 多選項行程（時間重疊）
- ✅ 天氣卡片（即時資料）
- ✅ 倒數計時器
- ✅ 行程詳情頁（可分享 URL）
- ✅ 地圖連結整合

#### 關鍵元件

```
ScheduleView.vue          # 主頁面
├── HorizontalDatePicker  # 日期選擇
├── WeatherCard          # 天氣卡片
├── CountdownTimer       # 倒數計時
└── DraggableTimeline    # 可拖拽時間軸
    └── ScheduleCard     # 行程卡片

ScheduleDetail.vue        # 詳情頁（獨立 URL）
ScheduleForm.vue          # 新增/編輯表單
```

---

### Module 2: 預訂管理（Bookings）

#### 功能清單

- ✅ PIN 碼保護機制
- ✅ 登機證風格卡片
- ✅ 住宿資訊卡片
- ✅ 租車與票券卡片
- ✅ PDF/圖片上傳功能
- ✅ 智慧圖片壓縮

#### 關鍵元件

```
BookingsView.vue          # 主頁面（需 PIN 解鎖）
├── PinLock              # PIN 碼輸入
├── BoardingPass         # 登機證卡片
├── HotelCard           # 住宿卡片
├── CarRentalCard       # 租車卡片
└── TicketCard          # 票券卡片

BookingDetail.vue         # 詳情頁
BookingForm.vue           # 新增/編輯表單
```

---

### Module 3: 記帳管理（Expense）

#### 功能清單

- ✅ 支出儀表板（圖表統計）
- ✅ 記帳表單（數字鍵盤）
- ✅ 即時匯率換算
- ✅ 分攤計算邏輯
- ✅ 債務關係視覺化

#### 關鍵元件

```
ExpenseView.vue           # 主頁面
├── ExpenseDashboard     # 儀表板
├── CategoryChart        # 分類圖表
└── ExpenseList         # 支出列表

ExpenseForm.vue           # 記帳表單
├── CurrencyInput        # 數字鍵盤
├── SplitCalculator      # 分攤計算器
└── ReceiptUploader     # 收據上傳
```

---

### Module 4: 日誌管理（Journal）

#### 功能清單

- ✅ 瀑布流佈局（Masonry Grid）
- ✅ 簡化 Markdown 編輯器
- ✅ 多圖上傳與排序
- ✅ 心情標記

#### 關鍵元件

```
CollectionView.vue        # 主頁面
└── JournalGrid          # 瀑布流佈局
    └── JournalCard      # 日誌卡片

JournalDetail.vue         # 詳情頁
JournalEditor.vue         # 編輯器
├── MarkdownEditor       # 文字編輯
├── PhotoGallery        # 照片管理
└── MoodSelector        # 心情選擇
```

---

### Module 5: 準備清單（Planning）

#### 功能清單

- ✅ 待辦清單（Todo）
- ✅ 行李清單
- ✅ 購物清單
- ✅ 拖曳排序
- ✅ 優先級標記

#### 關鍵元件

```
PlanningView.vue          # 主頁面
├── CategoryTabs         # 分類標籤
└── TodoList            # 清單
    └── TodoItem        # 待辦項目（可拖拽）

TodoForm.vue              # 新增/編輯表單
```

---

### Module 6: 成員管理（Members）

#### 功能清單

- ✅ 成員列表
- ✅ 頭像上傳
- ✅ 代表色設定

#### 關鍵元件

```
MembersView.vue           # 主頁面
└── MemberCard           # 成員卡片

MemberForm.vue            # 新增/編輯表單
```

---

## 安全性方案

### 1. Firebase Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 輔助函數
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(tripId) {
      return isSignedIn() &&
             get(/databases/$(database)/documents/trips/$(tripId)).data.ownerId == request.auth.uid;
    }

    function isMember(tripId) {
      return isSignedIn() &&
             request.auth.uid in get(/databases/$(database)/documents/trips/$(tripId)).data.members;
    }

    // Trips 主文件
    match /trips/{tripId} {
      allow read: if isMember(tripId);
      allow create: if isSignedIn() && request.resource.data.ownerId == request.auth.uid;
      allow update, delete: if isOwner(tripId);

      // 子集合規則
      match /{subcollection}/{documentId} {
        allow read: if isMember(tripId);
        allow write: if isMember(tripId);
      }
    }
  }
}
```

### 2. Storage Rules

```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /trips/{tripId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024  // 5MB 上限
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

### 3. PIN 碼加密

```typescript
// utils/security.ts
import CryptoJS from "crypto-js";

export function hashPin(pin: string): string {
  return CryptoJS.SHA256(pin).toString();
}

export function verifyPin(inputPin: string, hashedPin: string): boolean {
  return hashPin(inputPin) === hashedPin;
}

export function setupPin(pin: string): string {
  if (!/^\d{3,6}$/.test(pin)) {
    throw new Error("PIN 碼必須是 3-6 位數字");
  }
  return hashPin(pin);
}
```

---

## 效能優化策略

### 1. 快取機制

```typescript
// composables/useCache.ts
import { useLocalStorage } from "@vueuse/core";

export function useCache<T>(key: string, ttl: number = 3600000) {
  interface CacheData {
    data: T;
    timestamp: number;
  }

  const cache = useLocalStorage<CacheData | null>(`cache_${key}`, null);

  function set(data: T) {
    cache.value = {
      data,
      timestamp: Date.now(),
    };
  }

  function get(): T | null {
    if (!cache.value) return null;

    const age = Date.now() - cache.value.timestamp;
    if (age > ttl) {
      cache.value = null;
      return null;
    }

    return cache.value.data;
  }

  function clear() {
    cache.value = null;
  }

  return { set, get, clear };
}
```

### 2. 圖片懶加載

```vue
<!-- components/shared/LazyImage.vue -->
<script setup lang="ts">
import { ref } from "vue";
import { useIntersectionObserver } from "@vueuse/core";

interface Props {
  src: string;
  thumbnail?: string;
  alt?: string;
  aspectRatio?: string;
}

const props = withDefaults(defineProps<Props>(), {
  aspectRatio: "56.25%",
  alt: "",
});

const target = ref<HTMLElement>();
const isVisible = ref(false);
const loading = ref(true);
const currentSrc = ref(props.thumbnail || props.src);

useIntersectionObserver(target, ([{ isIntersecting }]) => {
  if (isIntersecting) {
    isVisible.value = true;
    if (props.thumbnail) {
      setTimeout(() => {
        currentSrc.value = props.src;
      }, 100);
    }
  }
});

function handleLoad() {
  loading.value = false;
}
</script>

<template>
  <div
    ref="target"
    class="relative overflow-hidden rounded-lg"
    :style="{ paddingTop: aspectRatio }"
  >
    <img
      v-if="isVisible"
      :src="currentSrc"
      :alt="alt"
      class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
      :class="{ 'opacity-0': loading, 'opacity-100': !loading }"
      @load="handleLoad"
    />
    <div
      v-if="loading"
      class="absolute inset-0 bg-forest-50 animate-pulse"
    ></div>
  </div>
</template>
```

### 3. Firestore 查詢優化

```typescript
// composables/useFirestore.ts
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";

export function useFirestore() {
  const PAGE_SIZE = 20;

  async function fetchSchedulesByDate(tripId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, `trips/${tripId}/schedules`),
      where("date", ">=", startOfDay),
      where("date", "<=", endOfDay),
      orderBy("date"),
      orderBy("time"),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  return {
    fetchSchedulesByDate,
  };
}
```

### 4. 離線支援

```typescript
// services/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  // ... 你的 Firebase 配置
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// 啟用離線持久化
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    console.warn("多個分頁開啟，離線功能僅在一個分頁有效");
  } else if (err.code === "unimplemented") {
    console.warn("瀏覽器不支援離線功能");
  }
});

export { app, db, storage };
```

---

## 環境變數設定

建立 `.env` 檔案：

```bash
# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# OpenWeatherMap API
VITE_OPENWEATHER_API_KEY=your_openweather_api_key

# ExchangeRate API
VITE_EXCHANGE_RATE_API_KEY=your_exchange_rate_api_key

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# App Config
VITE_APP_NAME=Travelogue
VITE_APP_VERSION=1.0.0
```

---

## 參考資源

### 官方文檔

- [Vue 3 文檔](https://vuejs.org/)
- [Vite 文檔](https://vitejs.dev/)
- [Tailwind CSS 文檔](https://tailwindcss.com/)
- [Firebase 文檔](https://firebase.google.com/docs)
- [Pinia 文檔](https://pinia.vuejs.org/)

### API 文檔

- [OpenWeatherMap API](https://openweathermap.org/api)
- [ExchangeRate API](https://www.exchangerate-api.com/docs)
- [Google Maps API](https://developers.google.com/maps)

### 工具與套件

- [VueUse](https://vueuse.org/) - Vue Composition Utilities
- [date-fns](https://date-fns.org/) - 日期處理
- [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression) - 圖片壓縮

---

**文檔版本**: 2.0.0  
**最後更新**: 2026-02-15  
**維護者**: Technical Team
