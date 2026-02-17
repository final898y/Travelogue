# 📝 Travelogue 開發日誌 (Commit Log)

> 記錄專案的開發進程、每次提交的內容與改動方向。

---

## 📅 提交歷史

### [2026-02-17]

#### `TBD` - feat(seed): 補全範例資料並實作全站實體資料串接

- **資料內容補完**:
  - 擴充 `seed.ts` 以包含子集合（記帳、資料收集）與嵌入式欄位（預定、準備清單）的豐富範例資料。
  - 實作 `importSeedData` 的子集合自動導入邏輯，支援子集合的 Upsert 與空檢查。
- **視圖實體串接**:
  - `BookingsView`: 實作機票與飯店預定的動態顯示，並優化 `location` 解析的容錯邏輯。
  - `ExpenseView`: 串接 `expenses` 子集合，實作總額計算與分類圓餅圖顯示。
  - `PlanningView`: 串接 `preparation` 陣列，動態劃分待辦事項與行李清單。
- **測試同步**:
  - 更新 `seed.spec.ts` 驗證子集合的導入行為與主文件的 Upsert 邏輯。

#### `03bf7c8` - refactor: 重構路由架構並導入 Firebase 子集合與資料收集功能

- **路由架構整合**:
  - 重構 `router` 配置，將所有旅程相關功能（預定、記帳、準備、收集）改為 `/:id/` 模式，解決功能割裂問題。
  - 優化 `BottomNav.vue`，實作動態 ID 連結生成與首頁自動禁用邏輯。
- **資料模型與 Firebase 優化**:
  - 在 `trip.ts` 導入「混合式儲存架構」：核心行程採大文件存儲，而「資料收集」與「記帳」則設計為子集合。
  - 擴展 `tripStore` 支援子集合的即時監聽 (onSnapshot) 與 CRUD 操作，新增 `addExpense` 與 `addCollection`。
- **功能轉型 - 行前資料收集 (Research Collection)**:
  - 將原有的「日誌 (Journal)」視圖重構為「資料收集」功能。
  - 支援 Threads、Instagram、Web 與 YouTube 來源標註與分類整理，專注於行前靈感收集。
  - 實作「新增收集」彈窗與 Firebase 異步寫入邏輯。
- **測試強化**:
  - 新增 `BottomNav.spec.ts` 驗證動態路由與權限控制邏輯。
  - 擴展 `tripStore.spec.ts` 覆蓋子集合操作與單一旅程抓取測試。
  - 修正 `TripCard.spec.ts` 的 ID 類型不符警告。

#### `bc18a09` - feat(ui): 優化地點結構與組件架構並更新地圖工具

- **資料結構優化**:
  - 在 `Activity` 與 `ActivityOption` 中導入 `subtitle` 欄位，明確劃分描述性標題與實際地點名稱。
  - 規範化 `location` 欄位為大區域名稱（如：淺草、新宿），提升資料的一致性。
- **組件重構**:
  - 建立 `ActivityOptionItem.vue` 專門處理備選方案的渲染，實現組件解耦。
  - 瘦身 `TimelineItem.vue`，將複雜的備選方案邏輯抽離，並修正 template 中存取 `window` 的 TypeScript 報錯。
- **功能擴充**:
  - 升級 `mapUtils.ts`，將連結生成邏輯改為優先使用 `subtitle` 作為精確搜尋核心。
  - 實作結構化備案功能，現在備選方案也能擁有獨立的地圖連結與地點資訊。
  - 修正 `BottomNav.vue` 的動態路由連結，解決無效 `/schedule` 路徑導致的警告。
- **文件與測試**:
  - 更新 `README.md`，補齊資料夾結構、實作項目清單及技術棧說明。
  - 新增 `mapUtils.spec.ts` 驗證防禦性連結生成邏輯。

#### `85e35ae` - refactor(logic): 重構行程管理架構並強化型別安全與測試

- **架構重構**:
  - 建立 `useTripDetails` composable，實現視圖與業務邏輯分離。
  - 重構 `Trip` 資料結構，引入 `DailyPlan` 與日期驅動 (Date-Driven) 的活動管理。
- **資料與功能**:
  - 擴充 `seed.ts`，實作東京、京都與北海道（5天）的完整行程假資料。
  - 優化導入邏輯，支援對現有資料的更新 (Upsert)。
- **型別安全**:
  - 修正 TypeScript 在日期處理上的嚴格檢查錯誤。
  - 移除測試代碼中的所有 `any`，改用官方 `DocumentData` 與自定義 Mock 介面。
- **測試覆蓋**:
  - 新增 `useTripDetails.spec.ts` 驗證動態日期計算與活動過濾。
  - 新增 `firebase.spec.ts` 驗證 SDK 初始化。
  - 新增 `seed.spec.ts` 驗證資料導入與更新邏輯。

#### `67648e7` - feat(schedule): 實作動態行程讀取與 Firebase 持久化優化

- **Firebase 優化**:
  - 升級持久化配置，將 `enableIndexedDbPersistence` 替換為 `initializeFirestore` 與 `persistentLocalCache`，支援多標籤頁共用快取。
  - 修正 `.gitignore` 以排除 `.env` 敏感檔案，同時保留 `.env.example`。
- **動態路由**: 更新 `router` 配置，將 `/schedule` 變更為 `/schedule/:id`，支援根據 ID 顯示特定行程。
- **資料模型**: 在 `Trip` 型別中新增 `scheduleItems` 欄位，擴展行程細節儲存。
- **UI 串接**:
  - `ScheduleView`: 重構為根據路徑參數 ID 從 `tripStore` 動態獲取標題與活動內容，取代靜態資料。
  - `HomeView`: 修正導航邏輯，點擊行程卡片時傳遞正確的 ID。
- **資料導入**: 優化 `seed.ts` 邏輯，從「重複則跳過」改為「重複則更新 (Upsert)」，並為預設行程補齊具體的活動細項。
- **工程規範**: 修正 `seed.ts` 的 TypeScript 類型定義，移除 `any` 轉型並通過 ESLint 檢查。

### [2026-02-16]

#### `HEAD` - feat(firebase): 整合 Firebase Firestore 與 Pinia Store

- **核心架構**: 初始化 Firebase SDK 並實作離線持久化 (Offline Persistence)。
- **狀態管理**: 建立 `tripStore` 處理旅程資料的即時訂閱 (onSnapshot) 與 CRUD 操作。
- **資料導入**: 實作 `seed.ts` 腳本，支援自動比對標題防止重複導入範例資料。
- **UI 串接**: 在 `HomeView` 實作真實資料讀取、載入狀態與「初始化資料」功能。
- **測試**: 新增 `tripStore.spec.ts` 單元測試，驗證 Store 初始狀態與數據更新邏輯。

#### `5dcc714` - feat(ui): 實作核心視圖並優化設計系統規範

- **改動方向**: 擴展功能模組並提升 UI/UX 質感。
- **具體內容**:
  - **設計系統**: 升級至 v1.1.0，引入「Soft UI Evolution」理念，並在 `style.css` 實作更細膩的混合式軟陰影。
  - **核心視圖**: 實作預訂 (Bookings)、記帳 (Expense)、日誌 (Journal)、準備 (Planning) 與設定 (Settings) 頁面。
  - **功能細節**:
    - `BookingsView`: 實作 PIN 碼鎖定與登機證風格卡片。
    - `ExpenseView`: 實作視覺化支出儀表板。
    - `JournalView`: 實作瀑布流佈局展示旅行記錄。
  - **導航優化**:
    - `BottomNav`: 改為 `router-link` 導航，新增「首頁」按鈕，並修正 Z-index 遮擋問題。
    - `ScheduleView`: 將返回按鈕邏輯修正為回到首頁列表。
  - **代碼修正**: 修正 `SettingsView` 的語法錯誤與圖示規範。

#### `86a6477` - chore(test): 遷移測試架構並更新 Agent 規範

- **改動方向**: 優化測試管理並強化工程化規範。
- **具體內容**:
  - **架構遷移**: 建立根目錄 `tests/` 資料夾（含 `unit`, `integration`, `e2e` 子目錄），並將 `src` 內的測試檔案全數遷移。
  - **路徑修正**: 更新遷移後測試檔案的組件導入路徑。
  - **規範升級**: 修改 `AGENTS.md`，強制要求新增功能必須編寫對應測試，並規範測試放置位置。

#### `e31a196` - refactor: 重構專案架構並建立自動化測試系統

- **改動方向**: 提升代碼可維護性、型別安全性與測試覆蓋率。
- **具體內容**:
  - **架構重整**: 建立 `src/types`, `src/stores`, `src/composables`, `src/services` 資料夾，並細分 `components` 為 `ui` 與 `trip` 目錄。
  - **型別統一**: 建立 `src/types/trip.ts` 並將全站旅程相關型別集中管理。
  - **基礎元件**: 實作 `BaseCard.vue` 作為全站卡片的風格基準。
  - **自動測試**: 配置 Vitest 並編寫 `TripCard.spec.ts`，驗證渲染邏輯與狀態顯示。
  - **代碼清理**: 移除 `HelloWorld.vue` 相關舊檔案，並修復 `HomeView.vue` 的 TypeScript 型別不匹配問題。

#### `8c6dfbf` - feat(router): 建立 Vue Router 系統並重構頁面架構

- **改動方向**: 導正專案架構以符合 Phase 0 里程碑規範。
- **具體內容**:
  - 安裝 `vue-router@4` 並配置 `History Mode`。
  - 建立 `src/views` 與 `src/router` 資料夾，實現頁面與組件分離。
  - 遷移 `HomeView.vue` 與 `ScheduleView.vue` 至 views 目錄，並改用編導式導航。
  - 重構 `App.vue`: 導入 `<router-view>` 並加入頁面切換的淡入淡出動畫。
  - 全面優化圖示系統：將所有表情符號 (Emoji) 替換為 Lucide SVG。

#### `18e4b3c` - feat(ui): 實作首頁 UI/UX 設計與設計系統優化

- **改動方向**: 建立 Travelogue 的核心視覺風格與首頁列表。
- **具體內容**:
  - 導入 `ui-ux-pro-max` 專家系統，定義「Motion-Driven」風格與「Storytelling」佈局。
  - 新增 `TripCard.vue`: 手帳風格旅程卡片，具備懸停動畫與 SVG 狀態標籤。
  - 新增 `BottomNav.vue`: 行動優先的懸浮導覽列，整合 Lucide 風格 SVG 圖示與毛玻璃效果。

### [2026-02-15]

#### `6d233b0` - chore: 配置 ESLint 與 Prettier 並更新專案 Script

#### `dfea005` - feat: 專案初始化

---

## 🚀 下一步計畫 (Upcoming)

- [ ] 安裝 Firebase SDK 並實作 `TripStore` (Pinia)。
- [ ] 實作 Phase 1: 準備清單模組 (Todo List)。
- [ ] 擴充共用 UI 元件庫 (BaseButton, BaseInput, Modal)。
