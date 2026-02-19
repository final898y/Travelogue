import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import BaseBottomSheet from "../../src/components/ui/BaseBottomSheet.vue";

// Mock Teleport needed for testing
const TeleportStub = {
  template: "<div><slot /></div>",
};

describe("BaseBottomSheet.vue", () => {
  it("當 isOpen 為 false 時不應顯示內容", () => {
    const wrapper = mount(BaseBottomSheet, {
      props: {
        isOpen: false,
      },
      global: {
        stubs: {
          Teleport: TeleportStub,
          Transition: {
            template: "<div><slot /></div>",
          },
        },
      },
    });

    expect(wrapper.find(".fixed.bottom-0").exists()).toBe(false);
  });

  it("當 isOpen 為 true 時應顯示內容與標題", () => {
    const title = "測試標題";
    const wrapper = mount(BaseBottomSheet, {
      props: {
        isOpen: true,
        title,
      },
      global: {
        stubs: {
          Teleport: TeleportStub,
          Transition: {
            template: "<div><slot /></div>",
          },
        },
      },
    });

    expect(wrapper.find("h3").text()).toBe(title);
    expect(wrapper.find(".fixed.bottom-0").exists()).toBe(true);
  });

  it("點擊背景遮罩應觸發 close 事件", async () => {
    const wrapper = mount(BaseBottomSheet, {
      props: {
        isOpen: true,
      },
      global: {
        stubs: {
          Teleport: TeleportStub,
          Transition: {
            template: "<div><slot /></div>",
          },
        },
      },
    });

    // 找到遮罩並點擊
    const backdrop = wrapper.find(".fixed.inset-0");
    await backdrop.trigger("click");

    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("點擊關閉按鈕應觸發 close 事件", async () => {
    const wrapper = mount(BaseBottomSheet, {
      props: {
        isOpen: true,
        title: "測試",
      },
      global: {
        stubs: {
          Teleport: TeleportStub,
          Transition: {
            template: "<div><slot /></div>",
          },
        },
      },
    });

    // 找到關閉按鈕 (header 中的 button)
    const closeBtn = wrapper.find("button");
    await closeBtn.trigger("click");

    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("有未儲存變更時，關閉應觸發確認對話框", async () => {
    const confirmSpy = vi
      .spyOn(window, "confirm")
      .mockImplementation(() => false); // 模擬取消
    const wrapper = mount(BaseBottomSheet, {
      props: {
        isOpen: true,
        hasUnsavedChanges: true,
        title: "測試",
      },
      global: {
        stubs: {
          Teleport: TeleportStub,
          Transition: {
            template: "<div><slot /></div>",
          },
        },
      },
    });

    const closeBtn = wrapper.find("button");
    await closeBtn.trigger("click");

    expect(confirmSpy).toHaveBeenCalled();
    expect(wrapper.emitted("close")).toBeFalsy(); // 因為我們模擬取消

    confirmSpy.mockImplementation(() => true); // 模擬確認
    await closeBtn.trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();

    confirmSpy.mockRestore();
  });
});
