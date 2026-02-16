# 🎨 設計系統規範 - Travelogue

> 溫馨自然風格的旅遊規劃 App 視覺設計指南

**版本**: 1.1.0  
**更新日期**: 2026-02-16  
**設計理念**: 溫暖、療癒、敘事、親近自然

---

## 📋 目錄

- [設計理念](#設計理念)
- [配色方案](#配色方案)
- [字體系統](#字體系統)
- [間距系統](#間距系統)
- [圓角與陰影](#圓角與陰影)
- [圖示系統](#圖示系統)
- [UI 元件規範](#ui-元件規範)
- [動畫效果](#動畫效果)
- [響應式設計](#響應式設計)
- [檢核清單](#檢核清單)

---

## 設計理念

### 核心價值

- **溫暖舒適**: 使用大地色系與柔和圓角，營造親切感
- **敘事佈局**: 採用 Storytelling 模式，引導使用者如閱讀手帳般瀏覽行程
- **自然療癒**: 受手帳文化與自然系美學啟發
- **無障礙優先**: 確保所有視覺元素符合 WCAG AA 級對比度標準，並提供清晰的 Focus 狀態

### 視覺關鍵字

```
溫馨 Cozy  |  手帳 Journal  |  自然 Nature  |  療癒 Healing
進化軟視覺 Soft UI Evolution  |  敘事佈局 Storytelling  |  觸感回饋 Tactile
```

---

## 配色方案

### 主色系 (Primary Colors)

#### 森林綠 (Forest Green) - 主要品牌色

```css
--forest-50: #f0f4e8 /* 淺背景 */ --forest-100: #e0e5d5 /* 次要背景、邊框 */
  --forest-200: #c8d4b5 /* 禁用狀態 */ --forest-300: #a9ba8e /* 裝飾元素 */
  --forest-400: #8b9a6d /* 主要按鈕、重點標記 */ --forest-500: #6f7f4f
  /* 按鈕 Hover */ --forest-600: #5f6f4a /* 按鈕 Active */ --forest-700: #4a5639
  /* 深色文字 */ --forest-800: #3a4429 /* 標題文字 */ --forest-900: #2a311c
  /* 最深文字 */;
```

#### 米白色 (Cream) - 背景色

```css
--cream: #f7f4eb /* 主背景 */ --cream-dark: #ede8dc /* 次要背景 */
  --cream-light: #fdfbf5 /* 卡片背景 */;
```

---

### 輔助色系 (Secondary Colors)

#### 大地棕 (Earth Brown) - 溫暖強調色

```css
--earth-50: #faf5ef --earth-100: #f0e8db --earth-200: #e5d6c0
  --earth-300: #d4b896 /* 美食類別、裝飾 */ --earth-400: #c19e72
  --earth-500: #a68a64 /* 次要按鈕 */ --earth-600: #8b7355 --earth-700: #6f5c45
  --earth-800: #564736 --earth-900: #3d3226;
```

---

## 圓角與陰影

### 圓角系統 (Border Radius)

```css
--radius-none: 0;
--radius-sm: 0.25rem; /* 4px - 標籤 */
--radius-md: 0.5rem; /* 8px - 按鈕、輸入框 */
--radius-lg: 1rem; /* 16px - 小卡片 */
--radius-xl: 1.5rem; /* 24px - 標準卡片 */
--radius-2xl: 2rem; /* 32px - 大型裝飾元件 */
--radius-full: 9999px; /* 完全圓形 */
```

### 陰影系統 (Shadows)

#### Soft UI Evolution Shadow（進化版軟陰影）

結合「硬位移」與「微擴散」，營造紙張層次感。

```css
--shadow-soft-sm: 2px 2px 0px rgba(224, 229, 213, 0.8);
--shadow-soft: 4px 4px 0px rgba(224, 229, 213, 0.8);
--shadow-soft-lg: 6px 6px 2px rgba(224, 229, 213, 0.6); /* 增加微擴散 */
--shadow-soft-hover: 6px 6px 0px rgba(200, 212, 181, 0.9);
```

---

## 防禦性設計與規範 (Anti-patterns)

- ❌ **禁用表情符號作為圖示**：必須使用 SVG 圖示（Font Awesome / Lucide）。
- ❌ **禁止佈局跳動的 Hover**：避免在 Hover 時改變元素尺寸。
- ❌ **禁止即時狀態切換**：互動必須有 150-300ms 的平滑過渡。
- ❌ **禁止低對比文字**：確保符合 WCAG 4.5:1 標準。

---

## 檢核清單 (Pre-Delivery Checklist)

- [ ] 所有可點擊元素均有 `cursor-pointer`。
- [ ] 互動過渡時間介於 150-300ms。
- [ ] 鍵盤導覽時 Focus 狀態清晰可見。
- [ ] 支援 `prefers-reduced-motion`。
- [ ] 響應式測試：375px, 768px, 1024px, 1440px。

---

**設計系統版本**: 1.1.0  
**最後更新**: 2026-02-16  
**維護者**: Design Team
