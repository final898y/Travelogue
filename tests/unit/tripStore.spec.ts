import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useTripStore } from "../../src/stores/tripStore";
import { addDoc, onSnapshot, updateDoc, getDocs } from "firebase/firestore";
import { auth } from "../../src/services/firebase";

// Mock Firebase
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(() => ({ id: "mock-coll" })),
  query: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  doc: vi.fn(() => ({ id: "mock-doc" })),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn((_q, _cb) => {
    // 預設不自動觸發 callback，除非在測試中手動呼叫
    return vi.fn();
  }),
  Timestamp: { now: () => ({ seconds: 123456789, nanoseconds: 0 }) },
}));

vi.mock("../../src/services/firebase", () => ({
  db: {},
  auth: { currentUser: null },
}));

describe("Trip Store (Refactored)", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    (auth as any).currentUser = null;
  });

  it("subscribeToTrips - 登入後應啟動監聽並更新 trips 狀態", async () => {
    (auth as any).currentUser = { uid: "user-123" };
    const store = useTripStore();

    // 模擬 onSnapshot 的觸發
    let snapshotCallback: any;
    (onSnapshot as vi.Mock).mockImplementation((_q, cb) => {
      snapshotCallback = cb;
      return vi.fn();
    });

    store.subscribeToTrips();

    const mockData = {
      id: "trip-1",
      userId: "user-123",
      title: "東京之旅",
      startDate: "2024-01-01",
      endDate: "2024-01-05",
      days: 5,
      status: "upcoming",
    };

    // 手動觸發 callback
    snapshotCallback({
      docs: [{ id: "trip-1", data: () => mockData }],
    });

    expect(store.trips).toHaveLength(1);
    expect(store.trips[0].title).toBe("東京之旅");
  });

  it("subscribeToPlans - 應將監聽到的行程存入 currentTripPlans", () => {
    const store = useTripStore();
    let snapshotCallback: any;
    (onSnapshot as vi.Mock).mockImplementation((_q, cb) => {
      snapshotCallback = cb;
      return vi.fn();
    });

    store.subscribeToPlans("trip-1");

    const mockPlan = {
      tripId: "trip-1",
      date: "2024-01-01",
      activities: [
        { id: "a1", time: "09:00", title: "景點", category: "sight" },
      ],
    };

    snapshotCallback({
      docs: [{ id: "plan-1", data: () => mockPlan }],
    });

    expect(store.currentTripPlans).toHaveLength(1);
    expect(store.currentTripPlans[0].date).toBe("2024-01-01");
  });

  it("updateTripActivity - 新增活動時應呼叫 addDoc 並生成 ID", async () => {
    (auth as any).currentUser = { uid: "user-123" };
    const store = useTripStore();

    // 模擬 getDocs 回傳空 (表示該日期尚無 plan)
    (getDocs as vi.Mock).mockResolvedValueOnce({ empty: true });
    (addDoc as vi.Mock).mockResolvedValueOnce({ id: "new-plan-id" });

    const newActivity: any = {
      time: "10:00",
      title: "逛街",
      category: "sight",
    };
    await store.updateTripActivity("trip-1", "2024-01-01", newActivity);

    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        tripId: "trip-1",
        date: "2024-01-01",
        activities: expect.arrayContaining([
          expect.objectContaining({ title: "逛街", id: expect.any(String) }),
        ]),
      }),
    );
  });

  it("addExpense - 未登入時應拋出錯誤", async () => {
    const store = useTripStore();
    await expect(store.addExpense("trip-1", {} as any)).rejects.toThrow(
      "User not logged in",
    );
  });

  it("addExpense - 登入後應正確新增至 expenses 子集合", async () => {
    (auth as any).currentUser = { uid: "user-123" };
    const store = useTripStore();
    (addDoc as vi.Mock).mockResolvedValueOnce({ id: "exp-1" });

    const expense = {
      date: "2024-01-01",
      amount: 500,
      currency: "TWD",
      description: "午餐",
      category: "Food",
    };

    await store.addExpense("trip-1", expense);

    expect(addDoc).toHaveBeenCalled();
  });

  it("deleteTripActivity - 應呼叫 updateDoc 移除特定活動", async () => {
    (auth as any).currentUser = { uid: "user-123" };
    const store = useTripStore();

    // 模擬已存在的行程
    const existingPlan = {
      tripId: "trip-1",
      date: "2024-01-01",
      activities: [
        { id: "a1", time: "09:00", title: "活動1", category: "sight" },
        { id: "a2", time: "12:00", title: "活動2", category: "food" },
      ],
    };

    (getDocs as vi.Mock).mockResolvedValueOnce({
      empty: false,
      docs: [{ id: "doc-123", data: () => existingPlan }],
    });

    await store.deleteTripActivity("trip-1", "2024-01-01", "a1");

    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        activities: [
          { id: "a2", time: "12:00", title: "活動2", category: "food" },
        ],
      }),
    );
  });
});
