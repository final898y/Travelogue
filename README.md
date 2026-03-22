# Travelogue

> 輕量化、視覺優先的個人旅行計畫 PWA。為那些熱愛規劃細節、追求美感的使用者打造的行程管理工具。

**線上展示**: [https://travelogue-prod-ebaff.web.app/](https://travelogue-prod-ebaff.web.app/)

---

## 核心亮點 (Highlights)

- **Soft UI Evolution**: 採用類擬物化與森林系色彩，提供舒適且極具現代感的介面，為規劃過程增添愉悅感。
- **即時數據同步**: 基於 Firebase Firestore 實作，支援多端同步與離線快取，隨時記錄靈感。
- **全方位互動反饋**: 自訂的高質感 Toast 提示與手勢關閉 Confirm 對話框，細節處盡顯設計巧思。
- **靈活成員管理**: 支援多人協作與多種身分權限，透過 ID 連結讓每位參與者都能同步最新進度。
- **即時匯率換算**: 整合台灣銀行 (BOT) 官方數據，提供具備 Firestore 快取機制的即時匯率工具，並附帶 Visa/Mastercard 官方查詢入口。
- **素材採集助手**: 快速整合來自 Threads、Instagram 與網頁的靈感，豐富行程內容。

---

## 快速啟動 (Quick Start)

### 1. 專案架構 (Project Structure)

```text
Travelogue/
├── functions/              # Firebase Cloud Functions (TypeScript)
│   ├── src/index.ts        # 匯率查詢與後端邏輯
│   └── eslint.config.js    # 後端獨立 Flat Config
├── src/                    # 前端 Vue 3 原始碼
│   ├── components/trip/    # 業務組件 (含匯率換算器)
│   ├── stores/             # Pinia 狀態管理
│   └── services/           # Firebase SDK 封裝
├── docs/                   # 完整開發與 API 規格文件
└── tests/                  # Vitest 單元測試
```

### 2. 環境需求

- Node.js (v18+)
- npm 或 pnpm
- Firebase CLI (`npm install -g firebase-tools`)

### 3. 安裝與執行

```bash
# 安裝前端依賴
npm install

# 安裝後端 Functions 依賴
cd functions && npm install && cd ..

# 啟動開發伺服器
npm run dev
```

---

## 技術棧 (Tech Stack)

- **前端框架**: Vue 3 (Composition API)
- **狀態管理**: Pinia
- **後端服務**: Firebase (Firestore, Auth, Functions v2, Hosting)
- **設計與校驗**: Tailwind CSS v4, Zod (數據校驗), Lucide Vue Next (圖示庫)
- **測試工具**: Vitest, @pinia/testing
- **建置工具**: Vite, TypeScript (ESM Mode)

---

## Firebase Functions & CORS 配置指南

由於匯率工具涉及跨網域 API 請求，部署後須完成以下設定：

### 1. 代碼層級 (onCall CORS)

在 `functions/src/index.ts` 中，`onCall` 必須設定 `cors` 屬性以允許前端來源：

```typescript
export const getExchangeRate = onCall({
  cors: ["https://your-domain.com", "http://localhost:5173"]
}, async (request) => { ... });
```

### 2. Google Cloud 控制台權限 (解決 Preflight 阻擋)

Firebase Functions v2 預設會阻擋未驗證的預檢請求 (OPTIONS)，須手動開放：

1.  前往 [Google Cloud Console - Cloud Functions](https://console.cloud.google.com/functions/list)。
2.  點擊 `getExchangeRate` 函式，進入 **權限 (Permissions)** 頁籤。
3.  點擊 **新增主體 (Add Principal)**。
4.  在主體欄位輸入 `allUsers`。
5.  角色選擇 `Cloud Functions Invoker` (及 `Cloud Run Invoker`，若系統提示)。
6.  **安全性說明**: 此操作僅允許瀏覽器觸碰端點以通過 CORS 檢查，函式內部仍透過 `request.auth` 嚴格限制僅登入使用者可執行邏輯。

---

## 開發文件 (Documentation)

- [**技術架構說明書 (TECHNICAL_SPEC.md)**](./docs/TECHNICAL_SPEC.md): 包含數據模型、Store 設計、元件樹。
- [**匯率 API 規格說明 (CURRENCY_API_SPEC.md)**](./docs/external_api/CURRENCY_API_SPEC.md): 詳述 BOT/Visa/Mastercard 匯率來源與 CSV 格式。
- [**UI/UX 設計規範 (UI_UX_DESIGN.md)**](./docs/UI_UX_DESIGN.md): 包含設計準則、色彩系統。
- [**開發日誌 (COMMIT_LOG.md)**](./docs/COMMIT_LOG.md): 詳細記錄各版本的改動。

---

## 隱私與安全性聲明

本專案實作了基於 **Google 登入** 與 **Email 身份驗證** 的安全機制：

- **白名單機制**: 登入後需符合 Firestore `whitelist` 列表才可存取。
- **資料隔離**: 所有行程資料均存放在特定使用者 UID 下，確保資料私密性。
- **後端驗證**: 所有 Cloud Functions 均強制檢查 Firebase Auth Token。

---

## AI 開發規範

本專案由 AI Agent 深度參與開發與維護，請參考 [AGENTS.md](./AGENTS.md)。每項改動皆需通過以下驗證流程：

1.  `npm run test` (測試)
2.  `npm run lint` (規範)
3.  `npm run format` (格式)
4.  `npm run build` (建置驗證)

---

**Version**: 2.5.0
**License**: MIT
