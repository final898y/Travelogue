import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import TripForm from "../../src/components/trip/TripForm.vue";

// Mock authStore
vi.mock("../../src/stores/authStore", () => ({
  useAuthStore: () => ({
    user: { email: "test@example.com" },
  }),
}));

// Mock icons
vi.mock("../../src/assets/icons", () => ({
  Check: { template: '<svg data-icon="Check" />' },
  UserPlus: { template: '<svg data-icon="UserPlus" />' },
  X: { template: '<svg data-icon="X" />' },
}));

describe("TripForm.vue", () => {
  it("應渲染預設表單狀態 (建立模式)", () => {
    const wrapper = mount(TripForm);

    const inputs = wrapper.findAll("input");
    const titleInput = inputs[0]; // Title is first input

    expect((titleInput.element as HTMLInputElement).value).toBe("");

    // 按鈕文字應為 "開啟新旅程"
    expect(wrapper.find("button.bg-forest-400").text()).toContain("開啟新旅程");

    // 狀態選擇應不顯示
    expect(wrapper.find("select").exists()).toBe(false);
  });

  it("應正確渲染編輯模式並填入初始資料", () => {
    const initialData = {
      id: "123",
      title: "京都之旅",
      startDate: "2024-04-01",
      endDate: "2024-04-05",
      status: "upcoming" as const,
      members: [{ id: "me", name: "我" }],
    };

    const wrapper = mount(TripForm, {
      props: {
        initialData,
      },
    });

    const inputs = wrapper.findAll("input");
    expect((inputs[0].element as HTMLInputElement).value).toBe("京都之旅");
    expect((inputs[1].element as HTMLInputElement).value).toBe("2024-04-01");

    // 狀態選擇應顯示
    const select = wrapper.find("select");
    expect(select.exists()).toBe(true);
    expect((select.element as HTMLSelectElement).value).toBe("upcoming");

    // 按鈕文字應為 "儲存變更"
    expect(wrapper.find("button.bg-forest-400").text()).toContain("儲存變更");
  });

  it("應正確計算天數", async () => {
    const wrapper = mount(TripForm);

    // 設定日期 (4/1 - 4/5 = 5天)
    const inputs = wrapper.findAll("input");
    await inputs[1].setValue("2024-04-01"); // Start
    await inputs[2].setValue("2024-04-05"); // End

    const daysBadge = wrapper.find(".bg-forest-50 span:last-child");
    expect(daysBadge.text()).toContain("5 天");
  });

  it("未輸入標題時不應觸發 save 事件", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const wrapper = mount(TripForm);

    await wrapper.find("button.bg-forest-400").trigger("click");

    expect(alertSpy).toHaveBeenCalledWith("請輸入旅程標題");
    expect(wrapper.emitted("save")).toBeFalsy();

    alertSpy.mockRestore();
  });

  it("開始日期晚於結束日期時不應觸發 save 事件", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const wrapper = mount(TripForm);

    const inputs = wrapper.findAll("input");
    await inputs[0].setValue("測試旅程");
    await inputs[1].setValue("2024-04-10"); // Start
    await inputs[2].setValue("2024-04-01"); // End (earlier)

    await wrapper.find("button.bg-forest-400").trigger("click");

    expect(alertSpy).toHaveBeenCalledWith("開始日期不能晚於結束日期");
    expect(wrapper.emitted("save")).toBeFalsy();

    alertSpy.mockRestore();
  });

  it("資料正確時應觸發 save 事件並傳遞正確資料", async () => {
    const wrapper = mount(TripForm);

    const inputs = wrapper.findAll("input");
    await inputs[0].setValue("大阪行");
    await inputs[1].setValue("2024-05-01");
    await inputs[2].setValue("2024-05-03"); // 3 days

    await wrapper.find("button.bg-forest-400").trigger("click");

    expect(wrapper.emitted("save")).toBeTruthy();
    const emittedData = wrapper.emitted("save")![0][0] as any;

    expect(emittedData.title).toBe("大阪行");
    expect(emittedData.days).toBe(3);
    expect(emittedData.startDate).toBe("2024-05-01");
  });

  it("修改資料時應觸發 update:dirty 事件", async () => {
    const wrapper = mount(TripForm);

    const input = wrapper.find("input[type='text']");
    await input.setValue("新標題");

    expect(wrapper.emitted("update:dirty")).toBeTruthy();
    expect(wrapper.emitted("update:dirty")![0][0]).toBe(true);
  });

  it("應能新增與刪除旅伴", async () => {
    const wrapper = mount(TripForm);
    const expectedDefaultName = "test"; // derived from test@example.com

    // 初始應只有預設旅伴名稱
    expect(wrapper.text()).toContain(expectedDefaultName);

    // 模擬輸入新旅伴
    const input = wrapper.find("input[placeholder='輸入旅伴姓名']");
    await input.setValue("夥伴X");

    // 點擊新增按鈕
    const userPlusBtn = wrapper.find('[data-icon="UserPlus"]').element
      .parentElement as HTMLButtonElement;
    await userPlusBtn.click();
    await nextTick();

    // 檢查標籤數量 (原本 1 個，現在應有 2 個)
    const tags = wrapper.findAll(".rounded-full.bg-white.border-forest-100");
    expect(tags.length).toBe(2);
    expect(tags.some((t) => t.text().includes("夥伴X"))).toBe(true);

    // 刪除旅伴
    const xBtn = wrapper.find('[data-icon="X"]').element
      .parentElement as HTMLButtonElement;
    await xBtn.click();
    await nextTick();

    expect(
      wrapper.findAll(".rounded-full.bg-white.border-forest-100").length,
    ).toBe(1);
  });
});
