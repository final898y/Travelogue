import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import CollectionForm from "../../src/components/trip/CollectionForm.vue";
import { useUIStore } from "../../src/stores/uiStore";

// Mock icons
vi.mock("../../src/assets/icons", () => ({
  Globe: { template: "<svg />" },
  AtSign: { template: "<svg />" },
  Instagram: { template: "<svg />" },
  Youtube: { template: "<svg />" },
  MoreHorizontal: { template: "<svg />" },
  X: { template: "<svg />" },
  Plus: { template: "<svg />" },
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

  it("應正確渲染編輯模式並填入資料", () => {
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
});
