import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import TripCard from "../TripCard.vue";

describe("TripCard.vue", () => {
  const mockTrip = {
    id: 1,
    title: "測試旅程",
    startDate: "03/20",
    endDate: "03/24",
    days: 5,
    coverImage: "https://example.com/image.jpg",
    countdown: 15,
    status: "upcoming" as const,
  };

  it("應正確渲染旅程標題", () => {
    const wrapper = mount(TripCard, {
      props: mockTrip,
    });
    expect(wrapper.text()).toContain("測試旅程");
  });

  it("應在 status 為 ongoing 時顯示 Ongoing 標籤", () => {
    const wrapper = mount(TripCard, {
      props: { ...mockTrip, status: "ongoing" },
    });
    expect(wrapper.text()).toContain("Ongoing");
  });

  it("應正確顯示距離出發天數", () => {
    const wrapper = mount(TripCard, {
      props: mockTrip,
    });
    expect(wrapper.text()).toContain("In 15 days");
  });

  it("應渲染圖片並設定正確的 alt 文字", () => {
    const wrapper = mount(TripCard, {
      props: mockTrip,
    });
    const img = wrapper.find("img");
    expect(img.exists()).toBe(true);
    expect(img.attributes("alt")).toBe("測試旅程");
  });
});
