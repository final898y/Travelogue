import { describe, it, expect, vi, beforeEach } from "vitest";
import { importSeedData } from "../../src/services/seed";
import * as firestore from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";

// 定義 Mock 用的型別，只包含我們程式碼中有用到的屬性
interface MockDoc {
  id: string;
  data: () => DocumentData;
}

interface MockSnapshot {
  docs: MockDoc[];
}

// Mock Firebase Firestore
vi.mock("firebase/firestore", async () => {
  const actual = await vi.importActual("firebase/firestore");
  return {
    ...actual,
    getDocs: vi.fn(),
    addDoc: vi.fn(),
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

  it("當資料庫為空時應執行新增邏輯", async () => {
    const mockSnapshot: MockSnapshot = { docs: [] };

    vi.mocked(firestore.getDocs).mockResolvedValue(
      mockSnapshot as firestore.QuerySnapshot,
    );

    const result = await importSeedData();

    expect(result.success).toBe(true);
    expect(result.added).toBeGreaterThan(0);
    expect(firestore.addDoc).toHaveBeenCalled();
  });

  it("當標題重複時應執行更新邏輯", async () => {
    const mockSnapshot: MockSnapshot = {
      docs: [
        {
          id: "existing-id",
          data: () => ({ title: "2024 東京賞櫻之旅" }),
        },
      ],
    };

    vi.mocked(firestore.getDocs).mockResolvedValue(
      mockSnapshot as firestore.QuerySnapshot,
    );

    const result = await importSeedData();

    expect(result.success).toBe(true);
    expect(result.updated).toBeGreaterThan(0);
    expect(firestore.updateDoc).toHaveBeenCalled();
  });
});
