import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import PlanHeader from "../../src/components/ui/PlanHeader.vue";

describe("PlanHeader.vue", () => {
  const defaultProps = {
    title: "東京賞櫻",
    daysToTrip: 5,
    weather: {
      temp: 18,
      condition: "Sunny",
      icon: "sun",
    },
  };

  it("應正確渲染標題與倒數天數", () => {
    const wrapper = mount(PlanHeader, {
      props: defaultProps,
    });
    
    expect(wrapper.text()).toContain("東京賞櫻");
    expect(wrapper.text()).toContain("距離出發還有 5 天");
  });

  it("應正確渲染天氣資訊", () => {
    const wrapper = mount(PlanHeader, {
      props: defaultProps,
    });
    
    expect(wrapper.text()).toContain("18°C");
    expect(wrapper.text()).toContain("Sunny");
  });

  it("點擊返回按鈕應觸發 click-back 事件", async () => {
    const wrapper = mount(PlanHeader, {
      props: defaultProps,
    });
    
    // Back button is the first button in the template based on structure
    // structure: button(back) -> div(flex) -> buttons(actions)
    const backBtn = wrapper.find("button"); 
    await backBtn.trigger("click");
    
    expect(wrapper.emitted("click-back")).toBeTruthy();
  });
});
