import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import HorizontalDatePicker from "../../src/components/ui/HorizontalDatePicker.vue";

describe("HorizontalDatePicker.vue", () => {
  const mockDates = [
    { fullDate: "2024-03-20", weekday: "Wed", day: "20" },
    { fullDate: "2024-03-21", weekday: "Thu", day: "21" },
    { fullDate: "2024-03-22", weekday: "Fri", day: "22" },
  ];

  it("應渲染正確數量的日期按鈕", () => {
    const wrapper = mount(HorizontalDatePicker, {
      props: {
        dates: mockDates,
        modelValue: "2024-03-20",
      },
    });
    const buttons = wrapper.findAll("button");
    expect(buttons.length).toBe(3);
  });

  it("應正確顯示日期與星期", () => {
    const wrapper = mount(HorizontalDatePicker, {
      props: {
        dates: mockDates,
        modelValue: "2024-03-20",
      },
    });
    const firstButton = wrapper.find("button");
    expect(firstButton.text()).toContain("Wed");
    expect(firstButton.text()).toContain("20");
  });

  it("選中的日期應有正確的樣式 (bg-forest-400)", () => {
    const wrapper = mount(HorizontalDatePicker, {
      props: {
        dates: mockDates,
        modelValue: "2024-03-21", // Select second date
      },
    });
    const buttons = wrapper.findAll("button");

    // First button (not selected)
    expect(buttons[0].classes()).not.toContain("bg-forest-400");
    expect(buttons[0].classes()).toContain("bg-white");

    // Second button (selected)
    expect(buttons[1].classes()).toContain("bg-forest-400");
    expect(buttons[1].classes()).not.toContain("bg-white");
  });

  it("點擊日期應觸發 update:modelValue 事件", async () => {
    const wrapper = mount(HorizontalDatePicker, {
      props: {
        dates: mockDates,
        modelValue: "2024-03-20",
      },
    });

    const buttons = wrapper.findAll("button");
    await buttons[2].trigger("click"); // Click 3rd date

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    expect(wrapper.emitted("update:modelValue")![0][0]).toBe("2024-03-22");
  });
});
