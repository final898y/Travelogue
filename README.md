# Travelogue

> 溫馨自然風格的旅遊規劃 PWA。旨在提供一個療癒、簡約且實用的旅遊規劃工具。

**線上展示**: [https://travelogue-prod-ebaff.web.app/](https://travelogue-prod-ebaff.web.app/)

---

## 快速啟動 (Quick Start)

### 1. 環境需求

- Node.js (v18+)
- npm 或 pnpm

### 2. 安裝與執行

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 執行自動測試
npm run test
```

---

## 技術棧 (Tech Stack)

- **前端框架**: [Vue 3 (Composition API)](https://vuejs.org/)
- **狀態管理**: [Pinia](https://pinia.vuejs.org/)
- **後端服務**: [Firebase (Firestore, Storage, Auth)](https://firebase.google.com/)
- **圖示系統**: [Lucide Vue Next](https://lucide.dev/)
- **程式語言**: [TypeScript](https://www.typescriptlang.org/)
- **樣式處理**: [Tailwind CSS v4](https://tailwindcss.com/)
- **測試工具**: [Vitest](https://vitest.dev/)
- **建置工具**: Vite

---

## Firebase 設定 (Firebase Setup)

本專案使用 Firebase 作為全方位後端服務。詳細配置請參考 [docs/FIREBASE_CONFIG.md](./docs/FIREBASE_CONFIG.md)。

### 1. 身份驗證 (Authentication)

專案實作了基於 **Google 登入** 與 **Email 白名單** 的安全存取機制：

- **驗證供應商**: Google Auth (`GoogleAuthProvider`)。
- **登入交互**: 使用 `signInWithPopup` 彈窗模式。
- **白名單校驗**:
  - 登入後會比對 Firestore `whitelist` 集合。
  - **Document ID** 必須為使用者 **Email 的全小寫** 格式（例如：`user@example.com`）。
  - 若不在白名單內，系統將強制執行 `signOut` 並提示錯誤。

### 2. 託管 (Hosting)

- **專案 ID**: `travelogue-prod-ebaff`
- **部署目錄**: `dist` (經由 Vite 建置)
- **預設網域**: [https://travelogue-prod-ebaff.web.app](https://travelogue-prod-ebaff.web.app)
- **配置檔案**: `firebase.json`
- **路由重寫 (Rewrites)**: 已配置所有路徑導向 `index.html`，以支援 Vue Router 的 History 模式（解決上線後重新整理頁面出現 404 的問題）。

> [!IMPORTANT]
> **自訂網域提醒**:
> 若您綁定了自訂網域（例如 `www.yourdomain.com`），除了在 Hosting 介面設定外，**務必**前往 **Firebase Console > Authentication > Settings > Authorized domains** 將該網域加入授權清單，否則 Google 登入功能會因安全性限制而失效。

---

## 部署流程 (Deployment)

每當完成開發並準備將變更推送至線上環境時，請依序執行以下步驟：

### 1. 執行本地驗證

確保所有程式碼符合規範且測試通過：

```powershell
npm.cmd run test; npm.cmd run lint; npm.cmd run format
```

### 2. 進行 Vite 建置

將 Vue 專案編譯為靜態檔案並輸出至 `dist/` 目錄：

```powershell
npm.cmd run build
```

### 3. 部署至 Firebase

將 `dist/` 目錄內容與 `firebase.json` 配置上傳至 Firebase Hosting：

```powershell
# 確保已登入 Firebase
firebase login

# 執行部署
firebase deploy --only hosting
```

---

### 3. 安全性規則 (Security Rules)

請在 Firebase Console 部署以下核心規則以確保資料安全：

- **白名單檢查**: 透過 `exists()` 函式確認 `request.auth.token.email` 是否存在於白名單集合中。
- **資料存取**: 僅限通過白名單驗證的使用者讀取與編輯。

### 4. 資料結構概覽 (Data Schema)

- `/whitelist/{email}`: 存放授權成員名單。
- `/trips/{tripId}`: 旅程主資訊。
  - `/plans`: 行程安排 (按 `date`, `time` 排序)。
  - `/expenses`: 記帳資料 (按 `date` 排序)。
  - `/collections`: 景點與美食收藏。

---

## 專案結構 (Folder Structure)

```
src/
├── assets/          # 靜態資源 (圖片、全域樣式)
├── components/      # Vue 元件
│   ├── trip/        # 旅程相關元件 (Timeline, Card 等)
│   └── ui/          # 通用 UI 元件 (Nav, Header 等)
├── composables/     # 可複用邏輯 (Composables)
├── router/          # 路由配置
├── services/        # 外部服務 (Firebase, Seed Data)
├── stores/          # 狀態管理 (Pinia)
├── types/           # TypeScript 型別定義
├── utils/           # 工具函式 (Map, Logic 等)
└── views/           # 頁面視圖
tests/               # 自動化測試 (Unit, Integration, E2E)
docs/                # 專案開發文件與日誌
```

---

## 設計系統 (Design System)

詳見 [docs/04_DESIGN_SYSTEM.md](./docs/04_DESIGN_SYSTEM.md)。

- **品牌色**: 森林綠 (`#8B9A6D`)、米白色 (`#F7F4EB`)、大地棕 (`#A68A64`)。
- **字體**: Noto Sans TC, Varela Round。
- **風格**: 手帳風、自然系、軟陰影、Lucide 精簡圖示。

---

## 目前實作項目

根據 [docs/COMMIT_LOG.md](./docs/COMMIT_LOG.md) 紀錄：

- **Firebase 整合**: 實作 Firestore 即時資料同步與離線快取 (IndexedDB)。
- **旅程管理系統**: 支援多日行程規劃、日期驅動的活動排列、備選方案 (Options) 結構化展示。
- **動態路由**: 實作動態行程頁面 (`/schedule/:id`) 與導航保護。
- **地圖導航工具**: 實作防禦性 Google Maps 連結生成器，優先支援 Place ID 與精確座標。
- **自動化測試**: 核心邏輯 (Composables)、狀態管理 (Stores) 與工具函式均具備測試覆蓋。
- **UI/UX 實作**: 基於「手帳風格」與「行動優先」原則實作的導覽系統與行程列表。

---

## 開發規範

本專案對 AI Agent 設有嚴格的行為規範，詳見 [AGENTS.md](./AGENTS.md)。

### 強制驗證流程

提交代碼前必須通過：

1. `npm run test` (測試)
2. `npm run lint` (規範)
3. `npm run format` (格式)

---

## 開發進度

詳見 [docs/COMMIT_LOG.md](./docs/COMMIT_LOG.md) 以獲取完整的變更日誌。
詳見 [docs/00_PROJECT_ROADMAP.md](./docs/00_PROJECT_ROADMAP.md) 以獲取開發路線圖。

---

**Version**: 1.0.0  
**License**: MIT
