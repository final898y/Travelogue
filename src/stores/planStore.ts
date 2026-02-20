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

    const idx = activities.findIndex((a) => a.id === activityToSave.id);
    if (idx !== -1) {
      activities[idx] = activityToSave;
    } else {
      activities.push(activityToSave);
    }

    if (docId) {
      await updateDoc(doc(db, "trips", tripId, "plans", docId), { activities });
    } else {
      const plansRef = collection(db, "trips", tripId, "plans");
      await addDoc(plansRef, { tripId, date, activities });
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

    const activities = plan.activities.filter((a) => a.id !== activityId);
    await updateDoc(doc(db, "trips", tripId, "plans", docId), { activities });
  };

  return {
    currentTripPlans,
    loading,
    error,
    subscribeToPlans,
    updateTripActivity,
    deleteTripActivity,
  };
});
