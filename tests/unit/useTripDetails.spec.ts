import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useTripDetails } from "../../src/composables/useTripDetails";
import type { Trip } from "../../src/types/trip";

describe("useTripDetails Composable", () => {
  const mockTrip: Trip = {
    id: "trip-1",
    title: "東京之旅",
    startDate: "2024-03-20",
    endDate: "2024-03-22",
    days: 3,
    coverImage: "test.jpg",
    status: "upcoming",
    plans: [
      {
        date: "2024-03-20",
        activities: [
          {
            time: "09:00",
            title: "活動 A",
            category: "sight",
            coordinates: { lat: 35.6895, lng: 139.6917 },
            address: "東京都新宿區",
          },
        ],
      },
      {
        date: "2024-03-21",
        activities: [
          {
            time: "12:00",
            title: "活動 B",
            category: "food",
            address: "東京都台東區",
          },
        ],
      },
    ],
  };

  it("應正確生成日期列表", () => {
    const trip = ref<Trip | undefined>(mockTrip);
    const selectedDate = ref("2024-03-20");
    const { dates } = useTripDetails(trip, selectedDate);

    expect(dates.value).toHaveLength(3);
    expect(dates.value[0].fullDate).toBe("2024-03-20");
    expect(dates.value[1].fullDate).toBe("2024-03-21");
    expect(dates.value[2].fullDate).toBe("2024-03-22");
  });

  it("應根據 selectedDate 正確計算 currentDayIndex", () => {
    const trip = ref<Trip | undefined>(mockTrip);
    const selectedDate = ref("2024-03-20");
    const { currentDayIndex } = useTripDetails(trip, selectedDate);

    expect(currentDayIndex.value).toBe(1);

    selectedDate.value = "2024-03-21";
    expect(currentDayIndex.value).toBe(2);

    selectedDate.value = "2024-03-22";
    expect(currentDayIndex.value).toBe(3);
  });

  it("應根據日期過濾正確的活動項目", () => {
    const trip = ref<Trip | undefined>(mockTrip);
    const selectedDate = ref("2024-03-20");
    const { scheduleItems } = useTripDetails(trip, selectedDate);

    expect(scheduleItems.value).toHaveLength(1);
    expect(scheduleItems.value[0].title).toBe("活動 A");

    selectedDate.value = "2024-03-21";
    expect(scheduleItems.value[0].title).toBe("活動 B");

    selectedDate.value = "2024-03-22"; // 沒計畫的日期
    expect(scheduleItems.value).toHaveLength(0);
  });

  it("應確保活動項目按照時間順序排列", () => {
    const tripWithUnsortedActivities: Trip = {
      ...mockTrip,
      plans: [
        {
          date: "2024-03-20",
          activities: [
            { time: "12:00", title: "午餐", category: "food" },
            { time: "08:00", title: "早餐", category: "food" },
            { time: "18:00", title: "晚餐", category: "food" },
          ],
        },
      ],
    };
    const trip = ref<Trip | undefined>(tripWithUnsortedActivities);
    const selectedDate = ref("2024-03-20");
    const { scheduleItems } = useTripDetails(trip, selectedDate);

    expect(scheduleItems.value[0].time).toBe("08:00");
    expect(scheduleItems.value[1].time).toBe("12:00");
    expect(scheduleItems.value[2].time).toBe("18:00");
  });

  it("當 trip 為 undefined 時應回傳空資料", () => {
    const trip = ref<Trip | undefined>(undefined);
    const selectedDate = ref("");
    const { dates, scheduleItems } = useTripDetails(trip, selectedDate);

    expect(dates.value).toEqual([]);
    expect(scheduleItems.value).toEqual([]);
  });
});
