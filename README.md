# 🌿 Travelogue

> 溫馨自然風格的旅遊規劃 PWA。旨在提供一個療癒、簡約且實用的旅遊規劃工具。

**線上展示**: [https://travelogue-prod-ebaff.web.app/](https://travelogue-prod-ebaff.web.app/)

---

## 📸 專案亮點 (Highlights)

- **Soft UI Evolution**: 採用「實心偏移陰影」與「手帳風格」佈局，提供極具質感的視覺體驗。
- **即時資料同步**: 基於 Firebase Firestore 實作，支援多端即時同步與離線存取。
- **全域交互系統**: 自定義的高質感 Toast 提示與非同步 Confirm 對話框，完美融合設計語言。
- **精準預算管理**: 支援多人均分與墊付款邏輯，採用 ID 綁定模式確保成員改名不影響資料。
- **靈感資料收集**: 輕鬆整理來自 Threads、Instagram 與網頁的旅遊靈感。

---

## 🚀 快速啟動 (Quick Start)

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

## 🛠️ 技術棧 (Tech Stack)

- **前端框架**: Vue 3 (Composition API)
- **狀態管理**: Pinia
- **後端服務**: Firebase (Firestore, Auth, Hosting)
- **核心套件**: Tailwind CSS v4, Zod (資料校驗), Lucide Vue Next (圖示)
- **測試工具**: Vitest, @pinia/testing
- **建置工具**: Vite (實作手動分包優化)

---

## 📂 專案文檔 (Documentation)

為了保持開發資訊的精簡與同步，專案文檔已統整如下：

- [**技術規格說明書 (TECHNICAL_SPEC.md)**](./docs/TECHNICAL_SPEC.md): 包含資料夾結構、Store 設計、資料模型定義與 Roadmap。
- [**UI/UX 設計規範 (UI_UX_DESIGN.md)**](./docs/UI_UX_DESIGN.md): 包含設計理念、顏色系統、陰影規範與交互組件定義。
- [**Firebase 設定指南 (FIREBASE_CONFIG.md)**](./docs/FIREBASE_CONFIG.md): 包含 Firestore Schema、安全性規則與索引設定。
- [**開發日誌 (COMMIT_LOG.md)**](./docs/COMMIT_LOG.md): 紀錄詳細的開發進程與功能變動。
- [**協作規範 (GIT_RULES.md)**](./docs/GIT_RULES.md): Git 分支策略與 Commit 規範。

---

## 🔐 身份驗證機制

專案實作了基於 **Google 登入** 與 **Email 白名單** 的安全存取機制：

- **白名單校驗**: 登入後會比對 Firestore `whitelist` 集合。
- **權限控制**: 只有存在於白名單中的 Email 才能執行資料讀寫。
- **自訂網域**: 部署後需在 Firebase Authentication 設置授權網域。

---

## 📅 開發規範

本專案對 AI Agent 設有嚴格的行為規範，詳見 [AGENTS.md](./AGENTS.md)。提交代碼前必須通過：

1.  `npm run test` (測試)
2.  `npm run lint` (規範)
3.  `npm run format` (格式)
4.  `npm run build` (建置驗證)

---

**Version**: 2.2.0 (Soft UI Evolution Edition)  
**License**: MIT
