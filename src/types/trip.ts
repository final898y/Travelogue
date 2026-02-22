import { z } from "zod";

/**
 * 通用 Firestore 時間戳 Schema
 * 使用 preprocess 將多種格式 (Timestamp Object, ISO String, Date) 統一轉為 Date 物件
 */
const FirestoreTimestampSchema = z.preprocess(
  (arg: unknown) => {
    // Firestore Timestamp 物件 (duck-typing) 或任何有 toDate 方法的物件
    if (
      typeof arg === "object" &&
      arg !== null &&
      "toDate" in arg &&
      typeof (arg as { toDate: unknown }).toDate === "function"
    ) {
      return (arg as { toDate: () => Date }).toDate();
    }
    // 序列化後的 Timestamp 物件 (例如 from JSON)
    if (typeof arg === "object" && arg !== null && "seconds" in arg) {
      const seconds = Number((arg as { seconds: unknown }).seconds);
      if (!isNaN(seconds)) {
        return new Date(seconds * 1000);
      }
    }
    // ISO String 或 number
    if (typeof arg === "string" || typeof arg === "number") {
      const date = new Date(arg);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    // 如果已經是 Date 物件
    if (arg instanceof Date) {
      return arg;
    }
    return arg; // 若無法解析，返回原值讓後續 z.date() 報錯
  },
  z.date({
    message:
      "欄位必須是有效的日期格式 (Firestore Timestamp, ISO String, or Date Object)",
  }),
);

/**
 * 基本地理座標 Schema
 */
export const CoordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

/**
 * 旅程狀態 Schema
 */
export const TripStatusSchema = z.enum(["ongoing", "upcoming", "finished"]);
export type TripStatus = z.infer<typeof TripStatusSchema>;

/**
 * 活動備選方案 Schema
 */
export const ActivityOptionSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  address: z.string().optional(),
  placeId: z.string().optional(),
  coordinates: CoordinatesSchema.optional(),
});
export type ActivityOption = z.infer<typeof ActivityOptionSchema>;

/**
 * 活動分類 Schema
 */
export const ActivityCategorySchema = z.enum([
  "sight",
  "food",
  "transport",
  "hotel",
]);
export type ActivityCategory = z.infer<typeof ActivityCategorySchema>;

/**
 * 單項活動 Schema
 */
export const ActivitySchema = z.object({
  id: z.string(),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "時間格式須為 HH:mm"),
  title: z.string().min(1, "活動標題不可為空"),
  subtitle: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  placeId: z.string().optional(),
  coordinates: CoordinatesSchema.optional(),
  category: ActivityCategorySchema,
  note: z.string().optional(),
  imageUrl: z.url().or(z.string().optional()),
  options: z.array(ActivityOptionSchema).optional(),
  isLast: z.boolean().optional(),
});
export type Activity = z.infer<typeof ActivitySchema>;

/**
 * 每日行程 Schema
 */
export const DailyPlanSchema = z.object({
  tripId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式須為 YYYY-MM-DD"),
  activities: z.array(ActivitySchema),
});
export type DailyPlan = z.infer<typeof DailyPlanSchema>;

/**
 * 預訂類型 Schema
 */
export const BookingTypeSchema = z.enum([
  "flight",
  "hotel",
  "transport",
  "activity",
  "other",
]);
export type BookingType = z.infer<typeof BookingTypeSchema>;

/**
 * 預訂資訊 Schema
 */
export const BookingSchema = z.object({
  id: z.string(),
  type: BookingTypeSchema,
  title: z.string().min(1, "預訂名稱不可為空"),
  dateTime: z.string().optional(),
  confirmationNo: z.string().optional(),
  location: z.string().optional(),
  note: z.string().optional(),
  isConfirmed: z.boolean(),
});
export type Booking = z.infer<typeof BookingSchema>;

/**
 * 準備清單項 Schema
 */
export const ChecklistItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "項目名稱不可為空"),
  isCompleted: z.boolean(),
  category: z.string().optional(),
});
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;

/**
 * 旅程成員 Schema
 */
export const TripMemberSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
});
export type TripMember = z.infer<typeof TripMemberSchema>;

/**
 * 核心旅程 Schema (Main Document)
 */
export const TripSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().min(1, "標題不可為空"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式須為 YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式須為 YYYY-MM-DD"),
  days: z.number().positive(),
  coverImage: z.url().or(z.string().optional()),
  countdown: z.number().optional(),
  status: TripStatusSchema,
  members: z.array(TripMemberSchema).optional(),

  // 嵌入式資料
  bookings: z.array(BookingSchema).optional(),
  preparation: z.array(ChecklistItemSchema).optional(),

  createdAt: FirestoreTimestampSchema,
  updatedAt: FirestoreTimestampSchema,
});

export type Trip = z.infer<typeof TripSchema>;

/**
 * 記帳相關 Schema (Sub-collection)
 */
export const ExpenseSchema = z.object({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式須為 YYYY-MM-DD"),
  category: z.string(),
  amount: z.number().positive("金額必須大於 0"),
  currency: z.string(),
  description: z.string().min(1, "描述不可為空"),
  payer: z.string().min(1, "需指定付款人"), // 付款人的 UID 或名稱
  splitWith: z.array(z.string()).min(1, "至少需有一人參與分帳"), // 參與分帳者的 UID 或名稱列表
  createdAt: FirestoreTimestampSchema,
});
export type Expense = z.infer<typeof ExpenseSchema>;

/**
 * 資料收集 Schema (Sub-collection)
 */
export const CollectionSourceSchema = z.enum([
  "threads",
  "instagram",
  "web",
  "youtube",
  "other",
]);
export type CollectionSource = z.infer<typeof CollectionSourceSchema>;

export const CollectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "標題不可為空"),
  url: z.url("請輸入有效的來源連結"),
  mapUrl: z.url("請輸入有效的地點連結").or(z.string().optional()),
  websiteUrl: z.url("請輸入有效的官網連結").or(z.string().optional()),
  source: CollectionSourceSchema,
  note: z.string().optional(),
  imageUrl: z.url().or(z.string().optional()),
  category: z.string().optional(),
  createdAt: FirestoreTimestampSchema,
});
export type Collection = z.infer<typeof CollectionSchema>;

/**
 * 輔助 UI 型別
 */
export interface DateItem {
  day: string;
  weekday: string;
  fullDate: string;
}
