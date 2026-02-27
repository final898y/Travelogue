import {
  collection,
  getDocs,
  query,
  where,
  writeBatch,
  doc,
  addDoc,
  Timestamp,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  TripSchema,
  DailyPlanSchema,
  ExpenseSchema,
  CollectionSchema,
} from "../types/trip";
import { z } from "zod";

/**
 * 導出資料包裹格式定義
 */
const ExportDataPackageSchema = z.object({
  version: z.string(),
  exportedAt: z.string(),
  userId: z.string(),
  trips: z.array(
    z.object({
      data: TripSchema,
      plans: z.array(DailyPlanSchema),
      expenses: z.array(ExpenseSchema),
      collections: z.array(CollectionSchema),
    }),
  ),
});

export type ExportDataPackage = z.infer<typeof ExportDataPackageSchema>;

/**
 * 單一旅程包裹格式定義
 */
const SingleTripPackageSchema = z.object({
  version: z.string(),
  exportedAt: z.string(),
  trip: z.object({
    data: TripSchema,
    plans: z.array(DailyPlanSchema),
    expenses: z.array(ExpenseSchema),
    collections: z.array(CollectionSchema),
  }),
});

export type SingleTripPackage = z.infer<typeof SingleTripPackageSchema>;

/**
 * 資料管理服務
 */
export const backupService = {
  /**
   * 提取單一旅程的完整資料
   */
  async fetchSingleTripData(tripId: string): Promise<SingleTripPackage> {
    const tripSnap = await getDocs(
      query(collection(db, "trips"), where("__name__", "==", tripId)),
    );

    const firstDoc = tripSnap.docs[0];
    if (!firstDoc) throw new Error("找不到該旅程資料");

    // 使用 Schema 解析確保資料完整性與 Timestamp 轉換
    const tripData = TripSchema.parse({ id: tripId, ...firstDoc.data() });

    const [plansSnap, expSnap, collSnap] = await Promise.all([
      getDocs(collection(db, "trips", tripId, "plans")),
      getDocs(collection(db, "trips", tripId, "expenses")),
      getDocs(collection(db, "trips", tripId, "collections")),
    ]);

    return {
      version: "1.1",
      exportedAt: new Date().toISOString(),
      trip: {
        data: tripData,
        plans: plansSnap.docs.map((d) => DailyPlanSchema.parse(d.data())),
        expenses: expSnap.docs.map((d) =>
          ExpenseSchema.parse({ id: d.id, ...d.data() }),
        ),
        collections: collSnap.docs.map((d) =>
          CollectionSchema.parse({ id: d.id, ...d.data() }),
        ),
      },
    };
  },

  /**
   * 觸發單一旅程 JSON 下載
   */
  async exportSingleTrip(tripId: string, title: string) {
    const data = await this.fetchSingleTripData(tripId);
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Trip_${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  /**
   * 導入單一旅程 (作為新旅程新增)
   */
  async importSingleTrip(userId: string, jsonFile: File) {
    const text = await jsonFile.text();
    const rawData = JSON.parse(text);
    const validatedData = SingleTripPackageSchema.parse(rawData);

    const { data, plans, expenses, collections } = validatedData.trip;

    // 建立新的 Trip Document
    const tripsRef = collection(db, "trips");
    const newTripData: Record<string, unknown> = {
      ...data,
      userId,
      title: `${data.title} (匯入)`,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    delete newTripData.id;

    const newTripRef = await addDoc(tripsRef, newTripData);
    const newTripId = newTripRef.id;

    // 批次寫入子集合
    const batch = writeBatch(db);

    for (const plan of plans) {
      const planRef = doc(collection(db, "trips", newTripId, "plans"));
      batch.set(planRef, { ...plan, tripId: newTripId });
    }

    for (const exp of expenses) {
      const expRef = doc(collection(db, "trips", newTripId, "expenses"));
      // 更新內部 ID 以符合新的 document ID
      batch.set(expRef, { ...exp, id: expRef.id });
    }

    for (const coll of collections) {
      const collRef = doc(collection(db, "trips", newTripId, "collections"));
      // 更新內部 ID 以符合新的 document ID
      batch.set(collRef, { ...coll, id: collRef.id });
    }

    await batch.commit();
    return newTripId;
  },

  /**
   * 提取當前使用者的所有旅遊資料
   */
  async fetchAllUserData(userId: string): Promise<ExportDataPackage> {
    const tripsRef = collection(db, "trips");
    const q = query(tripsRef, where("userId", "==", userId));
    const tripSnapshots = await getDocs(q);

    const fullTripsData = [];

    for (const tripDoc of tripSnapshots.docs) {
      const tripId = tripDoc.id;
      // 使用 Schema 解析
      const tripData = TripSchema.parse({ id: tripId, ...tripDoc.data() });

      // 平行抓取子集合
      const [plansSnap, expSnap, collSnap] = await Promise.all([
        getDocs(collection(db, "trips", tripId, "plans")),
        getDocs(collection(db, "trips", tripId, "expenses")),
        getDocs(collection(db, "trips", tripId, "collections")),
      ]);

      fullTripsData.push({
        data: tripData,
        plans: plansSnap.docs.map((d) => DailyPlanSchema.parse(d.data())),
        expenses: expSnap.docs.map((d) =>
          ExpenseSchema.parse({ id: d.id, ...d.data() }),
        ),
        collections: collSnap.docs.map((d) =>
          CollectionSchema.parse({ id: d.id, ...d.data() }),
        ),
      });
    }

    return {
      version: "1.1",
      exportedAt: new Date().toISOString(),
      userId,
      trips: fullTripsData,
    };
  },

  /**
   * 將資料包寫入 Firestore (核心導入邏輯)
   */
  async applyDataPackage(userId: string, validatedData: ExportDataPackage) {
    // 1. 清理該使用者的現有資料 (遞迴刪除)
    await this.clearAllUserData(userId);

    // 2. 批次寫入新資料
    const batch = writeBatch(db);

    for (const tripWrapper of validatedData.trips) {
      const { data, plans, expenses, collections } = tripWrapper;
      const tripId = data.id;
      const tripRef = doc(db, "trips", tripId);

      // 還原主文件
      const restoredTrip: Record<string, unknown> = { ...data, userId };
      delete restoredTrip.id;
      batch.set(tripRef, restoredTrip);

      // 還原子集合
      for (const plan of plans) {
        const planRef = doc(collection(db, "trips", tripId, "plans"));
        batch.set(planRef, plan);
      }
      for (const exp of expenses) {
        // 還原時保留原始 ID 以維持資料一致性
        const expRef = doc(db, "trips", tripId, "expenses", exp.id);
        batch.set(expRef, exp);
      }
      for (const coll of collections) {
        // 還原時保留原始 ID 以維持資料一致性
        const collRef = doc(db, "trips", tripId, "collections", coll.id);
        batch.set(collRef, coll);
      }
    }

    await batch.commit();
  },

  /**
   * 從 JSON 導入資料 (覆蓋模式)
   */
  async importFromJSON(userId: string, jsonFile: File) {
    const text = await jsonFile.text();
    const rawData = JSON.parse(text);
    const validatedData = ExportDataPackageSchema.parse(rawData);
    await this.applyDataPackage(userId, validatedData);
  },

  /**
   * 獲取使用者的雲端備份清單
   */
  async listCloudBackups(userId: string) {
    const backupsRef = collection(db, "backups");
    const q = query(
      backupsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as ExportDataPackage),
      createdAt: d.data().createdAt as Timestamp,
    }));
  },

  /**
   * 從雲端備份還原
   */
  async restoreFromCloud(userId: string, backupId: string) {
    const snap = await getDocs(
      query(collection(db, "backups"), where("__name__", "==", backupId)),
    );
    const firstDoc = snap.docs[0];
    if (snap.empty || !firstDoc) throw new Error("找不到備份紀錄");

    const backupData = firstDoc.data() as ExportDataPackage;
    await this.applyDataPackage(userId, backupData);
  },

  /**
   * 觸發 JSON 檔案下載
   */
  async exportToJSON(userId: string) {
    const data = await this.fetchAllUserData(userId);
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Travelogue_Export_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  /**
   * 將資料備份至雲端 (Firestore backups 集合)
   */
  async createCloudBackup(userId: string) {
    const data = await this.fetchAllUserData(userId);
    const backupsRef = collection(db, "backups");
    await addDoc(backupsRef, {
      ...data,
      userId,
      createdAt: Timestamp.now(),
    });
  },

  /**
   * 清理使用者的所有資料 (內部使用)
   */
  async clearAllUserData(userId: string) {
    const tripsRef = collection(db, "trips");
    const q = query(tripsRef, where("userId", "==", userId));
    const tripSnapshots = await getDocs(q);

    for (const tripDoc of tripSnapshots.docs) {
      const tripId = tripDoc.id;

      // 刪除子集合內容
      const subCollections = ["plans", "expenses", "collections"];
      for (const sub of subCollections) {
        const subSnap = await getDocs(collection(db, "trips", tripId, sub));
        for (const subDoc of subSnap.docs) {
          await deleteDoc(subDoc.ref);
        }
      }

      // 刪除主文件
      await deleteDoc(tripDoc.ref);
    }
  },
};
