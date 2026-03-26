import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { createTestingPinia } from "@pinia/testing";
import BookingForm from "../../src/components/trip/BookingForm.vue";
import { useUIStore } from "../../src/stores/uiStore";

// Mock icons
vi.mock("../../src/assets/icons", () => ({
  Plane: { template: '<svg data-icon="Plane" />' },
  Bed: { template: '<svg data-icon="Bed" />' },
  Car: { template: '<svg data-icon="Car" />' },
  Ticket: { template: '<svg data-icon="Ticket" />' },
  Package: { template: '<svg data-icon="Package" />' },
}));

describe("BookingForm.vue", () => {
  const mountWithPinia = (options = {}) => {
    return mount(BookingForm, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            stubActions: false,
          }),
        ],
      },
      ...options,
    });
  };

  it("應正確渲染初始狀態", () => {
    const wrapper = mountWithPinia({
      props: {
        initialData: { title: "測試預訂", type: "hotel" },
      },
    });

    expect(wrapper.find("input[placeholder='例如：飯店地址']").exists()).toBe(true);
    expect((wrapper.find("input[type='text']").element as HTMLInputElement).value).toBe("測試預訂");
  });

  it("機票類型應正確拆分初始 location 與 dateTime", () => {
    const wrapper = mountWithPinia({
      props: {
        initialData: {
          type: "flight",
          location: "TPE -> NRT",
          dateTime: "2024-04-01T10:00 | 2024-04-01T14:00",
        },
      },
    });

    const vm = wrapper.vm as any;
    expect(vm.formData.depLoc).toBe("TPE");
    expect(vm.formData.arrLoc).toBe("NRT");
    expect(vm.formData.depTime).toBe("2024-04-01T10:00");
    expect(vm.formData.arrTime).toBe("2024-04-01T14:00");
  });

  it("機票類型若資料格式不正確應能優雅處理 (邊界值測試)", () => {
    const wrapper = mountWithPinia({
      props: {
        initialData: {
          type: "flight",
          location: "只有出發地",
          dateTime: "只有一個時間",
        },
      },
    });

    const vm = wrapper.vm as any;
    expect(vm.formData.depLoc).toBe("只有出發地");
    expect(vm.formData.arrLoc).toBe("");
    expect(vm.formData.depTime).toBe("只有一個時間");
    expect(vm.formData.arrTime).toBe("");
  });

  it("儲存機票時應正確合併欄位", async () => {
    const wrapper = mountWithPinia({
      props: {
        initialData: { type: "flight", title: "長榮航空" },
      },
    });

    const vm = wrapper.vm as any;
    vm.formData.depLoc = "TSA";
    vm.formData.arrLoc = "HND";
    vm.formData.depTime = "2024-05-01T09:00";
    vm.formData.arrTime = "2024-05-01T12:00";

    await wrapper.find("button.bg-forest-400").trigger("click");

    expect(wrapper.emitted("save")).toBeTruthy();
    const payload = wrapper.emitted("save")![0][0] as any;
    expect(payload.location).toBe("TSA -> HND");
    expect(payload.dateTime).toBe("2024-05-01T09:00 | 2024-05-01T12:00");
  });

  it("未輸入標題時應顯示警告且不發送事件", async () => {
    const wrapper = mountWithPinia({
      props: {
        initialData: { title: "", type: "hotel" },
      },
    });
    const uiStore = useUIStore();

    await wrapper.find("button.bg-forest-400").trigger("click");

    expect(uiStore.showToast).toHaveBeenCalledWith("請輸入預訂標題", "warning");
    expect(wrapper.emitted("save")).toBeFalsy();
  });

  it("修改資料時應發送 update:dirty 事件", async () => {
    const wrapper = mountWithPinia({
      props: {
        initialData: { title: "舊標題", type: "hotel" },
      },
    });

    await wrapper.find("input").setValue("新標題");
    await nextTick();

    expect(wrapper.emitted("update:dirty")).toBeTruthy();
    expect(wrapper.emitted("update:dirty")?.at(-1)).toEqual([true]);

    // 還原標題應變回 false
    await wrapper.find("input").setValue("舊標題");
    await nextTick();
    expect(wrapper.emitted("update:dirty")?.at(-1)).toEqual([false]);
  });
});
