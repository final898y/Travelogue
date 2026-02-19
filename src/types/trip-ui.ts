/**
 * TripUI Interface
 * 專供 TripCard 等 UI 組件使用的純型別定義，避免 Vue SFC 編譯器無法解析 Zod 推導型別的問題。
 */
export interface TripMemberUI {
  id: string;
  name: string;
}

export interface TripUI {
  id: string;
  userId: string;
  title: string;
  startDate: string;
  endDate: string;
  days: number;
  coverImage?: string;
  countdown?: number;
  status: "ongoing" | "upcoming" | "finished";
  members?: TripMemberUI[];
}

export interface ActivityOptionUI {
  title: string;
  subtitle?: string;
  address?: string;
  placeId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ActivityUI {
  id?: string;
  time: string;
  title: string;
  subtitle?: string;
  location?: string;
  address?: string;
  placeId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  category: "sight" | "food" | "transport" | "hotel";
  note?: string;
  imageUrl?: string;
  options?: ActivityOptionUI[];
  isLast?: boolean;
}
