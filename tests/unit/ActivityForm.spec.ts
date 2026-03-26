import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import ActivityForm from "../../src/components/trip/ActivityForm.vue";
import { useUIStore } from "../../src/stores/uiStore";

// Mock icons
vi.mock("../../src/assets/icons", () => ({
  Landmark: { template: "<svg />" },
  Utensils: { template: "<svg />" },
  Car: { template: "<svg />" },
  Bed: { template: "<svg />" },
  MapPin: { template: "<svg />" },
  Plus: { template: "<svg />" },
  X: { template: "<svg />" },
  Globe: { template: "<svg />" },
  Map: { template: "<svg />" },
  Pencil: { template: "<!-- Pencil -->" },
  BookOpen: { template: "<!-- BookOpen -->" },
  ExternalLink: { template: "<!-- ExternalLink -->" },
  Palette: { template: "<!-- Palette -->" },
}));

// Mock ImageUploader
vi.mock("../../src/components/ui/ImageUploader.vue", () => ({
  default: {
    name: "ImageUploader",
    template: "<div class='mock-image-uploader' />",
    props: ["images", "userId", "documentId", "isReadOnly"],
  },
}));

describe("ActivityForm.vue", () => {
  const mountWithPinia = (options = {}) => {
    return mount(ActivityForm, {
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

  it("應渲染預設表單狀態 (建立模式)", () => {
    const wrapper = mountWithPinia({
      props: {
        initialData: {},
      },
    });

    // 檢查預設值
    const timeInput = wrapper.find("input[type='time']");
    expect((timeInput.element as HTMLInputElement).value).toBe("09:00");

    // 檢查按鈕
    expect(wrapper.find("button.bg-forest-400").text()).toContain(
      "新增行程活動",
    );
    // 刪除按鈕不應存在
    expect(
      wrapper.findAll("button").filter((b) => b.text().includes("刪除此行程"))
        .length,
    ).toBe(0);
  });

  it("應正確填入初始資料 (編輯模式)", async () => {
    const initialData = {
      id: "123",
      title: "午餐",
      category: "food" as const,
      time: "12:30",
    };

    const wrapper = mountWithPinia({
      props: {
        initialData,
      },
    });

    // [FIX]: 組件現在預設為閱覽模式，需先切換到編輯模式
    const toggleButton = wrapper.find("button.text-forest-400"); // '切換編輯' 按鈕
    await toggleButton.trigger("click");

    const titleInput = wrapper.find("input[placeholder='例如：東京鐵塔']");
    expect((titleInput.element as HTMLInputElement).value).toBe("午餐");

    // 檢查類別選取狀態 (food 對應第二個按鈕)
    // 我們檢查 class 是否包含選取樣式
    const foodBtn = wrapper.findAll(".grid.grid-cols-4 button")[1];
    expect(foodBtn.classes()).toContain("bg-forest-50");

    expect(wrapper.find("button.bg-forest-400").text()).toContain("儲存變更");
    // 刪除按鈕應存在
    expect(
      wrapper.findAll("button").filter((b) => b.text().includes("刪除此行程"))
        .length,
    ).toBe(1);
  });

  it("切換類別應更新 formData", async () => {
    const wrapper = mountWithPinia({
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
    const wrapper = mountWithPinia({
      props: { initialData: {} },
    });
    const uiStore = useUIStore();

    await wrapper.find("button.bg-forest-400").trigger("click");

    expect(uiStore.showToast).toHaveBeenCalledWith("請輸入活動標題", "warning");
    expect(wrapper.emitted("save")).toBeFalsy();
  });

  it("應正確處理備選方案 (Options) 的新增與刪除", async () => {
    const wrapper = mountWithPinia({
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
    const wrapper = mountWithPinia({
      props: {
        initialData: { id: "123", title: "Test" },
      },
    });

    const deleteBtn = wrapper
      .findAll("button")
      .find((b) => b.text().includes("刪除此行程"));
    await deleteBtn?.trigger("click");

    expect(wrapper.emitted("delete")).toBeTruthy();
  });

  describe("閱覽/編輯模式 (Read/Edit Mode)", () => {
    it("當有 id 時, 預設應為閱覽模式", () => {
      const wrapper = mountWithPinia({
        props: { initialData: { id: "123", title: "Test Activity" } },
      });
      // 閱覽模式下，標題輸入框不該存在
      expect(wrapper.find("input[placeholder*='東京鐵塔']").exists()).toBe(
        false,
      );
      // 應顯示標題文字
      expect(wrapper.find(".text-lg.font-bold").text()).toBe("Test Activity");
    });

    it("當沒有 id 時, 預設應為編輯模式", () => {
      const wrapper = mountWithPinia({
        props: { initialData: { title: "New Activity" } },
      });
      // 編輯模式下，標題輸入框應存在
      expect(wrapper.find("input[placeholder*='東京鐵塔']").exists()).toBe(
        true,
      );
    });

    it("閱覽模式下，mapUrl 和 coordinates 應轉為可點擊連結", () => {
      const wrapper = mountWithPinia({
        props: {
          initialData: {
            id: "123",
            mapUrl: "http://example.com/map",
            coordinates: { lat: 35.6, lng: 139.7 },
          },
        },
      });

      const links = wrapper.findAll("a");
      const mapUrlLink = links.find(
        (l) => l.attributes("href") === "http://example.com/map",
      );
      const coordsLink = links.find((l) =>
        l.attributes("href")?.includes("35.6,139.7"),
      );

      expect(mapUrlLink?.exists()).toBe(true);
      expect(mapUrlLink?.attributes("target")).toBe("_blank");

      expect(coordsLink?.exists()).toBe(true);
      expect(coordsLink?.attributes("target")).toBe("_blank");
      expect(coordsLink?.find("span").text()).toContain("35.6, 139.7");
    });

    it("點擊按鈕應能切換模式", async () => {
      const wrapper = mountWithPinia({
        props: { initialData: { id: "123" } },
      });

      // 初始為閱覽模式
      expect(wrapper.find("input[type='time']").exists()).toBe(false);

      // 點擊切換為編輯模式
      const toggleButton = wrapper.find("button.text-forest-400");
      await toggleButton.trigger("click");

      // 檢查是否切換到編輯模式
      expect(wrapper.find("input[type='time']").exists()).toBe(true);
      expect(wrapper.find("button.text-forest-400").text()).toContain(
        "新增方案",
      );

      // 再次點擊切換回閱覽模式 (無變更時應直接切換)
      await toggleButton.trigger("click");
      expect(wrapper.find("input[type='time']").exists()).toBe(false);
    });

    it("當有未儲存變更時，點擊結束編輯應顯示確認對話框", async () => {
      const wrapper = mountWithPinia({
        props: { initialData: { id: "123", title: "Original" } },
      });
      const uiStore = useUIStore();
      // @ts-expect-error - mockResolvedValue is not in the type definition but injected by createTestingPinia
      uiStore.showConfirm.mockResolvedValue(false);

      // 切換為編輯模式
      const toggleButton = wrapper.find("button.text-forest-400");
      await toggleButton.trigger("click");

      // 修改標題 (觸發 dirty)
      await wrapper
        .find("input[placeholder='例如：東京鐵塔']")
        .setValue("Modified");

      // 點擊結束編輯
      await toggleButton.trigger("click");

      expect(uiStore.showConfirm).toHaveBeenCalled();
      // 因為模擬為 false，所以應保持在編輯模式
      expect(wrapper.find("input[placeholder='例如：東京鐵塔']").exists()).toBe(
        true,
      );
    });

    it("編輯模式下應能切換地點資訊類型", async () => {
      const wrapper = mountWithPinia({
        props: { initialData: {} },
      });

      // 預設為 '名稱' (name)
      expect(wrapper.find("input[placeholder='例如：東京鐵塔']").exists()).toBe(
        true,
      );

      const locationButtons = wrapper.findAll(".bg-forest-50.p-0\\.5 button");

      // 切換到 '地址' (address)
      await locationButtons[1].trigger("click");
      expect(wrapper.find("input[placeholder='請輸入完整地址']").exists()).toBe(
        true,
      );

      // 切換到 '座標' (coordinates)
      await locationButtons[2].trigger("click");
      expect(wrapper.find("input[placeholder='緯度 (Lat)']").exists()).toBe(
        true,
      );
      expect(wrapper.find("input[placeholder='經度 (Lng)']").exists()).toBe(
        true,
      );

      // 切換到 '連結' (link)
      await locationButtons[3].trigger("click");
      expect(
        wrapper
          .find("input[placeholder='貼上 Google Maps 或其他地圖連結']")
          .exists(),
      ).toBe(true);
    });

    it("應正確處理座標輸入並儲存", async () => {
      const wrapper = mountWithPinia({
        props: { initialData: {} },
      });

      await wrapper
        .find("input[placeholder='例如：東京鐵塔']")
        .setValue("座標測試");

      const locationButtons = wrapper.findAll(".bg-forest-50.p-0\\.5 button");
      await locationButtons[2].trigger("click"); // 切換到座標

      const latInput = wrapper.find("input[placeholder='緯度 (Lat)']");
      const lngInput = wrapper.find("input[placeholder='經度 (Lng)']");

      await latInput.setValue(35.6895);
      await lngInput.setValue(139.6917);

      await wrapper.find("button.bg-forest-400").trigger("click");

      expect(wrapper.emitted("save")).toBeTruthy();
      const savedData = wrapper.emitted("save")![0][0] as any;
      expect(savedData.coordinates).toEqual({ lat: 35.6895, lng: 139.6917 });
    });

    it("閱覽模式下，備選方案應為唯讀", () => {
      const wrapper = mountWithPinia({
        props: {
          initialData: {
            id: "123",
            options: [{ title: "Option 1", subtitle: "Sub 1" }],
          },
        },
      });

      // 應顯示備選方案的文字，而非輸入框
      expect(wrapper.find(".text-xs.font-bold.text-forest-700").text()).toBe(
        "Option 1",
      );
      // [FIX]: 使用更精確的選擇器來定位 subtitle
      expect(wrapper.find(".p-4 .space-y-2 .text-\\[10px\\]").text()).toBe(
        "Sub 1",
      );
      expect(wrapper.find("input[placeholder*='方案標題']").exists()).toBe(
        false,
      );

      // 新增方案按鈕不該存在
      const addBtn = wrapper
        .findAll("button")
        .find((b) => b.text().includes("新增方案"));
      expect(addBtn).toBeFalsy();
    });
  });
});
