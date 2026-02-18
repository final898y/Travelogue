import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useTripStore } from "../../src/stores/tripStore";
import { getDocs, getDoc, addDoc, onSnapshot } from "firebase/firestore";
import { auth } from "../../src/services/firebase";

// Mock Firebase
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(() => ({ id: "mock-coll" })),
  query: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  Timestamp: { now: () => ({ seconds: 123456789, nanoseconds: 0 }) },
}));

vi.mock("../../src/services/firebase", () => ({
  db: {},
  auth: { currentUser: null }, // 預設未登入
}));

// 建立符合 Zod Schema 的 Mock 資料
const createMockTrip = (id: string, title: string) => ({
  id,
  userId: "user-123",
  title,
  startDate: "2024-01-01",
  endDate: "2024-01-05",
  days: 5,
  status: "upcoming",
  coverImage: "https://example.com/image.jpg",
});

describe("Trip Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    (auth as unknown as { currentUser: any }).currentUser = null; // 重置登入狀態
  });

  it("fetchTrips - 未登入時應不執行動作", async () => {
    const store = useTripStore();
    await store.fetchTrips();
    expect(getDocs).not.toHaveBeenCalled();
    expect(store.loading).toBe(false);
  });

  it("fetchTrips - 登入後應從 Firestore 獲取資料並排序", async () => {
    (auth as unknown as { currentUser: any }).currentUser = { uid: "user-123" };
    const store = useTripStore();
    const mockDocs = [
      { id: "trip-1", data: () => createMockTrip("trip-1", "Trip 1") },
    ];

    (getDocs as vi.Mock).mockResolvedValueOnce({ docs: mockDocs });

    await store.fetchTrips();

    expect(store.trips).toHaveLength(1);
    expect(store.trips[0].title).toBe("Trip 1");
    expect(store.loading).toBe(false);
  });

  it("fetchTripById - 登入後應回傳指定行程", async () => {
    (auth as unknown as { currentUser: any }).currentUser = { uid: "user-123" };
    const store = useTripStore();
    (getDoc as vi.Mock).mockResolvedValueOnce({
      exists: () => true,
      id: "trip-1",
      data: () => createMockTrip("trip-1", "Single Trip"),
    });

    const result = await store.fetchTripById("trip-1");
    expect(result?.title).toBe("Single Trip");
  });

  it("addTrip - 應包含 userId 並呼叫 addDoc", async () => {
    (auth as unknown as { currentUser: any }).currentUser = { uid: "user-123" };
    const store = useTripStore();
    (addDoc as vi.Mock).mockResolvedValueOnce({ id: "new-trip-id" });

    const newTrip = {
      title: "New Trip",
      startDate: "2024-01-01",
      endDate: "2024-01-05",
      days: 5,
      status: "upcoming",
    } as any;
    const id = await store.addTrip(newTrip);

    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        title: "New Trip",
        userId: "user-123",
      }),
    );
    expect(id).toBe("new-trip-id");
  });

  it("addExpense - 應正確指向子集合並新增資料", async () => {
    const store = useTripStore();
    (addDoc as vi.Mock).mockResolvedValueOnce({ id: "exp-123" });

    const expense = {
      amount: 100,
      category: "Food",
    } as any;
    await store.addExpense("trip-1", expense);

    expect(addDoc).toHaveBeenCalled();
  });

  it("addCollection - 應正確指向資料收集子集合", async () => {
    const store = useTripStore();
    (addDoc as vi.Mock).mockResolvedValueOnce({ id: "coll-123" });

    const item = {
      name: "Cool Spot",
      type: "spot",
    } as any;
    await store.addCollection("trip-1", item);

    expect(addDoc).toHaveBeenCalled();
  });

  it("subscribeToTrips - 未登入時應回傳空函式", () => {
    const store = useTripStore();
    const unsubscribe = store.subscribeToTrips();
    expect(onSnapshot).not.toHaveBeenCalled();
    expect(typeof unsubscribe).toBe("function");
  });
});
