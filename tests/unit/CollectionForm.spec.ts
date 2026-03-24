import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import CollectionForm from "../../src/components/trip/CollectionForm.vue";
import { useUIStore } from "../../src/stores/uiStore";

vi.mock("../../src/assets/icons", () => ({
  Globe: { template: "<svg />" },
  AtSign: { template: "<svg />" },
  Instagram: { template: "<svg />" },
  Youtube: { template: "<svg />" },
  MoreHorizontal: { template: "<svg />" },
  X: { template: "<svg />" },
  Plus: { template: "<svg />" },
  Pencil: { template: "<!-- Pencil -->" },
  BookOpen: { template: "<!-- BookOpen -->" },
  ExternalLink: { template: "<!-- ExternalLink -->" },
  ChevronDown: { template: "<!-- ChevronDown -->" },
  Palette: { template: "<!-- Palette -->" },
}));

// Mock ImageUploader
vi.mock("../../src/components/ui/ImageUploader.vue", () => ({
  default: {
    name: "ImageUploader",
    template: "<div class='mock-image-uploader' />",
    props: ["images", "userId", "documentId", "isReadOnly"],
  },
}));

describe("CollectionForm.vue", () => {
  const mountWithPinia = (options = {}) => {
    return mount(CollectionForm, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
          }),
        ],
      },
      ...options,
    });
  };

  it("應渲染預設表單狀態 (建立模式)", () => {
    const wrapper = mountWithPinia({
      props: {
        initialData: {},
      },
    });

    // 檢查預設分類
    const select = wrapper.find("select");
    expect(select.exists()).toBe(true);
    expect((select.element as HTMLSelectElement).value).toBe("未分類");

    // 檢查來源預設為 web
    // web 對應第一個按鈕
    const firstBtn = wrapper.find(".grid-cols-5 button");
    expect(firstBtn.classes()).toContain("border-forest-400");
  });

  it("應正確渲染編輯模式並填入資料", async () => {
    const initialData = {
      id: "coll-1",
      title: "好吃拉麵",
      url: "https://example.com",
      mapUrl: "https://maps.google.com",
      websiteUrl: "https://tabelog.com",
      category: "美食",
      source: "instagram" as const,
      tags: ["拉麵", "東京"],
    };

    const wrapper = mountWithPinia({
      props: {
        initialData,
      },
    });

    // [FIX]: Since the component now defaults to read-only mode,
    // we need to switch to edit mode first.
    const toggleButton = wrapper.find("button.text-forest-400"); // '切換編輯' 按鈕
    await toggleButton.trigger("click");

    const textInputs = wrapper.findAll("input[type='text']");
    const urlInputs = wrapper.findAll("input[type='url']");

    // 標題輸入框
    expect((textInputs[0].element as HTMLInputElement).value).toBe("好吃拉麵");

    // 網址輸入框 (現在 index 偏移了，因為多了一個標籤 input)
    expect((urlInputs[0].element as HTMLInputElement).value).toBe(
      "https://example.com",
    );
    expect((urlInputs[1].element as HTMLInputElement).value).toBe(
      "https://maps.google.com",
    );
    expect((urlInputs[2].element as HTMLInputElement).value).toBe(
      "https://tabelog.com",
    );

    expect((wrapper.find("select").element as HTMLSelectElement).value).toBe(
      "美食",
    );

    // 檢查標籤渲染
    const tagChips = wrapper.findAll(".tag-chip");
    expect(tagChips).toHaveLength(2);
    expect(tagChips[0].text()).toContain("#拉麵");
    expect(tagChips[1].text()).toContain("#東京");

    // IG 對應第三個按鈕 (index 2)
    const igBtn = wrapper.findAll(".grid-cols-5 button")[2];
    expect(igBtn.classes()).toContain("border-forest-400");
  });

  it("應能新增與移除標籤", async () => {
    const wrapper = mountWithPinia({
      props: { initialData: { tags: ["舊標籤"] } },
    });

    const tagInput = wrapper.findAll("input[type='text']")[1];
    await tagInput.setValue("新標籤");
    await tagInput.trigger("keydown.enter");

    let tagChips = wrapper.findAll(".tag-chip");
    expect(tagChips).toHaveLength(2);
    expect(tagChips[1].text()).toContain("#新標籤");

    // 點擊移除按鈕
    await tagChips[0].find("button").trigger("click");
    tagChips = wrapper.findAll(".tag-chip");
    expect(tagChips).toHaveLength(1);
    expect(tagChips[0].text()).toContain("#新標籤");
  });

  it("切換分類應更新 formData", async () => {
    const wrapper = mountWithPinia({
      props: { initialData: {} },
    });

    const select = wrapper.find("select");
    await select.setValue("景點");

    expect(wrapper.emitted("update:dirty")).toBeTruthy();
    expect(wrapper.emitted("update:dirty")![0][0]).toBe(true);
  });

  it("標題或網址未輸入或網址無效時應擋下儲存並提示", async () => {
    const wrapper = mountWithPinia({
      props: { initialData: {} },
    });
    const uiStore = useUIStore();

    // Case 1: 沒標題
    await wrapper.find("button.bg-forest-400").trigger("click");
    expect(uiStore.showToast).toHaveBeenCalledWith("請輸入標題", "warning");

    // Case 2: 有標題沒網址
    const textInputs = wrapper.findAll("input[type='text']");
    await textInputs[0].setValue("測試");
    await wrapper.find("button.bg-forest-400").trigger("click");
    expect(uiStore.showToast).toHaveBeenCalledWith("請輸入網址", "warning");

    // Case 3: 無效的網址
    const urlInputs = wrapper.findAll("input[type='url']");
    await urlInputs[0].setValue("invalid-url");
    await wrapper.find("button.bg-forest-400").trigger("click");
    expect(uiStore.showToast).toHaveBeenCalledWith(
      "請輸入有效的來源網址",
      "warning",
    );

    // Case 4: 無效的地點網址
    await urlInputs[0].setValue("https://valid.com");
    await urlInputs[1].setValue("invalid-map-url");
    await wrapper.find("button.bg-forest-400").trigger("click");
    expect(uiStore.showToast).toHaveBeenCalledWith(
      "請輸入有效的地點網址",
      "warning",
    );

    // Case 5: 無效的官網網址
    await urlInputs[1].setValue("https://valid-map.com");
    await urlInputs[2].setValue("invalid-website-url");
    await wrapper.find("button.bg-forest-400").trigger("click");
    expect(uiStore.showToast).toHaveBeenCalledWith(
      "請輸入有效的官網網址",
      "warning",
    );
  });

  it("應能正確切換所有來源類型", async () => {
    const wrapper = mountWithPinia({
      props: { initialData: {} },
    });

    const sourceButtons = wrapper.findAll(".grid-cols-5 button");
    const sources = ["web", "threads", "instagram", "youtube", "other"];

    for (let i = 0; i < sources.length; i++) {
      await sourceButtons[i].trigger("click");
      // 這裡直接透過觸發儲存來檢查 source 是否正確更新
      await wrapper.find("input[type='text']").setValue("來源測試");
      await wrapper
        .findAll("input[type='url']")[0]
        .setValue("https://test.com");
      await wrapper.find("button.bg-forest-400").trigger("click");

      const lastSave = wrapper.emitted("save")?.slice(-1)[0][0] as any;
      expect(lastSave.source).toBe(sources[i]);
    }
  });

  it("資料正確且網址有效時應觸發 save", async () => {
    const wrapper = mountWithPinia({
      props: { initialData: {} },
    });

    const textInputs = wrapper.findAll("input[type='text']");
    await textInputs[0].setValue("我的景點");

    const urlInputs = wrapper.findAll("input[type='url']");
    await urlInputs[0].setValue("https://google.com");
    await wrapper.find("select").setValue("景點");

    // 輸入標籤但未按 Enter，儲存時應自動加入
    await textInputs[1].setValue("自動加入標籤");

    await wrapper.find("button.bg-forest-400").trigger("click");

    expect(wrapper.emitted("save")).toBeTruthy();
    const data = wrapper.emitted("save")![0][0] as any;
    expect(data.title).toBe("我的景點");
    expect(data.category).toBe("景點");
    expect(data.tags).toContain("自動加入標籤");
  });

  describe("閱覽/編輯模式 (Read/Edit Mode)", () => {
    it("當有 id 時, 預設應為閱覽模式", () => {
      const wrapper = mountWithPinia({
        props: { initialData: { id: "123", title: "Test" } },
      });
      // 閱覽模式下，輸入框不該存在
      expect(wrapper.find("input[placeholder*='拉麵']").exists()).toBe(false);
      // 應顯示標題文字
      expect(wrapper.find(".text-lg.font-bold").text()).toBe("Test");
    });

    it("當沒有 id 時, 預設應為編輯模式", () => {
      const wrapper = mountWithPinia({
        props: { initialData: { title: "Test" } },
      });
      // 編輯模式下，輸入框應存在
      expect(wrapper.find("input[placeholder*='拉麵']").exists()).toBe(true);
    });

    it("閱覽模式下，URL 應為可點擊的連結", () => {
      const wrapper = mountWithPinia({
        props: {
          initialData: {
            id: "123",
            url: "http://example.com",
            mapUrl: "http://maps.google.com",
          },
        },
      });

      const links = wrapper.findAll("a");
      const link1 = links.find(
        (l) => l.attributes("href") === "http://example.com",
      );
      const link2 = links.find(
        (l) => l.attributes("href") === "http://maps.google.com",
      );

      expect(link1?.exists()).toBe(true);
      expect(link1?.attributes("target")).toBe("_blank");

      expect(link2?.exists()).toBe(true);
      expect(link2?.attributes("target")).toBe("_blank");
    });

    it("點擊按鈕應能切換模式", async () => {
      const wrapper = mountWithPinia({
        props: { initialData: { id: "123", title: "Test" } },
      });

      // 初始為閱覽模式
      expect(wrapper.find("input[type='text']").exists()).toBe(false);

      // 點擊切換為編輯模式
      const toggleButton = wrapper.find("button.text-forest-400"); // '切換編輯' 按鈕
      await toggleButton.trigger("click");

      // 檢查是否切換到編輯模式
      expect(wrapper.find("input[placeholder*='拉麵']").exists()).toBe(true);
      expect(wrapper.find("button.bg-forest-400").exists()).toBe(true); // 儲存按鈕

      // 再次點擊切換回閱覽模式
      await toggleButton.trigger("click");
      expect(wrapper.find("input[placeholder*='拉麵']").exists()).toBe(false);
    });

    it("閱覽模式下不應顯示儲存按鈕, 但應顯示刪除按鈕", () => {
      const wrapper = mountWithPinia({
        props: { initialData: { id: "123" } },
      });
      // 儲存按鈕
      expect(wrapper.find("button.bg-forest-400").exists()).toBe(false);
      // 刪除按鈕
      expect(wrapper.find("button.border-red-50").exists()).toBe(true);
    });
  });
});
