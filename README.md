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

本專案使用 Firebase 作為後端服務，包含驗證 (Auth) 與資料庫 (Firestore)。詳細配置請參考 [docs/FIREBASE_CONFIG.md](./docs/FIREBASE_CONFIG.md)。

### 1. 驗證與白名單 (Auth & Whitelist)

為確保資料安全性，專案實作了 **Google 登入** 與 **Email 白名單** 機制：

- **登入方式**: 僅支援 Google 帳號登入。
- **白名單機制**: 只有 Email 存在於 Firestore `whitelist` 集合中的使用者才能存取資料。
- **設定方式**:
  1. 在 Firestore 建立 `whitelist` 集合。
  2. 新增文件，其 **Document ID** 必須為使用者的 **Email (全小寫)**。

### 2. 安全性規則 (Security Rules)

請務必在 Firebase Console 部署以下核心規則：

- **白名單檢查**: 透過 `exists()` 函式確認 `request.auth.token.email` 是否在白名單中。
- **共享存取**: 只要通過白名單驗證的使用者，即可讀取與編輯旅程資料。

### 3. 資料結構概覽 (Data Schema)

- `/whitelist/{email}`: 存放授權成員。
- `/trips/{tripId}`: 旅程主資訊。
  - `/schedules`: 行程安排 (按 `date`, `time` 排序)。
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
