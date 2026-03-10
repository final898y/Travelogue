import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions";
import * as logger from "firebase-functions/logger";

// 初始化 Admin SDK
initializeApp();

// 全局設定：限制實例數量以控制預算
setGlobalOptions({ maxInstances: 10, region: "asia-east1" });

/**
 * Visa API 回傳結構
 */
interface VisaResponse {
  originalValues: {
    fromCurrency: string;
    toCurrency: string;
    fxRateVisa: string;
    lastUpdatedVisaRate: number;
  };
  status: string;
}

/**
 * Mastercard API 回傳結構
 */
interface MastercardResponse {
  data: {
    conversionRate: number;
    fxDate: string;
    transCurr: string;
    crdhldBillCurr: string;
  };
}

/**
 * 取得匯率雲端函式
 */
export const getExchangeRate = onCall(
  {
    cors: ["https://travelogue.final898y.com", "http://localhost:5173"],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "請先登入後再查詢匯率");
    }

    const { from, to, provider = "Visa", forceUpdate = false } = request.data;
    if (!from || !to) {
      throw new HttpsError("invalid-argument", "缺少必要的幣別參數");
    }

    // 取得今日日期
    const now = new Date();
    const todayISO = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const cacheId = `${from}_${to}_${provider}_${todayISO}`;
    const db = getFirestore();
    const cacheRef = db.collection("exchange_rates_cache").doc(cacheId);

    try {
      if (!forceUpdate) {
        const cacheSnap = await cacheRef.get();
        if (cacheSnap.exists) {
          const cacheData = cacheSnap.data();
          if (cacheData?.date === todayISO) {
            logger.info(`Cache Hit: ${cacheId}`);
            return { ...cacheData, source: "cache" };
          }
        }
      }

      logger.info(`Fetching from API: ${provider} (${from}->${to})`);
      let rate = 0;

      if (provider === "Visa") {
        // Visa 使用 MM/DD/YYYY
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const yyyy = now.getFullYear();
        const visaDate = `${mm}/${dd}/${yyyy}`;

        const visaUrl = `https://usa.visa.com/cmsapi/fx/rates?amount=1.0&fee=0&utcConvertedDate=${visaDate}&exchangedate=${visaDate}&fromCurr=${from}&toCurr=${to}`;
        const response = await fetch(visaUrl, {
          headers: { "User-Agent": "Mozilla/5.0" },
        });
        if (!response.ok) throw new Error("Visa API 請求失敗");
        const apiData = (await response.json()) as VisaResponse;
        rate = parseFloat(apiData.originalValues.fxRateVisa);
      } else if (provider === "Mastercard") {
        // Mastercard 使用 YYYY-MM-DD
        const mcUrl = `https://www.mastercard.com/settlement/currencyrate/conversion-rate?fxDate=${todayISO}&transCurr=${from}&crdhldBillCurr=${to}&bankFee=0&transAmt=1.0`;
        const response = await fetch(mcUrl, {
          headers: { "User-Agent": "Mozilla/5.0" },
        });
        if (!response.ok) throw new Error("Mastercard API 請求失敗");
        const apiData = (await response.json()) as MastercardResponse;
        rate = apiData.data.conversionRate;
      } else {
        throw new HttpsError("invalid-argument", "不支援的匯率組織");
      }

      if (!rate || isNaN(rate)) {
        throw new Error("無法解析匯率數據");
      }

      const result = {
        from,
        to,
        rate,
        timestamp: Date.now(),
        date: todayISO,
        provider,
      };

      await cacheRef.set(result);
      return { ...result, source: "api" };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "匯率查詢暫時無法使用";
      logger.error("Exchange Rate Error:", error);
      throw new HttpsError("internal", errorMessage);
    }
  },
);
