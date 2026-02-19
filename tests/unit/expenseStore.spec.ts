import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useExpenseStore } from "../../src/stores/expenseStore";
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
  Timestamp: { now: vi.fn(() => ({ seconds: 123, nanoseconds: 456 })) },
}));

// Mock Firebase Auth
vi.mock("../../src/services/firebase", () => ({
  db: {},
  auth: { currentUser: { uid: "user-123" } },
}));

describe("Expense Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("初始化時應具備正確的初始狀態", () => {
    const store = useExpenseStore();
    expect(store.expenses).toEqual([]);
    expect(store.loading).toBe(false);
  });

  it("addExpense 應能正確新增項目", async () => {
    const store = useExpenseStore();
    const tripId = "trip-1";
    const newItem = {
      date: "2024-03-20",
      category: "Food",
      amount: 1000,
      currency: "TWD",
      description: "午餐",
      payer: "我",
      splitWith: ["我"],
    };

    await store.addExpense(tripId, newItem as any);

    expect(firestore.addDoc).toHaveBeenCalled();
    const addedData = (firestore.addDoc as any).mock.calls[0][1];
    expect(addedData.description).toBe("午餐");
    expect(addedData.createdAt).toBeDefined();
  });

  it("updateExpense 應能正確更新項目並過濾內部欄位", async () => {
    const store = useExpenseStore();
    const tripId = "trip-1";
    const expenseId = "exp-123";
    const updatedData = {
      id: expenseId,
      description: "更新描述",
      amount: 2000,
      createdAt: { seconds: 0, nanoseconds: 0 },
    };

    await store.updateExpense(tripId, expenseId, updatedData as any);

    expect(firestore.updateDoc).toHaveBeenCalled();
    const finalData = (firestore.updateDoc as any).mock.calls[0][1];
    expect(finalData.description).toBe("更新描述");
    expect(finalData.id).toBeUndefined();
    expect(finalData.createdAt).toBeUndefined();
  });

  it("deleteExpense 應能正確執行刪除", async () => {
    const store = useExpenseStore();
    await store.deleteExpense("trip-1", "exp-123");
    expect(firestore.deleteDoc).toHaveBeenCalled();
  });
});
