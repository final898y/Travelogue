import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useCollectionStore } from "../../src/stores/collectionStore";
import { useAuthStore } from "../../src/stores/authStore";
import { CollectionSchema } from "../../src/types/trip";

// Mock firebase
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
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

describe("collectionStore.ts", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // Mock Auth Store
    const authStore = useAuthStore();
    authStore.user = { uid: "test-user-123" } as any;
  });

  it("應能正確提取所有項目中的不重複標籤並排序 (allTags)", () => {
    const store = useCollectionStore();

    // 手動設置 mock 資料
    store.collections = [
      {
        id: "1",
        title: "景點 A",
        url: "https://a.com",
        source: "web",
        tags: ["日本", "賞櫻"],
        createdAt: new Date(),
      },
      {
        id: "2",
        title: "美食 B",
        url: "https://b.com",
        source: "instagram",
        tags: ["美食", "日本"],
        createdAt: new Date(),
      },
      {
        id: "3",
        title: "無標籤 C",
        url: "https://c.com",
        source: "web",
        tags: [],
        createdAt: new Date(),
      },
    ] as any;

    expect(store.allTags).toEqual(["日本", "美食", "賞櫻"]);
  });

  it("當部分項目沒有 tags 欄位時，應能正常運作並補上預設空陣列", () => {
    const store = useCollectionStore();

    // 模擬從 Firestore 讀取的原始資料 (其中一筆沒有 tags 欄位)
    const rawData = [
      {
        id: "old-doc",
        title: "舊資料",
        url: "https://old.com",
        source: "web",
        createdAt: { toDate: () => new Date() },
      },
      {
        id: "new-doc",
        title: "新資料",
        url: "https://new.com",
        source: "web",
        tags: ["新標籤"],
        createdAt: { toDate: () => new Date() },
      },
    ];

    const validatedData = rawData
      .map((item) => {
        const result = CollectionSchema.safeParse(item);
        return result.success ? result.data : (null as any);
      })
      .filter(Boolean);

    store.collections = validatedData as any;

    expect(store.collections[0].tags).toEqual([]); // 應自動補上空陣列
    expect(store.collections[1].tags).toEqual(["新標籤"]);
    expect(store.allTags).toEqual(["新標籤"]);
  });

  it("allTags 應能排除無效或空白的標籤", () => {
    const store = useCollectionStore();
    store.collections = [
      {
        id: "1",
        title: "測試",
        url: "https://test.com",
        source: "web",
        tags: [" ", "", null, undefined, " 有效標籤 "],
        createdAt: new Date(),
      },
    ] as any;

    expect(store.allTags).toEqual(["有效標籤"]);
  });
});
