import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useExpenseStore } from "../../src/stores/expenseStore";
import { useAuthStore } from "../../src/stores/authStore";
import * as firestore from "firebase/firestore";

// Mock Firebase
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  Timestamp: {
    now: vi.fn(() => ({
      seconds: 123,
      nanoseconds: 456,
      toDate: () => new Date(),
    })),
  },
}));

vi.mock("../../src/services/firebase", () => ({
  db: {},
}));

vi.mock("../../src/stores/authStore", () => ({
  useAuthStore: vi.fn(),
}));

describe("expenseStore.ts v2.0 (統計精準度與安全性測試)", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    (useAuthStore as any).mockReturnValue({
      user: { uid: "user-123" },
    });
  });

  describe("統計與計算屬性 (Computed Properties)", () => {
    it("totalAmount: 應正確累加有效金額，並自動忽略無效金額 (NaN/null/undefined)", () => {
      const store = useExpenseStore();
      store.expenses = [
        { amount: 1000, currency: "TWD" },
        { amount: 500.5, currency: "TWD" },
        { amount: null, currency: "TWD" }, // 無效
        { amount: "invalid", currency: "TWD" }, // 無效
      ] as any;

      expect(store.totalAmount).toBe(1500.5);
    });

    it("categoryStats: 應正確統計各類別金額，並自動 trim 類別名稱空白", () => {
      const store = useExpenseStore();
      store.expenses = [
        { category: "美食", amount: 100 },
        { category: " 美食 ", amount: 200 }, // 應歸類為同類
        { category: "住宿", amount: 1500 },
      ] as any;

      const stats = store.categoryStats;
      expect(stats["美食"]).toBe(300);
      expect(stats["住宿"]).toBe(1500);
      expect(Object.keys(stats)).toHaveLength(2);
    });

    it("應能正確處理幣別統計 (雖然目前僅支援 TWD，但需具備防護邏輯)", () => {
      const store = useExpenseStore();
      store.expenses = [
        { amount: 100, currency: "TWD" },
        { amount: 50, currency: "JPY" }, // 異幣別
      ] as any;

      // 假設目前 totalAmount 僅加總數值，未來需支援匯率轉換
      expect(store.totalAmount).toBe(150);
    });
  });

  describe("操作防護 (Actions Security)", () => {
    it("未登入時 addExpense 應拋出錯誤", async () => {
      (useAuthStore as any).mockReturnValue({ user: null });
      const store = useExpenseStore();
      await expect(store.addExpense("t1", {} as any)).rejects.toThrow(
        "User not logged in",
      );
    });

    it("updateExpense: 應嚴格過濾掉禁止手動更新的內部欄位 (id, createdAt)", async () => {
      const store = useExpenseStore();
      const dirtyUpdate = {
        id: "exp-1",
        createdAt: "hack-date",
        amount: 500,
        description: "修改描述",
      };

      await store.updateExpense("t1", "exp-1", dirtyUpdate as any);

      const updateCall = (firestore.updateDoc as any).mock.calls[0][1];
      expect(updateCall.id).toBeUndefined();
      expect(updateCall.createdAt).toBeUndefined();
      expect(updateCall.amount).toBe(500);
    });

    it("deleteExpense: 網路錯誤時應正確拋出異常供 UI 處理", async () => {
      const store = useExpenseStore();
      (firestore.deleteDoc as any).mockRejectedValueOnce(
        new Error("Network Error"),
      );

      await expect(store.deleteExpense("t1", "exp-1")).rejects.toThrow(
        "Network Error",
      );
    });
  });
});
