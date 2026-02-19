import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useTripStore } from "../../src/stores/tripStore";
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
  doc: vi.fn(),
  Timestamp: { now: vi.fn(() => ({ seconds: 123, nanoseconds: 456 })) },
}));

// Mock Firebase Auth
vi.mock("../../src/services/firebase", () => ({
  db: {},
  auth: { currentUser: { uid: "user-123" } },
}));

describe("Trip Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("初始化時應具備正確的初始狀態", () => {
    const store = useTripStore();
    expect(store.trips).toEqual([]);
    expect(store.loading).toBe(false);
  });

  it("addTrip 應能正確新增旅程並綁定 userId", async () => {
    const store = useTripStore();
    const tripData = {
      title: "新旅程",
      startDate: "2024-05-01",
      endDate: "2024-05-05",
      days: 5,
      status: "upcoming" as const,
    };

    (firestore.addDoc as any).mockResolvedValueOnce({ id: "new-trip-id" });

    const id = await store.addTrip(tripData as any);

    expect(id).toBe("new-trip-id");
    expect(firestore.addDoc).toHaveBeenCalled();
    const addedData = (firestore.addDoc as any).mock.calls[0][1];
    expect(addedData.userId).toBe("user-123");
    expect(addedData.createdAt).toBeDefined();
  });

  it("updateTripBooking 應能更新 trip 中的預訂陣列", async () => {
    const store = useTripStore();
    const tripId = "trip-1";
    const newBooking = { title: "新飯店", type: "hotel", isConfirmed: true };

    // Mock 讀取原始旅程資料
    (firestore.getDoc as any).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ bookings: [] }),
    });

    await store.updateTripBooking(tripId, newBooking as any);

    expect(firestore.updateDoc).toHaveBeenCalled();
    const updatedData = (firestore.updateDoc as any).mock.calls[0][1];
    expect(updatedData.bookings[0].title).toBe("新飯店");
    expect(updatedData.bookings[0].id).toBeDefined(); // 應生成 ID
  });

  it("updateTripPreparationItem 應能更新 trip 中的準備清單", async () => {
    const store = useTripStore();
    const tripId = "trip-1";
    const newItem = { title: "帶相機", category: "電子" };

    (firestore.getDoc as any).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ preparation: [] }),
    });

    await store.updateTripPreparationItem(tripId, newItem as any);

    expect(firestore.updateDoc).toHaveBeenCalled();
    const updatedData = (firestore.updateDoc as any).mock.calls[0][1];
    expect(updatedData.preparation[0].title).toBe("帶相機");
    expect(updatedData.preparation[0].isCompleted).toBe(false);
  });

  it("togglePreparationItem 應能切換項目的完成狀態", async () => {
    const store = useTripStore();
    const tripId = "trip-1";
    const itemId = "item-123";

    (firestore.getDoc as any).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        preparation: [{ id: itemId, title: "測試", isCompleted: false }],
      }),
    });

    await store.togglePreparationItem(tripId, itemId);

    expect(firestore.updateDoc).toHaveBeenCalled();
    const updatedData = (firestore.updateDoc as any).mock.calls[0][1];
    expect(updatedData.preparation[0].isCompleted).toBe(true);
  });
});
