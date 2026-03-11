import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useExchangeStore } from "../../src/stores/exchangeStore";

// 模擬 Firebase Functions
vi.mock("firebase/functions", () => ({
  httpsCallable: vi.fn(() => 
    vi.fn(() => Promise.resolve({
      data: {
        from: "TWD",
        to: "JPY",
        rate: 4.5,
        timestamp: Date.now(),
        date: "2026-03-11",
        provider: "Bank of Taiwan",
        source: "api"
      }
    }))
  ),
  getFunctions: vi.fn()
}));

// 模擬 Firebase Service
vi.mock("../../src/services/firebase", () => ({
  functions: {}
}));

describe("exchangeStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("初始狀態應為正確的預設值", () => {
    const store = useExchangeStore();
    expect(store.lastUsed).toEqual({
      from: "TWD",
      to: "JPY",
      provider: "BOT"
    });
    expect(store.ratesCache).toEqual({});
  });

  describe("loadHistory", () => {
    it("當 LocalStorage 為空時，應保留預設值", () => {
      const store = useExchangeStore();
      store.loadHistory();
      expect(store.lastUsed.provider).toBe("BOT");
    });

    it("當載入損壞的 JSON 時，應優雅處理而不崩潰", () => {
      localStorage.setItem("travelogue_exchange_history", "{ invalid json }");
      const store = useExchangeStore();
      
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      store.loadHistory();
      
      expect(consoleSpy).toHaveBeenCalled();
      expect(store.lastUsed.from).toBe("TWD"); // 應保持預設
      consoleSpy.mockRestore();
    });

    it("應正確載入儲存的歷史紀錄", () => {
      const saved = { from: "USD", to: "TWD", provider: "BOT" };
      localStorage.setItem("travelogue_exchange_history", JSON.stringify(saved));
      
      const store = useExchangeStore();
      store.loadHistory();
      
      expect(store.lastUsed.from).toBe("USD");
      expect(store.lastUsed.to).toBe("TWD");
    });

    it("邊界情境：當舊資料為 Visa/Mastercard 時，應強制轉換為 BOT", () => {
      const legacyData = { from: "TWD", to: "EUR", provider: "Visa" };
      localStorage.setItem("travelogue_exchange_history", JSON.stringify(legacyData));
      
      const store = useExchangeStore();
      store.loadHistory();
      
      expect(store.lastUsed.provider).toBe("BOT");
      expect(store.lastUsed.from).toBe("TWD");
    });
  });

  describe("fetchRate", () => {
    it("呼叫 fetchRate 後應更新快取與最後使用紀錄", async () => {
      const store = useExchangeStore();
      const result = await store.fetchRate("TWD", "JPY");

      expect(result.rate).toBe(4.5);
      expect(store.lastUsed.from).toBe("TWD");
      expect(store.lastUsed.to).toBe("JPY");
      
      // 檢查快取 key 格式是否正確
      const cacheKey = "TWD_JPY_BOT";
      expect(store.ratesCache[cacheKey]).toBeDefined();
      expect(store.ratesCache[cacheKey].rate).toBe(4.5);
    });

    it("持久化：fetchRate 成功後應自動更新 LocalStorage", async () => {
      const store = useExchangeStore();
      await store.fetchRate("USD", "TWD");

      const saved = JSON.parse(localStorage.getItem("travelogue_exchange_history") || "{}");
      expect(saved.from).toBe("USD");
      expect(saved.to).toBe("TWD");
      expect(saved.provider).toBe("BOT");
    });
  });
});
