# 🎨 Travelogue UI/UX 設計規範

本文件定義了 Travelogue 專案的視覺風格、交互邏輯與設計系統規範，旨在確保應用程式展現一致的「手帳風格」質感。

---

## 1. 設計理念：Soft UI Evolution

Travelogue 採用 **Storytelling (敘事型)** 佈局，強調溫暖、療癒與觸感。

-   **Cozy (舒適)**: 大量使用米白色調與森林綠，減輕視覺壓力。
-   **Tactile (觸感)**: 使用「實心偏移陰影」取代傳統模糊陰影，模擬實體手帳的貼紙感。
-   **Motion-Driven (動畫驅動)**: 全站採用平滑的過渡動畫 (Fade, Slide, Scale)，提升操作的流暢度。

---

## 2. 顏色系統 (Tailwind CSS Config)

### 2.1 品牌核心色
-   **森林綠 (Forest Green)**: 主要品牌色，用於 Header、主按鈕與成功狀態。
    - `forest-400`: #8b9a6d (主色)
    - `forest-800`: #3a4429 (深色文字)
-   **米白色 (Cream)**: 全站背景色。
    - `cream-light`: #fdfbf5 (卡片背景)
    - `cream`: #f7f4eb (主背景)

### 2.2 功能色系
-   **珊瑚紅 (Coral Red)**: 錯誤、刪除與重要警告 (`#d97878`)。
-   **蜂蜜橘 (Honey Orange)**: 中度警告、提醒與待辦標記 (`#e89f5a`)。
-   **大地棕 (Earth Brown)**: 記帳功能主色、副按鈕 (`#a68a64`)。
-   **天空藍 (Sky Blue)**: 交通與網頁收集標記 (`#6b9bd1`)。

---

## 3. 陰影與圓角 (Shadows & Borders)

專案不使用標準的 CSS 模糊陰影，而是使用 **實心偏移陰影**。

-   **`shadow-soft-sm`**: `2px 2px 0px rgba(224, 229, 213, 0.8)`
-   **`shadow-soft`**: `4px 4px 0px rgba(224, 229, 213, 0.8)`
-   **`shadow-soft-lg`**: `6px 6px 2px rgba(224, 229, 213, 0.6)`
-   **圓角規範**:
    - `rounded-xl` (1rem): 按鈕、輸入框。
    - `rounded-2xl` (1.5rem): 一般卡片。
    - `rounded-3xl` (2rem): 底部抽屜 (BottomSheet)、主容器。

---

## 4. 全域交互組件 (Global Interaction)

### 4.1 BaseToast (吐司訊息)
-   **位置**: 頂部中央固定。
-   **風格**: 純白背景、實心邊框、`font-rounded` 加粗文字。
-   **自動化**: 預設顯示 3 秒，具備 Slide Down 進入動畫。

### 4.2 BaseConfirmDialog (確認對話框)
-   **背景**: `forest-900/10` 搭配 `backdrop-blur-sm` 高質感模糊。
-   **風格**: 垂直堆疊按鈕，強化視覺層次感的實心大陰影。

---

## 5. 圖示規範 (Icons)

全站統一使用 **Lucide-vue-next**。
-   所有圖示需經由 `src/assets/icons.ts` 集中導出。
-   優先使用 `stroke-width="2"`，重要交互可提升至 `2.5`。
