# 📝 Travelogue 開發日誌 (Commit Log)

> 記錄專案的開發進程、每次提交的內容與改動方向。

---

## 📅 提交歷史

### [2026-02-16]

#### `pending` - refactor: 重構專案架構並建立自動化測試系統

- **改動方向**: 提升代碼可維護性、型別安全性與測試覆蓋率。
- **具體內容**:
  - **架構重整**: 建立 `src/types`, `src/stores`, `src/composables`, `src/services` 資料夾，並細分 `components` 為 `ui` 與 `trip` 目錄。
  - **型別統一**: 建立 `src/types/trip.ts` 並將全站旅程相關型別集中管理。
  - **基礎元件**: 實作 `BaseCard.vue` 作為全站卡片的風格基準。
  - **自動測試**: 配置 Vitest 並編寫 `TripCard.spec.ts`，驗證渲染邏輯與狀態顯示。
  - **代碼清理**: 移除 `HelloWorld.vue` 相關舊檔案，並修復 `HomeView.vue` 的 TypeScript 型別不匹配問題。
  - **驗證**: 通過完整的 Build, Test, Lint, Format 流程。

#### `8c6dfbf` - feat(router): 建立 Vue Router 系統並重構頁面架構

- **改動方向**: 導正專案架構以符合 Phase 0 里程碑規範。
- **具體內容**:
  - 安裝 `vue-router@4` 並配置 `History Mode`。
  - 建立 `src/views` 與 `src/router` 資料夾，實現頁面與組件分離。
  - 遷移 `HomeView.vue` 與 `ScheduleView.vue` 至 views 目錄，並改用編導式導航。
  - 重構 `App.vue`: 導入 `<router-view>` 並加入頁面切換的淡入淡出動畫。
  - 全面優化圖示系統：將所有表情符號 (Emoji) 替換為 Lucide SVG。
  - 完成 `Phase 0` 中「路由系統設定完成」的目標。

#### `18e4b3c` - feat(ui): 實作行程頁面 (Schedule) 與交互邏輯

- **改動方向**: 建立旅程的核心規劃介面與頁面導航。
- **具體內容**:
  - 新增 `ScheduleHeader.vue`: 顯示倒數計時與天氣資訊的頁首。
  - 新增 `HorizontalDatePicker.vue`: 橫向捲動日期切換器，具備平滑滾動與選中特效。
  - 新增 `TimelineItem.vue`: 實作垂直時間軸行程卡片，支援類別色標與多方案 (Group A/B) 視覺呈現。
  - 新增 `ScheduleView.vue`: 整合上述組件的完整頁面，並加入浮動新增按鈕 (FAB)。
  - 更新 `App.vue`: 實作基礎導航邏輯，支援首頁旅程卡片點擊跳轉至行程頁面。

#### `de5bd87` - feat(ui): 實作首頁 UI/UX 設計與設計系統優化

- **改動方向**: 建立 Travelogue 的核心視覺風格與首頁列表。
- **具體內容**:
  - 導入 `ui-ux-pro-max` 專家系統，定義「Motion-Driven」風格與「Storytelling」佈局。
  - 新增 `TripCard.vue`: 手帳風格旅程卡片，具備懸停動畫與 SVG 狀態標籤。
  - 新增 `BottomNav.vue`: 行動優先的懸浮導覽列，整合 Lucide 風格 SVG 圖示與毛玻璃效果。
  - 優化設計系統：定義全域字體變數與溫馨自然色系。

### [2026-02-15]

#### `6d233b0` - chore: 配置 ESLint 與 Prettier 並更新專案 Script
#### `dfea005` - feat: 專案初始化

---

## 🚀 下一步計畫 (Upcoming)

- [ ] 安裝 Firebase SDK 並實作 `TripStore` (Pinia)。
- [ ] 實作 Phase 1: 準備清單模組 (Todo List)。
- [ ] 擴充共用 UI 元件庫 (BaseButton, BaseInput, Modal)。
