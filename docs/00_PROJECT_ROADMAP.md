# 🗺️ Travelogue - 完整開發路線圖

> 溫馨自然風格的旅遊規劃 PWA - 15 週開發計畫

**版本**: 2.0.0  
**更新日期**: 2026-02-15  
**專案名稱**: Travelogue

---

## 📋 目錄

- [快速啟動指南](#快速啟動指南)
- [完整開發路線圖](#完整開發路線圖)
- [里程碑定義](#里程碑定義)
- [開發建議](#開發建議)
- [常見問題](#常見問題)

---

## 快速啟動指南

### Step 1: 環境準備

#### 1.1 安裝必要工具

```bash
# 確認 Node.js 版本（建議 v18 或以上）
node -v

# 確認 npm 或 pnpm
npm -v
```

#### 1.2 建立專案

```bash
# 使用 Vite 建立 Vue 3 + TypeScript 專案
npm create vite@latest Travelogue -- --template vue-ts

cd Travelogue

# 安裝相依套件
npm install
```

#### 1.3 安裝核心套件

```bash
# UI & Styling
npm install -D tailwindcss@latest postcss autoprefixer
npm install @tailwindcss/forms

# Vue 生態系
npm install vue-router@4 pinia

# Firebase
npm install firebase

# 工具庫
npm install @vueuse/core date-fns

# 圖示
npm install @fortawesome/fontawesome-free

# 圖片處理
npm install browser-image-compression

# 拖拽功能
npm install vuedraggable@next

# PWA
npm install -D vite-plugin-pwa

# Google Maps
npm install @googlemaps/js-api-loader
```

#### 1.4 初始化 Tailwind

```bash
npx tailwindcss init -p
```

---

### Step 2: Firebase 設定

#### 2.1 建立 Firebase 專案

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點擊「建立專案」
3. 專案名稱：`Travelogue-prod`
4. 啟用 Google Analytics（建議）
5. 完成建立

#### 2.2 啟用服務

在 Firebase Console 中啟用：

- ✅ **Firestore Database**
  - 選擇「正式版模式」
  - 地區選擇：`asia-east1`（台灣）
- ✅ **Storage**
  - 地區選擇：`asia-east1`
- ✅ **Hosting**（部署用）

#### 2.3 取得設定

1. 專案設定 → 新增應用程式 → Web
2. 複製 Firebase 設定物件
3. 儲存到 `.env`

#### 2.4 建立 Firestore 索引

在 Firestore → 索引 → 建立索引：

**索引 1: schedules（依日期排序）**

- Collection ID: `schedules`
- 欄位：`date` (Ascending), `time` (Ascending), `order` (Ascending)

**索引 2: expenses（依日期排序）**

- Collection ID: `expenses`
- 欄位：`date` (Descending), `createdAt` (Descending)

---

### Step 3: 取得 API Keys

#### 3.1 OpenWeatherMap API

1. 前往 https://openweathermap.org/api
2. 註冊帳號（免費）
3. 取得 API Key
4. 免費方案：1,000 calls/day

#### 3.2 ExchangeRate API

1. 前往 https://www.exchangerate-api.com/
2. 註冊帳號（免費）
3. 取得 API Key
4. 免費方案：1,500 requests/month

#### 3.3 Google Maps API

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案
3. 啟用以下 API：
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API
4. 建立 API 金鑰
5. 免費額度：$200 USD/月

#### 3.4 建立 .env 檔案

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

⚠️ **重要**：將 `.env` 加入 `.gitignore`

---

## 完整開發路線圖

### 🎯 Phase 0: 專案架構（Week 1）

**目標**：建立穩固的專案基礎

#### 里程碑檢查

- [ ] Vite + Vue 3 + TypeScript 專案建立完成
- [ ] Tailwind CSS 配置完成（含自定義主題）
- [ ] Firebase SDK 整合完成
- [ ] 基礎資料夾結構建立
- [ ] 路由系統設定完成（History Mode）
- [ ] Pinia stores 架構建立
- [ ] 共用 UI 元件庫（Button, Card, Input, Modal）
- [ ] 設計系統實作（配色、間距、圓角）

#### 工作項目

```
Day 1-2: 專案初始化
├── npm create vite + 安裝相依套件
├── 設定 Tailwind（參考 DESIGN_SYSTEM.md）
├── 建立資料夾結構
└── 設定 tsconfig.json（嚴格模式）

Day 3-4: Firebase 整合
├── 建立 Firebase 專案
├── 設定 Firestore、Storage
├── 實作 firebase.ts service
├── 啟用離線持久化
└── 測試連線

Day 5-6: 共用元件
├── Button.vue（多變體：primary, secondary, outline, ghost）
├── Card.vue（Soft Shadow）
├── Input.vue（含驗證、error state）
├── Modal.vue（動畫、backdrop）
├── Loading.vue（骨架屏）
└── Badge.vue（多種顏色）

Day 7: 佈局與路由
├── BottomNav.vue（固定底部導航）
├── Header.vue（動態標題）
├── TripLayout.vue（主要佈局）
└── router/index.ts（完整路由設定）
```

**本週產出**：可運行的 App 骨架，有基本導航與 UI 元件

---

### 🌱 Phase 1: 準備清單模組（Week 2）

**目標**：實作最簡單的模組，快速看到成果

#### 里程碑檢查

- [ ] Todo List UI 完成
- [ ] 新增/編輯/刪除 Todo 功能
- [ ] 勾選完成功能（含動畫）
- [ ] 分類標籤（待辦/行李/購物）
- [ ] 拖曳排序功能
- [ ] Firestore CRUD 整合
- [ ] 優先級標記（高/中/低）

#### 工作項目

```
Day 1-2: 資料層
├── types/todo.ts（TypeScript 型別定義）
├── stores/todo.ts（Pinia store）
└── composables/useTodo.ts（業務邏輯）

Day 3-4: UI 元件
├── PlanningView.vue（主頁面）
├── CategoryTabs.vue（分類切換）
├── TodoList.vue（列表，使用 vuedraggable）
├── TodoItem.vue（單項，含拖曳手柄）
└── TodoForm.vue（新增/編輯 Modal）

Day 5-7: 功能整合與測試
├── Firestore CRUD 操作
├── 拖曳排序實作
├── 完成動畫（checkbox 勾選）
├── 優先級顏色標記
└── 測試與 Bug 修復
```

**本週產出**：完整可用的待辦清單功能

---

### 📅 Phase 2: 行程模組（基礎版）（Week 3-4）

**目標**：實作核心的行程管理功能

#### Week 3: 基礎 CRUD

**里程碑檢查**

- [ ] 橫向日期選擇器
- [ ] 行程時間軸 UI
- [ ] 新增/編輯/刪除行程
- [ ] 類別標記（景點/美食/交通/住宿）
- [ ] 地點輸入與 Google Maps 連結

**工作項目**

```
Day 1-2: 資料模型
├── types/schedule.ts
├── stores/schedule.ts
└── composables/useSchedule.ts

Day 3-5: UI 元件
├── ScheduleView.vue
├── HorizontalDatePicker.vue（橫向滾動）
├── ScheduleTimeline.vue
├── ScheduleCard.vue（含類別顏色）
└── ScheduleForm.vue

Day 6-7: Firestore 整合
├── CRUD 操作
├── 即時訂閱（onSnapshot）
└── 測試
```

#### Week 4: 天氣與進階功能

**里程碑檢查**

- [ ] 天氣卡片（整合 OpenWeatherMap）
- [ ] 倒數計時器
- [ ] 行程詳情頁（獨立 URL）
- [ ] 照片上傳功能
- [ ] 分享連結功能

**工作項目**

```
Day 1-3: 天氣整合
├── services/weather.ts
├── composables/useWeather.ts
├── WeatherCard.vue
└── 快取機制實作

Day 4-5: 其他功能
├── CountdownTimer.vue
├── ScheduleDetail.vue（獨立頁面）
├── ImageUploader.vue
└── useShare.ts（分享功能）

Day 6-7: 測試與優化
├── 效能優化
├── 錯誤處理
└── UI 調整
```

**本週產出**：完整的行程管理功能

---

### 🎫 Phase 3: 預訂模組（Week 5）

**目標**：實作預訂資料管理與 PIN 碼保護

#### 里程碑檢查

- [ ] PIN 碼保護機制
- [ ] 登機證風格卡片
- [ ] 住宿資訊卡片
- [ ] 租車與票券卡片
- [ ] PDF/圖片上傳功能
- [ ] 圖片壓縮整合

#### 工作項目

```
Day 1-2: PIN 碼保護
├── composables/usePinLock.ts
├── components/PinLock.vue
├── LocalStorage 狀態管理
└── 路由守衛整合

Day 3-4: 資料層
├── types/booking.ts（含飛機、住宿、租車、票券型別）
└── stores/booking.ts

Day 5-6: UI 元件
├── BookingsView.vue
├── BoardingPass.vue（登機證風格）
├── HotelCard.vue
├── CarRentalCard.vue
├── TicketCard.vue
└── BookingForm.vue

Day 7: 檔案上傳
├── composables/useImageCompression.ts
├── composables/useStorage.ts
├── ImageUploader.vue
└── 測試
```

**本週產出**：完整的預訂管理功能

---

### 💰 Phase 4: 記帳模組（Week 6）

**目標**：實作記帳與分攤計算功能

#### 里程碑檢查

- [ ] 支出儀表板
- [ ] 記帳表單（數字鍵盤）
- [ ] 匯率換算（整合 ExchangeRate API）
- [ ] 分攤計算邏輯
- [ ] 債務關係視覺化
- [ ] 支出統計圖表

#### 工作項目

```
Day 1-2: 匯率整合
├── services/exchangeRate.ts
├── composables/useExchangeRate.ts
└── LocalStorage 快取

Day 3-4: 資料層與計算邏輯
├── types/expense.ts
├── stores/expense.ts
├── utils/currency.ts（換算邏輯）
└── utils/expense.ts（分攤計算）

Day 5-6: UI 元件
├── ExpenseView.vue
├── ExpenseDashboard.vue（儀表板）
├── ExpenseForm.vue（記帳表單）
├── CurrencyInput.vue（數字鍵盤）
├── SplitCalculator.vue
└── ExpenseList.vue

Day 7: 視覺化與測試
├── 支出統計圖表（可用 Chart.js）
├── 債務關係圖
└── 測試
```

**本週產出**：完整的記帳與分攤功能

---

### 📓 Phase 5: 日誌 & 成員模組（Week 7）

**目標**：實作日誌與成員管理

#### 里程碑檢查

- [ ] 瀑布流佈局（Masonry Grid）
- [ ] 日誌編輯器（簡化 Markdown）
- [ ] 多圖上傳與排序
- [ ] 心情標記
- [ ] 成員列表
- [ ] 頭像上傳

#### 工作項目

```
Day 1-3: 日誌模組
├── types/journal.ts
├── stores/journal.ts
├── CollectionView.vue
├── JournalGrid.vue（瀑布流）
├── JournalCard.vue
└── JournalEditor.vue

Day 4-5: 編輯器功能
├── Markdown 編輯器（簡化版）
├── PhotoGallery.vue（多圖管理）
└── MoodSelector.vue

Day 6-7: 成員模組
├── types/member.ts
├── stores/member.ts
├── MembersView.vue
├── MemberCard.vue
└── MemberForm.vue
```

**本週產出**：完整的日誌與成員功能

---

### 🚀 Phase 6: 進階功能 Part 1（Week 8-9）

**目標**：加入拖拽排序與多選項行程

#### Week 8: 拖拽排序

- [ ] 整合 vuedraggable
- [ ] 行程卡片拖拽手柄
- [ ] 拖拽視覺回饋
- [ ] 更新 Firestore order 欄位
- [ ] Ghost 元素樣式

#### Week 9: 多選項行程

- [ ] 選項組資料結構
- [ ] 多選項 UI（虛線框、字母標記）
- [ ] 確認選項功能
- [ ] 刪除其他選項
- [ ] 選項比較 Modal

**本週產出**：拖拽排序 + 多選項行程功能

---

### 🗺️ Phase 7: 進階功能 Part 2（Week 10-11）

**目標**：Google Maps 整合與 Instagram 匯入

#### Week 10: Google Maps

- [ ] 地圖視圖頁面（全螢幕）
- [ ] 標記顯示（分類顏色）
- [ ] 路線規劃（Directions API）
- [ ] 地圖樣式（溫馨配色）
- [ ] 與 Google Maps App 互動
- [ ] InfoWindow 資訊窗

#### Week 11: Instagram 匯入

- [ ] Instagram URL 驗證
- [ ] 匯入按鈕與 Modal
- [ ] 手動輸入地點名稱
- [ ] 建立行程草稿
- [ ] 來源標記（source.type）

**本週產出**：地圖視圖 + Instagram 匯入功能

---

### 📦 Phase 8: 資料管理 & PWA（Week 12）

**目標**：資料匯出/匯入與 PWA 配置

#### 資料管理

- [ ] JSON 匯出（完整備份）
- [ ] Markdown 匯出（行程表）
- [ ] CSV 匯出（支出記錄）
- [ ] JSON 匯入（還原備份）
- [ ] 匯出/匯入 UI
- [ ] 檔案驗證

#### PWA 配置

- [ ] manifest.json 設定
- [ ] Service Worker 配置
- [ ] 離線快取策略
- [ ] 安裝提示 UI
- [ ] App Icon 設計（192x192, 512x512）
- [ ] Splash Screen

**本週產出**：完整的資料管理功能 + 可安裝的 PWA

---

### 🎨 Phase 9: 優化與測試（Week 13-14）

**目標**：效能優化與全面測試

#### Week 13: 效能優化

- [ ] 圖片懶加載（所有圖片）
- [ ] Virtual Scroll（長列表）
- [ ] Firestore 查詢優化
- [ ] 快取機制完善
- [ ] Bundle 大小優化（分析 & tree-shaking）
- [ ] Critical CSS 提取

#### Week 14: 測試與修正

- [ ] 功能測試（所有模組）
- [ ] 多裝置測試（iOS/Android/Desktop）
- [ ] 離線功能測試
- [ ] PWA 安裝測試
- [ ] 無障礙測試（a11y）
- [ ] Bug 修復

**本週產出**：穩定、高效能的產品

---

### 🚢 Phase 10: 部署上線（Week 15）

**目標**：部署到正式環境

#### 部署流程

```bash
1. Firebase Hosting 部署
   ├── npm run build
   ├── firebase login
   ├── firebase init hosting
   └── firebase deploy

2. 環境變數設定（正式環境）

3. Firebase Security Rules 部署
   ├── firestore.rules
   └── storage.rules

4. 自訂網域設定（可選）

5. 監控設定
   ├── Firebase Analytics
   ├── Firebase Performance
   └── Error Tracking
```

#### 里程碑檢查

- [ ] 正式環境部署成功
- [ ] 自訂網域設定（如有）
- [ ] Security Rules 部署並測試
- [ ] 監控工具啟用
- [ ] 使用者測試
- [ ] 效能檢查（Lighthouse Score > 90）

**最終產出**：上線的 Travelogue PWA 🎉

---

## 里程碑定義

### MVP (Minimum Viable Product) - Week 7

**必備功能**：

- ✅ 行程管理（基礎）
- ✅ 準備清單
- ✅ 記帳功能
- ✅ 預訂管理
- ✅ 基本資料匯出

**目標**：可以實際用於一趟旅行規劃

### Version 1.0 - Week 12

**完整功能**：

- ✅ 所有核心模組
- ✅ 拖拽排序
- ✅ Google Maps
- ✅ 完整資料管理
- ✅ PWA 可安裝

**目標**：功能完整的產品

### Version 1.1 - 未來擴充

**進階功能**：

- 多人協作模式
- Instagram 自動解析（付費 API）
- AI 行程推薦
- 即時通知
- 社群分享

---

## 開發建議

### 1. 迭代開發

- 每個 Phase 結束都要有可運行的產品
- 優先實作「核心功能」，再加「進階功能」
- 每週 Demo，獲取回饋

### 2. 程式碼品質

- 遵循 TypeScript 嚴格模式
- 共用邏輯抽取成 Composables
- UI 元件力求可重用
- 加上適當的註解

### 3. 測試策略

- 手動測試為主（初期）
- 關鍵邏輯加上單元測試
- 使用 Chrome DevTools 測試 PWA
- 多裝置測試（iOS/Android）

### 4. 效能注意事項

- 避免過度的 Firestore 讀取
- 圖片一定要壓縮
- 列表使用 Virtual Scroll
- 善用 LocalStorage 快取

### 5. 使用者體驗

- Mobile-first 設計
- 載入狀態要明確
- 錯誤提示要友善
- 動畫要流暢（60fps）

---

## 常見問題

### Q1: Firebase 免費額度不夠用怎麼辦？

**A**:

- 實作快取機制（減少讀取）
- 使用分頁載入（一次不抓全部）
- 升級到 Blaze 計畫（按量付費）

### Q2: Google Maps API 費用問題？

**A**:

- 每月 $200 免費額度通常夠用
- 限制 API Key 使用網域
- 考慮使用 Leaflet.js（開源替代方案）

### Q3: 圖片上傳太慢？

**A**:

- 前端壓縮（browser-image-compression）
- 顯示上傳進度
- 背景上傳（不阻塞 UI）

### Q4: 離線功能不穩定？

**A**:

- 檢查 Firebase Persistence 設定
- 善用 LocalStorage 作為備份
- 提供「手動同步」按鈕

---

## 學習資源

### Vue 3 & TypeScript

- [Vue 3 官方文檔](https://vuejs.org/)
- [TypeScript 官方文檔](https://www.typescriptlang.org/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)

### Firebase

- [Firebase 官方文檔](https://firebase.google.com/docs)
- [Firestore 資料建模最佳實踐](https://firebase.google.com/docs/firestore/manage-data/structure-data)

### Tailwind CSS

- [Tailwind CSS 官方文檔](https://tailwindcss.com/)

### PWA

- [PWA 開發指南](https://web.dev/progressive-web-apps/)
- [Workbox 文檔](https://developer.chrome.com/docs/workbox/)

---

## 結語

這是一個完整的 15 週開發計畫，涵蓋：

- ✅ 6 大核心功能模組
- ✅ 5 個進階功能
- ✅ PWA 支援
- ✅ 完整的資料管理

**建議的開始方式**：

1. 先完成 **Phase 0-1**（專案架構 + 準備清單）
2. 快速獲得成就感
3. 再逐步完成其他模組

準備好開始了嗎？ 🚀

---

**文檔版本**: 2.0.0  
**最後更新**: 2026-02-15  
**維護者**: Project Management Team
