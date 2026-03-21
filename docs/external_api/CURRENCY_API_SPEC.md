# 匯率來源與 API 規格說明 (Currency API Spec)

本文件詳述 Travelogue 支援的三種匯率獲取方案。目前系統**主要採用台灣銀行 (BOT) 資料來源**，並提供 Visa 與 Mastercard 官網連結供使用者參考。

---

## 1. 台灣銀行 (Bank of Taiwan, BOT) - 現行採用方案

這是目前 Cloud Functions `getExchangeRate` 實際呼叫的來源。透過下載每日匯率 CSV 檔案進行解析。

### 1.1 資料來源

- **CSV 下載連結**: [https://rate.bot.com.tw/xrt/flcsv/0/day](https://rate.bot.com.tw/xrt/flcsv/0/day)
- **更新頻率**: 台灣銀行營業日即時更新。

### 1.2 CSV 格式分析

檔案編碼為 UTF-8 (或 Big5，程式內須處理)，以逗號分隔。關鍵欄位定義如下：

| 索引 (Index) | 欄位名稱 | 說明                                        |
| :----------- | :------- | :------------------------------------------ |
| 0            | 幣別     | 貨幣代碼 (如 USD, JPY, EUR)                 |
| 1            | 匯率類型 | "本行買入" 或 "本行賣出"                    |
| 12           | 現金賣出 | 臨櫃換匯使用的價格                          |
| 13           | 即期賣出 | 帳戶交易或信用卡換算參考價格 (系統優先採用) |

**解析邏輯**:

- 系統讀取第 13 欄 (即期賣出)，若該值為 `0` 或空值，則回退使用第 12 欄 (現金賣出)。
- 計算台幣 (TWD) 對外幣或外幣對外幣的匯率。

---

## 2. Visa 匯率計算器

由於 Visa API 具備嚴格的瀏覽器預檢 (Preflight) 與安全性限制，後端直接請求容易被阻擋，目前作為「外部連結」供用戶手動查詢。

### 2.1 官方網站

[Visa Currency Exchange Calculator](https://usa.visa.com/support/consumer/travel-support/exchange-rate-calculator.html)

### 2.2 API 格式 (參考)

```http
GET https://usa.visa.com/cmsapi/fx/rates?amount=1.0&fee=0&utcConvertedDate=MM%2FDD%2FYYYY&exchangedate=MM%2FDD%2FYYYY&fromCurr=TWD&toCurr=JPY
```

### 2.3 回傳範例

```json
{
  "originalValues": {
    "fromCurrency": "JPY",
    "fxRateVisa": "0.2023890713",
    "lastUpdatedVisaRate": 1772841026
  },
  "status": "success"
}
```

---

## 3. Mastercard 匯率計算器

同樣具備嚴格的 API 限制，目前作為「外部連結」提供。

### 3.1 官方網站

[Mastercard Currency Converter](https://www.mastercard.com/content/mastercardcom/global/en/personal/get-support/convert-currency.html)

### 3.2 API 格式 (參考)

```http
GET https://www.mastercard.com/settlement/currencyrate/conversion-rate?fxDate=YYYY-MM-DD&transCurr=JPY&crdhldBillCurr=TWD&bankFee=0&transAmt=1.0
```

### 3.3 回傳範例

```json
{
  "data": {
    "conversionRate": 0.2025326,
    "fxDate": "2026-03-08",
    "transCurr": "JPY",
    "crdhldBillCurr": "TWD"
  }
}
```

---

## 4. 方案比較與選型建議

| 維度         | 台灣銀行 (BOT)       | Visa / Mastercard        |
| :----------- | :------------------- | :----------------------- |
| **可存取性** | 高 (開放 CSV 連結)   | 低 (嚴格 Web 防護)       |
| **精準度**   | 國內銀行換匯基準     | 信用卡實際刷卡基準       |
| **系統角色** | **自動計算引擎來源** | **詳細說明與外部參考**   |
| **手續費**   | 不含手續費           | 可選 1.5% 國際手續費試算 |
