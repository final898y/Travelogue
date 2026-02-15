# 🌿 Travelogue

> 溫馨自然風格的旅遊規劃 PWA。旨在提供一個療癒、簡約且實用的旅遊規劃工具。

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

- **前端框架**: [Vue 3 (Composition API)](https://vuejs.org/)
- **程式語言**: [TypeScript](https://www.typescriptlang.org/)
- **樣式處理**: [Tailwind CSS v4](https://tailwindcss.com/)
- **測試工具**: [Vitest](https://vitest.dev/)
- **代碼規範**: ESLint + Prettier
- **建置工具**: Vite

---

## 🎨 設計系統 (Design System)

詳見 [docs/04_DESIGN_SYSTEM.md](./docs/04_DESIGN_SYSTEM.md)。

- **品牌色**: 森林綠 (`#8B9A6D`)、米白色 (`#F7F4EB`)、大地棕 (`#A68A64`)。
- **字體**: Noto Sans TC, Varela Round。
- **風格**: 手帳風、自然系、軟陰影。

---

## 📜 開發規範

本專案對 AI Agent 設有嚴格的行為規範，詳見 [AGENTS.md](./AGENTS.md)。

### 強制驗證流程

提交代碼前必須通過：

1. `npm run test` (測試)
2. `npm run lint` (規範)
3. `npm run format` (格式)

---

## 📅 開發進度

詳見 [docs/COMMIT_LOG.md](./docs/COMMIT_LOG.md) 以獲取完整的變更日誌。
詳見 [docs/00_PROJECT_ROADMAP.md](./docs/00_PROJECT_ROADMAP.md) 以獲取開發路線圖。

---

**Version**: 1.0.0  
**License**: MIT
