import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import CollectionForm from "../../src/components/trip/CollectionForm.vue";

// Mock icons
vi.mock("../../src/assets/icons", () => ({
  Globe: { template: "<svg />" },
  AtSign: { template: "<svg />" },
  Instagram: { template: "<svg />" },
  Youtube: { template: "<svg />" },
  MoreHorizontal: { template: "<svg />" },
}));

describe("CollectionForm.vue", () => {
  it("應渲染預設表單狀態 (建立模式)", () => {
    const wrapper = mount(CollectionForm, {
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
      category: "美食",
      source: "instagram" as const,
    };

    const wrapper = mount(CollectionForm, {
      props: {
        initialData,
      },
    });

    expect(
      (wrapper.find("input[type='text']").element as HTMLInputElement).value,
    ).toBe("好吃拉麵");
    expect((wrapper.find("select").element as HTMLSelectElement).value).toBe(
      "美食",
    );

    // IG 對應第三個按鈕 (index 2)
    const igBtn = wrapper.findAll(".grid-cols-5 button")[2];
    expect(igBtn.classes()).toContain("border-forest-400");
  });

  it("切換分類應更新 formData", async () => {
    const wrapper = mount(CollectionForm, {
      props: { initialData: {} },
    });

    const select = wrapper.find("select");
    await select.setValue("景點");

    expect(wrapper.emitted("update:dirty")).toBeTruthy();
    expect(wrapper.emitted("update:dirty")![0][0]).toBe(true);
  });

  it("標題或網址未輸入時應擋下儲存並提示", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const wrapper = mount(CollectionForm, {
      props: { initialData: {} },
    });

    // Case 1: 沒標題
    await wrapper.find("button.bg-forest-400").trigger("click");
    expect(alertSpy).toHaveBeenCalledWith("請輸入標題");

    // Case 2: 有標題沒網址
    await wrapper.find("input[type='text']").setValue("測試");
    await wrapper.find("button.bg-forest-400").trigger("click");
    expect(alertSpy).toHaveBeenCalledWith("請輸入網址");

    alertSpy.mockRestore();
  });

  it("資料正確且網址有效時應觸發 save", async () => {
    const wrapper = mount(CollectionForm, {
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
