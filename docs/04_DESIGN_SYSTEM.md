# 🎨 設計系統規範 - Travelogue

> 溫馨自然風格的旅遊規劃 App 視覺設計指南

**版本**: 1.0.0  
**更新日期**: 2026-02-15  
**設計理念**: 溫暖、療癒、簡約、親近自然

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

---

## 設計理念

### 核心價值

- **溫暖舒適**: 使用大地色系與柔和圓角，營造親切感
- **簡約清晰**: 資訊層級分明，避免過度裝飾
- **自然療癒**: 受手帳文化與自然系美學啟發
- **觸感回饋**: 每個互動都有明確的視覺與動畫回饋

### 視覺關鍵字

```
溫馨 / 手帳風 / 自然系 / 療癒 / 圓潤 / 柔和
Cozy / Journal / Nature / Healing / Rounded / Soft
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

**使用場景**：

- 主要 CTA 按鈕
- 導航列 Active 狀態
- 重點標記與 Badge
- Icon 主色

#### 米白色 (Cream) - 背景色

```css
--cream: #f7f4eb /* 主背景 */ --cream-dark: #ede8dc /* 次要背景 */
  --cream-light: #fdfbf5 /* 卡片背景 */;
```

**使用場景**：

- App 主背景
- 卡片內容區
- Modal 背景

---

### 輔助色系 (Secondary Colors)

#### 大地棕 (Earth Brown) - 溫暖強調色

```css
--earth-50: #faf5ef --earth-100: #f0e8db --earth-200: #e5d6c0
  --earth-300: #d4b896 /* 美食類別、裝飾 */ --earth-400: #c19e72
  --earth-500: #a68a64 /* 次要按鈕 */ --earth-600: #8b7355 --earth-700: #6f5c45
  --earth-800: #564736 --earth-900: #3d3226;
```

**使用場景**：

- 美食類別標記
- 次要 CTA 按鈕
- 溫暖提示訊息
- Outline 按鈕

---

### 功能色系 (Accent Colors)

#### 天空藍 (Sky Blue) - 交通類別

```css
--sky-blue: #6b9bd1;
```

**使用場景**: 交通類別、資訊提示

#### 薰衣草紫 (Lavender) - 住宿類別

```css
--lavender: #9b8fb9;
```

**使用場景**: 住宿類別、特殊標記

#### 蜜橙色 (Honey Orange) - 活動類別

```css
--honey-orange: #e89f5a;
```

**使用場景**: 活動類別、警告提示

#### 珊瑚紅 (Coral Red) - 錯誤狀態

```css
--coral-red: #d97878;
```

**使用場景**: 錯誤提示、刪除確認

---

### 中性色系 (Neutral Colors)

#### 灰階 (Grays)

```css
--gray-50: #fafaf9 --gray-100: #f5f5f4 --gray-200: #e7e5e4 --gray-300: #d6d3d1
  --gray-400: #a8a29e --gray-500: #78716c /* 次要文字 */ --gray-600: #57534e
  /* 一般文字 */ --gray-700: #44403c /* 重要文字 */ --gray-800: #292524
  --gray-900: #1c1917 /* 最深文字 */;
```

---

### 語意化顏色 (Semantic Colors)

```css
/* 成功 */
--success-bg: #ecfdf5 --success-border: #a7f3d0 --success-text: #065f46
  /* 警告 */ --warning-bg: #fffbeb --warning-border: #fde68a
  --warning-text: #92400e /* 錯誤 */ --error-bg: #fef2f2 --error-border: #fecaca
  --error-text: #991b1b /* 資訊 */ --info-bg: #eff6ff --info-border: #bfdbfe
  --info-text: #1e40af;
```

---

### 配色使用矩陣

| 元素         | 顏色         | 使用情境       |
| ------------ | ------------ | -------------- |
| **主要按鈕** | `forest-400` | CTA、確認操作  |
| **次要按鈕** | `earth-500`  | 次要操作、取消 |
| **文字連結** | `forest-600` | 可點擊文字     |
| **標題文字** | `forest-800` | H1-H3          |
| **正文文字** | `gray-600`   | 段落、說明     |
| **次要文字** | `gray-500`   | 時間、輔助訊息 |
| **邊框**     | `forest-100` | 卡片、輸入框   |
| **分隔線**   | `gray-200`   | 內容區塊分隔   |

---

## 字體系統

### 字體家族 (Font Family)

```css
/* 主要字體 - 中文 */
--font-primary: "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif;

/* 圓體字 - 標題與特殊元素 */
--font-rounded: "Varela Round", "Noto Sans TC", sans-serif;

/* 等寬字 - 代碼、數字 */
--font-mono: "JetBrains Mono", "Courier New", monospace;
```

### 字級系統 (Type Scale)

基於 1.25 比例（Major Third）

```css
--text-xs: 0.75rem; /* 12px - 小標籤、版權資訊 */
--text-sm: 0.875rem; /* 14px - 次要文字、提示 */
--text-base: 1rem; /* 16px - 正文、按鈕 */
--text-lg: 1.125rem; /* 18px - 副標題 */
--text-xl: 1.25rem; /* 20px - 卡片標題 */
--text-2xl: 1.5rem; /* 24px - 頁面標題 */
--text-3xl: 1.875rem; /* 30px - 主標題 */
--text-4xl: 2.25rem; /* 36px - Hero 標題 */
```

### 字重 (Font Weight)

```css
--font-normal: 400; /* 正文 */
--font-medium: 500; /* 次要標題 */
--font-semibold: 600; /* 按鈕、強調 */
--font-bold: 700; /* 主標題 */
```

### 行高 (Line Height)

```css
--leading-tight: 1.25; /* 標題 */
--leading-normal: 1.5; /* 正文 */
--leading-relaxed: 1.75; /* 長文章 */
```

### 字距 (Letter Spacing)

```css
--tracking-tight: -0.025em; /* 大標題 */
--tracking-normal: 0; /* 正文 */
--tracking-wide: 0.025em; /* 按鈕、標籤 */
```

---

## 間距系統

### 間距尺度 (Spacing Scale)

基於 4px 網格系統

```css
--space-0: 0; /* 0px */
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px - 基準單位 */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
--space-20: 5rem; /* 80px */
--space-24: 6rem; /* 96px */
```

### 元件間距規範

```css
/* 元件內部 padding */
--padding-xs: var(--space-2); /* 8px - 緊湊 */
--padding-sm: var(--space-3); /* 12px - 小元件 */
--padding-md: var(--space-4); /* 16px - 標準 */
--padding-lg: var(--space-6); /* 24px - 卡片 */
--padding-xl: var(--space-8); /* 32px - Section */

/* 元件間距 gap */
--gap-xs: var(--space-2); /* 8px */
--gap-sm: var(--space-3); /* 12px */
--gap-md: var(--space-4); /* 16px */
--gap-lg: var(--space-6); /* 24px */
--gap-xl: var(--space-8); /* 32px */
```

---

## 圓角與陰影

### 圓角系統 (Border Radius)

```css
--radius-none: 0;
--radius-sm: 0.25rem; /* 4px - 標籤 */
--radius-md: 0.5rem; /* 8px - 按鈕、輸入框 */
--radius-lg: 1rem; /* 16px - 卡片 */
--radius-xl: 1.5rem; /* 24px - Modal */
--radius-2xl: 2rem; /* 32px - 大型卡片 */
--radius-full: 9999px; /* 完全圓形 */
```

### 陰影系統 (Shadows)

#### Soft Shadow（軟陰影 - 品牌特色）

```css
--shadow-soft-sm: 2px 2px 0px rgba(224, 229, 213, 0.8);
--shadow-soft: 4px 4px 0px rgba(224, 229, 213, 0.8);
--shadow-soft-lg: 6px 6px 0px rgba(224, 229, 213, 0.8);

/* Hover 狀態 */
--shadow-soft-hover: 6px 6px 0px rgba(200, 212, 181, 0.9);
```

**使用場景**: 卡片、按鈕、Modal

#### Classic Shadow（傳統陰影 - 輔助用）

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

**使用場景**: 下拉選單、Popover、Toast

---

## 圖示系統

### 圖示庫

使用 **Font Awesome Free 6.x**

### 圖示尺寸

```css
--icon-xs: 0.75rem; /* 12px */
--icon-sm: 1rem; /* 16px */
--icon-md: 1.25rem; /* 20px - 標準 */
--icon-lg: 1.5rem; /* 24px */
--icon-xl: 2rem; /* 32px */
--icon-2xl: 2.5rem; /* 40px */
```

### 常用圖示對應

| 功能 | 圖示 | Font Awesome Class                      |
| ---- | ---- | --------------------------------------- |
| 行程 | 📅   | `fa-calendar-alt`                       |
| 預訂 | 🎫   | `fa-ticket-alt`                         |
| 記帳 | 💰   | `fa-wallet`                             |
| 日誌 | 📓   | `fa-book`                               |
| 清單 | ✅   | `fa-tasks`                              |
| 地圖 | 🗺️   | `fa-map`                                |
| 景點 | 🏛️   | `fa-landmark`                           |
| 美食 | 🍴   | `fa-utensils`                           |
| 交通 | 🚗   | `fa-car`                                |
| 住宿 | 🛏️   | `fa-bed`                                |
| 天氣 | ☀️   | `fa-sun` / `fa-cloud` / `fa-cloud-rain` |
| 分享 | 📤   | `fa-share`                              |
| 編輯 | ✏️   | `fa-edit`                               |
| 刪除 | 🗑️   | `fa-trash`                              |
| 新增 | ➕   | `fa-plus`                               |

---

## UI 元件規範

### 按鈕 (Button)

#### 尺寸變體

```css
/* Small */
padding: 6px 12px;
font-size: 14px;
border-radius: 8px;

/* Medium (預設) */
padding: 10px 16px;
font-size: 16px;
border-radius: 12px;

/* Large */
padding: 14px 24px;
font-size: 18px;
border-radius: 16px;
```

#### 顏色變體

**Primary (主要)**

```css
background: var(--forest-400);
color: white;
box-shadow: var(--shadow-soft);

/* Hover */
background: var(--forest-500);
box-shadow: var(--shadow-soft-hover);

/* Active */
background: var(--forest-600);
transform: scale(0.95);
```

**Secondary (次要)**

```css
background: var(--earth-400);
color: white;
box-shadow: var(--shadow-soft-sm);
```

**Outline (輪廓)**

```css
background: transparent;
border: 2px solid var(--forest-400);
color: var(--forest-700);

/* Hover */
background: var(--forest-50);
```

**Ghost (幽靈)**

```css
background: transparent;
color: var(--forest-700);

/* Hover */
background: var(--forest-50);
```

---

### 卡片 (Card)

#### 標準卡片

```css
background: white;
border-radius: var(--radius-xl); /* 24px */
padding: var(--padding-lg); /* 24px */
box-shadow: var(--shadow-soft);
transition: all 0.2s ease;

/* Hover */
box-shadow: var(--shadow-soft-hover);
transform: translateY(-2px);
```

#### 緊湊卡片

```css
padding: var(--padding-md); /* 16px */
border-radius: var(--radius-lg); /* 16px */
```

---

### 輸入框 (Input)

```css
/* 基礎樣式 */
padding: 12px 16px;
font-size: 16px;
border-radius: var(--radius-md); /* 12px */
border: 2px solid var(--forest-100);
background: white;
transition: all 0.2s ease;

/* Focus */
border-color: var(--forest-400);
box-shadow: 0 0 0 3px rgba(139, 154, 109, 0.1);
outline: none;

/* Error */
border-color: var(--coral-red);
box-shadow: 0 0 0 3px rgba(217, 120, 120, 0.1);

/* Disabled */
background: var(--gray-100);
color: var(--gray-400);
cursor: not-allowed;
```

---

### 標籤 (Badge)

```css
/* 預設 */
padding: 4px 12px;
font-size: 12px;
font-weight: 500;
border-radius: var(--radius-full);
background: var(--forest-100);
color: var(--forest-700);

/* 尺寸變體 */
/* Small */
padding: 2px 8px;
font-size: 10px;

/* Large */
padding: 6px 16px;
font-size: 14px;
```

---

### Modal / Dialog

```css
/* 背景遮罩 */
background: rgba(0, 0, 0, 0.5);
backdrop-filter: blur(4px);

/* Modal 容器 */
background: white;
border-radius: var(--radius-xl);
padding: var(--padding-xl);
box-shadow: var(--shadow-xl);
max-width: 90vw;
max-height: 90vh;
```

---

### Toast / 通知

```css
/* 容器 */
padding: 16px 20px;
border-radius: var(--radius-lg);
box-shadow: var(--shadow-lg);
min-width: 280px;

/* 成功 */
background: var(--success-bg);
border-left: 4px solid var(--success-border);
color: var(--success-text);

/* 錯誤 */
background: var(--error-bg);
border-left: 4px solid var(--error-border);
color: var(--error-text);
```

---

## 動畫效果

### 時間函數 (Timing Functions)

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### 動畫時長 (Duration)

```css
--duration-fast: 150ms; /* 快速反饋 */
--duration-normal: 200ms; /* 標準動畫 */
--duration-slow: 300ms; /* 複雜動畫 */
```

### 常用動畫

#### Fade In

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn var(--duration-normal) var(--ease-out);
}
```

#### Slide Up

```css
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-up {
  animation: slideUp var(--duration-normal) var(--ease-out);
}
```

#### Bounce

```css
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.bounce {
  animation: bounce 0.5s var(--ease-bounce);
}
```

#### Scale Press (按鈕按壓效果)

```css
.button:active {
  transform: scale(0.95);
  transition: transform var(--duration-fast) var(--ease-out);
}
```

---

## 響應式設計

### 斷點 (Breakpoints)

```css
/* Mobile First 策略 */
--screen-sm: 640px; /* 手機橫向 */
--screen-md: 768px; /* 平板直向 */
--screen-lg: 1024px; /* 平板橫向 / 小筆電 */
--screen-xl: 1280px; /* 桌面 */
--screen-2xl: 1536px; /* 大螢幕 */
```

### 使用範例

```css
/* 基礎樣式 (Mobile) */
.container {
  padding: 16px;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 24px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 32px;
    max-width: 1280px;
    margin: 0 auto;
  }
}
```

### 文字響應式

```css
/* 標題 */
h1 {
  font-size: 1.5rem; /* 24px mobile */
}

@media (min-width: 768px) {
  h1 {
    font-size: 1.875rem; /* 30px tablet */
  }
}

@media (min-width: 1024px) {
  h1 {
    font-size: 2.25rem; /* 36px desktop */
  }
}
```

---

## Tailwind CSS 配置

### tailwind.config.js

```javascript
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#F7F4EB",
          dark: "#EDE8DC",
          light: "#FDFBF5",
        },
        forest: {
          50: "#F0F4E8",
          100: "#E0E5D5",
          200: "#C8D4B5",
          300: "#A9BA8E",
          400: "#8B9A6D",
          500: "#6F7F4F",
          600: "#5F6F4A",
          700: "#4A5639",
          800: "#3A4429",
          900: "#2A311C",
        },
        earth: {
          50: "#FAF5EF",
          100: "#F0E8DB",
          200: "#E5D6C0",
          300: "#D4B896",
          400: "#C19E72",
          500: "#A68A64",
          600: "#8B7355",
          700: "#6F5C45",
          800: "#564736",
          900: "#3D3226",
        },
        accent: {
          blue: "#6B9BD1",
          purple: "#9B8FB9",
          orange: "#E89F5A",
          red: "#D97878",
        },
      },
      fontFamily: {
        sans: [
          "Noto Sans TC",
          "PingFang TC",
          "Microsoft JhengHei",
          "sans-serif",
        ],
        rounded: ["Varela Round", "Noto Sans TC", "sans-serif"],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
      boxShadow: {
        "soft-sm": "2px 2px 0px rgba(224, 229, 213, 0.8)",
        soft: "4px 4px 0px rgba(224, 229, 213, 0.8)",
        "soft-lg": "6px 6px 0px rgba(224, 229, 213, 0.8)",
        "soft-hover": "6px 6px 0px rgba(200, 212, 181, 0.9)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        100: "25rem",
      },
      animation: {
        "bounce-soft": "bounce-soft 0.5s ease-in-out",
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-in",
      },
      keyframes: {
        "bounce-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
```

---

## 設計資源

### 推薦字體來源

- **Noto Sans TC**: [Google Fonts](https://fonts.google.com/noto/specimen/Noto+Sans+TC)
- **Varela Round**: [Google Fonts](https://fonts.google.com/specimen/Varela+Round)

### 圖示資源

- **Font Awesome**: [fontawesome.com](https://fontawesome.com/)
- **Heroicons**: [heroicons.com](https://heroicons.com/) (輔助用)

### 設計工具

- **Figma**: 設計原型
- **Coolors**: [coolors.co](https://coolors.co/) - 配色工具
- **Realtime Colors**: [realtimecolors.com](https://realtimecolors.com/) - 即時預覽配色

---

## 無障礙設計 (Accessibility)

### 顏色對比度

確保所有文字與背景的對比度符合 WCAG 2.1 AA 標準：

- 一般文字：至少 4.5:1
- 大文字（18px+ 或 14px+ 粗體）：至少 3:1

### 測試工具

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools Lighthouse

### 語意化 HTML

- 使用正確的標籤 (`<button>`, `<nav>`, `<main>`, `<article>`)
- 為互動元素提供 `aria-label`
- 表單輸入框使用 `<label>`

---

## 暗色模式（未來擴充）

目前專注於淺色主題，暗色模式計畫在 v2.0 加入。

預計配色方向：

- 背景：深灰綠 `#1A2118`
- 卡片：灰綠 `#2A3528`
- 主色：淺森林綠 `#A9BA8E`

---

**設計系統版本**: 1.0.0  
**最後更新**: 2026-02-15  
**維護者**: Design Team
