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
  title: string; // 描述性標題，例如：淺草寺參拜
  subtitle?: string; // 精確地點名稱，例如：淺草寺
  location?: string; // 大區域名稱，例如：淺草
  address?: string; // 完整地址
  placeId?: string; // Google Maps Place ID
  coordinates?: {
    lat: number;
    lng: number;
  };
  category: ActivityCategory;
  note?: string;
  imageUrl?: string; // 地點預覽圖
  options?: ActivityOption[];
  isLast?: boolean;
}

export interface ActivityOption {
  title: string; // 描述性標題
  subtitle?: string; // 精確地點名稱
  address?: string;
  placeId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface DateItem {
  day: string;
  weekday: string;
  fullDate: string;
}
