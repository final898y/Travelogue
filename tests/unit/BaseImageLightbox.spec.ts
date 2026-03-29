import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import BaseImageLightbox from "../../src/components/ui/BaseImageLightbox.vue";

describe("BaseImageLightbox.vue", () => {
  const images = [
    { url: "img1.jpg", path: "path1" },
    { url: "img2.jpg", path: "path2" },
    { url: "img3.jpg", path: "path3" },
  ];

  const defaultProps = {
    isOpen: true,
    images: images,
    initialIndex: 0,
  };

  const mountLightbox = (props = {}) => {
    return mount(BaseImageLightbox, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          Teleport: true,
          Transition: true,
        },
      },
    });
  };

  it("當 isOpen 為 false 時不應渲染內容", () => {
    const wrapper = mountLightbox({ isOpen: false });
    expect(wrapper.find(".fixed").exists()).toBe(false);
  });

  it("當只有一張圖片時，不應顯示導航按鈕與計數器", () => {
    const singleImage = [images[0]];
    const wrapper = mountLightbox({ images: singleImage });

    expect(wrapper.find(".md\\:block").exists()).toBe(false); // ChevronLeft/Right 應該隱藏
    expect(wrapper.text()).not.toContain("1 / 1");
  });

  it("多圖模式下，應顯示正確的計數器", () => {
    const wrapper = mountLightbox({ initialIndex: 1 });
    expect(wrapper.text()).toContain("2 / 3");
  });

  it("點擊下一張按鈕應正確切換並循環", async () => {
    const wrapper = mountLightbox({ initialIndex: 1 });

    // 找到 Next 按鈕並點擊 (右側按鈕是 Next)
    const nextBtn = wrapper.findAll("button")[2];
    await nextBtn.trigger("click");
    expect(wrapper.text()).toContain("3 / 3");

    // 再次點擊應循環回第一張
    await nextBtn.trigger("click");
    expect(wrapper.text()).toContain("1 / 3");
  });

  it("點擊前一張按鈕應正確切換並循環", async () => {
    const wrapper = mountLightbox({ initialIndex: 0 });

    // 找到 Prev 按鈕並點擊
    const prevBtn = wrapper.findAll("button")[1];
    await prevBtn.trigger("click");
    expect(wrapper.text()).toContain("3 / 3");
  });

  it("應支援 Esc 鍵關閉", async () => {
    const wrapper = mountLightbox();

    const event = new KeyboardEvent("keydown", { key: "Escape" });
    window.dispatchEvent(event);

    await nextTick();
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("應支援鍵盤左右箭頭切換", async () => {
    const wrapper = mountLightbox({ initialIndex: 0 });

    // 按右箭頭
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    await nextTick();
    expect(wrapper.text()).toContain("2 / 3");

    // 按左箭頭
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    await nextTick();
    expect(wrapper.text()).toContain("1 / 3");
  });

  it("點擊遮罩背景應觸發關閉", async () => {
    const wrapper = mountLightbox();

    // 點擊最外層的 fixed div
    const overlay = wrapper.find(".fixed");
    await overlay.trigger("click");

    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("點擊圖片本身不應觸發關閉 (Stop Propagation)", async () => {
    const wrapper = mountLightbox();

    const img = wrapper.find("img");
    await img.trigger("click");

    expect(wrapper.emitted("close")).toBeFalsy();
  });

  it("當傳入新的 initialIndex 時應更新當前圖片", async () => {
    const wrapper = mountLightbox({ initialIndex: 0 });
    expect(wrapper.text()).toContain("1 / 3");

    await wrapper.setProps({ initialIndex: 2 });
    expect(wrapper.text()).toContain("3 / 3");
  });
});
