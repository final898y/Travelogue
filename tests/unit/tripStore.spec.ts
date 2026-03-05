import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useTripStore } from "../../src/stores/tripStore";
import { useAuthStore } from "../../src/stores/authStore";
import * as firestore from "firebase/firestore";

// Mock Firebase
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  getDoc: vi.fn(),
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

describe("tripStore.ts v2.0 (資料分類與防護測試)", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    // Default mock user (Email priority)
    (useAuthStore as any).mockReturnValue({
      user: { uid: "user-123", email: "user@test.com" },
    });
  });

  describe("初始狀態", () => {
    it("應具備預設空狀態與分類", () => {
      const store = useTripStore();
      expect(store.trips).toEqual([]);
      expect(store.ongoingTrips).toEqual([]);
      expect(store.upcomingTrips).toEqual([]);
      expect(store.finishedTrips).toEqual([]);
    });
  });

  describe("資料分類 (Computed Properties)", () => {
    it("應根據 status 正確分類旅程並依 startDate 排序", () => {
      const store = useTripStore();
      store.trips = [
        {
          id: "1",
          title: "進行中 A",
          status: "ongoing",
          startDate: "2024-05-01",
        },
        {
          id: "2",
          title: "未來 B",
          status: "upcoming",
          startDate: "2024-06-01",
        },
        {
          id: "3",
          title: "未來 C",
          status: "upcoming",
          startDate: "2024-05-15",
        }, // C 比 B 早
        {
          id: "4",
          title: "已結束 D",
          status: "finished",
          startDate: "2024-04-01",
        },
      ] as any;

      expect(store.ongoingTrips).toHaveLength(1);
      expect(store.upcomingTrips).toHaveLength(2);
      expect(store.upcomingTrips[0].id).toBe("3"); // 2024-05-15
      expect(store.upcomingTrips[1].id).toBe("2"); // 2024-06-01
      expect(store.finishedTrips).toHaveLength(1);
    });

    it("當 trips 為 null 或資料損壞時，計算屬性不應崩潰且回傳空陣列", () => {
      const store = useTripStore();
      (store as any).trips = null;
      expect(store.ongoingTrips).toEqual([]);
      expect(store.upcomingTrips).toEqual([]);
    });
  });

  describe("新增旅程 (addTrip)", () => {
    it("未登入時新增應拋出錯誤 (安全性防護)", async () => {
      (useAuthStore as any).mockReturnValue({ user: null });
      const store = useTripStore();
      await expect(store.addTrip({} as any)).rejects.toThrow(
        "User not logged in",
      );
    });

    it("新增時應自動生成 ID 並優先使用 Email 作為 userId", async () => {
      const store = useTripStore();
      (firestore.addDoc as any).mockResolvedValueOnce({ id: "mock-trip-id" });

      const id = await store.addTrip({ title: "測試" } as any);

      expect(id).toBe("mock-trip-id");
      const addedData = (firestore.addDoc as any).mock.calls[0][1];
      expect(addedData.userId).toBe("user@test.com");
      expect(addedData.createdAt).toBeDefined();
    });
  });

  describe("旅程子項管理 (Bookings & Preparation)", () => {
    it("updateTripBooking: 當旅程不存在時應拋出錯誤", async () => {
      const store = useTripStore();
      (firestore.getDoc as any).mockResolvedValueOnce({ exists: () => false });

      await expect(
        store.updateTripBooking("invalid-id", {} as any),
      ).rejects.toThrow("Trip not found");
    });

    it("updateTripBooking: 應能在現有 bookings 陣列中追加新項目並生成 ID", async () => {
      const store = useTripStore();
      (firestore.getDoc as any).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ bookings: [{ id: "b1", title: "舊預訂" }] }),
      });

      await store.updateTripBooking("t1", { title: "新預訂" } as any);

      expect(firestore.updateDoc).toHaveBeenCalled();
      const updatedData = (firestore.updateDoc as any).mock.calls[0][1];
      expect(updatedData.bookings).toHaveLength(2);
      expect(updatedData.bookings[1].id).toBeDefined();
    });

    it("togglePreparationItem: 應精確切換指定項目的 isCompleted 狀態", async () => {
      const store = useTripStore();
      (firestore.getDoc as any).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          preparation: [
            { id: "i1", title: "A", isCompleted: false },
            { id: "i2", title: "B", isCompleted: false },
          ],
        }),
      });

      await store.togglePreparationItem("t1", "i2");

      const updatedData = (firestore.updateDoc as any).mock.calls[0][1];
      expect(
        updatedData.preparation.find((i: any) => i.id === "i1").isCompleted,
      ).toBe(false);
      expect(
        updatedData.preparation.find((i: any) => i.id === "i2").isCompleted,
      ).toBe(true);
    });
  });
});
