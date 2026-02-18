import { describe, it, expect, vi, beforeEach } from "vitest";
import { importSeedData } from "../../src/services/seed";
import * as firestore from "firebase/firestore";

// Mock Firebase Firestore
vi.mock("firebase/firestore", async () => {
  const actual = await vi.importActual("firebase/firestore");
  return {
    ...actual,
    getDocs: vi.fn(),
    addDoc: vi.fn(() => Promise.resolve({ id: "new-doc-id" })),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    collection: vi.fn((_db, ...path) => ({ id: path[path.length - 1] })),
    doc: vi.fn((_db, ...path) => ({
      id: path[path.length - 1],
      ref: "mock-ref",
    })),
    Timestamp: {
      now: vi.fn(() => ({ toMillis: () => Date.now() })),
    },
  };
});

describe("Seed Service", () => {
  const mockUserId = "test-user-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("當資料庫為空時應執行新增邏輯並導入子集合", async () => {
    // 模擬空資料庫
    vi.mocked(firestore.getDocs).mockResolvedValue({
      docs: [],
      empty: true,
    } as unknown as firestore.QuerySnapshot);

    const result = await importSeedData(mockUserId);

    expect(result.success).toBe(true);
    // 驗證是否新增了旅程文件
    expect(firestore.addDoc).toHaveBeenCalled();
    // 驗證傳入的資料包含 userId
    expect(firestore.addDoc).toHaveBeenCalledWith(
      expect.objectContaining({ id: "trips" }),
      expect.objectContaining({ userId: mockUserId }),
    );
  });

  it("當標題重複時應執行更新邏輯並補充子集合", async () => {
    const mockTripDoc = {
      id: "existing-id",
      data: () => ({ title: "2024 東京賞櫻之旅" }),
    };

    // 第一次 getDocs 回傳現有旅程，後續回傳空的子集合
    vi.mocked(firestore.getDocs)
      .mockResolvedValueOnce({
        docs: [mockTripDoc],
        empty: false,
      } as unknown as firestore.QuerySnapshot) // trips
      .mockResolvedValue({
        docs: [],
        empty: true,
      } as unknown as firestore.QuerySnapshot); // sub-collections

    const result = await importSeedData(mockUserId);

    expect(result.success).toBe(true);
    // 應呼叫 updateDoc 更新現有旅程
    expect(firestore.updateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ id: "existing-id" }),
      expect.objectContaining({ userId: mockUserId }),
    );
  });

  it("若子集合已有資料，則不應重複導入子集合", async () => {
    const mockTripDocs = [
      { id: "id1", data: () => ({ title: "2024 東京賞櫻之旅" }) },
      { id: "id2", data: () => ({ title: "京都古都漫步" }) },
      { id: "id3", data: () => ({ title: "北海道冬季祭典" }) },
    ];

    vi.mocked(firestore.getDocs).mockImplementation(
      async () =>
        ({
          empty: false,
          docs: mockTripDocs,
        }) as unknown as firestore.QuerySnapshot,
    );

    await importSeedData(mockUserId);

    // 既然所有旅程都存在，應呼叫 updateDoc
    expect(firestore.updateDoc).toHaveBeenCalled();
    // 且子集合也不為空 (empty: false)，所以不應呼叫任何 addDoc
    expect(firestore.addDoc).not.toHaveBeenCalled();
  });
});
