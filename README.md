# 🧳 Travelogue

> 輕量化、視覺優先的個人旅行計畫 PWA。為那些熱愛規劃細節、追求美感的使用者打造的行程管理工具。

**線上展示**: [https://travelogue-prod-ebaff.web.app/](https://travelogue-prod-ebaff.web.app/)

---

## ✨ 核心亮點 (Highlights)

- **Soft UI Evolution**: 採用類擬物化與森林系色彩，提供舒適且極具現代感的介面，為規劃過程增添愉悅感。
- **即時數據同步**: 基於 Firebase Firestore 實作，支援多端同步與離線快取，隨時記錄靈感。
- **全方位互動反饋**: 自訂的高質感 Toast 提示與手勢關閉 Confirm 對話框，細節處盡顯設計巧思。
- **靈活成員管理**: 支援多人協作與多種身分權限，透過 ID 連結讓每位參與者都能同步最新進度。
- **素材採集助手**: 快速整合來自 Threads、Instagram 與網頁的靈感，豐富行程內容。

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

# 執行單元測試
npm run test
```

---

## 🛠️ 技術棧 (Tech Stack)

- **前端框架**: Vue 3 (Composition API)
- **狀態管理**: Pinia
- **後端服務**: Firebase (Firestore, Auth, Hosting)
- **設計與校驗**: Tailwind CSS v4, Zod (數據校驗), Lucide Vue Next (圖示庫)
- **測試工具**: Vitest, @pinia/testing
- **建置工具**: Vite (極速開發體驗)

---

## 📖 開發文件 (Documentation)

為了維護開發品質與提升協作效率，本專案已建立完整的文件體系：

- [**技術架構說明書 (TECHNICAL_SPEC.md)**](./docs/TECHNICAL_SPEC.md): 包含數據模型、Store 設計、元件樹與 Roadmap。
- [**UI/UX 設計規範 (UI_UX_DESIGN.md)**](./docs/UI_UX_DESIGN.md): 包含設計準則、色彩系統、元件庫定義。
- [**Firebase 配置指南 (FIREBASE_CONFIG.md)**](./docs/FIREBASE_CONFIG.md): 包含 Firestore Schema、安全規則與環境變數設定。
- [**開發日誌 (COMMIT_LOG.md)**](./docs/COMMIT_LOG.md): 詳細記錄開發里程碑與各版本的改動。
- [**協作規範 (GIT_RULES.md)**](./docs/GIT_RULES.md): Git 分支管理與 Commit 訊息格式規範。

---

## 🔒 隱私與安全性聲明

本專案實作了基於 **Google 登入** 與 **Email 身份驗證** 的安全機制：

- **白名單機制**: 登入後需符合 Firestore `whitelist` 列表才可存取。
- **資料隔離**: 所有行程資料均存放在特定使用者 UID 下，確保資料私密性。
- **安全規則**: 透過後端 Firebase Authentication 驗證所有的資料存取權限。

---

## 🤖 AI 開發規範

本專案由 AI Agent 深度參與開發與維護，請參考 [AGENTS.md](./AGENTS.md)。每項改動皆需通過以下驗證流程：

1.  `npm run test` (測試)
2.  `npm run lint` (規範)
3.  `npm run format` (格式)
4.  `npm run build` (建置驗證)

---

**Version**: 2.2.2
**License**: MIT
