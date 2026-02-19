# 📝 Travelogue 開發日誌 (Commit Log)

> 記錄專案的開發進程、每次提交的內容與改動方向。

---

## 📅 提交歷史

### [2026-02-19]

#### `TBD` - refactor(terminology): 統一全站專案用語並優化視圖命名

- **用語統一與重命名**:
  - 將「行程 (Schedule)」統一改稱為「計畫 (Plan)」，包含 `ScheduleView.vue` 重命名為 `PlanView.vue`，及 `ScheduleHeader.vue` 重命名為 `PlanHeader.vue`。
  - 將「行前規劃 (Planning)」重新命名為「準備清單 (Preparation)」，`PlanningView.vue` 改為 `PreparationView.vue` 以符合實際功能定義。
  - 規範化複數命名：`BookingsView.vue` 改為 `BookingView.vue`，`SettingsView.vue` 改為 `SettingView.vue`。
- **架構與型別同步**:
  - 更新 `src/router/index.ts` 以反映新的視圖路徑與組件名稱。
  - 同步修改 `tripStore.ts`、`useTripDetails.ts` 與 `trip.ts` 中的相關變數與型別定義。
  - 更新 `BottomNav.vue` 的導航連結，確保路徑指向正確。
- **測試與文件更新**:
  - 重構 `tests/unit/BottomNav.spec.ts` 與 `tests/unit/useTripDetails.spec.ts` 以適應新的組件名稱。
  - 更新 `README.md` 中的專案結構說明與功能描述。
- **工程規範**:
  - 完成 `npm run test`, `lint`, `format`, `build` 完整驗證流程，確保重命名後無任何引用錯誤或編譯失敗。

## [<日期 YYYY-MM-DD>] feat(schedule): 實作行程編輯與備選方案管理功能

- Hash: `TBD`
- 改動方向: 建立完整的行程活動編輯系統，並強化資料一致性與排序邏輯。
- 具體內容:
  - **編輯功能實作**:
    - 建立 `BaseBottomSheet.vue` 通用底部抽屜組件，支援行動端手勢感與背景遮罩。
    - 建立 `ActivityForm.vue` 互動式表單，支援行程標題、時間、分類、地點與詳細說明的編輯。
    - 實作「備選方案」動態編輯介面，支援多個備案的增刪與標題/副標題維護。
  - **資料一致性與型別強化**:
    - 更新 `ActivitySchema`，將 `id` 欄位改為必填 (Required)，確保 CRUD 操作的準確性。
    - 更新 `seed.ts` 種子資料，為所有範例活動補上唯一 ID，並同步更新 Zod 驗證邏輯。
    - 修改 `tripStore.ts` 實作 `updateTripActivity` 與 `deleteTripActivity`，支援 Firestore 步同步與本地 Pinia 狀態反應式更新。
  - **UI/UX 優化**:
    - 修正 `useTripDetails` 排序邏輯，強制所有行程活動依照 `time` (HH:mm) 欄位進行排序。
    - 優化 `TimelineItem` 與 `ActivityOptionItem` 的點擊區域，區分「開啟地圖」與「開啟編輯」，防止行動端誤觸。
  - **工程規範**:
    - 完成 `npm run test`, `lint`, `format`, `build` 完整驗證流程。
    - 修復 Zod `format()` 過時警告，改用 `flatten()` 優化錯誤日誌輸出。

## [<日期 YYYY-MM-DD>] refactor(database): 行程資料架構重構為子集合 (Sub-collection)

- Hash: `TBD`
- 改動方向: 將 `plans` 陣列從 `trips` 主文件中抽離，獨立存儲於子集合以優化效能與擴展性。
- 具體內容:
  - **資料架構重設計**:
    - 修改 `src/types/trip.ts`，將 `plans` 從 `TripSchema` 移除，改為獨立的 `DailyPlan` 子集合。
    - 在 `DailyPlanSchema` 中加入 `tripId` 欄位，強化跨集合查詢能力。
  - **Store 與狀態管理優化**:
    - 更新 `tripStore.ts` 支援 `subscribeToPlans` 即時監聽子集合變化。
    - 重構 `updateTripActivity` 與 `deleteTripActivity`，實作子集合文件的動態建立與原子化更新。
    - 優化 Store 邏輯：消除物件 Mutation 副作用、補強 Auth 安全檢查、統一子集合監聽風格。
  - **資料流適配**:
    - 更新 `useTripDetails` composable，改為接收獨立的 `plans` 狀態，維持 UI 反應性。
    - 調整 `ScheduleView.vue` 生命週期，進入頁面時啟動特定旅程的行程監聽。
    - 更新 `ExpenseView` 與 `CollectionView` 以適應統一的監聽 State 模式。
  - **種子資料與測試更新**:
    - 重構 `seed.ts` 將行程資料完全抽離主文件陣列，並實作子集合自動導入邏輯。
    - 重寫 `tripStore.spec.ts` 與更新 `useTripDetails.spec.ts` 以符合新的參數結構與訂閱模式。

### [2026-02-18]

#### `af4a0d5` - feat(logic): 導入 Zod 資料校驗並優化 UI 型別分離架構

- **Zod 執行期校驗**:
  - 在 `src/types/trip.ts` 引入 Zod，建立完整的旅程、行程、預訂與記帳 Schema。
  - 重構 `tripStore.ts`，實作 `validateAndFilter` 輔助函式，確保從 Firestore 抓取的資料符合 Zod 規範並自動過濾損毀資料。
  - 補全 `userId` 欄位至所有資料模型與種子導入邏輯中，強化資料歸屬與安全性。
- **UI 型別分離架構**:
  - 建立 `src/types/trip-ui.ts` 定義純 TypeScript 介面（`TripUI`, `ActivityUI` 等）。
  - 將 `TripCard`, `TimelineItem`, `ActivityOptionItem` 等組件的 Props 改為引用 UI 型別，徹底解決 Vue SFC 編譯器無法解析 Zod 推導型別導致的 Build Error。
- **工程規範與測試同步**:
  - 更新 `AGENTS.md`，將 `npm run build` 正式納入 Pre-Commit 強制驗證流程。
  - 同步更新 `tripStore.spec.ts`, `TripCard.spec.ts`, `seed.spec.ts` 的 Mock 資料與斷言，確保測試覆蓋 Zod 校驗邏輯。

#### `31e2430` - docs(firebase): 優化 Hosting 配置並補全部署文件

- **身分驗證實作**:
  - 實作 Google 登入功能並新增 `authStore` 管理使用者登入狀態。
  - 建立 `LoginView.vue` 登入頁面，並在 `App.vue` 實作全域初始載入動畫與 Splash Screen。
  - 實作全域路由守護 (Navigation Guard)，在確認登入狀態前進行非同步等待，確保未登入者無法存取受保護頁面。
- **白名單機制與資安強化**:
  - 導入「Email 白名單」機制，結合 Firestore `exists()` 安全性規則實作高效的存取控制。
  - 更新 `authStore` 邏輯，登入後自動比對白名單 Email（以 Email 作為 Document ID）。
  - 更新 `tripStore` 邏輯，強制在 CRUD 操作中檢查登入狀態並自動綁定 `userId`。
- **UI/UX 優化與架構調整**:
  - 移除 `BookingsView.vue` 舊有的 PIN 碼鎖定功能，改由 Firebase Auth 統一控管。
  - 更新 `BottomNav.vue` 與 `router` 配置，讓「更多」按鈕支援全域與旅程設定的彈性跳轉。
  - 新增 `docs/FIREBASE_CONFIG.md` 技術文件並同步更新 `README.md` 的後端配置指南。

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
    - `CollectionView`: 實作資料收集與展示邏輯。
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
