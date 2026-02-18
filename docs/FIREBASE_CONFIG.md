# 🌍 Travelogue Firebase 資料設定指南

本文件定義了 Travelogue 專案的 Firestore 資料結構、安全性規則 (Security Rules) 以及索引設定，確保資料的安全與存取效能。

## 1. Firestore 資料結構 (Data Schema)

### 📂 `whitelist` (全域集合)

用於存放授權使用者的 Email，實作存取控制。

- **文件 ID**: **必須直接使用使用者的 Email (全小寫)**。例如 `test@gmail.com`。
- **欄位**:
  - `email` (string): 使用者 Email（供參考，Security Rules 實際上是檢查文件 ID）。
  - `addedAt` (timestamp): 加入時間。

### 📂 `trips` (主集合)

存放所有的旅程資訊。

- **欄位**:
  - `title` (string): 旅程名稱。
  - `startDate` (timestamp): 開始日期。
  - `endDate` (timestamp): 結束日期。
  - `userId` (string): 建立者的 Firebase UID。
  - `createdAt` (timestamp): 建立時間。
  - `destination` (string): 目的地。

#### └── 📂 `schedules` (子集合)

- **路徑**: `/trips/{tripId}/schedules/{scheduleId}`
- **欄位**: `date`, `time`, `activity`, `order`, `location` (geopoint)。

#### └── 📂 `expenses` (子集合)

- **路徑**: `/trips/{tripId}/expenses/{expenseId}`
- **欄位**: `category`, `amount`, `currency`, `date`, `userId`, `createdAt` (timestamp)。

#### └── 📂 `collections` (子集合)

- **路徑**: `/trips/{tripId}/collections/{itemId}`
- **欄位**: `type` (spot/food), `name`, `note`, `rating`, `createdAt` (timestamp)。

---

## 2. 安全性規則 (Security Rules)

請將以下程式碼貼入 **Firebase Console > Firestore > Rules**。此規則結合了「白名單驗證」與「共享存取」。

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 核心驗證函式：檢查使用者是否已登入且其 Email 存在於白名單集合中
    function isWhitelisted() {
      return request.auth != null &&
        exists(/databases/$(database)/documents/whitelist/$(request.auth.token.email.lower()));
    }

    // 旅程資料 (Trips)
    match /trips/{tripId} {
      // 只有在白名單內的使用者可以讀寫所有旅程資料
      allow read, write: if isWhitelisted();

      // 子集合：繼承父文件的驗證邏輯
      match /schedules/{scheduleId} {
        allow read, write: if isWhitelisted();
      }

      match /expenses/{expenseId} {
        allow read, write: if isWhitelisted();
      }

      match /collections/{itemId} {
        allow read, write: if isWhitelisted();
      }
    }

    // 白名單集合 (Whitelist)
    match /whitelist/{docId} {
      // 僅限登入使用者讀取自己的權限狀態，禁止前端修改白名單
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

---

## 3. 索引設定 (Firestore Indexes)

Firestore 的索引分為「自動建立」與「手動建立」兩類：

### A. 自動建立 (無需手動設定)

Firestore 預設會為每個欄位建立**單欄位索引**。

- 支援：單純的 `orderBy("startDate")` 或單一欄位的 `where()`。
- **注意**：若手動建立單欄位複合索引，會看到「this index is not necessary」的錯誤。

### B. 手動建立 (複合索引)

當查詢涉及**多個不同欄位**的過濾與排序時，必須建立複合索引。

| 集合路徑                   | 欄位 (排序順序)                    | 適用查詢範例                     |
| :------------------------- | :--------------------------------- | :------------------------------- |
| `trips`                    | `userId` (Asc), `startDate` (Desc) | 找出特定使用者的旅程並按日期排序 |
| `trips/{tripId}/schedules` | `date` (Asc), `time` (Asc)         | 行程表按日期與時間排序           |
| `trips/{tripId}/expenses`  | `category` (Asc), `date` (Desc)    | 按類別篩選並按日期排序           |

### C. 釐清「集合 ID」與「路徑」

在 Firebase 控制台建立複合索引時，系統會要求輸入「集合 ID」，這常與「路徑」混淆：

- **路徑 (Path)**: `/trips/{tripId}/schedules` (資料的完整位址)。
- **集合 ID (Collection ID)**: **`schedules`** (集合的名稱)。
- **概念**: 建立索引時填入 **`schedules`** 即可，它會自動套用到所有旅程下的該子集合。

### D. 手動建立步驟 (以 schedules 為例)

1. 進入 **Firestore > 索引 > 複合**，點擊「建立索引」。
2. **集合 ID**: 輸入 `schedules`。
3. **欄位**: 依序新增 `date` (遞增) 與 `time` (遞增)。
4. **查詢範圍**:
   - **集合 (Collection)**: 僅在單一旅程內查詢 (預設推薦)。
   - **集合群組 (Collection Group)**: 跨旅程查詢所有行程。

### E. 如何快速建立索引？

若查詢缺少索引，請查看瀏覽器 **Console (F12)**，點擊錯誤訊息中的 **Firebase 連結**。系統會自動帶入正確配置，點擊「建立」即可。

---

## 4. 驗證配置 (Authentication)

### 啟用項目

1. **Google Auth**: 於 Firebase Console 啟用 Google 登入。
2. **Authorized Domains**: 確保 `localhost` 與您的正式網域已列入授權清單。

### 白名單初始化 (重要)

在使用應用程式前，請手動在 Firestore 中加入您的第一個白名單 Email：

1. 進入 Firestore 頁面。
2. 建立集合 `whitelist`。
3. 新增文件，文件 ID 可使用您的 Email（全小寫），並新增欄位 `email` (string) = `"您的 email"`。

---

## 5. 後續資安建議

- **Firebase Functions**: 未來建議將 `OPENWEATHER_API_KEY` 移至 Functions 處理。
- **App Check**: 正式上線後，建議開啟 Firebase App Check 以防止非官方 App 盜用您的 API 配額。
