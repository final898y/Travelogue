import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import CollectionView from "../../src/views/CollectionView.vue";
import { useCollectionStore } from "../../src/stores/collectionStore";
import { useUIStore } from "../../src/stores/uiStore";
import { ref } from "vue";

// Mock vue-router
const mockRoute = {
  params: { id: "trip-123" },
};
const mockRouter = {
  push: vi.fn(),
};
vi.mock("vue-router", () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter,
}));

// Mock icons
vi.mock("../../src/assets/icons", () => ({
  ChevronLeft: { template: "<svg />" },
  AtSign: { template: "<svg />" },
  Instagram: { template: "<svg />" },
  Globe: { template: "<svg />" },
  Youtube: { template: "<svg />" },
  MoreHorizontal: { template: "<svg />" },
  Plus: { template: "<svg />" },
  MapPin: { template: "<svg />" },
  Bookmark: { template: "<svg />" },
  ExternalLink: { template: "<svg />" },
  ImageIcon: { template: "<svg />" },
}));

// Stub components
const stubs = {
  BaseBottomSheet: {
    template: "<div class='stub-bottom-sheet'><slot /></div>",
    props: ["isOpen"],
  },
  CollectionForm: {
    template: "<div class='stub-collection-form' />",
    props: ["initialData"],
  },
  BaseImageLightbox: {
    template: "<div class='stub-lightbox' />",
  },
};

describe("CollectionView.vue", () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        collection: {
          collections: [],
          loading: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const mountView = () => {
    return mount(CollectionView, {
      global: {
        plugins: [pinia],
        stubs,
      },
    });
  };

  it("當執行新增收集時，即使表單回傳了預產生的 ID，也應調用 addCollection", async () => {
    const wrapper = mountView();
    const store = useCollectionStore();

    // 1. 模擬點擊新增按鈕 (不帶參數呼叫 openEditSheet)
    // 透過直接存取組件實例來呼叫方法 (方便測試內部的 handleSave 邏輯)
    const vm = wrapper.vm as any;
    vm.openEditSheet();

    // 2. 模擬 CollectionForm 觸發 save 事件回傳資料 (帶有自動產生的 ID)
    const newItemWithId = {
      id: "new-uuid-123",
      title: "新景點",
      url: "https://test.com",
    };
    
    await vm.handleSaveCollection(newItemWithId);

    // 3. 驗證是否調用了 addCollection 而非 updateCollection
    expect(store.addCollection).toHaveBeenCalledWith("trip-123", newItemWithId);
    expect(store.updateCollection).not.toHaveBeenCalled();
  });

  it("當執行編輯現有項目時，應調用 updateCollection", async () => {
    const wrapper = mountView();
    const store = useCollectionStore();

    const existingItem = {
      id: "existing-id",
      title: "舊景點",
      url: "https://old.com",
      tags: [],
    };

    // 1. 模擬開啟編輯 Sheet
    const vm = wrapper.vm as any;
    vm.openEditSheet(existingItem);

    // 2. 模擬儲存變更
    const updatedItem = { ...existingItem, title: "更新後的標題" };
    await vm.handleSaveCollection(updatedItem);

    // 3. 驗證是否調用了 updateCollection
    expect(store.updateCollection).toHaveBeenCalledWith(
      "trip-123",
      existingItem.id,
      updatedItem
    );
    expect(store.addCollection).not.toHaveBeenCalled();
  });
});
