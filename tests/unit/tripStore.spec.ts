import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useTripStore } from "../../src/stores/tripStore";

// Mock Firebase
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(() => Promise.resolve({ id: "new-doc-id" })),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  Timestamp: {
    now: () => "mock-timestamp",
  },
}));

vi.mock("../../src/services/firebase", () => ({
  db: {},
}));

describe("Trip Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("初始狀態應為空列表且不處於載入中", () => {
    const store = useTripStore();
    expect(store.trips).toEqual([]);
    expect(store.loading).toBe(false);
    expect(store.error).toBe(null);
  });

  it("fetchTripById 應正確呼叫 getDoc 並回傳資料", async () => {
    const store = useTripStore();
    const { getDoc, doc } = await import("firebase/firestore");
    
    (getDoc as any).mockResolvedValueOnce({
      exists: () => true,
      id: "trip-123",
      data: () => ({ title: "測試旅程" })
    });

    const result = await store.fetchTripById("trip-123");
    
    expect(doc).toHaveBeenCalled();
    expect(result?.title).toBe("測試旅程");
    expect(result?.id).toBe("trip-123");
  });

  it("addExpense 應正確呼叫 addDoc 並指向子集合", async () => {
    const store = useTripStore();
    const { addDoc, collection } = await import("firebase/firestore");
    
    const expenseData = {
      date: "2024-03-20",
      category: "Food",
      amount: 500,
      currency: "TWD",
      description: "Dinner"
    };

    await store.addExpense("trip-123", expenseData);
    
    expect(collection).toHaveBeenCalledWith(expect.anything(), "trips", "trip-123", "expenses");
    expect(addDoc).toHaveBeenCalled();
  });

  it("addCollection 應正確呼叫 addDoc 並指向子集合", async () => {
    const store = useTripStore();
    const { addDoc, collection } = await import("firebase/firestore");
    
    const collectionData = {
      title: "Threads 貼文",
      url: "https://threads.net/...",
      source: "threads" as const,
      category: "Food"
    };

    await store.addCollection("trip-123", collectionData);
    
    expect(collection).toHaveBeenCalledWith(expect.anything(), "trips", "trip-123", "collections");
    expect(addDoc).toHaveBeenCalled();
  });
});
