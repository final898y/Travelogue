/**
 * Trip related type definitions
 */

export type TripStatus = "ongoing" | "upcoming" | "finished";

/**
 * 核心旅程介面 (Main Document)
 */
export interface Trip {
  id: string;
  title: string;
  startDate: string; // 格式: YYYY-MM-DD
  endDate: string; // 格式: YYYY-MM-DD
  days: number;
  coverImage: string;
  countdown?: number;
  status: TripStatus;
  
  // 嵌入式資料 (量小且緊密相關)
  plans?: DailyPlan[];
  bookings?: Booking[];
  preparation?: ChecklistItem[];
  
  // 子集合資料 (僅作為類型參考，實際由 store 分別抓取)
  // expenses: Expense[];
  // collections: ResearchCollection[];
  
  createdAt?: any;
  updatedAt?: any;
}

/**
 * 行程相關 (Embedded)
 */
export interface DailyPlan {
  date: string; // 格式: YYYY-MM-DD
  activities: Activity[];
}

export type ActivityCategory = "sight" | "food" | "transport" | "hotel";

export interface Activity {
  id?: string;
  time: string; // 格式: HH:mm
  title: string;
  subtitle?: string;
  location?: string;
  address?: string;
  placeId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  category: ActivityCategory;
  note?: string;
  imageUrl?: string;
  options?: ActivityOption[];
  isLast?: boolean;
}

export interface ActivityOption {
  title: string;
  subtitle?: string;
  address?: string;
  placeId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * 預訂相關 (Embedded)
 */
export type BookingType = "flight" | "hotel" | "transport" | "activity" | "other";

export interface Booking {
  id: string;
  type: BookingType;
  title: string;
  dateTime?: string;
  confirmationNo?: string;
  location?: string;
  note?: string;
  isConfirmed: boolean;
}

/**
 * 準備清單 (Embedded)
 */
export interface ChecklistItem {
  id: string;
  title: string;
  isCompleted: boolean;
  category?: string;
}

/**
 * 記帳相關 (Sub-collection)
 */
export interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  currency: string;
  description: string;
  payer?: string;
  createdAt?: any;
}

/**
 * 資料收集 (Sub-collection)
 * 用於行前收集網路文章、Threads、IG 等
 */
export type CollectionSource = "threads" | "instagram" | "web" | "youtube" | "other";

export interface ResearchCollection {
  id: string;
  title: string;
  url: string;
  source: CollectionSource;
  note?: string;
  imageUrl?: string;
  category?: string; // 例如：美食、景點、購物清單
  createdAt: any;
}

export interface DateItem {
  day: string;
  weekday: string;
  fullDate: string;
}
