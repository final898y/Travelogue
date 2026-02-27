# 天氣預報功能技術規範 (Weather Integration Spec)

本文件定義了如何整合 OpenWeatherMap API 與 Google Geocoding API，為旅程計畫提供氣候資訊。

## 1. 資料結構變更 (Data Schema)

為了存儲每一天的主要地點資訊，需修改 `src/types/trip.ts` 中的 `DailyPlanSchema`。

### DailyPlanSchema 擴充

- `locationName` (string, optional): 該日的主要地點名稱。用於 UI 顯示與搜尋。
- `coordinates` (CoordinatesSchema, optional): 該地點的經緯度。**API 請求的核心參數**。
- `placeId` (string, optional): Google Place ID。用於確保地點的唯一性與重新查詢。

**預設邏輯 (Defaulting Logic)：**

1. 若當天無手動設置，系統自動抓取當天 `activities[0]` 的 `location`, `coordinates` 與 `placeId` 作為該日天氣基準。
2. 使用者手動設置時，透過搜尋介面呼叫 Geocoding API 取得最新座標。

---

## 2. 後端代理與快取 (Cloudflare Workers)

為確保 API Key 不外洩，建立一個統一的代理入口處理天氣與地理資訊。

### A. OpenWeatherMap Proxy (`/weather`)

- **參數**：`lat`, `lon`, `date`
- **功能**：獲取氣象資料。
- **快取**：1 小時。

### B. Google Geocoding Proxy (`/geocode`)

- **參數**：`address` (地名) 或 `place_id`
- **功能**：將地名轉換為 `lat`, `lon` 與標準化的 `display_name`。
- **快取**：24 小時（地點座標鮮少變動，長效快取可大幅節省 Google API 配額費用）。
- **安全性**：Worker 內建 `GOOGLE_MAPS_API_KEY`，僅接受來自專案網域的請求。

---

## 3. 前端獲取流程 (Data Flow)

當需要更新某日天氣且缺少座標時，遵循以下流程：

1. **地名轉座標**：呼叫 `Worker /geocode?address={locationName}`。
2. **存入資料庫**：將回傳的 `lat`, `lon` 與正確的 `locationName` 更新回該日的 `DailyPlan`（避免下次重複轉譯）。
3. **獲取天氣**：使用取得的座標呼叫 `Worker /weather`。

---

## 4. UI 呈現 (UI / UX)

### 圖示規範 (Icons)

使用 `lucide-vue-next`：

- `Sunny` -> `<Sun />`
- `Clouds` -> `<Cloud />`
- `Rain` -> `<CloudRain />`
- `Thunderstorm` -> `<CloudLightning />`
- `Snow` -> `<CloudSnow />`

### 設置介面

- 在 `PlanHeader.vue` 或其下方增加一個地點標籤。
- 點擊標籤彈出 `BaseBottomSheet`：
  - 提供一個輸入框進行地點搜尋。
  - 搜尋時呼叫 `/geocode` 代理。
  - 選定後更新 `DailyPlan` 並觸發天氣重新抓取。

---

## 5. 安全性與限制 (Security & Limits)

- **API 費用優化**：透過 Worker 快取減少 Google Geocoding API 的呼叫次數（Google 按次計費較貴）。
- **地圖配額**：本功能僅使用 Geocoding (Web Service)，不需載入完整的 Google Maps JS SDK，降低載入負擔。

---

**Version**: 1.2.0
**Last Updated**: 2026-02-24
