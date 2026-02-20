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
    };

    const wrapper = mountWithPinia({
      props: {
        initialData,
      },
    });

    const textInput = wrapper.find("input[type='text']");
    const urlInputs = wrapper.findAll("input[type='url']");

    expect((textInput.element as HTMLInputElement).value).toBe("好吃拉麵");
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

    // IG 對應第三個按鈕 (index 2)
    const igBtn = wrapper.findAll(".grid-cols-5 button")[2];
    expect(igBtn.classes()).toContain("border-forest-400");
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
    await wrapper.find("input[type='text']").setValue("測試");
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

    await wrapper.find("input[type='text']").setValue("我的景點");
    await wrapper.find("input[type='url']").setValue("https://google.com");
    await wrapper.find("select").setValue("景點");

    await wrapper.find("button.bg-forest-400").trigger("click");

    expect(wrapper.emitted("save")).toBeTruthy();
    const data = wrapper.emitted("save")![0][0] as any;
    expect(data.title).toBe("我的景點");
    expect(data.category).toBe("景點");
  });
});
