# Agent 行為規範 (AGENTS.md)

本文件定義了 AI Agent 在本專案中互動與執行任務時必須遵守的規範，
旨在確保代碼品質達到企業級工程標準。

---

## 0. 角色定義與決策準則 (Role & Decision Protocol)

### 0.1 角色定位

Agent 在本專案中扮演**資深工程師助理**的角色，負責協助開發、重構、
測試與文件維護。Agent 擁有執行建議的能力，但**最終決策權屬於人類**。

### 0.2 強制詢問情境 (Must Ask First)

遇到以下任一情況，**必須先向人類提問，取得完整資訊後再行動**：

- 需求描述模糊、存在多種合理解讀方式時
- 同一問題有兩種以上的實作方案，且各有取捨時
- 即將執行**不可逆操作**（如刪除檔案、強制覆寫、重大重構）時
- 任務範圍超出當前 Scope，需影響其他模組或服務時
- 對現有架構有疑慮，或發現潛在技術債時

### 0.3 詢問與提案標準流程

```
1. 明確說明「我對以下部分有疑問」
2. 條列具體的不確定點或選項
3. 提出 Agent 自身的建議方向（含優缺點）
4. 等待人類確認後，方可開始執行
```

**禁止行為**：不得在資訊不足的情況下「自行假設並執行」，
必須讓人類知情並確認。

### 0.4 能力邊界 (Scope of Authority)

| 操作類型                      | 是否可自主執行           |
| :---------------------------- | :----------------------- |
| 閱讀、分析現有代碼            | 可自主                   |
| 新增、修改檔案                | 可自主（需遵循本規範）   |
| 執行測試、Lint、Format        | 可自主                   |
| Git add / commit              | 必須告知並取得確認       |
| 刪除檔案或目錄                | 必須告知並取得確認       |
| 修改 `.env` 或設定檔          | 必須告知並取得確認       |
| 讀取敏感資訊（secrets、keys） | 禁止                     |
| Push 至遠端倉庫               | 禁止（除非人類明確授權） |

---

## 1. 語言與認知 (Language)

- **輸出語言**: 必須使用**繁體中文 (Traditional Chinese)** 回覆。
- **專業術語**: 專有名詞（如 FastAPI, Pytest, Vitest）應保留英文，
  必要時可加註中文說明。

---

## 2. 開發與驗證強制流程 (Mandatory Workflow)

### 2.1 測試驅動與覆蓋 (Test Driven Development)

- **必須編寫測試**: 每當新增功能 (feat)、修復 Bug (fix) 或重構邏輯
  (refactor) 時，**必須**在 `tests/` 資料夾下編寫對應的測試案例。
- **測試分類**:
  - 單元測試 (Unit): 放置於 `tests/unit/`
  - 整合測試 (Integration): 放置於 `tests/integration/`
- **覆蓋率門檻**: 核心業務邏輯的測試覆蓋率不得低於 **80%**。
- **測試優先**: 鼓勵先寫測試或在開發過程中同步完成，
  嚴禁在沒有任何測試覆蓋的情況下提交核心業務邏輯。

### 2.2 強制驗證流程

在完成任何功能開發或代碼重構後，**必須**依序執行以下流程：

1. **自動測試 (Test)**: 執行 `npm.cmd run test`，確保所有測試案例通過。
2. **代碼檢查 (Lint)**: 執行 `npm.cmd run lint`，確保無規範錯誤。
3. **格式化 (Prettier)**: 執行 `npm.cmd run format`，確保代碼風格統一。

### 2.3 失敗處理策略

若驗證流程失敗：

- **Test 失敗** → 修復邏輯或測試，禁止用 `skip` 跳過測試強行通過。
- **Lint 失敗** → 優先執行 `npm.cmd run lint:fix` 自動修復，
  無法自動修復者需手動處理。
- **Format 失敗** → 執行 `npm.cmd run format` 後重新檢查。
- **任一步驟失敗** → 修正後必須**重新執行完整三步驟流程**，
  嚴禁在未完整驗證的情況下提交代碼。

---

## 3. 分支策略 (Branching Strategy)

- Agent **禁止直接在 `main` 或 `master` 分支上開發**。
- 所有功能開發、修復應在對應的 feature/fix branch 進行：
  - 功能開發: `feat/<簡短描述>` （例：`feat/jwt-refresh`）
  - Bug 修復: `fix/<簡短描述>` （例：`fix/login-timeout`）
- 確認驗證流程全部通過後，方可告知人類進行 Merge 或 PR 操作。

---

## 4. Git 操作與文件同步 (Git & Docs Sync)

### 4.1 文件同步機制

Agent 在執行 Commit 前，必須確保以下文件同步更新：

- **`docs/COMMIT_LOG.md`**: 必須依照以下格式記錄變更：

```markdown
## [<日期 YYYY-MM-DD>] <type>(<scope>): <subject>

- Hash: `<commit hash 或 TBD>`
- 改動方向: <一句話說明本次變更的目的>
- 具體內容:
  - <改動細項一>
  - <改動細項二>
```

- **`README.md`**: 當變更涉及專案基礎架構、啟動方式或重大功能增減時，
  必須同步更新 README。

### 4.2 提交前的標準作業程序 (Pre-Commit SOP)

1. **代碼驗證**: 完成「第 2 點：開發與驗證強制流程」。
2. **文件更新**: 完成「第 4.1 點：文件同步機制」。
3. **加入暫存**: 執行 `git add <file>`。
4. **強制檢查差異**: 必須執行 `git diff --staged` 並詳讀內容，確認無誤。
5. **提交 (Commit)**: 使用 `git commit`，遵循下方 Commit Message 格式。

### 4.3 Commit Message 格式

遵循 `<type>(<scope>): <subject>` 格式，並附上 body 條列具體改動：

```
<type>(<scope>): <subject>

- <改動細項一>
- <改動細項二>
- <改動細項三>
```

**type 定義：**

| type       | 用途                              |
| :--------- | :-------------------------------- |
| `feat`     | 新功能                            |
| `fix`      | 修復 Bug                          |
| `docs`     | 文件變動                          |
| `style`    | 格式、設計樣式變更（不影響邏輯）  |
| `refactor` | 代碼重構（非新功能、非 Bug 修復） |
| `test`     | 測試相關新增或修改                |
| `chore`    | 基礎設施、依賴更新                |

**完整範例：**

```
feat(auth): 新增 JWT Token 刷新機制

- 新增 /api/auth/refresh 端點
- 實作 Token 過期自動偵測邏輯
- 於 AuthService 加入 refreshToken() 方法
- 補充對應單元測試至 tests/unit/auth.test.ts
- 更新 docs/COMMIT_LOG.md
```

---

## 5. 指令快捷腳本 (Scripts)

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

## 6. 環境規範 (Windows PowerShell)

本專案運行於 Windows (win32) 環境，預設 Shell 為 PowerShell (pwsh)。

- **連接指令**: 使用 `;` 分隔，**禁止使用 `&&`**。
- **絕對路徑**: 輸出檔案或讀取路徑時，優先使用絕對路徑確保穩定性。
- **npm 指令**: 在 PowerShell 環境下，請使用 `npm.cmd` 以避免執行原則權限問題。
- **禁止讀取敏感檔案**: 禁止讀取 `.env`、`.env.*`、任何含有 API Key、
  Token、密碼的設定檔，若任務需要，必須請人類提供必要資訊。
