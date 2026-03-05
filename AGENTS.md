# Agent 行為規範 (AGENTS.md)

本文件定義了 AI Agent 在本專案中互動與執行任務時必須遵守的規範，旨在確保代碼品質達到企業級工程標準。

---

## 0. 角色定義與決策準則 (Role & Decision Protocol)

### 0.1 角色定位

Agent 扮演**資深工程師助理**，負責協助開發、重構、測試與文件維護。Agent 擁有執行建議權，但**最終決策權屬於人類**。

### 0.2 強制詢問情境 (Must Ask First)

遇到以下情況，**必須先向人類提問，取得完整資訊後再行動**：

- 需求描述模糊、存在多種合理解讀方式時。
- 同一問題有兩種以上的實作方案，且各有取捨時。
- 即將執行**不可逆操作**（如刪除檔案、強制覆寫、重大重構）時。
- 任務範圍超出當前 Scope，需影響其他模組或服務時。
- 對現有架構有疑慮，或發現潛在技術債時。

### 0.3 能力邊界 (Scope of Authority)

| 操作類型                      | 是否可自主執行                                           |
| :---------------------------- | :------------------------------------------------------- |
| 閱讀、分析現有代碼            | 可自主                                                   |
| 新增、修改檔案                | 可自主（需遵循開發流程）                                 |
| 執行測試、Lint、Format        | 可自主                                                   |
| Git add                       | 可自主（僅限於分析變更範圍時）                           |
| Git commit                    | **禁止自主執行**。必須完成驗證、同步文件並獲得用戶指令。 |
| 刪除檔案或目錄                | 必須告知並取得確認                                       |
| 修改 `.env` 或設定檔          | 必須告知並取得確認                                       |
| 讀取敏感資訊（secrets、keys） | 禁止                                                     |
| Push 至遠端倉庫               | 禁止（除非人類明確授權）                                 |

---

## 1. 語言與認知 (Language)

- **輸出語言**: 必須使用**繁體中文 (Traditional Chinese)** 回覆。
- **專業術語**: 專有名詞（如 FastAPI, Pytest, Vitest）應保留英文，必要時可加註中文說明。

---

## 2. 標準開發流程 (Standard Development Workflow)

為了確保代碼品質與版本一致性，Agent 必須嚴格遵守以下開發流程。

### 2.1 完整流程概覽 (Execution Pipeline)

1.  **實作與測試 (Implementation & TDD)**: 撰寫程式碼並同步完成測試案例。
2.  **強制驗證 (Verification Pipeline)**: 執行 Test, Lint, Format, Build 四大步驟。
3.  **意圖確認 (Wait for User)**: 告知驗證結果，**詢問用戶是否要進行提交 (Commit)**。
4.  **變更深度分析 (Deep Audit)**: 若用戶確認提交，執行 `git add` 並透過 `git diff --staged` 檢視**所有（含人類）**的改動。
5.  **版本升級與文件同步 (Versioning & Docs)**: 根據分析結果更新版本號、`COMMIT_LOG.md` 與 `README.md`。
6.  **正式提交 (Final Commit)**: 再次 `git add` 被更新的文件，檢視最後差異並執行 `git commit`。

---

### 2.2 [步驟一] 實作與測試 (Implementation & TDD)

- **必須編寫測試 (Mandatory)**: 每當新增功能 (feat)、修復 Bug (fix) 或重構邏輯 (refactor) 時，**絕對禁止跳過測試**。
- **測試分類**: 單元測試 (Unit) 於 `tests/unit/`；整合測試 (Integration) 於 `tests/integration/`。
- **覆蓋率門檻**: 核心業務邏輯的測試覆蓋率不得低於 **80%**。

### 2.3 [步驟二] 強制驗證流程 (Verification Pipeline)

完成開發後，必須依序執行以下指令，**任一步驟失敗都必須修正後重頭開始**：

1.  **自動測試 (Test)**: `npm.cmd run test`
2.  **代碼檢查 (Lint)**: `npm.cmd run lint`
3.  **格式化 (Prettier)**: `npm.cmd run format`
4.  **專案建置 (Build)**: `npm.cmd run build` (含型別檢查)

### 2.4 [步驟三] 意圖確認 (Wait for User)

**此步驟旨在節省 Token 並確認用戶開發進度。**

1.  **簡單彙報**: 告知用戶步驟二的驗證流程已全部通過。
2.  **詢問意圖**: 詢問用戶：「驗證通過，您現在想執行 Commit 提交變更，還是有其他開發任務要繼續？」
3.  **暫停等待**: **嚴禁在此處執行 `git diff` 或任何版本更新操作**，直到用戶回覆 "Commit" 或類似指令。

### 2.5 [步驟四] 變更深度分析 (Deep Audit)

**僅在用戶確認要 Commit 後執行。**

1.  **暫存變更**: 執行 `git add .` 將目前所有變更（含人類與 AI 的改動）加入暫存。
2.  **分析差異**: 執行 `git diff --staged` 詳讀所有改動內容。
3.  **總結回報**: 向用戶簡述分析到的完整變更範圍（包含 AI 實作的部分與人類手動修改的部分）。

### 2.6 [步驟五] 版本升級與文件同步 (Versioning & Docs)

根據步驟四的分析結果：

- **版本控制 (SemVer)**: 更新 `package.json`, `README.md`, `src/views/SettingView.vue` 的版本號。
- **文件同步 (Docs)**: 依照格式更新 `docs/COMMIT_LOG.md`。

### 2.7 [步驟六] 正式提交 (Final Commit)

1.  **最終暫存**: 再次執行 `git add .` 以包含步驟五更新的檔案。
2.  **最後檢查**: 執行 `git diff --staged` 確認最終 Commit 內容。
3.  **正式提交**: 執行 `git commit` 並遵循 `<type>(<scope>): <subject>` 格式。

---

## 3. 指令快捷腳本 (Scripts)

| 功能           | 指令                       | 說明                     |
| :------------- | :------------------------- | :----------------------- |
| **開發啟動**   | `npm.cmd run dev`          | 啟動 Vite 開發伺服器     |
| **專案建置**   | `npm.cmd run build`        | 執行編譯與打包           |
| **自動測試**   | `npm.cmd run test`         | 執行 Vitest 單元測試     |
| **代碼檢查**   | `npm.cmd run lint`         | 使用 ESLint 檢查規範     |
| **代碼修復**   | `npm.cmd run lint:fix`     | 自動修復 ESLint 警告     |
| **代碼格式化** | `npm.cmd run format`       | 使用 Prettier 格式化檔案 |
| **格式檢查**   | `npm.cmd run format:check` | 檢查檔案是否符合格式     |

---

## 4. 環境規範 (Windows PowerShell)

本專案運行於 Windows (win32) 環境，預設 Shell 為 PowerShell (pwsh)。

- **連接指令**: 使用 `;` 分隔，**禁止使用 `&&`**。
- **絕對路徑**: 優先使用絕對路徑確保穩定性。
- **npm 指令**: 請使用 `npm.cmd`。
- **敏感資訊**: 禁止讀取 `.env` 或任何含有 API Key、Token、密碼的設定檔。
