import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { httpsCallable } from "firebase/functions";
import { functions } from "../services/firebase";

export interface ExchangeRateResult {
  from: string;
  to: string;
  rate: number;
  timestamp: number;
  date: string;
  provider: string;
  source: "cache" | "api";
}

export const useExchangeStore = defineStore("exchange", () => {
  const lastUsed = ref({
    from: "TWD",
    to: "JPY",
    provider: "Visa",
  });

  const ratesCache = ref<Record<string, ExchangeRateResult>>({});

  // 從 LocalStorage 載入歷史紀錄
  const loadHistory = () => {
    const saved = localStorage.getItem("travelogue_exchange_history");
    if (saved) {
      try {
        lastUsed.value = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse exchange history", e);
      }
    }
  };

  // 儲存歷史紀錄至 LocalStorage
  const saveHistory = () => {
    localStorage.setItem(
      "travelogue_exchange_history",
      JSON.stringify(lastUsed.value),
    );
  };

  // 監聽變動自動儲存
  watch(lastUsed, saveHistory, { deep: true });

  const fetchRate = async (
    from: string,
    to: string,
    provider: string,
    forceUpdate = false,
  ): Promise<ExchangeRateResult> => {
    const getExchangeRate = httpsCallable(functions, "getExchangeRate");

    const result = await getExchangeRate({
      from,
      to,
      provider,
      forceUpdate,
    });

    const data = result.data as ExchangeRateResult;

    // 更新快取與最後使用紀錄
    const cacheKey = `${from}_${to}_${provider}`;
    ratesCache.value[cacheKey] = data;

    lastUsed.value = { from, to, provider };

    return data;
  };

  return {
    lastUsed,
    ratesCache,
    loadHistory,
    fetchRate,
  };
});
