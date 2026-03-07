import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { createTestingPinia } from "@pinia/testing";
import MemberForm from "../../src/components/trip/MemberForm.vue";
import { useUIStore } from "../../src/stores/uiStore";

// Mock icons
vi.mock("../../src/assets/icons", () => ({
  UserPlus: { template: '<svg data-icon="UserPlus" />' },
  X: { template: '<svg data-icon="X" />' },
}));

describe("MemberForm.vue", () => {
  const initialMembers = [
    { id: "me@example.com", name: "我" },
    { id: "p1", name: "夥伴A" },
  ];
  const currentUserEmail = "me@example.com";

  const mountWithPinia = (options = {}) => {
    return mount(MemberForm, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            stubActions: false, // 我們需要讓 showConfirm 正常運作 Promise
          }),
        ],
      },
      ...options,
    });
  };

  it("應正確渲染初始成員名單", () => {
    const wrapper = mountWithPinia({
      props: {
        initialMembers,
        currentUserEmail,
      },
    });

    const tags = wrapper.findAll(".rounded-full.bg-white.border-forest-100");
    expect(tags.length).toBe(2);
    expect(wrapper.text()).toContain("我");
    expect(wrapper.text()).toContain("夥伴A");
  });

  it("應能新增成員", async () => {
    const wrapper = mountWithPinia({
      props: {
        initialMembers,
        currentUserEmail,
      },
    });

    const input = wrapper.find("input[placeholder='輸入旅伴姓名']");
    await input.setValue("新朋友");

    const addBtn = wrapper.find('[data-icon="UserPlus"]').element
      .parentElement as HTMLButtonElement;
    await addBtn.click();
    await nextTick();

    expect(
      wrapper.findAll(".rounded-full.bg-white.border-forest-100").length,
    ).toBe(3);
    expect(wrapper.text()).toContain("新朋友");
  });

  it("當名稱重複時應提示錯誤且不新增", async () => {
    const wrapper = mountWithPinia({
      props: {
        initialMembers,
        currentUserEmail,
      },
    });
    const uiStore = useUIStore();

    const input = wrapper.find("input[placeholder='輸入旅伴姓名']");
    await input.setValue("夥伴A");

    const addBtn = wrapper.find('[data-icon="UserPlus"]').element
      .parentElement as HTMLButtonElement;
    await addBtn.click();

    expect(uiStore.showToast).toHaveBeenCalledWith("旅伴名稱重複", "warning");
    expect(
      wrapper.findAll(".rounded-full.bg-white.border-forest-100").length,
    ).toBe(2);
  });

  it("應能刪除成員且現在包含自己 (取消限制)", async () => {
    const wrapper = mountWithPinia({
      props: {
        initialMembers,
        currentUserEmail,
      },
    });
    const uiStore = useUIStore();
    // 模擬使用者點擊確認
    vi.mocked(uiStore.showConfirm).mockResolvedValue(true);

    // 以前只有一個 X，現在應該有兩個
    const xIcons = wrapper.findAll('[data-icon="X"]');
    expect(xIcons.length).toBe(2);

    // 刪除我自己 (me@example.com)
    const xBtn = xIcons[0].element.parentElement as HTMLButtonElement;
    await xBtn.click();
    await nextTick();
    await nextTick();

    expect(wrapper.text()).not.toContain("我");
    expect(wrapper.text()).toContain("夥伴A");
  });

  it("不應允許儲存空名單", async () => {
    const wrapper = mountWithPinia({
      props: {
        initialMembers: [{ id: "p1", name: "最後一人" }],
        currentUserEmail,
      },
    });
    const uiStore = useUIStore();
    vi.mocked(uiStore.showConfirm).mockResolvedValue(true);

    // 刪除最後一人
    const xBtn = wrapper.find('[data-icon="X"]').element
      .parentElement as HTMLButtonElement;
    await xBtn.click();
    await nextTick();
    await nextTick();

    // 嘗試儲存
    const saveBtn = wrapper.find("button.bg-forest-400");
    await saveBtn.trigger("click");

    expect(uiStore.showToast).toHaveBeenCalledWith(
      "旅伴名單不能為空",
      "warning",
    );
    expect(wrapper.emitted("save")).toBeFalsy();
  });

  it("點擊儲存按鈕應發送 save 事件", async () => {
    const wrapper = mountWithPinia({
      props: {
        initialMembers,
        currentUserEmail,
      },
    });

    const saveBtn = wrapper.find("button.bg-forest-400");
    await saveBtn.trigger("click");

    expect(wrapper.emitted("save")).toBeTruthy();
    expect(wrapper.emitted("save")![0][0]).toEqual(initialMembers);
  });
});
