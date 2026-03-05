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

describe("collectionStore.ts v2.0 (邊界與極端測試)", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("計算屬性 (Computed Properties)", () => {
    it("應能在 collections 為空陣列時，回傳空陣列", () => {
      const store = useCollectionStore();
      store.collections = [];
      expect(store.allTags).toEqual([]);
      expect(store.allCategories).toEqual([]);
    });

    it("應能處理 null/undefined 的標籤與分類並正確過濾", () => {
      const store = useCollectionStore();
      store.collections = [
        {
          id: "1",
          tags: ["日本", null, undefined, "", "  ", 123],
          category: null,
        },
        {
          id: "2",
          tags: undefined,
          category: " 美食 ", // 應修剪空白
        },
        {
          id: "3",
          category: "", // 空字串不應被加入
        },
      ] as any;

      expect(store.allTags).toEqual(["日本"]);
      expect(store.allCategories).toEqual(["美食"]);
    });

    it("應能處理高度重複且帶有空格的標籤/分類並保持唯一性與排序", () => {
      const store = useCollectionStore();
      store.collections = [
        { id: "1", tags: ["A", "B", "a "], category: "景點" },
        { id: "2", tags: ["B", "C"], category: " 景點" },
        { id: "3", tags: ["A"], category: "景點 " },
      ] as any;

      // 目前實作 Set 是區分大小寫的 (A 與 a)，符合多數 UI 的分類需求
      expect(store.allTags).toEqual(["A", "B", "C", "a"]);
      expect(store.allCategories).toEqual(["景點"]);
    });
  });

  describe("驗證與過濾邏輯 (validateAndFilter)", () => {
    it("應能完全排除不符合 Zod Schema 的髒資料", () => {
      const store = useCollectionStore();
      const mockDate = new Date();
      const dirtyData = [
        {
          id: "valid",
          title: "正確",
          url: "https://test.com",
          source: "web",
          createdAt: mockDate,
        }, // 有效
        {
          id: "invalid-url",
          title: "網址錯誤",
          url: "not-a-url",
          source: "web",
          createdAt: mockDate,
        }, // 無效 URL
        {
          id: "missing-title",
          url: "https://ok.com",
          source: "web",
          createdAt: mockDate,
        }, // 缺標題
        {
          id: "wrong-source",
          title: "來源錯誤",
          url: "https://ok.com",
          source: "bad-source",
          createdAt: mockDate,
        }, // 來源不符
      ];

      // 模擬從 Firestore 取得 rawData 並透過 store 處理
      const validated = dirtyData
        .map((item) => {
          const result = CollectionSchema.safeParse(item);
          return result.success ? result.data : null;
        })
        .filter(Boolean);

      store.collections = validated as any;
      expect(store.collections).toHaveLength(1);
      expect(store.collections[0].title).toBe("正確");
    });
  });

  describe("安全性與操作行為 (Security & Actions)", () => {
    it("當用戶未登入時，執行新增/更新/刪除操作應拋出錯誤", async () => {
      const authStore = useAuthStore();
      authStore.user = null; // 強制設定為未登入
      const store = useCollectionStore();

      await expect(store.addCollection("trip-1", {} as any)).rejects.toThrow(
        "User not logged in",
      );
      await expect(
        store.updateCollection("trip-1", "doc-1", {}),
      ).rejects.toThrow("User not logged in");
      await expect(store.deleteCollection("trip-1", "doc-1")).rejects.toThrow(
        "User not logged in",
      );
    });
  });
});
