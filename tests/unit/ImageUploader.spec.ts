import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import ImageUploader from "../../src/components/ui/ImageUploader.vue";
import { uploadImage } from "../../src/services/storageService";
import { useUIStore } from "../../src/stores/uiStore";

// Mock storageService
vi.mock("../../src/services/storageService", () => ({
  uploadImage: vi.fn(),
  deleteImage: vi.fn(),
}));

// Mock URL.createObjectURL/revokeObjectURL
global.URL.createObjectURL = vi.fn(() => "mock-url");
global.URL.revokeObjectURL = vi.fn();

describe("ImageUploader.vue", () => {
  const defaultProps = {
    images: [],
    userId: "user123",
    documentId: "doc456",
    maxImages: 3,
  };

  const mountWithPinia = (options = {}) => {
    return mount(ImageUploader, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
          }),
        ],
      },
      ...options,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("應該正確渲染初始狀態與上傳按鈕", () => {
    const wrapper = mountWithPinia({ props: defaultProps });
    expect(wrapper.find("button").text()).toContain("上傳圖片");
    expect(wrapper.text()).toContain("0/3");
  });

  it("當超過張數限制時應顯示警告", async () => {
    const wrapper = mountWithPinia({
      props: {
        ...defaultProps,
        images: [
          { url: "1", path: "p1" },
          { url: "2", path: "p2" },
          { url: "3", path: "p3" },
        ],
      },
    });
    const uiStore = useUIStore();

    // 模擬選取一個檔案
    const input = wrapper.find("input[type='file']");
    const file = new File([""], "test.jpg", { type: "image/jpeg" });

    // 手動觸發 change
    Object.defineProperty(input.element, "files", {
      value: [file],
    });
    await input.trigger("change");

    expect(uiStore.showToast).toHaveBeenCalledWith(
      expect.stringContaining("最多只能上傳"),
      "warning",
    );
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it("檔案過大時應顯示錯誤", async () => {
    const wrapper = mountWithPinia({ props: defaultProps });
    const uiStore = useUIStore();

    const largeFile = new File(["a".repeat(11 * 1024 * 1024)], "big.jpg", {
      type: "image/jpeg",
    });
    const input = wrapper.find("input[type='file']");

    Object.defineProperty(input.element, "files", {
      value: [largeFile],
    });
    await input.trigger("change");

    expect(uiStore.showToast).toHaveBeenCalledWith(
      expect.stringContaining("超過 10MB"),
      "error",
    );
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it("上傳成功後應觸發 update:images 事件", async () => {
    const wrapper = mountWithPinia({ props: defaultProps });
    const mockResult = { url: "http://done.com/1.jpg", path: "path/1.jpg" };
    (uploadImage as any).mockResolvedValue(mockResult);

    const file = new File([""], "test.jpg", { type: "image/jpeg" });
    const input = wrapper.find("input[type='file']");

    Object.defineProperty(input.element, "files", {
      value: [file],
    });
    // 使用新的 handle 方法名稱或直接觸發 change
    await input.trigger("change");

    // 等待非同步上傳完成
    await vi.waitFor(() => {
      expect(wrapper.emitted("update:images")).toBeTruthy();
    });

    const emitted = wrapper.emitted("update:images")![0][0] as any[];
    expect(emitted).toContainEqual(mockResult);
  });

  it("點擊刪除按鈕應觸發 update:images 移除該項", async () => {
    const images = [{ url: "u1", path: "p1" }];
    const wrapper = mountWithPinia({
      props: { ...defaultProps, images },
    });

    // 點擊 X 按鈕 (第一個按鈕是 X)
    const removeBtn = wrapper.find("button.absolute");
    await removeBtn.trigger("click");

    expect(wrapper.emitted("update:images")).toBeTruthy();
    expect(wrapper.emitted("update:images")![0][0]).toHaveLength(0);
  });

  it("唯讀模式下不應顯示上傳與刪除按鈕", () => {
    const images = [{ url: "u1", path: "p1" }];
    const wrapper = mountWithPinia({
      props: { ...defaultProps, images, isReadOnly: true },
    });

    expect(wrapper.find("button.relative").exists()).toBe(false); // 上傳按鈕
    expect(wrapper.find("button.absolute").exists()).toBe(false); // 刪除按鈕
  });
});
