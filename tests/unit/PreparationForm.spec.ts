import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { createTestingPinia } from "@pinia/testing";
import PreparationForm from "../../src/components/trip/PreparationForm.vue";
import { useUIStore } from "../../src/stores/uiStore";

// Mock icons
vi.mock("../../src/assets/icons", () => ({
  Briefcase: { template: '<svg data-icon="Briefcase" />' },
  FileText: { template: '<svg data-icon="FileText" />' },
  CreditCard: { template: '<svg data-icon="CreditCard" />' },
  Pill: { template: '<svg data-icon="Pill" />' },
  Smartphone: { template: '<svg data-icon="Smartphone" />' },
  CheckSquare: { template: '<svg data-icon="CheckSquare" />' },
  Plus: { template: '<svg data-icon="Plus" />' },
}));

describe("PreparationForm.vue", () => {
  const mountWithPinia = (options = {}) => {
    return mount(PreparationForm, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            stubActions: false,
          }),
        ],
      },
      ...options,
    });
  };

  it("應正確渲染初始狀態", () => {
    const wrapper = mountWithPinia({
      props: {
        initialData: { title: "準備行李", category: "行李" },
      },
    });

    expect(wrapper.find("input").exists()).toBe(true);
    expect((wrapper.find("input").element as HTMLInputElement).value).toBe(
      "準備行李",
    );
  });

  it("未輸入標題時應顯示警告且不發送事件", async () => {
    const wrapper = mountWithPinia({
      props: {
        initialData: { title: "" },
      },
    });
    const uiStore = useUIStore();

    await wrapper.find("button.bg-forest-400").trigger("click");

    expect(uiStore.showToast).toHaveBeenCalledWith("請輸入項目名稱", "warning");
    expect(wrapper.emitted("save")).toBeFalsy();
  });

  it("點擊類別按鈕應切換類別", async () => {
    const wrapper = mountWithPinia({
      props: {
        initialData: { title: "測試項目", category: "行李" },
      },
    });

    // 找到 "證件簽證" 類別按鈕並點擊
    const certBtn = wrapper
      .findAll("button")
      .find((b) => b.text().includes("證件簽證"));
    await certBtn?.trigger("click");

    const vm = wrapper.vm as any;
    expect(vm.formData.category).toBe("證件");
    // 檢查是否有選中樣式
    expect(certBtn?.classes()).toContain("border-forest-400");
  });

  it("修改標題應發送 update:dirty 事件", async () => {
    const wrapper = mountWithPinia({
      props: {
        initialData: { title: "原項目" },
      },
    });

    await wrapper.find("input").setValue("新項目");
    await nextTick();

    expect(wrapper.emitted("update:dirty")).toBeTruthy();
    expect(wrapper.emitted("update:dirty")?.at(-1)).toEqual([true]);

    await wrapper.find("input").setValue("原項目");
    await nextTick();
    expect(wrapper.emitted("update:dirty")?.at(-1)).toEqual([false]);
  });

  it("正確輸入時應發送 save 事件", async () => {
    const wrapper = mountWithPinia({
      props: {
        initialData: { title: "更換外幣", category: "金融" },
      },
    });

    await wrapper.find("button.bg-forest-400").trigger("click");

    expect(wrapper.emitted("save")).toBeTruthy();
    const payload = wrapper.emitted("save")![0][0] as any;
    expect(payload.title).toBe("更換外幣");
    expect(payload.category).toBe("金融");
  });
});
