import { computed, type Ref } from "vue";
import type { Trip, DateItem, Activity } from "../types/trip";

export function useTripDetails(
  trip: Ref<Trip | undefined>,
  selectedDate: Ref<string>,
) {
  // 動態計算行程日期列表
  const dates = computed<DateItem[]>(() => {
    if (!trip.value) return [];

    const start = new Date(trip.value.startDate);
    const end = new Date(trip.value.endDate);
    const dateList: DateItem[] = [];

    // 使用副本避免修改原始日期物件
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const isoParts = d.toISOString().split("T");
      const isoDate = isoParts[0] || ""; // 確保永遠是 string

      dateList.push({
        fullDate: isoDate,
        day: `${d.getMonth() + 1}/${d.getDate()}`,
        weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
      });
    }
    return dateList;
  });

  // 計算目前是第幾天 (Day X)
  const currentDayIndex = computed(() => {
    if (!trip.value || !selectedDate.value) return 1;

    const start = new Date(trip.value.startDate);
    const current = new Date(selectedDate.value);

    // 歸零時間部分以準確計算天數差
    start.setHours(0, 0, 0, 0);
    current.setHours(0, 0, 0, 0);

    const diffTime = current.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    return diffDays + 1;
  });

  // 根據選中日期過濾活動
  const scheduleItems = computed<Activity[]>(() => {
    if (!trip.value || !selectedDate.value) return [];
    const plan = trip.value.plans?.find((p) => p.date === selectedDate.value);
    return plan?.activities || [];
  });

  return {
    dates,
    currentDayIndex,
    scheduleItems,
  };
}
