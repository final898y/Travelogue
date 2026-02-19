import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import BottomNav from "../../src/components/ui/BottomNav.vue";

const mockRoute = {
  params: { id: "" },
  path: "/",
};

vi.mock("vue-router", () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("BottomNav.vue", () => {
  beforeEach(() => {
    mockRoute.params.id = "";
    mockRoute.path = "/";
  });

  it("在首頁時，除了首頁以外的連結應處於禁用狀態樣式", () => {
    const wrapper = mount(BottomNav, {
      global: {
        stubs: {
          RouterLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    const links = wrapper.findAll("a");
    const planLink = links.find((l) => l.text().includes("行程"));

    expect(planLink).toBeDefined();
    expect(planLink?.classes()).toContain("opacity-30");
  });

  it("當在特定旅程頁面時，連結應包含正確的 ID 且不禁用", () => {
    mockRoute.params.id = "trip-123";
    mockRoute.path = "/plan/trip-123";

    const wrapper = mount(BottomNav, {
      global: {
        stubs: {
          RouterLink: {
            template: '<a :to="$attrs.to"><slot /></a>',
          },
        },
      },
    });

    const links = wrapper.findAll("a");
    const expenseLink = links.find((l) => l.text().includes("記帳"));

    expect(expenseLink).toBeDefined();
    expect(expenseLink?.classes()).not.toContain("opacity-30");
    expect(expenseLink?.attributes("to")).toBe("/trip/trip-123/expense");
  });

  it("應正確顯示當前啟動的標籤樣式", () => {
    mockRoute.params.id = "trip-123";
    mockRoute.path = "/trip/trip-123/expense";

    const wrapper = mount(BottomNav, {
      global: {
        stubs: {
          RouterLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    const links = wrapper.findAll("a");
    const expenseLink = links.find((l) => l.text().includes("記帳"));

    expect(expenseLink).toBeDefined();
    expect(expenseLink?.classes()).toContain("text-forest-500");
  });
});
