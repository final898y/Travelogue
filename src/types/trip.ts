/**
 * Trip related type definitions
 */

export type TripStatus = "ongoing" | "upcoming" | "finished";

export interface Trip {
  id: number | string;
  title: string;
  startDate: string;
  endDate: string;
  days: number;
  coverImage: string;
  countdown?: number;
  status: TripStatus;
  scheduleItems?: Activity[];
}

export type ActivityCategory = "sight" | "food" | "transport" | "hotel";

export interface Activity {
  time: string;
  title: string;
  location?: string;
  category: ActivityCategory;
  isLast?: boolean;
  options?: string[];
}

export interface DateItem {
  day: string;
  weekday: string;
  fullDate: string;
}
