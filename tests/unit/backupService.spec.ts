import { describe, it, expect, vi, beforeEach } from "vitest";
import { backupService } from "../../src/services/backupService";
import * as firestore from "firebase/firestore";

// Mock Firebase Firestore
vi.mock("firebase/firestore", async () => {
  const actual = await vi.importActual("firebase/firestore");
  return {
    ...actual,
    getDocs: vi.fn(),
    addDoc: vi.fn(),
    deleteDoc: vi.fn(),
    writeBatch: vi.fn(() => ({
      set: vi.fn(),
      commit: vi.fn(() => Promise.resolve()),
    })),
    collection: vi.fn((_db, ...path) => ({ id: path[path.length - 1], path: path.join("/") })),
    doc: vi.fn((_db, ...path) => ({ id: path[path.length - 1], ref: "mock-ref" })),
    query: vi.fn(),
    where: vi.fn(),
    Timestamp: {
      now: vi.fn(() => ({ seconds: 123, nanoseconds: 456 })),
    },
  };
});

describe("Backup Service", () => {
  const mockUserId = "user-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchAllUserData", () => {
    it("應正確抓取旅程及其所有子集合資料", async () => {
      const mockTripDoc = {
        id: "trip-abc",
        data: () => ({ title: "東京之旅", userId: mockUserId }),
      };

      // Mock getDocs sequence: 1. trips, 2. plans, 3. expenses, 4. collections
      vi.mocked(firestore.getDocs)
        .mockResolvedValueOnce({
          docs: [mockTripDoc],
        } as unknown as firestore.QuerySnapshot)
        .mockResolvedValueOnce({
          docs: [{ id: "plan-1", data: () => ({ date: "2024-01-01" }) }],
        } as unknown as firestore.QuerySnapshot)
        .mockResolvedValueOnce({
          docs: [{ id: "exp-1", data: () => ({ amount: 100 }) }],
        } as unknown as firestore.QuerySnapshot)
        .mockResolvedValueOnce({
          docs: [{ id: "coll-1", data: () => ({ title: "景點" }) }],
        } as unknown as firestore.QuerySnapshot);

      const result = await backupService.fetchAllUserData(mockUserId);

      expect(result.userId).toBe(mockUserId);
      expect(result.trips.length).toBe(1);
      expect(result.trips[0].data.id).toBe("trip-abc");
      expect(result.trips[0].plans.length).toBe(1);
      expect(result.trips[0].expenses.length).toBe(1);
      expect(result.trips[0].collections.length).toBe(1);

      // 驗證是否使用了正確的查詢過濾
      expect(firestore.where).toHaveBeenCalledWith("userId", "==", mockUserId);
    });
  });

  describe("clearAllUserData", () => {
    it("應遞迴刪除子集合後再刪除主文件", async () => {
      const mockTripDoc = {
        id: "trip-abc",
        ref: { id: "trip-abc" },
        data: () => ({}),
      };

      vi.mocked(firestore.getDocs)
        .mockResolvedValueOnce({ docs: [mockTripDoc] } as any) // trips
        .mockResolvedValueOnce({ docs: [{ ref: "p1" }] } as any) // plans
        .mockResolvedValueOnce({ docs: [{ ref: "e1" }] } as any) // expenses
        .mockResolvedValueOnce({ docs: [{ ref: "c1" }] } as any); // collections

      await backupService.clearAllUserData(mockUserId);

      // 總共應呼叫 4 次刪除 (1主 + 3子)
      expect(firestore.deleteDoc).toHaveBeenCalledTimes(4);
    });
  });

  describe("importFromJSON", () => {
    it("當輸入無效 JSON 格式時應拋出錯誤 (Zod 驗證)", async () => {
      const invalidFile = new File(['{"invalid": "data"}'], "test.json", { type: "application/json" });
      
      await expect(backupService.importFromJSON(mockUserId, invalidFile))
        .rejects.toThrow();
    });

    it("合法資料應觸發清理並執行批次寫入", async () => {
      const validData = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        userId: mockUserId,
        trips: [{
          data: {
            id: "trip-1",
            userId: mockUserId,
            title: "測試",
            startDate: "2024-01-01",
            endDate: "2024-01-02",
            days: 2,
            status: "upcoming"
          },
          plans: [],
          expenses: [],
          collections: []
        }]
      };
      
      const file = new File([JSON.stringify(validData)], "backup.json", { type: "application/json" });
      
      // Mock clearAllUserData
      const clearSpy = vi.spyOn(backupService, "clearAllUserData").mockResolvedValue(undefined);
      
      // Mock getDocs for clear
      vi.mocked(firestore.getDocs).mockResolvedValue({ docs: [] } as any);

      await backupService.importFromJSON(mockUserId, file);

      expect(clearSpy).toHaveBeenCalledWith(mockUserId);
      expect(firestore.writeBatch).toHaveBeenCalled();
    });
  });
});
