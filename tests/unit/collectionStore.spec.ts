import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useCollectionStore } from "../../src/stores/collectionStore";
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

describe("Collection Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("初始化時應具備正確的初始狀態", () => {
    const store = useCollectionStore();
    expect(store.collections).toEqual([]);
    expect(store.loading).toBe(false);
  });

  it("addCollection 應能正確新增項目", async () => {
    const store = useCollectionStore();
    const tripId = "trip-1";
    const newItem = {
      title: "必吃拉麵",
      url: "https://example.com",
      source: "web" as const,
      category: "美食",
    };

    await store.addCollection(tripId, newItem as any);

    expect(firestore.addDoc).toHaveBeenCalled();
    const addedData = (firestore.addDoc as any).mock.calls[0][1];
    expect(addedData.title).toBe("必吃拉麵");
    expect(addedData.createdAt).toBeDefined();
  });

  it("updateCollection 應能正確更新項目並過濾內部欄位", async () => {
    const store = useCollectionStore();
    const tripId = "trip-1";
    const collectionId = "col-123";
    const updatedData = {
      id: collectionId, // 應被過濾
      title: "更新標題",
      createdAt: { seconds: 0, nanoseconds: 0 }, // 應被過濾
    };

    await store.updateCollection(tripId, collectionId, updatedData as any);

    expect(firestore.updateDoc).toHaveBeenCalled();
    const finalData = (firestore.updateDoc as any).mock.calls[0][1];
    expect(finalData.title).toBe("更新標題");
    expect(finalData.id).toBeUndefined();
    expect(finalData.createdAt).toBeUndefined();
  });

  it("deleteCollection 應能正確執行刪除", async () => {
    const store = useCollectionStore();
    await store.deleteCollection("trip-1", "col-123");
    expect(firestore.deleteDoc).toHaveBeenCalled();
  });
});
