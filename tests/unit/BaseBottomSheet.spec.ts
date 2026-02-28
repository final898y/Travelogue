import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import BaseBottomSheet from "../../src/components/ui/BaseBottomSheet.vue";

// Mock Teleport needed for testing
const TeleportStub = {
  template: "<div><slot /></div>",
};

describe("BaseBottomSheet.vue", () => {
  let pushStateSpy: any;
  let backSpy: any;
  let confirmSpy: any;

  beforeEach(() => {
    // Mock History API
    pushStateSpy = vi
      .spyOn(window.history, "pushState")
      .mockImplementation(() => {});
    backSpy = vi.spyOn(window.history, "back").mockImplementation(() => {});
    confirmSpy = vi.spyOn(window, "confirm");

    // Mock initial history state
    Object.defineProperty(window.history, "state", {
      configurable: true,
      get: () => ({ sheetOpen: true }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mountComponent = (props = {}) => {
    return mount(BaseBottomSheet, {
      props: {
        isOpen: false,
        ...props,
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
  };

  describe("基礎渲染", () => {
    it("當 isOpen 為 false 時不應顯示內容", () => {
      const wrapper = mountComponent({ isOpen: false });
      expect(wrapper.find(".fixed.bottom-0").exists()).toBe(false);
    });

    it("當 isOpen 為 true 時應顯示內容與標題", () => {
      const title = "測試標題";
      const wrapper = mountComponent({ isOpen: true, title });
      expect(wrapper.find("h3").text()).toBe(title);
      expect(wrapper.find(".fixed.bottom-0").exists()).toBe(true);
    });
  });

  describe("UI 關閉觸發", () => {
    it("點擊背景遮罩應觸發 close 事件", async () => {
      const wrapper = mountComponent({ isOpen: true });
      await wrapper.find(".fixed.inset-0").trigger("click");
      expect(wrapper.emitted("close")).toBeTruthy();
    });

    it("點擊關閉按鈕應觸發 close 事件", async () => {
      const wrapper = mountComponent({ isOpen: true, title: "測試" });
      await wrapper.find("button").trigger("click");
      expect(wrapper.emitted("close")).toBeTruthy();
    });
  });

  describe("History API 與返回鍵邏輯", () => {
    it("當 isOpen 變為 true 時，應執行 pushState", async () => {
      const wrapper = mountComponent({ isOpen: false });
      await wrapper.setProps({ isOpen: true });
      expect(pushStateSpy).toHaveBeenCalled();
    });

    it("當透過 UI 關閉時 (isOpen 變為 false)，應執行 history.back()", async () => {
      const wrapper = mountComponent({ isOpen: true });
      // 模擬父組件將 isOpen 設為 false
      await wrapper.setProps({ isOpen: false });
      expect(backSpy).toHaveBeenCalled();
    });

    it("按下 Escape 鍵應觸發關閉", async () => {
      const wrapper = mountComponent({ isOpen: true });
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await nextTick();
      expect(wrapper.emitted("close")).toBeTruthy();
    });
  });

  describe("未儲存變更處理", () => {
    it("有未儲存變更時，關閉應顯示確認對話框", async () => {
      confirmSpy.mockReturnValue(false); // 使用者點擊「取消」
      const wrapper = mountComponent({ isOpen: true, hasUnsavedChanges: true });

      await wrapper.find(".fixed.inset-0").trigger("click");

      expect(confirmSpy).toHaveBeenCalled();
      expect(wrapper.emitted("close")).toBeFalsy();
    });
  });

  describe("手勢處理", () => {
    it("向下滑動應更新位移 (dragOffset)", async () => {
      const wrapper = mountComponent({ isOpen: true });
      const handlebar = wrapper.find(".cursor-grab");

      await handlebar.trigger("touchstart", {
        touches: [{ clientY: 100 }],
      });

      await handlebar.trigger("touchmove", {
        touches: [{ clientY: 150 }],
      });

      const sheet = wrapper.find(".fixed.bottom-0");
      expect(sheet.attributes("style")).toContain("translateY(50px)");
    });

    it("滑動超過閾值放開後應觸發關閉", async () => {
      const wrapper = mountComponent({ isOpen: true });
      const handlebar = wrapper.find(".cursor-grab");

      await handlebar.trigger("touchstart", { touches: [{ clientY: 100 }] });
      await handlebar.trigger("touchmove", { touches: [{ clientY: 250 }] }); // 下滑 150px
      await handlebar.trigger("touchend");

      expect(wrapper.emitted("close")).toBeTruthy();
    });
  });
});
