# 🌍 Travelogue Firebase 資料設定指南

本文件定義了 Travelogue 專案的 Firestore 資料結構、安全性規則 (Security Rules) 以及索引設定，確保資料的安全與存取效能。

---

## 1. Firestore 資料結構 (Data Schema)

### 📂 `whitelist` (全域集合)

用於存放授權使用者的 Email，實作高效的存取控制。

- **文件 ID**: **必須直接使用使用者的 Email (全小寫)**。例如 `test@gmail.com`。
- **欄位**:
  - `email` (string): 使用者 Email。
  - `addedAt` (timestamp): 加入時間。

### 📂 `trips` (主集合)

存放旅程的核心資訊與嵌入式清單。

- **欄位**:
  - `title` (string): 旅程名稱。
  - `startDate` (string): 開始日期 (YYYY-MM-DD)。
  - `endDate` (string): 結束日期 (YYYY-MM-DD)。
  - `days` (number): 總天數。
  - `status` (string): `upcoming` | `ongoing` | `finished`。
  - `coverImage` (string): 封面圖 URL。
  - `members` (array): `Array<{ id: string, name: string }>`。
  - `bookings` (array): 嵌入式預訂資訊。
  - `preparation` (array): 嵌入式準備清單項目。
  - `userId` (string): 建立者的 Firebase UID。
  - `createdAt` (timestamp): 建立時間。
  - `updatedAt` (timestamp): 最後更新時間。

#### └── 📂 `plans` (子集合)

- **路徑**: `/trips/{tripId}/plans/{planId}`
- **功能**: 存放每日具體行程。
- **欄位**: `tripId`, `date`, `activities` (Array of Activity objects)。

#### └── 📂 `expenses` (子集合)

- **路徑**: `/trips/{tripId}/expenses/{expenseId}`
- **功能**: 存放記帳與分帳紀錄。
- **欄位**: `date`, `category`, `amount`, `currency`, `description`, `payer` (Member ID), `splitWith` (Array of Member IDs), `createdAt`。

#### └── 📂 `collections` (子集合)

- **路徑**: `/trips/{tripId}/collections/{itemId}`
- **功能**: 存放行前收集的靈感 (網頁、IG、Threads 等)。
- **欄位**: `title`, `url`, `source`, `category`, `note`, `createdAt`。

---

## 2. 安全性規則 (Security Rules)

本專案採用「白名單驗證」機制。請將以下規則部署至 Firebase Console：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 核心驗證：檢查使用者是否已登入且其 Email 存在於白名單中
    function isWhitelisted() {
      return request.auth != null &&
        exists(/databases/$(database)/documents/whitelist/$(request.auth.token.email.lower()));
    }

    // 旅程資料存取 (含所有子集合)
    match /trips/{tripId} {
      allow read, write: if isWhitelisted();

      match /plans/{planId} {
        allow read, write: if isWhitelisted();
      }

      match /expenses/{expenseId} {
        allow read, write: if isWhitelisted();
      }

      match /collections/{itemId} {
        allow read, write: if isWhitelisted();
      }
    }

    // 白名單唯讀規則
    match /whitelist/{email} {
      allow read: if request.auth != null;
      allow write: if false; // 禁止從前端修改白名單
    }
  }
}
```

---

## 3. 索引設定 (Firestore Indexes)

當應用程式執行複雜查詢（如跨欄位過濾與排序）時，需建立以下複合索引：

| 集合 ID    | 欄位 (排序順序)                    | 用途                     |
| :--------- | :--------------------------------- | :----------------------- |
| `trips`    | `userId` (Asc), `startDate` (Desc) | 獲取特定使用者的旅程列表 |
| `plans`    | `tripId` (Asc), `date` (Asc)       | 按日期排序顯示行程活動   |
| `expenses` | `tripId` (Asc), `date` (Desc)      | 按時間倒序顯示記帳明細   |

---

## 4. 驗證配置 (Authentication)

1. **Google Auth**: 必須啟用 `GoogleAuthProvider`。
2. **Authorized Domains**: 在部署至自訂網域後，務必將網域加入 Firebase 的授權清單中。
3. **白名單初始化**: 首次使用前，請手動在 `whitelist` 集合中新增一份以您 Email 為 ID 的文件。
