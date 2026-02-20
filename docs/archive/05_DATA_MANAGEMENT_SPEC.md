# Data Management 技術規劃書 (Backup, Export, Import)

本規劃書旨在為 Travelogue 專案實作健全的資料備份、匯出與匯入機制，確保使用者資料的安全性與遷移便利性。

---

## 1. 目標與核心功能

1.  **資料備份 (Cloud Backup)**: 將當前使用者所有的 `trips` 及其子集合資料快照，存儲於 Firebase 的 `backups` 集合中。
2.  **資料導出 (JSON Export)**: 將所有資料打包成單一 JSON 檔案，支援瀏覽器端下載。
3.  **資料導入 (JSON Import)**: 讀取使用者提供的 JSON 檔案，驗證格式後，**完整覆蓋**或**增量同步**回 Firebase 資料庫。

---

## 2. 資料架構定義 (Data Schema)

導出的 JSON 結構將遵循以下嵌套格式，以確保完整性：

```typescript
interface ExportDataPackage {
  version: string; // 格式版本
  exportedAt: string; // 匯出時間 (ISO)
  userId: string; // 原屬使用者 ID
  trips: Array<{
    data: Trip; // 主文件資料 (含 members, bookings, preparation)
    plans: DailyPlan[]; // 子集合: 行程
    expenses: Expense[]; // 子集合: 記帳
    collections: Collection[]; // 子集合: 資料收集
  }>;
}
```

---

## 3. 詳細實作步驟

### Step 1: 建立 `backupService.ts`

建立一個專門處理資料提取與寫入的服務模組。

- **提取邏輯**: 實作一個 `recursiveFetch` 函數，獲取 `trips` 列表後，針對每個 `tripId` 並行抓取 `plans`, `expenses`, `collections` 子集合內容。
- **寫入邏輯**: 封裝 Firestore `writeBatch` (或 `Transaction`)，確保在導入資料時，大批量操作的原子性（每次 Batch 上限 500 次操作）。

### Step 2: 實作備份功能 (Backup)

- 在 `backups` 集合中建立文件，ID 為 `userId_timestamp`。
- 存儲完整的 `ExportDataPackage` 物件。
- 限制每個使用者保留最近 3 次備份（自動清理舊紀錄）。

### Step 3: 實作導出功能 (Export)

- 使用 `Blob` 與 `URL.createObjectURL` 觸發下載。
- 檔名格式：`Travelogue_Backup_YYYYMMDD.json`。

### Step 4: 實作導入功能 (Import)

- **驗證**: 使用 Zod Schema 驗證上傳的 JSON 檔案是否符合 `ExportDataPackage` 規範。
- **清空邏輯**: 在覆蓋前，先遞歸刪除該使用者當前的所有 `trips`相關資料。
- **恢復邏輯**: 依序還原主文件與子集合。

### Step 5: UI 整合 (`SettingView.vue`)

- 新增「資料備份與還原」區塊。
- 整合 `uiStore.showConfirm`：導入前必須顯示「資料將被完全覆蓋」的警告。
- 實作上傳按鈕：使用 `<input type="file" accept=".json">`。
- 加入全域 Loading 遮罩與 Toast 進度提示。

---

## 4. 技術難點與對策

- **Firestore Batch 限制**: 一個 Batch 最多 500 個操作。若旅程資料量龐大，需自動切分為多個 Batch 執行。
- **大檔案處理**: 數百 MB 的 JSON 可能導致瀏覽器記憶體壓力，實作時需注意序列化效能。
- **資料一致性**: 在導入期間應暫時停用應用的即時監聽 (Optional) 或顯示強制的 Loading 遮罩，防止 UI 渲染不完整的資料狀態。

---

## 5. 後續執行計畫

1.  **Phase A**: 實作 `backupService.ts` 的提取與導出下載功能。
2.  **Phase B**: 實作導入驗證邏輯與 Batch 寫入機制。
3.  **Phase C**: 於 `SettingView.vue` 完成 UI 串接並進行邊界測試。
