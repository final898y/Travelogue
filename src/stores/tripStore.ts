import { defineStore } from "pinia";
import { ref } from "vue";
import {
  collection,
  query,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { z } from "zod";
import {
  TripSchema,
  DailyPlanSchema,
  ExpenseSchema,
  ResearchCollectionSchema,
  type Trip,
  type DailyPlan,
  type Activity,
  type Expense,
  type ResearchCollection,
} from "../types/trip";

export const useTripStore = defineStore("trip", () => {
  const trips = ref<Trip[]>([]);
  const currentTripPlans = ref<DailyPlan[]>([]);
  const currentTripExpenses = ref<Expense[]>([]);
  const currentTripCollections = ref<ResearchCollection[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Collection reference
  const tripsRef = collection(db, "trips");

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
          `[Zod Validation Failed]`,
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

  // Real-time listener for all trips
  const subscribeToTrips = () => {
    if (!auth.currentUser) return () => {};
    loading.value = true;
    const q = query(tripsRef, orderBy("startDate", "desc"));
    return onSnapshot(
      q,
      (snapshot) => {
        const rawData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        trips.value = validateAndFilter<Trip>(TripSchema, rawData);
        loading.value = false;
      },
      (err) => {
        error.value = err.message;
        loading.value = false;
      },
    );
  };

  /**
   * 獲取單一旅程資訊 (用於非即時監聽視圖)
   */
  const fetchTripById = async (id: string) => {
    if (!auth.currentUser) return null;
    const docRef = doc(db, "trips", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const rawData = { id: docSnap.id, ...docSnap.data() };
      const result = TripSchema.safeParse(rawData);
      if (result.success) {
        return result.data;
      } else {
        console.error(
          `[Zod Validation Failed for Trip ${id}]`,
          result.error.flatten().fieldErrors,
        );
        return null;
      }
    }
    return null;
  };

  /**
   * 監聽特定旅程的行程 (Plans 子集合)
   */
  const subscribeToPlans = (tripId: string) => {
    const plansRef = collection(db, "trips", tripId, "plans");
    const q = query(plansRef, orderBy("date", "asc"));
    return onSnapshot(q, (snapshot) => {
      const rawData = snapshot.docs.map((doc) => ({
        tripId, // 確保 tripId 存在以通過 Schema 驗證
        ...doc.data(),
      }));
      currentTripPlans.value = validateAndFilter<DailyPlan>(
        DailyPlanSchema,
        rawData,
      );
    });
  };

  /**
   * 更新行程中的活動 (子集合模式)
   */
  const updateTripActivity = async (
    tripId: string,
    date: string,
    activity: Activity,
  ) => {
    if (!auth.currentUser) throw new Error("User not logged in");

    const { id: docId, plan } = await getOrCreatePlanDoc(tripId, date);
    const activities = [...plan.activities];

    // 建立活動副本，避免 Mutation 副作用
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
   * 刪除行程中的活動 (子集合模式)
   */
  const deleteTripActivity = async (
    tripId: string,
    date: string,
    activityId: string,
  ) => {
    if (!auth.currentUser) throw new Error("User not logged in");

    const { id: docId, plan } = await getOrCreatePlanDoc(tripId, date);
    if (!docId) return;

    const activities = plan.activities.filter((a) => a.id !== activityId);
    await updateDoc(doc(db, "trips", tripId, "plans", docId), { activities });
  };

  /**
   * 監聽記帳資料
   */
  const subscribeToExpenses = (tripId: string) => {
    const expensesRef = collection(db, "trips", tripId, "expenses");
    const q = query(expensesRef, orderBy("date", "desc"));
    return onSnapshot(q, (snapshot) => {
      const rawData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      currentTripExpenses.value = validateAndFilter<Expense>(
        ExpenseSchema,
        rawData,
      );
    });
  };

  const addExpense = async (
    tripId: string,
    expense: Omit<Expense, "id" | "createdAt">,
  ) => {
    if (!auth.currentUser) throw new Error("User not logged in");
    const expensesRef = collection(db, "trips", tripId, "expenses");
    return await addDoc(expensesRef, {
      ...expense,
      createdAt: Timestamp.now(),
    });
  };

  /**
   * 監聽資料收集
   */
  const subscribeToCollections = (tripId: string) => {
    const collectionsRef = collection(db, "trips", tripId, "collections");
    const q = query(collectionsRef, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const rawData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      currentTripCollections.value = validateAndFilter<ResearchCollection>(
        ResearchCollectionSchema,
        rawData,
      );
    });
  };

  const addCollection = async (
    tripId: string,
    item: Omit<ResearchCollection, "id" | "createdAt">,
  ) => {
    if (!auth.currentUser) throw new Error("User not logged in");
    const collectionsRef = collection(db, "trips", tripId, "collections");
    return await addDoc(collectionsRef, {
      ...item,
      createdAt: Timestamp.now(),
    });
  };

  // Add a new trip
  const addTrip = async (
    tripData: Omit<Trip, "id" | "userId" | "createdAt">,
  ) => {
    if (!auth.currentUser)
      throw new Error("User must be logged in to create a trip");
    const docRef = await addDoc(tripsRef, {
      ...tripData,
      userId: auth.currentUser.uid,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  };

  return {
    trips,
    currentTripPlans,
    currentTripExpenses,
    currentTripCollections,
    loading,
    error,
    subscribeToTrips,
    fetchTripById,
    subscribeToPlans,
    updateTripActivity,
    deleteTripActivity,
    subscribeToExpenses,
    addExpense,
    subscribeToCollections,
    addCollection,
    addTrip,
  };
});
