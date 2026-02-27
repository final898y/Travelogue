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
    deleteDoc: vi.fn(() => Promise.resolve()),
    writeBatch: vi.fn(() => ({
      set: vi.fn(),
      commit: vi.fn(() => Promise.resolve()),
    })),
    collection: vi.fn((_db, ...path) => ({
      id: path[path.length - 1],
      path: path.join("/"),
    })),
    doc: vi.fn((_db, ...path) => ({
      id: path[path.length - 1],
      ref: { id: path[path.length - 1] },
    })),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
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
        data: () => ({
          title: "東京之旅",
          userId: mockUserId,
          startDate: "2024-01-01",
          endDate: "2024-01-05",
          days: 5,
          status: "upcoming",
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };

      vi.mocked(firestore.getDocs)
        .mockResolvedValueOnce({
          docs: [mockTripDoc],
        } as unknown as firestore.QuerySnapshot)
        .mockResolvedValueOnce({
          docs: [
            {
              id: "sub-1",
              data: () => ({
                tripId: "trip-abc",
                date: "2024-01-01",
                activities: [],
              }),
            },
          ],
        } as unknown as firestore.QuerySnapshot)
        .mockResolvedValueOnce({
          docs: [
            {
              id: "exp-1",
              data: () => ({
                date: "2024-01-01",
                category: "food",
                amount: 100,
                currency: "TWD",
                description: "Lunch",
                payer: "user-123",
                splitWith: ["user-123"],
                createdAt: new Date(),
              }),
            },
          ],
        } as unknown as firestore.QuerySnapshot)
        .mockResolvedValueOnce({
          docs: [
            {
              id: "coll-1",
              data: () => ({
                title: "Spot",
                url: "https://example.com",
                source: "web",
                createdAt: new Date(),
              }),
            },
          ],
        } as unknown as firestore.QuerySnapshot);

      const result = await backupService.fetchAllUserData(mockUserId);

      expect(result.userId).toBe(mockUserId);
      expect(result.trips.length).toBe(1);
      expect(firestore.getDocs).toHaveBeenCalledTimes(4);
    });
  });

  describe("fetchSingleTripData", () => {
    it("應正確抓取特定旅程及其子集合資料", async () => {
      const tripId = "target-trip";
      vi.mocked(firestore.getDocs)
        .mockResolvedValueOnce({
          empty: false,
          docs: [
            {
              id: tripId,
              data: () => ({
                title: "特定旅程",
                userId: mockUserId,
                startDate: "2024-01-01",
                endDate: "2024-01-05",
                days: 5,
                status: "upcoming",
                createdAt: new Date(),
                updatedAt: new Date(),
              }),
            },
          ],
        } as any)
        .mockResolvedValue({ docs: [] } as any);

      const result = await backupService.fetchSingleTripData(tripId);

      expect(result.trip.data.id).toBe(tripId);
      expect(firestore.where).toHaveBeenCalledWith("__name__", "==", tripId);
    });
  });

  describe("importSingleTrip", () => {
    it("導入單一旅程時應產生新旅程並修改標題", async () => {
      const validSingleData = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        trip: {
          data: {
            id: "old-id",
            userId: mockUserId,
            title: "原標題",
            startDate: "2024-01-01",
            endDate: "2024-01-02",
            days: 2,
            status: "upcoming",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          plans: [{ tripId: "old-id", date: "2024-01-01", activities: [] }],
          expenses: [],
          collections: [],
        },
      };

      const file = new File([JSON.stringify(validSingleData)], "trip.json", {
        type: "application/json",
      });
      vi.mocked(firestore.addDoc).mockResolvedValue({
        id: "new-trip-id",
      } as any);

      const newId = await backupService.importSingleTrip(mockUserId, file);

      expect(newId).toBe("new-trip-id");
      expect(firestore.addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ title: "原標題 (匯入)" }),
      );
    });
  });

  describe("listCloudBackups", () => {
    it("應正確查詢雲端備份清單並依時間排序", async () => {
      vi.mocked(firestore.getDocs).mockResolvedValueOnce({
        docs: [
          {
            id: "b1",
            data: () => ({ createdAt: { toDate: () => new Date() } }),
          },
        ],
      } as any);

      const result = await backupService.listCloudBackups(mockUserId);

      expect(result.length).toBe(1);
      expect(firestore.orderBy).toHaveBeenCalledWith("createdAt", "desc");
    });
  });

  describe("clearAllUserData", () => {
    it("應遞迴刪除子集合後再刪除主文件", async () => {
      const mockTripDoc = {
        id: "trip-abc",
        ref: { id: "trip-ref" },
        data: () => ({}),
      };

      vi.mocked(firestore.getDocs)
        .mockResolvedValueOnce({ docs: [mockTripDoc] } as any)
        .mockResolvedValue({ docs: [{ ref: { id: "sub-ref" } }] } as any);

      await backupService.clearAllUserData(mockUserId);

      expect(firestore.deleteDoc).toHaveBeenCalled();
    });
  });

  describe("importFromJSON", () => {
    it("當輸入無效 JSON 格式時應拋出錯誤", async () => {
      const invalidFile = new File(['{"invalid": "data"}'], "test.json", {
        type: "application/json",
      });
      await expect(
        backupService.importFromJSON(mockUserId, invalidFile),
      ).rejects.toThrow();
    });
  });
});
