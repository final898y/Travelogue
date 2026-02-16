# Agent 行為規範 (AGENTS.md)

本文件定義了 AI Agent 在本專案中互動與執行任務時必須遵守的規範，旨在確保代碼品質達到企業級工程標準。

## 1. 語言與認知

- **輸出語言**: 必須使用 **繁體中文 (Traditional Chinese)** 回覆。
- **專業術語**: 專有名詞（如 FastAPI, Pytest, Vitest）應保留英文，必要時可加註中文說明。

## 2. 開發與驗證強制流程 (Mandatory Workflow)

### 2.1 測試驅動與覆蓋 (Test Driven Development)

- **必須編寫測試**: 每當新增功能 (feat)、修復 Bug (fix) 或重構邏輯 (refactor) 時，**必須**在 `tests/` 資料夾下編寫對應的測試案例。
- **測試分類**: 
  - 單元測試 (Unit): 放置於 `tests/unit/`。
  - 整合測試 (Integration): 放置於 `tests/integration/`。
- **測試優先**: 鼓勵先寫測試或在開發過程中同步完成測試，嚴禁在沒有任何測試覆蓋的情況下提交核心業務邏輯。

### 2.2 強制驗證流程

在完成任何功能開發或代碼重構後，**必須**依序執行以下流程進行驗證，確保代碼品質後方可進入 Git 提交：

1.  **自動測試 (Test)**: 執行 `npm run test`，確保所有測試案例通過。
2.  **代碼檢查 (Lint)**: 執行 `npm run lint`，確保無規範錯誤。
3.  **格式化 (Prettier)**: 執行 `npm run format`，確保代碼風格統一。

**若上述任一步驟失敗，必須修正後重新執行完整流程，嚴禁在未驗證情況下提交代碼。**

## 3. Git 操作與文件同步 (Git & Docs Sync)

### 3.1. 文件同步機制

Agent 在執行 Commit 前，必須確保以下文件同步更新：

- **`docs/COMMIT_LOG.md`**: 必須記錄該次變更的 Hash（若已知）、日期、改動方向與具體內容。
- **`README.md`**: 當變更涉及專案基礎架構、啟動方式或重大功能增減時，必須同步更新 README。

### 3.2. 提交前的標準作業程序 (Pre-Commit SOP)

1.  **代碼驗證**: 完成「第 2 點：開發與驗證強制流程」。
2.  **文件更新**: 完成「第 3.1 點：文件同步機制」。
3.  **加入暫存**: 執行 `git add <file>`。
4.  **強制檢查差異**: 必須執行 `git diff --staged` 並詳讀內容，確認無誤。
5.  **提交 (Commit)**: 使用 `git commit`，遵循 Conventional Commits 格式。

### 3.3. Commit Message 格式

遵循 `<type>(<scope>): <subject>` 格式：

- `feat`: 新功能
- `fix`: 修復 Bug
- `docs`: 文件更動
- `style`: 格式、設計樣式變更
- `refactor`: 代碼重構
- `test`: 測試相關
- `chore`: 基礎設施、依賴更新

## 4. 指令快捷腳本 (Scripts)

本專案使用以下指令進行日常開發與驗證：

| 功能           | 指令 (npm.cmd)             | 說明                     |
| :------------- | :------------------------- | :----------------------- |
| **開發啟動**   | `npm.cmd run dev`          | 啟動 Vite 開發伺服器     |
| **專案建置**   | `npm.cmd run build`        | 執行編譯與打包           |
| **自動測試**   | `npm.cmd run test`         | 執行 Vitest 單元測試     |
| **代碼檢查**   | `npm.cmd run lint`         | 使用 ESLint 檢查規範     |
| **代碼修復**   | `npm.cmd run lint:fix`     | 自動修復 ESLint 警告     |
| **代碼格式化** | `npm.cmd run format`       | 使用 Prettier 格式化檔案 |
| **格式檢查**   | `npm.cmd run format:check` | 檢查檔案是否符合格式     |

## 5. 環境規範 (Windows PowerShell)

本專案運行於 Windows (win32) 環境，預設 Shell 為 PowerShell (pwsh)。

- **連接指令**: 使用 `;` 分隔，**禁止使用 `&&`**。
- **絕對路徑**: 輸出檔案或讀取路徑時，請優先考慮使用絕對路徑以確保穩定性。
- **npm 指令**: 在 PowerShell 環境下，請使用 `npm.cmd` 以避免執行原則權限問題。
