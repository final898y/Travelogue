# 📄 圖片上傳與儲存架構規格書 (Image Storage Spec)

- **版本**: v1.1
- **狀態**: 草案 (更新後)
- **日期**: 2026-03-23

---

## 1. 總覽 (Overview)

本文件旨在為 `Travelogue` 專案設計一個完整、可擴展且與現有架構解耦的圖片上傳與管理系統。此系統將取代 `ActivitySchema` 與 `CollectionSchema` 中現有的 `imageUrl` 字串欄位，實現真實的圖片檔案上傳、壓縮、儲存與讀取功能。

## 2. 架構設計 (Architecture Design)

### 2.1. 儲存服務 (Storage Service) - 解耦核心

為了達成高度解耦，我們將建立一個 `src/services/storageService.ts`，它將作為圖片處理的唯一入口（Adapter Pattern）。

- **職責**:
  - 處理圖片檔案的上傳、刪除與 URL 獲取。
  - 封裝所有與 Firebase Storage SDK 的直接互動。
  - 對外提供一個簡潔、與後端無關的 API 接口。

- **對外接口 (Public Interface)**:

  ```typescript
  // src/services/storageService.ts

  interface UploadResult {
    url: string; // 圖片的公開存取 URL
    path: string; // 圖片在 Storage 中的儲存路徑 (用於刪除)
  }

  /**
   * 上傳單張圖片 (內含 Web Worker 壓縮邏輯)
   * @param file - 原始 File 物件
   * @param userId - 用於建立用戶專屬路徑
   * @param onProgress - 上傳進度回調 (0-100)
   * @returns Promise<UploadResult>
   */
  async function uploadImage(
    file: File,
    userId: string,
    onProgress?: (progress: number) => void,
  ): Promise<UploadResult>;

  /**
   * 根據儲存路徑刪除單張圖片
   * @param path - 圖片在 Storage 中的儲存路徑
   * @returns Promise<void>
   */
  async function deleteImage(path: string): Promise<void>;
  ```

### 2.2. 客戶端圖片壓縮 (Client-Side Image Compression)

為節省儲存空間與頻寬，所有圖片在上傳前都應在客戶端進行壓縮。

- **技術方案**: 使用 `browser-image-compression` 庫，並啟用 **Web Worker** 模式。
- **實作位置**: 在 `storageService.ts` 中封裝相關邏輯。
- **壓縮參數 (可配置)**:
  - **最大檔案大小**: 上傳前初步檢查，上限為 `10MB`。
  - **最大尺寸**: 將圖片的最長邊縮放至 `1920px` (maxIteration: 10)。
  - **壓縮後大小**: 目標壓縮至 `1MB` 以下。
  - **輸出格式**: 優先輸出為 `image/jpeg`，保留透明度則輸出 `image/png`。
  - **EXIF 處理**: 確保圖片方向正確（該庫會自動處理）。

## 3. 數據模型與限制 (Data Model & Constraints)

### 3.1. 限制 (Constraints)

- **數量限制**: 每個 `Activity` 或 `Collection` 項目最多上傳 **10 張** 圖片。
- **物理大小**: 上傳前檢查單個檔案不超過 **10MB**。

### 3.2. 新增 `ImageSchema`

```typescript
// src/types/trip.ts

export const ImageSchema = z.object({
  url: z.string().url("圖片 URL 格式不正確"),
  path: z.string().min(1, "圖片儲存路徑不可為空"),
});
export type Image = z.infer<typeof ImageSchema>;
```

### 3.3. 更新 `ActivitySchema` 和 `CollectionSchema`

將原有的 `imageUrl` 欄位替換為 `images` 陣列。

- **After**:
  ```typescript
  // ActivitySchema / CollectionSchema
  images: z.array(ImageSchema).max(10, "最多上傳 10 張圖片").optional(),
  ```

## 4. 資料一致性與刪除策略 (Data Consistency & Deletion Strategy)

為了確保 Storage 檔案與 Firestore 文件的同步，採用以下策略：

### 4.1. 延遲刪除 (Delayed Deletion)

- **行為**: 使用者在編輯介面按下「刪除圖片」時，前端僅將該圖片從暫時的 `images` 陣列中移除，**不立即**呼叫 `storageService.deleteImage`。
- **執行時機**: 僅當使用者按下表單的「儲存（Save）」並成功更新 Firestore 後，才比對新舊圖片陣列，將已移除圖片的 `path` 傳給 `deleteImage` 進行清理。
- **優點**: 避免使用者「取消編輯」後導致圖片已從實體上刪除但 Firestore 仍存有該路徑的問題。

### 4.2. 孤兒檔案清理 (Orphan Files Cleanup)

- **長期方案**: 考慮建立 Firebase Cloud Functions，定期掃描 Storage 中不屬於任何 Firestore 項目的路徑並刪除，作為最後防線。

## 5. UI/UX 設計 (UI/UX Design)

### 5.1. 圖片上傳組件 (`ImageUploader.vue`)

- **功能**:
  - 支援多圖選取與拖曳上傳。
  - 實時顯示各別圖片的上傳進度。
  - 檢查張數限制 (10張)。
- **互動流程**:
  1. 選取檔案 -> 檢查大小/數量。
  2. 啟動 Web Worker 壓縮。
  3. 呼叫 `storageService.uploadImage`。
  4. 取得結果後更新給父組件。

## 6. Firebase 安全性規則 (Firebase Security Rules)

暫時維持公開讀取權限，但將寫入限制在擁有者 ID 下。

```ini
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /images/{userId}/{documentId}/{allPaths=**} {
      allow read; // 公開讀取
      allow write, delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

**舊資料遷移備註**: 由於目前尚未有實際圖片上傳資料，不需進行舊資料遷移。
