/**
 * Trip related type definitions
 */

export type TripStatus = "ongoing" | "upcoming" | "finished";

export interface Trip {
  id: number | string;
  title: string;
  startDate: string; // 格式: YYYY-MM-DD
  endDate: string; // 格式: YYYY-MM-DD
  days: number;
  coverImage: string;
  countdown?: number;
  status: TripStatus;
  plans?: DailyPlan[];
}

export interface DailyPlan {
  date: string; // 格式: YYYY-MM-DD
  activities: Activity[];
}

export type ActivityCategory = "sight" | "food" | "transport" | "hotel";

export interface Activity {
  id?: string;
  time: string; // 格式: HH:mm
  title: string;
  location?: string;
  category: ActivityCategory;
  note?: string;
  isLast?: boolean;
}

export interface DateItem {
  day: string;
  weekday: string;
  fullDate: string;
}
