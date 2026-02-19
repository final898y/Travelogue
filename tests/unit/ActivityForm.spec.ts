import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import ActivityForm from "../../src/components/trip/ActivityForm.vue";

// Mock icons
vi.mock("../../src/assets/icons", () => ({
  Landmark: { template: "<svg />" },
  Utensils: { template: "<svg />" },
  Car: { template: "<svg />" },
  Bed: { template: "<svg />" },
  MapPin: { template: "<svg />" },
  Plus: { template: "<svg />" },
  X: { template: "<svg />" },
}));

describe("ActivityForm.vue", () => {
  it("應渲染預設表單狀態 (建立模式)", () => {
    const wrapper = mount(ActivityForm, {
      props: {
        initialData: {},
      },
    });

    // 檢查預設值
    const timeInput = wrapper.find("input[type='time']");
    expect((timeInput.element as HTMLInputElement).value).toBe("09:00");

    // 檢查按鈕
    expect(wrapper.find("button.bg-forest-400").text()).toContain("新增行程活動");
    // 刪除按鈕不應存在
    expect(wrapper.findAll("button").filter(b => b.text().includes("刪除此行程")).length).toBe(0);
  });

  it("應正確填入初始資料 (編輯模式)", () => {
    const initialData = {
      id: "123",
      title: "午餐",
      category: "food" as const,
      time: "12:30",
    };

    const wrapper = mount(ActivityForm, {
      props: {
        initialData,
      },
    });

    const titleInput = wrapper.find("input[placeholder='例如：東京鐵塔']");
    expect((titleInput.element as HTMLInputElement).value).toBe("午餐");
    
    // 檢查類別選取狀態 (food 對應第二個按鈕)
    // 我們檢查 class 是否包含選取樣式
    const foodBtn = wrapper.findAll(".grid.grid-cols-4 button")[1];
    expect(foodBtn.classes()).toContain("bg-forest-50");

    expect(wrapper.find("button.bg-forest-400").text()).toContain("儲存變更");
    // 刪除按鈕應存在
    expect(wrapper.findAll("button").filter(b => b.text().includes("刪除此行程")).length).toBe(1);
  });

  it("切換類別應更新 formData", async () => {
    const wrapper = mount(ActivityForm, {
      props: { initialData: {} },
    });

    const buttons = wrapper.findAll(".grid.grid-cols-4 button");
    // 點擊第三個 (交通)
    await buttons[2].trigger("click");
    
    // 檢查是否有 dirty update (因為預設是 sight)
    expect(wrapper.emitted("update:dirty")).toBeTruthy();
    expect(wrapper.emitted("update:dirty")![0][0]).toBe(true);
  });

  it("未輸入標題時不應觸發 save", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const wrapper = mount(ActivityForm, {
      props: { initialData: {} },
    });

    await wrapper.find("button.bg-forest-400").trigger("click");
    
    expect(alertSpy).toHaveBeenCalledWith("請輸入活動標題");
    expect(wrapper.emitted("save")).toBeFalsy();
    
    alertSpy.mockRestore();
  });

  it("應正確處理備選方案 (Options) 的新增與刪除", async () => {
    const wrapper = mount(ActivityForm, {
      props: { initialData: {} },
    });

    // 初始無方案
    expect(wrapper.text()).toContain("目前沒有備選方案");

    // 新增方案
    const addBtn = wrapper.find("button.text-forest-400"); // "新增方案" 按鈕
    await addBtn.trigger("click");

    expect(wrapper.findAll("input[placeholder*='方案標題']").length).toBe(1);

    // 刪除方案
    const removeBtn = wrapper.find("button.border-red-50"); // Delete X button
    await removeBtn.trigger("click");

    expect(wrapper.findAll("input[placeholder*='方案標題']").length).toBe(0);
  });

  it("點擊刪除按鈕應觸發 delete 事件", async () => {
    const wrapper = mount(ActivityForm, {
      props: {
        initialData: { id: "123", title: "Test" },
      },
    });

    const deleteBtn = wrapper.findAll("button").find(b => b.text().includes("刪除此行程"));
    await deleteBtn?.trigger("click");

    expect(wrapper.emitted("delete")).toBeTruthy();
  });
});
