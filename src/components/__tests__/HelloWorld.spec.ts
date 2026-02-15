import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import HelloWorld from "../HelloWorld.vue";

describe("HelloWorld.vue", () => {
  it("應正確渲染傳入的 msg 屬性", () => {
    const msg = "你好，Travelogue！";
    const wrapper = mount(HelloWorld, {
      props: { msg },
    });

    expect(wrapper.text()).toContain(msg);
  });

  it("點擊按鈕後 count 應增加", async () => {
    const wrapper = mount(HelloWorld, {
      props: { msg: "測試" },
    });

    const button = wrapper.find("button");
    await button.trigger("click");

    expect(wrapper.text()).toContain("count is 1");
  });
});
