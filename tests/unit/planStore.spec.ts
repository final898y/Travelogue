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
  Timestamp: { now: vi.fn(() => ({ seconds: 123, nanoseconds: 456 })) },
}));

// Mock Firebase Auth
vi.mock("../../src/services/firebase", () => ({
  db: {},
  auth: { currentUser: { uid: "user-123" } },
}));

// Mock authStore
vi.mock("../../src/stores/authStore", () => ({
  useAuthStore: vi.fn(),
}));

describe("Plan Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    // Default mock user for authStore
    (useAuthStore as any).mockReturnValue({
      user: { uid: "user-123" },
    });
  });

  it("初始化時應具備正確的初始狀態", () => {
    const store = usePlanStore();
    expect(store.currentTripPlans).toEqual([]);
    expect(store.loading).toBe(false);
    expect(store.error).toBe(null);
  });

  it("updateTripActivity 應能正確處理新增邏輯", async () => {
    const store = usePlanStore();
    const tripId = "trip-1";
    const date = "2024-03-20";
    const newActivity = {
      title: "新活動",
      time: "10:00",
      category: "sight" as const,
    };

    // Mock getOrCreatePlanDoc 內部行為 (snapshot empty)
    (firestore.getDocs as any).mockResolvedValueOnce({ empty: true });
    (firestore.addDoc as any).mockResolvedValueOnce({ id: "new-plan-id" });

    await store.updateTripActivity(tripId, date, newActivity as any);

    expect(firestore.addDoc).toHaveBeenCalled();
    const addedData = (firestore.addDoc as any).mock.calls[0][1];
    expect(addedData.activities[0].title).toBe("新活動");
    expect(addedData.activities[0].id).toBeDefined(); // 應自動生成 UUID
  });

  it("updateTripActivity 應能正確處理更新邏輯", async () => {
    const store = usePlanStore();
    const tripId = "trip-1";
    const date = "2024-03-20";
    const existingId = "act-123";
    const updatedActivity = {
      id: existingId,
      title: "更新後的活動",
      time: "12:00",
      category: "food" as const,
    };

    // Mock getOrCreatePlanDoc 內部行為 (已有文件)
    const mockPlan = {
      tripId,
      date,
      activities: [
        { id: existingId, title: "舊活動", time: "10:00", category: "sight" },
      ],
    };
    (firestore.getDocs as any).mockResolvedValueOnce({
      empty: false,
      docs: [{ id: "doc-123", data: () => mockPlan }],
    });

    await store.updateTripActivity(tripId, date, updatedActivity as any);

    expect(firestore.updateDoc).toHaveBeenCalled();
    const updatedData = (firestore.updateDoc as any).mock.calls[0][1];
    expect(updatedData.activities[0].title).toBe("更新後的活動");
  });

  it("deleteTripActivity 應能正確移除活動", async () => {
    const store = usePlanStore();
    const tripId = "trip-1";
    const date = "2024-03-20";
    const targetId = "act-1";

    const mockPlan = {
      tripId,
      date,
      activities: [
        { id: "act-1", title: "刪除我" },
        { id: "act-2", title: "留著我" },
      ],
    };
    (firestore.getDocs as any).mockResolvedValueOnce({
      empty: false,
      docs: [{ id: "doc-123", data: () => mockPlan }],
    });

    await store.deleteTripActivity(tripId, date, targetId);

    expect(firestore.updateDoc).toHaveBeenCalled();
    const updatedData = (firestore.updateDoc as any).mock.calls[0][1];
    expect(updatedData.activities).toHaveLength(1);
    expect(updatedData.activities[0].id).toBe("act-2");
  });
});
