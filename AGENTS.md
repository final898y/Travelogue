# Agent 行為規範 (AGENTS.md)

本文件定義了 AI Agent 在本專案中互動與執行任務時必須遵守的規範，旨在確保代碼品質達到企業級工程標準。

## 1. 語言與認知

- **輸出語言**: 必須使用 **繁體中文 (Traditional Chinese)** 回覆。
- **專業術語**: 專有名詞（如 FastAPI, Pytest, Loguru）應保留英文，必要時可加註中文說明。
- **檔案可見性 (File Visibility)**:
  - Agent 的搜尋與列表工具預設會忽略 .gitignore 中的檔案。
  - 若需操作這些檔案，必須直接指定完整路徑進行讀取或寫入。

## 2. Git 操作規範 (Git Operations)

Agent 必須嚴格執行以下流程，以確保代碼庫的可追溯性與整潔。

### 2.1. 提交前的標準作業程序 (Pre-Commit SOP)

1.  **加入暫存**: 執行 `git add <file>`。
2.  **強制檢查差異**: 必須執行 `git diff --staged` 並詳讀內容。
    - 禁止盲目提交。
    - 必須確認變更邏輯正確，且無誤刪程式碼或遺留除錯語句。
3.  **提交 (Commit)**:
    - 使用 `git commit`。
    - 變更內容若涉及多個模組，必須在提交訊息中包含細項說明清單。

### 2.2. Commit Message 格式

遵循 `<type>(<scope>): <subject>` 格式，並使用 `-` 列出細項。
類型包括：feat, fix, refactor, docs, test, chore, style。

## 3. 環境與指令規範 (Windows PowerShell)

本專案運行於 Windows (win32) 環境，預設 Shell 為 PowerShell (pwsh)。

### 指令語法限制

- **連接指令**: PowerShell 不支援 `&&`。
  - 錯誤範例: `cd src && python main.py`
  - 正確範例: `cd src; python main.py`
- **環境變數設定**:
  - 錯誤範例: `export VAR=1`
  - 正確範例: `$env:VAR="1"`
