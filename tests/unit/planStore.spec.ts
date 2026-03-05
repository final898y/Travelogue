import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { usePlanStore } from "../../src/stores/planStore";
import { useAuthStore } from "../../src/stores/authStore";
import * as firestore from "firebase/firestore";

// Mock Firebase
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  getDocs: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
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

describe("planStore.ts v2.0 (行程邏輯與排序測試)", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    (useAuthStore as any).mockReturnValue({
      user: { uid: "user-123" },
    });
  });

  describe("活動排序與過濾 (Computed/Getters Logic)", () => {
    it("getActivitiesByDate: 應正確按時間 HH:mm 排序活動", () => {
      const store = usePlanStore();
      const tripId = "trip-1";
      const date = "2024-03-20";

      store.currentTripPlans = [
        {
          tripId,
          date,
          activities: [
            { id: "1", title: "晚餐", time: "19:00" },
            { id: "2", title: "早午餐", time: "11:30" },
            { id: "3", title: "早餐", time: "08:00" },
          ],
        },
      ] as any;

      const activities = store.getActivitiesByDate(date);
      expect(activities[0].title).toBe("早餐");
      expect(activities[1].title).toBe("早午餐");
      expect(activities[2].title).toBe("晚餐");
    });

    it("getActivitiesByDate: 當該日期不存在時，應回傳空陣列", () => {
      const store = usePlanStore();
      const activities = store.getActivitiesByDate("2099-01-01");
      expect(activities).toEqual([]);
    });
  });

  describe("操作安全性與異常處理 (Actions Defense)", () => {
    it("未登入時 updateTripActivity 應拋出錯誤", async () => {
      (useAuthStore as any).mockReturnValue({ user: null });
      const store = usePlanStore();
      await expect(
        store.updateTripActivity("t1", "2024-01-01", {} as any),
      ).rejects.toThrow("User not logged in");
    });

    it("deleteTripActivity: 當活動為該日期最後一項時，應直接刪除文件而非僅清空陣列 (優化存儲)", async () => {
      const store = usePlanStore();
      const tripId = "trip-1";
      const date = "2024-03-20";
      const docId = "doc-123";

      const mockPlan = {
        tripId,
        date,
        activities: [{ id: "act-1", title: "唯一的活動" }],
      };

      (firestore.getDocs as any).mockResolvedValueOnce({
        empty: false,
        docs: [{ id: docId, data: () => mockPlan }],
      });

      await store.deleteTripActivity(tripId, date, "act-1");

      // 檢查是否呼叫了 deleteDoc (而非 updateDoc)
      expect(firestore.deleteDoc).toHaveBeenCalled();
      expect(firestore.updateDoc).not.toHaveBeenCalled();
    });

    it("deleteTripActivity: 當尚有其他活動時，應僅更新陣列內容", async () => {
      const store = usePlanStore();
      const tripId = "trip-1";
      const date = "2024-03-20";
      const docId = "doc-123";

      const mockPlan = {
        tripId,
        date,
        activities: [
          { id: "act-1", title: "A" },
          { id: "act-2", title: "B" },
        ],
      };

      (firestore.getDocs as any).mockResolvedValueOnce({
        empty: false,
        docs: [{ id: docId, data: () => mockPlan }],
      });

      await store.deleteTripActivity(tripId, date, "act-1");

      expect(firestore.updateDoc).toHaveBeenCalled();
      const updatedData = (firestore.updateDoc as any).mock.calls[0][1];
      expect(updatedData.activities).toHaveLength(1);
      expect(updatedData.activities[0].id).toBe("act-2");
    });
  });
});
