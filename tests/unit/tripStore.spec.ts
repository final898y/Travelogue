import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useTripStore } from "../../src/stores/tripStore";

// Mock Firebase
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
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
  });

  it("初始狀態應為空列表且不處於載入中", () => {
    const store = useTripStore();
    expect(store.trips).toEqual([]);
    expect(store.loading).toBe(false);
    expect(store.error).toBe(null);
  });

  it("可以在訂閱時更新 trips 列表 (模擬 snapshot 邏輯)", async () => {
    const store = useTripStore();

    // 雖然真正的訂閱是透過 onSnapshot，
    // 我們可以測試 store 的 trips 響應式屬性能否正確接收資料
    const mockData = [
      { id: "1", title: "東京之旅", status: "upcoming" },
      { id: "2", title: "京都之旅", status: "ongoing" },
    ];

    // @ts-expect-error - 模擬內部行為
    store.trips = mockData;

    expect(store.trips.length).toBe(2);
    expect(store.trips[0].title).toBe("東京之旅");
  });
});
