import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import MemberForm from "../../src/components/trip/MemberForm.vue";

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

  it("應正確渲染初始成員名單", () => {
    const wrapper = mount(MemberForm, {
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
    const wrapper = mount(MemberForm, {
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
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const wrapper = mount(MemberForm, {
      props: {
        initialMembers,
        currentUserEmail,
      },
    });

    const input = wrapper.find("input[placeholder='輸入旅伴姓名']");
    await input.setValue("夥伴A");

    const addBtn = wrapper.find('[data-icon="UserPlus"]').element
      .parentElement as HTMLButtonElement;
    await addBtn.click();

    expect(alertSpy).toHaveBeenCalledWith("旅伴名稱重複");
    expect(
      wrapper.findAll(".rounded-full.bg-white.border-forest-100").length,
    ).toBe(2);

    alertSpy.mockRestore();
  });

  it("應能刪除成員且不能刪除自己", async () => {
    const confirmSpy = vi
      .spyOn(window, "confirm")
      .mockImplementation(() => true);
    const wrapper = mount(MemberForm, {
      props: {
        initialMembers,
        currentUserEmail,
      },
    });

    // 嘗試刪除夥伴A (id: p1)
    // 夥伴A 的標籤內應有 X 按鈕，而 "我" 沒有
    const xIcons = wrapper.findAll('[data-icon="X"]');
    expect(xIcons.length).toBe(1); // 只有一個 X 圖示 (給夥伴A)

    const xBtn = xIcons[0].element.parentElement as HTMLButtonElement;
    await xBtn.click();
    await nextTick();

    expect(
      wrapper.findAll(".rounded-full.bg-white.border-forest-100").length,
    ).toBe(1);
    expect(wrapper.text()).not.toContain("夥伴A");
    expect(wrapper.text()).toContain("我");

    confirmSpy.mockRestore();
  });

  it("點擊儲存按鈕應發送 save 事件", async () => {
    const wrapper = mount(MemberForm, {
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
