# 信用卡國際匯率 API 說明

本文檔整理了 **Visa** 與 **Mastercard** 官方網站提供的匯率查詢 API，包含範例呼叫與回傳 JSON 格式。

---

## Visa Currency Exchange API

**官方網站**  
[Visa Currency Exchange Calculator](https://usa.visa.com/support/consumer/travel-support/exchange-rate-calculator.html)

**API 範例呼叫**

```http
https://usa.visa.com/cmsapi/fx/rates?amount=1000&fee=0&utcConvertedDate=03%2F09%2F2026&exchangedate=03%2F09%2F2026&fromCurr=TWD&toCurr=JPY
```

**回傳 JSON 範例**

```json
{
  "originalValues": {
    "fromCurrency": "JPY",
    "fromCurrencyName": "Japanese Yen",
    "toCurrency": "TWD",
    "toCurrencyName": "New Taiwan Dollar",
    "asOfDate": 1773014400,
    "fromAmount": "1000",
    "toAmountWithVisaRate": "202.389071",
    "toAmountWithAdditionalFee": "202.389071",
    "fxRateVisa": "0.2023890713",
    "fxRateWithAdditionalFee": "0.2023890713",
    "lastUpdatedVisaRate": 1772841026,
    "benchmarks": []
  },
  "conversionAmountValue": "1000",
  "conversionBankFee": "0.0",
  "conversionInputDate": "03/09/2026",
  "conversionFromCurrency": "TWD",
  "conversionToCurrency": "JPY",
  "status": "success"
}
```

---

## Mastercard Currency Conversion API

**官方網站**  
[Mastercard Currency Converter](https://www.mastercard.com/content/mastercardcom/global/en/personal/get-support/convert-currency.html)

**API 範例呼叫**

```http
https://www.mastercard.com/settlement/currencyrate/conversion-rate?fxDate=2026-03-09&transCurr=JPY&crdhldBillCurr=TWD&bankFee=0&transAmt=1000
```

**回傳 JSON 範例**

```json
{
  "name": "settlement-conversion-rate",
  "description": "Settlement conversion rate and billing amount",
  "date": "2026-03-09 15:12:29",
  "data": {
    "conversionRate": 0.2025326,
    "crdhldBillAmt": 202.5326,
    "fxDate": "2026-03-08",
    "transCurr": "JPY",
    "crdhldBillCurr": "TWD",
    "transAmt": 1000
  }
}
```
