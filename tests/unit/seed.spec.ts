import { describe, it, expect, vi, beforeEach } from "vitest";
import { importSeedData } from "../../src/services/seed";
import * as firestore from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";

// 定義 Mock 用的型別，只包含我們程式碼中有用到的屬性
interface _MockDoc {
  id: string;
  data: () => DocumentData;
}

// Mock Firebase Firestore
vi.mock("firebase/firestore", async () => {
  const actual = await vi.importActual("firebase/firestore");
  return {
    ...actual,
    getDocs: vi.fn(),
    addDoc: vi.fn(() => Promise.resolve({ id: "new-doc-id" })),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    collection: vi.fn(),
    doc: vi.fn(),
    Timestamp: {
      now: vi.fn(() => ({ toMillis: () => Date.now() })),
    },
  };
});

describe("Seed Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("當資料庫為空時應執行新增邏輯並導入子集合", async () => {
    // 模擬空資料庫
    vi.mocked(firestore.getDocs).mockResolvedValue({
      docs: [],
      empty: true,
    } as unknown as firestore.QuerySnapshot);

    const result = await importSeedData();

    expect(result.success).toBe(true);
    // 驗證是否新增了旅程文件
    expect(firestore.addDoc).toHaveBeenCalled();
    // 驗證是否嘗試獲取子集合（用於檢查是否為空）
    expect(firestore.collection).toHaveBeenCalledWith(
      expect.anything(),
      "trips",
      expect.any(String),
      "expenses",
    );
    expect(firestore.collection).toHaveBeenCalledWith(
      expect.anything(),
      "trips",
      expect.any(String),
      "collections",
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

    const result = await importSeedData();

    expect(result.success).toBe(true);
    // 應呼叫 updateDoc 更新現有旅程
    expect(firestore.updateDoc).toHaveBeenCalled();
    // 應呼叫 addDoc 填入子集合資料
    expect(firestore.addDoc).toHaveBeenCalled();
  });

  it("若子集合已有資料，則不應重複導入子集合", async () => {
    // 模擬所有 seed.ts 中的旅程都已經存在於資料庫中
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

    await importSeedData();

    // 既然所有旅程都存在，應呼叫 updateDoc
    expect(firestore.updateDoc).toHaveBeenCalled();
    // 且子集合也不為空 (empty: false)，所以不應呼叫任何 addDoc
    expect(firestore.addDoc).not.toHaveBeenCalled();
  });
});
