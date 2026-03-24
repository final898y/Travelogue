import { defineStore } from "pinia";
import { ref } from "vue";
import {
  collection,
  query,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuthStore } from "./authStore";
import { deleteImage } from "../services/storageService";
import { z } from "zod";
import { DailyPlanSchema, type DailyPlan, type Activity } from "../types/trip";

export const usePlanStore = defineStore("plan", () => {
  const currentTripPlans = ref<DailyPlan[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const authStore = useAuthStore();

  /**
   * 輔助函式：驗證並過濾資料
   */
  const validateAndFilter = <T>(
    schema: z.ZodSchema<T>,
    items: unknown[],
  ): T[] => {
    return items.reduce((acc: T[], item: unknown) => {
      const result = schema.safeParse(item);
      if (result.success) {
        acc.push(result.data);
      } else {
        console.error(
          `[Plan Store Validation Failed]`,
          result.error.flatten().fieldErrors,
          item,
        );
      }
      return acc;
    }, []);
  };

  /**
   * 根據日期獲取活動 (按時間 HH:mm 排序)
   */
  const getActivitiesByDate = (date: string) => {
    const plan = currentTripPlans.value.find((p) => p.date === date);
    if (!plan) return [];
    return [...plan.activities].sort((a, b) => a.time.localeCompare(b.time));
  };

  /**
   * 輔助函式：取得或建立特定日期的 Plan 文件
   */
  const getOrCreatePlanDoc = async (tripId: string, date: string) => {
    const plansRef = collection(db, "trips", tripId, "plans");
    const q = query(plansRef, where("date", "==", date));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { id: null, plan: { tripId, date, activities: [] } as DailyPlan };
    }

    const firstDoc = snapshot.docs[0]!;
    return { id: firstDoc.id, plan: firstDoc.data() as DailyPlan };
  };

  /**
   * 監聽特定旅程的行程 (Plans 子集合)
   */
  const subscribeToPlans = (tripId: string) => {
    loading.value = true;
    const plansRef = collection(db, "trips", tripId, "plans");
    const q = query(plansRef, orderBy("date", "asc"));

    return onSnapshot(
      q,
      (snapshot) => {
        const rawData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          tripId, // 確保 tripId 正確
          id: doc.id,
        }));
        currentTripPlans.value = validateAndFilter<DailyPlan>(
          DailyPlanSchema,
          rawData,
        );
        loading.value = false;
      },
      (err) => {
        error.value = err.message;
        loading.value = false;
      },
    );
  };

  /**
   * 更新行程中的活動
   */
  const updateTripActivity = async (
    tripId: string,
    date: string,
    activity: Activity,
  ) => {
    if (!authStore.user) throw new Error("User not logged in");

    const { id: docId, plan } = await getOrCreatePlanDoc(tripId, date);
    const activities = [...plan.activities];

    // 處理 ID 生成與更新
    const activityToSave = activity.id
      ? { ...activity }
      : { ...activity, id: crypto.randomUUID() };

    // 取得舊資料以供後續比對圖片
    const oldActivity = activities.find((a) => a.id === activityToSave.id);

    const idx = activities.findIndex((a) => a.id === activityToSave.id);
    if (idx !== -1) {
      activities[idx] = activityToSave as Activity;
    } else {
      activities.push(activityToSave as Activity);
    }

    if (docId) {
      await updateDoc(doc(db, "trips", tripId, "plans", docId), { activities });
    } else {
      const plansRef = collection(db, "trips", tripId, "plans");
      await addDoc(plansRef, { tripId, date, activities });
    }

    // 延遲刪除邏輯：成功存檔後，比對並刪除已移除的圖片
    if (oldActivity && oldActivity.images) {
      const oldPaths = oldActivity.images.map((img) => img.path);
      const newPaths = new Set(
        (activityToSave.images || []).map((img) => img.path),
      );

      const pathsToDelete = oldPaths.filter((path) => !newPaths.has(path));

      // 非同步執行刪除，不阻塞主流程
      pathsToDelete.forEach((path) => {
        deleteImage(path).catch((err) =>
          console.error("延遲刪除圖片失敗:", err),
        );
      });
    }
  };

  /**
   * 刪除行程中的活動
   */
  const deleteTripActivity = async (
    tripId: string,
    date: string,
    activityId: string,
  ) => {
    if (!authStore.user) throw new Error("User not logged in");

    const { id: docId, plan } = await getOrCreatePlanDoc(tripId, date);
    if (!docId) return;

    // 取得要被刪除的活動以供清理圖片
    const activityToDelete = plan.activities.find((a) => a.id === activityId);

    const activities = plan.activities.filter((a) => a.id !== activityId);

    if (activities.length === 0) {
      // 若無活動，直接刪除文件
      const { deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "trips", tripId, "plans", docId));
    } else {
      await updateDoc(doc(db, "trips", tripId, "plans", docId), { activities });
    }

    // 清理被刪除活動的所有圖片
    if (activityToDelete && activityToDelete.images) {
      activityToDelete.images.forEach((img) => {
        deleteImage(img.path).catch((err) =>
          console.error("清理活動圖片失敗:", err),
        );
      });
    }
  };

  return {
    currentTripPlans,
    loading,
    error,
    getActivitiesByDate,
    subscribeToPlans,
    updateTripActivity,
    deleteTripActivity,
  };
});
