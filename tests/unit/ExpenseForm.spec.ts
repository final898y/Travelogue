import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { createTestingPinia } from "@pinia/testing";
import ExpenseForm from "../../src/components/trip/ExpenseForm.vue";
import { useUIStore } from "../../src/stores/uiStore";

// Mock icons
vi.mock("../../src/assets/icons", () => ({
  Utensils: { template: '<svg data-icon="Utensils" />' },
  Car: { template: '<svg data-icon="Car" />' },
  Bed: { template: '<svg data-icon="Bed" />' },
  Landmark: { template: '<svg data-icon="Landmark" />' },
  ShoppingBag: { template: '<svg data-icon="ShoppingBag" />' },
  MoreHorizontal: { template: '<svg data-icon="MoreHorizontal" />' },
  Check: { template: '<svg data-icon="Check" />' },
  RefreshCcw: { template: '<svg data-icon="RefreshCcw" />' },
  FileText: { template: '<svg data-icon="FileText" />' },
}));

describe("ExpenseForm.vue", () => {
  const tripMembers = [
    { id: "me", name: "我" },
    { id: "p1", name: "夥伴A" },
    { id: "p2", name: "夥伴B" },
  ];

  const mountWithPinia = (options = {}) => {
    return mount(ExpenseForm, {
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
        initialData: { type: "expense" },
        tripMembers,
      },
    });

    expect(wrapper.find("input[placeholder='0.00']").exists()).toBe(true);
    expect(wrapper.text()).toContain("新增支出");
    expect(wrapper.text()).toContain("紀錄還款");
  });

  it("切換至還款模式時應更新 UI", async () => {
    const wrapper = mountWithPinia({
      props: {
        initialData: { type: "expense" },
        tripMembers,
      },
    });

    const repayBtn = wrapper
      .findAll("button")
      .find((b) => b.text().includes("紀錄還款"));
    await repayBtn?.trigger("click");

    expect(wrapper.text()).toContain("付款人 (還錢的人)");
    expect(wrapper.text()).toContain("收款人 (被還錢的人)");
    // 檢查切換按鈕的顏色 (蜂蜜橘)
    const activeBtn = wrapper.find("button.text-honey-orange");
    expect(activeBtn.exists()).toBe(true);
    expect(activeBtn.text()).toContain("紀錄還款");
  });

  it("均分模式應正確計算平均金額", async () => {
    const wrapper = mountWithPinia({
      props: {
        initialData: { amount: 300, splitWith: ["me", "p1", "p2"] },
        tripMembers,
      },
    });

    expect(wrapper.text()).toContain("100"); // 300 / 3
  });

  it("開啟自訂金額模式應顯示獨立輸入框", async () => {
    const wrapper = mountWithPinia({
      props: {
        initialData: { amount: 1000, splitWith: ["me", "p1"] },
        tripMembers,
      },
    });

    const customBtn = wrapper
      .findAll("button")
      .find((b) => b.text().includes("平均分攤"));
    await customBtn?.trigger("click");
    await nextTick();

    expect(wrapper.text()).toContain("自訂金額");
    const inputs = wrapper.findAll("input[type='number']");
    // 總金額輸入框 + 兩個成員的自訂輸入框
    expect(inputs.length).toBe(3);
  });

  it("當自訂金額總和不符時應攔截儲存並提示", async () => {
    const wrapper = mountWithPinia({
      props: {
        initialData: {
          type: "expense",
          amount: 1000,
          description: "測試支出",
          payer: "me",
          splitWith: ["me", "p1"],
        },
        tripMembers,
      },
    });
    const uiStore = useUIStore();

    // 切換到自訂模式
    await wrapper
      .findAll("button")
      .find((b) => b.text().includes("平均分攤"))
      ?.trigger("click");
    await nextTick();

    // 直接修改 vm 資料來模擬輸入 (因為 setValue 在 v-if 多層結構下有時不穩定)
    const vm = wrapper.vm as any;
    vm.formData.customAmounts["me"] = 500;
    vm.formData.customAmounts["p1"] = 400; // 總共 900 != 1000
    await nextTick();

    const saveBtn = wrapper
      .findAll("button")
      .find((b) => b.text().includes("新增紀錄"));
    await saveBtn?.trigger("click");

    expect(uiStore.showToast).toHaveBeenCalledWith(
      expect.stringContaining("自訂金額總和 (900) 與支出金額 (1000) 不符"),
      "warning",
    );
    expect(wrapper.emitted("save")).toBeFalsy();
  });

  it("自訂金額正確時應發送 save 事件並帶入 customAmounts", async () => {
    const wrapper = mountWithPinia({
      props: {
        initialData: {
          type: "expense",
          amount: 1000,
          description: "測試支出",
          payer: "me",
          splitWith: ["me", "p1"],
        },
        tripMembers,
      },
    });

    await wrapper
      .findAll("button")
      .find((b) => b.text().includes("平均分攤"))
      ?.trigger("click");
    await nextTick();

    const vm = wrapper.vm as any;
    vm.formData.customAmounts["me"] = 600;
    vm.formData.customAmounts["p1"] = 400; // 總共 1000
    await nextTick();

    const saveBtn = wrapper
      .findAll("button")
      .find((b) => b.text().includes("新增紀錄"));
    await saveBtn?.trigger("click");

    expect(wrapper.emitted("save")).toBeTruthy();
    const savedData = wrapper.emitted("save")![0][0] as any;
    expect(savedData.customAmounts).toEqual({ me: 600, p1: 400 });
  });

  it("還款模式不應顯示自訂金額按鈕", async () => {
    const wrapper = mountWithPinia({
      props: {
        initialData: { type: "repayment" },
        tripMembers,
      },
    });

    expect(wrapper.text()).not.toContain("平均分攤");
    expect(wrapper.text()).not.toContain("自訂金額");
  });
});
