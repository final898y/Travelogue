import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BaseCard from "../../src/components/ui/BaseCard.vue";

describe("BaseCard.vue", () => {
  it("應渲染預設插槽內容", () => {
    const content = "<div>測試內容</div>";
    const wrapper = mount(BaseCard, {
      slots: {
        default: content,
      },
    });
    expect(wrapper.html()).toContain(content);
  });

  it("應套用預設 props (padding: md, background: white)", () => {
    const wrapper = mount(BaseCard);
    expect(wrapper.classes()).toContain("p-6"); // md
    expect(wrapper.classes()).toContain("bg-white");
    expect(wrapper.classes()).toContain("shadow-soft");
  });

  it("應正確套用自定義 padding", () => {
    const wrapper = mount(BaseCard, {
      props: {
        padding: "lg",
      },
    });
    expect(wrapper.classes()).toContain("p-8");
  });

  it("應正確套用自定義背景色", () => {
    const wrapper = mount(BaseCard, {
      props: {
        background: "cream",
      },
    });
    expect(wrapper.classes()).toContain("bg-cream-light");
  });

  it("當 hoverable 為 true 時應有 cursor-pointer 類別", () => {
    const wrapper = mount(BaseCard, {
      props: {
        hoverable: true,
      },
    });
    expect(wrapper.classes()).toContain("cursor-pointer");
    expect(wrapper.classes()).toContain("card-base");
  });
});
