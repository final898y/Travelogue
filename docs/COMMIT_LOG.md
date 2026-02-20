# 📝 Travelogue 開發日誌 (Commit Log)

> 記錄專案的開發進程、每次提交的內容與改動方向。

---

## 📅 提交歷史

## [2026-02-20]

## [2026-02-20] refactor(store): 全站 Store 架構同步與 ID 衝突防禦

- **Version**: `2.1.5`
- **改動方向**: 統一全站 Store 的 Auth 注入方式與資料映射安全性。
- **具體內容**:
  - 完成 `expenseStore.ts` 與 `planStore.ts` 的 `authStore` 遷移，移除所有剩餘的 Firebase SDK `auth` 直接調用。
  - 同步修正所有子集合的 `onSnapshot` 映射邏輯，確保文件 `id` 覆蓋順序正確，防止資料庫欄位衝突導致的更新失敗。
  - 於 `addExpense` 等方法實作資料清理，確保物件 ID 不會汙染 Firestore 文檔欄位。
  - 更新 `package.json`, `README.md`, `SettingView.vue` 版本號至 `2.1.5`。

## [2026-02-20] fix(store): 解決 Firestore 文件 ID 映射衝突與 Store 權限注入

- **Version**: `2.1.4`
- **改動方向**: 修正資料映射順序以防止 ID 被覆蓋，並完成 CollectionStore 的權限重構。
- **具體內容**:
  - 修正 `tripStore.ts` 與 `collectionStore.ts` 的映射邏輯，確保 `id: doc.id` 具有最高優先權（放置於解構之後）。
  - 重構 `collectionStore.ts` 以完全使用 `authStore` 進行權限判斷，移除對 Firebase `auth` 的直接依賴。
  - 在 `addTrip` 與 `addCollection` 實作資料清理邏輯，確保新增時不會將帶有 `id` 欄位的物件存入資料庫內容中。
  - 補全 TypeScript 型別定義，徹底消除 Store 中因清理資料而產生的 `any` 型別警告。
  - 更新 `package.json`, `README.md`, `SettingView.vue` 版本號至 `2.1.4`。

## [2026-02-20] feat(collection): 擴展資料收集結構並優化連結功能

- **Version**: `2.1.3`
- **改動方向**: 針對資料收集 (Collection) 實作多重 URL 支援，優化地圖與官網跳轉體驗。
- **具體內容**:
  - 於 `CollectionSchema` 新增 `mapUrl` (地點) 與 `websiteUrl` (官網/訂餐) 可選欄位。
  - 更新 `CollectionForm.vue` 支援新欄位輸入，並改用 Zod 標準之 `.url()` 進行嚴格校驗。
  - 重構 `CollectionView.vue` 卡片，將地圖圖示連結至 `mapUrl`，並新增官網連結圖示 (`ExternalLink`)。
  - 同步更新 `seed.ts` 範例資料與 `CollectionForm.spec.ts` 單元測試。
  - 修正 `icons.ts` 補上缺失的 `ExternalLink` 與 `Github` 圖示匯出。
  - 更新 `package.json`, `README.md`, `SettingView.vue` 版本號至 `2.1.3`。

## [2026-02-20] feat(booking): 優化機票預訂流程與系統連結

- **Version**: `2.1.2`
- **改動方向**: 針對機票預訂實作分欄輸入與原生時間選擇，並補強系統連結。
- **具體內容**:
  - 在 `BookingForm.vue` 中針對「機票」類型實作分欄輸入（出發地/目的地、出發時間/抵達時間）。
  - 將所有預訂時間輸入優化為原生 `datetime-local` 選擇器。
  - 重構 `BookingView.vue` 機票卡片，將地點與對應時間成對顯示，提升閱讀直覺。
  - 在 `SettingView.vue` 的「關於」區塊新增 GitHub 專案源碼連結，並同步更新 `icons.ts`。
  - 修正 `README.md` 中失效的文件連結。
  - 更新 `package.json`, `README.md`, `SettingView.vue` 版本號至 `2.1.2`。

## [2026-02-20] refactor(auth): 優化權限驗證與資料存儲邏輯

- **Version**: `2.1.1`
- **改動方向**: 統一使用 `authStore` 進行權限驗證，移除硬編碼 Email，並優先以 Email 作為資料關聯鍵。
- **具體內容**:
  - 在 `authStore.ts` 中擴展白名單驗證邏輯，支援讀取並存儲 `isAdmin` 權限旗標。
  - 在 `HomeView.vue` 中，將「初始化資料」按鈕改為根據 `authStore.isAdmin` 決定是否顯示（解耦硬編碼）。
  - 在 `tripStore.ts` 中，將所有直接調用 Firebase `auth` 的邏輯改為引用 `authStore`，確保狀態單一來源。
  - 在 `addTrip` 方法中，優先使用 `user.email` 作為 `userId` 存入資料庫，提升資料可讀性。
  - 在 `HomeView.vue` 的 `handleDeleteTrip` 增加 `userId` 與當前使用者 Email 的權限比對。
  - 更新 `package.json`, `README.md`, `SettingView.vue` 版本號至 `2.1.1`。

### `TBD` - feat(trip): 實作特定旅程之匯出與匯入功能

- **功能擴展**:
  - 於 `backupService.ts` 新增 `exportSingleTrip` 與 `importSingleTrip` 方法，支援單一旅程資料的提取與恢復。
  - 導入單一旅程時會自動產生新 Trip ID，標題附加「(匯入)」後綴，防止與現有資料衝突。
- **UI/UX 優化**:
  - 在 `TripCard.vue` 的更多選單中新增「匯出」按鈕。
  - 在 `HomeView.vue` 的 Header 新增「匯入行程」按鈕，並實作匯入後的自動導航邏輯。
- **測試與驗證**:
  - 於 `backupService.spec.ts` 補全單一旅程操作的單元測試。
  - 修正 TypeScript `Record<string, unknown>` 型別轉型，確保 `Timestamp` 寫入時符合 Lint 規範。
  - 通過 85 個測試案例、無 Lint 錯誤、生產環境編譯成功。

## [2026-02-20]

### `TBD` - feat(settings): 實作資料管理系統 (備份/導出/導入) 與單元測試

- **核心服務實作**:
  - 建立 `backupService.ts` 處理遞迴資料提取，完整涵蓋旅程及其所有子集合（行程、支出、收藏）。
  - 實作 JSON 格式打包與下載邏輯，支援本地備份。
  - 實作雲端備份功能，將資料快照存儲於 Firestore `backups` 集合。
  - 實作安全導入邏輯：包含 Zod Schema 校驗、遞迴刪除現有資料與 `writeBatch` 批次恢復。
- **測試覆蓋**:
  - 新增 `tests/unit/backupService.spec.ts`，驗證資料提取查詢、遞迴刪除邏輯以及導入時的 Zod 校驗。
- **UI/UX 整合**:
  - 於 `SettingView.vue` 新增「資料安全」區塊與對應功能按鈕。
  - 導入前整合 `BaseConfirmDialog` 進行二次確認，防止誤操作。
  - 實作全域處理遮罩與即時 Toast 進度提示。
- **工程與驗證**:
  - 修正 TypeScript 型別轉型錯誤與 Lint 規範問題。
  - 通過 85 個測試案例 (含 4 個新測試)、無 Lint 錯誤、生產環境編譯成功。

## [2026-02-20]

### `TBD` - feat(ui): 實作全域 Toast 與 ConfirmDialog 並優化交互體驗

- **全域交互系統**:
  - 建立 `uiStore.ts` (Pinia) 統一管理提示與確認狀態，支援非同步 `Promise` 型式的確認對話框。
  - 建立 `BaseToast.vue`: 採用 Soft UI 手帳風格設計，具備實心陰影與品牌專屬色系（Forest, Coral-red, Honey-orange）。
  - 建立 `BaseConfirmDialog.vue`: 現代化模態對話框，具備高質感背景模糊與符合專案規範的按鈕設計。
- **全站交互替換**:
  - 將全專案超過 30 處 `window.alert()` 與 `window.confirm()` 替換為自定義組件，達成 100% UI 一致性。
  - 受影響範圍包含所有視圖 (Views) 與業務表單 (Forms)。
- **工程與測試優化**:
  - 安裝 `@pinia/testing` 套件並更新 4 個核心表單測試檔案 (`TripForm.spec.ts` 等)，補全 Pinia 測試環境。
  - 更新測試邏輯以驗證 `uiStore.showToast` 觸發狀態，確保交互邏輯可被測試覆蓋。
- **驗證成果**:
  - 通過 81 個測試案例、無 Lint 錯誤、生產環境編譯成功。

## [2026-02-20]

### `TBD` - style(home): 更新首頁 Header Logo 並優化視覺比例

- **品牌更新**:
  - 將首頁 Header 原有的 `Sprout` 圖示與 `Travelogue` 文字替換為品牌專屬 `Logo.svg`，強化視覺一致性。
- **UI/UX 優化**:
  - 調整 Logo 顯示高度為 `h-10` (40px)，在維持頁面簡潔的同時提升品牌辨識度。
  - 移除不再使用的 `Sprout` 圖示導入，減少組件冗餘。
- **驗證狀態**:
  - 通過 `lint`, `format` 與生產環境 `build` 驗證。

## [2026-02-19]

### `TBD` - test(ui/trip): 補全核心 UI 組件與業務表單的單元測試

- **測試覆蓋擴展**:
  - 新增 `BaseCard.spec.ts`, `BaseBottomSheet.spec.ts`, `PlanHeader.spec.ts`, `HorizontalDatePicker.spec.ts` 完整涵蓋基礎 UI 及其互動邏輯。
  - 新增 `TripForm.spec.ts` 與 `ActivityForm.spec.ts` 驗證旅程與活動編輯表單的複雜業務邏輯、天數計算與資料驗證。
- **互動與相容性優化**:
  - 實作 `window.confirm` 與 `window.alert` 的 Vitest Spies 模擬，確保表單驗證失敗時的視覺回饋正確觸發。
  - 修正 Tailwind CSS 含有斜線 (`/`) 的類別在 `jsdom` 選擇器中的相容性問題，改用更穩定的選擇器策略。
- **驗證成果**:
  - 新增 6 個測試檔案，共 30 個測試案例全數通過。
  - 核心組件與複雜表單的測試覆蓋率顯著提升，符合企業級工程標準。

## [2026-02-19]

### `TBD` - refactor(trip): 實作旅伴 ID 綁定模式與分類選單優化

- **成員管理架構重構**:
  - 將旅程成員從純字串陣列重構為 `Array<{ id: string, name: string }>` ID 綁定模式。
  - 「我」的 ID 自動綁定至 `authStore` 的使用者 Email，確保跨旅程身份一致性。
  - 在 `TripForm.vue` 實作動態成員增刪介面，為新旅伴產生唯一識別 ID 並支援即時髒值偵測。
- **記帳與結算系統升級**:
  - `ExpenseForm.vue` 全面改用 ID 儲存付款人與均分對象，UI 顯示則透過 ID 動態查找成員名稱。
  - 新增支出時，系統會自動預設均分對象為該旅程的所有現有成員。
  - 更新 `ExpenseView.vue` 結算與明細顯示邏輯，解決因改名導致的歷史紀錄斷連問題。
- **UI/UX 優化**:
  - 將 `CollectionForm.vue` 的分類輸入框替換為 `select` 下拉選單，提供「美食、景點、住宿」等 8 項預設選項。
  - 修正 Lucide 圖示匯出與 TypeScript 選用鏈結安全性。
- **工程與驗證**:
  - 更新 `seed.ts` 同步範例旅程與記帳資料結構。
  - 通過完整驗證流程：76 個測試案例全數通過、無 Lint 錯誤、生產環境編譯成功。

## [2026-02-19]

### `TBD` - refactor(trip): 實作旅伴 ID 綁定模式、名稱即時編輯與數據同步優化

- **成員管理架構重構**:
  - 將旅程成員從純字串陣列重構為 `Array<{ id: string, name: string }>` ID 綁定模式。
  - 導入深拷貝機制隔離 `MemberForm.vue` 狀態，防止 Props 污染。
  - 支援**點擊名稱即時編輯**與**刪除確認提醒**，並保持 ID 不變以維護資料一致性。
- **數據同步與健壯性**:
  - 在 `tripStore.ts` 實作單一旅程訂閱 `subscribeToTrip`，確保 `ExpenseView` 成員名單即時更新。
  - 移除全站硬編碼之「我」，改為動態抓取登入者 `displayName` 或 Email。
  - 優化 `getMemberName` 邏輯，針對已移除成員提供防禦性顯示。
- **UI/UX 優化**:
  - 將 `CollectionForm.vue` 分類優化為下拉選單。
- **品質驗證**:
  - 通過完整驗證流程：81 個測試案例全數通過、無 Lint 錯誤、生產環境編譯成功。

### [2026-02-19]

#### `TBD` - feat(home): 實作旅程編輯與刪除功能並優化互動體驗

- **功能增強**:
  - 在 `tripStore.ts` 實作 `updateTrip` 與 `deleteTrip` 方法，補全旅程生命週期管理。
  - 在 `TripCard.vue` 整合 `MoreHorizontal` 下拉選單，支援「編輯」與「刪除」操作。
  - 實作「編輯模式」：`TripForm.vue` 支援傳入 `initialData` 並動態切換標題、按鈕文字與狀態選擇器（Ongoing, Upcoming, Finished）。
- **UI/UX 優化**:
  - 實作選單開啟時的動態 `z-index` 提升，防止選單被鄰近卡片遮擋。
  - 採用與 `PlanView` 一致的 `BaseBottomSheet` 整合邏輯，包含未儲存變更警告與手勢關閉。
  - 優化事件冒泡處理，確保點擊選單按鈕時不會觸發卡片的導航行為。
- **工程規範**:
  - 嚴格對齊專案各視圖間的 `BaseBottomSheet` 使用模式與命名慣例 (`isSaving`, `handleCloseSheet`)。
  - 完成 `npm run test`, `lint`, `format`, `build` 完整驗證流程。

#### `7f89761` - feat(ui): 全面整合 BaseBottomSheet 手勢關閉與未儲存警告

- **所有視圖整合**:
  - 更新 `PlanView`, `BookingView`, `ExpenseView`, `CollectionView`, `PreparationView` 實作髒值 (dirty check) 監控。
  - 將各表單組件 (`ActivityForm`, `BookingForm`, `ExpenseForm`, `CollectionForm`, `PreparationForm`) 的變動狀態傳遞予 `BaseBottomSheet` 之 `:has-unsaved-changes` 屬性。
  - 確保使用者在有變動的情境下，透過「滑動關閉」、「背景點擊」或「ESC」觸發 handleClose 時皆會彈出確認對話框，提升資料安全性。
- **組件更新**:
  - 在所有對應表單組件實作 `watch(formData, ..., { deep: true })` 並發送 `update:dirty` 事件。
- **建置驗證**:
  - 通過 TypeScript 全域檢查與 `npm run build` 編譯。

#### `9452bb4` - perf(build): 實作分包優化與大型第三方庫抽離

- **Vite 打包優化**:
  - 在 `vite.config.ts` 實作 `manualChunks` 分包策略。
  - 將 `firebase`、`zod` 以及 `vue` 核心套件抽離成獨立的 Vendor Chunks。
  - `index.js` 體積從 634kB 減少至 49kB，顯著提升首屏載入速度與瀏覽器快取效率。
- **工程配置更新**:
  - 更新 `.gitignore` 排除 `bundle-stats.html` 分析檔案。
  - 修正 `ExpenseView.vue` 中的 TypeScript 型別警告。
- **驗證狀態**:
  - 通過完整 `test`, `lint`, `format`, `build` 驗證流程。

#### `4d90483` - refactor(ui): 全站遷移至 lucide-vue-next 圖示系統並優化一致性

- **圖示系統升級**:
  - 建立 `src/assets/icons.ts` 統一管理專案圖示。
  - 將全站核心與表單組件中的硬編碼 SVG 與表情符號替換為 Lucide 組件。
  - 統一空狀態提示樣式，使用組件化圖示替代 Emoji。
- **架構清理**:
  - 完成全站圖示遷移，大幅減少組件模板體積。
  - 通過完整 `test`, `lint`, `format`, `build` 驗證。

#### `72588d6` - test(stores): 補全所有 Store 單元測試並優化架構

- **測試系統升級**:
  - 重新編寫 `tripStore.spec.ts`，專注於旅程列表與預訂管理。
  - 新增 `planStore.spec.ts`，完整覆蓋行程活動的 CRUD 邏輯。
  - 新增 `collectionStore.spec.ts`，驗證資料收集的原子化更新與過濾邏輯。
- **架構清理**:
  - 完成 `tripStore.ts` 的職責分離，移除計畫與收集相關的過時代碼。
  - 清理未使用的 Firebase 導入項，確保生產環境編譯無誤。
- **驗證狀態**:
  - 10 個測試檔案，共 40 個測試案例全數通過。
  - 通過完整 `test`, `lint`, `format`, `build` 驗證流程。

#### `fd47db5` - feat(preparation): 實作準備清單的新增、編輯、刪除與狀態切換

- **準備清單功能實作**:
  - 在 `tripStore.ts` 實作 `updateTripPreparationItem`、`deleteTripPreparationItem` 與 `togglePreparationItem` 方法。
  - 建立 `PreparationForm.vue` 組件，提供類別選單（行李、證件、金融、醫藥、電子、其他）並統一使用 Lucide SVG 圖示。
  - 重構 `PreparationView.vue`，整合 `BaseBottomSheet` 實作與 `PlanView` 一致的 FAB 新增流程與編輯體驗。
- **UI/UX 優化**:
  - 區分「待辦」與「行李」分頁顯示，並支援點擊項目快速切換完成狀態。
  - 導入 Optimistic UI 概念，切換完成狀態時立即反應並同步至資料庫.
  - 補全返回按鈕與全域 Loading 遮罩。
- **工程規範**:
  - 修正 `tripStore.ts` 中缺失的型別導入，確保編譯無誤。
  - 完成 `npm run test`, `lint`, `format`, `build` 完整驗證流程。

#### `d5169c1` - refactor(collection): 獨立資料收集 Store 並補全新增編輯功能

- **Store 獨立與遷移**:
  - 建立 `collectionStore.ts` 並將資料收集狀態與 CRUD 邏輯從 `tripStore.ts` 抽離，提升維護性。
  - 實作完整的 `updateCollection` 與 `deleteCollection` 方法。
- **功能與 UI 優化**:
  - 建立 `CollectionForm.vue` 組件，統一使用 Lucide SVG 圖示提供網頁、IG、YouTube 等來源選擇。
  - 重構 `CollectionView.vue`，整合 `BaseBottomSheet` 實作與 `PlanView` 一致的 FAB 新增流程。
  - 加入來源過濾器 (Filters) 與點擊編輯功能。
- **工程規範與型別安全**:
  - 嚴格遵守 Zod Schema 校驗與 TypeScript 型別定義。
  - 修正 `collectionStore` 中的 lint 錯誤，移除 `any` 並優化解構賦值.
  - 完成 `npm run test`, `lint`, `format`, `build` 完整驗證流程。

#### `8cf9492` - feat(booking): 實作預訂行程的新增、編輯與刪除功能

- **預訂管理功能實作**:
  - 在 `tripStore.ts` 實作 `updateTripBooking` 與 `deleteTripBooking` 方法，管理主文件中的 `bookings` 陣列。
  - 建立 `BookingForm.vue` 組件，支援機票、住宿、交通等預訂類型的輸入，並統一使用 Lucide SVG 圖示替代表情符號。
  - 重構 `BookingView.vue`，整合 `BaseBottomSheet` 實作互動式編輯流程。
- **UI/UX 優化**:
  - 將「新增預訂」按鈕調整為右下角懸浮按鈕 (FAB)，與 `PlanView.vue` 保持一致的互動模式。
  - 提升預訂卡片的互動性，點擊即可開啟編輯。
- **型別安全與規範**:
  - 移除 `tripStore.ts` 中的 `any` 型別，確保預訂處理邏輯的型別安全性。
  - 完成 `npm run test`, `lint`, `format`, `build` 完整驗證流程。

#### `69c7121` `feat(home)` - 實作新增旅程功能並優化首頁互動

- **新增旅程功能實作**:
  - 建立 `TripForm.vue` 組件，支援旅程標題、起訖日期、天數自動計算與封面圖選擇。
  - 在 `HomeView.vue` 整合 `BaseBottomSheet` 與 `TripForm`，提供流暢的新增體驗。
  - 實作 `handleSaveTrip` 邏輯，串接 `tripStore.addTrip` 並於成功後自動導航至新旅程。
- **UI/UX 優化**:
  - 統一「新增旅程」的點擊入口（Header 按鈕與底部卡片）。
  - 加入全域 Loading 遮罩，提升非同步操作時的視覺回饋。
- **工程規範**:
  - 嚴格遵循 `TripSchema` 型別規範。
  - 修正 `TripForm` 中的 TypeScript 型別推導錯誤，確保生產環境編譯成功。
  - 完成 `npm run test`, `lint`, `format`, `build` 完整驗證流程。

#### `2afe7a4` - refactor(terminology): 統一全站專案用語並優化視圖命名

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
- 改動方向: 建立完整的行程活動編輯系統，並強化資料一致性與排序邏輯.
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
    - 修正 `useTripDetails` 排序邏輯，強制所有行程活動依照 `time` (HH:mm) 欄位進行排序.
    - 優化 `TimelineItem` 與 `ActivityOptionItem` 的點擊區域，區分「開啟地圖」與「開啟編輯」，防止行動端 誤觸。
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
    - 更新 `useTripDetails` composable，改為接收獨立的 `plans` 狀態，維持 UI 反應性.
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
  - 新增 `mapUtils.spec.ts` 驗證防禦性連結生成邏輯.

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
  - 新增 `firebase.spec.ts` 驗證 SDK 初始化.
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

- **改動方向**: 導正專案架構以符合 Phase 0 里里程碑規範。
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
