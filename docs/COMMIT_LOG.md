# 📝 Travelogue 開發日誌 (Commit Log)

> 記錄專案的開發進程、每次提交的內容與改動方向。

---

## 📅 提交歷史

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
