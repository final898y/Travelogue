import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions";
import * as logger from "firebase-functions/logger";

// 初始化 Admin SDK
initializeApp();

// 全局設定：限制實例數量以控制預算
setGlobalOptions({ maxInstances: 5, region: "asia-east1" });

/**
 * 取得匯率雲端函式 (改由台灣銀行資料來源)
 */
export const getExchangeRate = onCall(
  {
    cors: ["https://travelogue.final898y.com", "http://localhost:5173"],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "請先登入後再查詢匯率");
    }

    const { from, to, forceUpdate = false } = request.data;
    if (!from || !to) {
      throw new HttpsError("invalid-argument", "缺少必要的幣別參數");
    }

    // 取得今日日期
    const now = new Date();
    const todayISO = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const cacheId = `BOT_RATES_${todayISO}`;
    const db = getFirestore();
    const cacheRef = db.collection("exchange_rates_cache").doc(cacheId);

    try {
      let rates: Record<string, number> = {};

      if (!forceUpdate) {
        const cacheSnap = await cacheRef.get();
        if (cacheSnap.exists) {
          const cacheData = cacheSnap.data();
          if (cacheData?.date === todayISO) {
            logger.info(`Cache Hit: ${cacheId}`);
            rates = cacheData.rates;
          }
        }
      }

      if (Object.keys(rates).length === 0) {
        logger.info("Fetching from Bank of Taiwan CSV...");
        const botUrl = "https://rate.bot.com.tw/xrt/flcsv/0/day";
        const response = await fetch(botUrl);

        if (!response.ok) {
          throw new Error(`BOT API 請求失敗: ${response.status}`);
        }

        const csvText = await response.text();
        const lines = csvText.split("\n");

        // 解析 CSV (從第 1 行開始，跳過標題)
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",");
          if (cols.length < 14) continue;

          const currency = cols[0].trim();
          // 優先使用即期賣出 (第 13 欄)，若為 0 則使用現金賣出 (第 12 欄)
          let rateValue = parseFloat(cols[13]);
          if (isNaN(rateValue) || rateValue === 0) {
            rateValue = parseFloat(cols[12]);
          }

          if (!isNaN(rateValue) && rateValue !== 0) {
            rates[currency] = rateValue;
          }
        }

        // 寫入快取
        await cacheRef.set({
          date: todayISO,
          timestamp: Date.now(),
          rates,
          provider: "BOT",
        });
      }

      // 計算匯率
      // 如果 from 是 TWD，則 rate = 1 / rates[to]
      // 如果 to 是 TWD，則 rate = rates[from]
      // 如果兩者都不是 TWD，則先換成台幣再換成目標幣別: rate = rates[from] / rates[to]
      let finalRate = 0;
      if (from === "TWD") {
        finalRate = 1 / (rates[to] || 0);
      } else if (to === "TWD") {
        finalRate = rates[from] || 0;
      } else {
        const fromInTwd = rates[from] || 0;
        const toInTwd = rates[to] || 0;
        finalRate = fromInTwd / toInTwd;
      }

      if (!finalRate || isFinite(finalRate) === false) {
        throw new Error(`無法計算 ${from} 到 ${to} 的匯率`);
      }

      return {
        from,
        to,
        rate: parseFloat(finalRate.toFixed(6)),
        timestamp: Date.now(),
        date: todayISO,
        provider: "Bank of Taiwan",
        source: Object.keys(rates).length > 0 ? "api" : "cache",
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "匯率查詢暫時無法使用";
      logger.error("Exchange Rate Error:", error);
      throw new HttpsError("internal", errorMessage);
    }
  },
);
