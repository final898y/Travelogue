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
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { z } from "zod";
import {
  TripSchema,
  ExpenseSchema,
  ResearchCollectionSchema,
  type Trip,
  type Activity,
  type Expense,
  type ResearchCollection,
} from "../types/trip";

export const useTripStore = defineStore("trip", () => {
  const trips = ref<Trip[]>([]);
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

  // Fetch all trips for all users (Shared mode)
  const fetchTrips = async () => {
    if (!auth.currentUser) return;
    loading.value = true;
    try {
      const q = query(tripsRef, orderBy("startDate", "desc"));
      const querySnapshot = await getDocs(q);
      const rawData: unknown[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      trips.value = validateAndFilter<Trip>(TripSchema, rawData);
    } catch (err) {
      error.value = (err as Error).message;
    } finally {
      loading.value = false;
    }
  };

  // Fetch single trip
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
          result.error.format(),
        );
        return null;
      }
    }
    return null;
  };

  // Real-time listener for all trips
  const subscribeToTrips = () => {
    if (!auth.currentUser) return () => {};
    const q = query(tripsRef, orderBy("startDate", "desc"));
    return onSnapshot(q, (snapshot) => {
      const rawData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      trips.value = validateAndFilter<Trip>(TripSchema, rawData);
    });
  };

  /**
   * 更新行程中的活動 (新增或修改)
   */
  const updateTripActivity = async (
    tripId: string,
    date: string,
    activity: Activity,
  ) => {
    if (!auth.currentUser) throw new Error("User not logged in");
    const trip = trips.value.find((t) => t.id === tripId);
    if (!trip) throw new Error("Trip not found");

    const plans = trip.plans ? [...trip.plans] : [];
    let plan = plans.find((p) => p.date === date);

    if (!plan) {
      plan = { date, activities: [] };
      plans.push(plan);
    }

    // 如果沒有 ID，則是新增；如果有 ID，則是編輯
    if (!activity.id) {
      activity.id = crypto.randomUUID();
      plan.activities.push(activity);
    } else {
      const idx = plan.activities.findIndex((a) => a.id === activity.id);
      if (idx !== -1) {
        plan.activities[idx] = activity;
      } else {
        // 若帶有 ID 但沒找到 (可能是 legacy data)，也當作新增
        plan.activities.push(activity);
      }
    }

    const docRef = doc(db, "trips", tripId);
    await updateDoc(docRef, {
      plans,
      updatedAt: Timestamp.now(),
    });

    // 同步更新本地狀態，觸發 UI 反應性
    trip.plans = plans;
  };

  /**
   * 刪除行程中的活動
   */
  const deleteTripActivity = async (
    tripId: string,
    date: string,
    activityId: string,
  ) => {
    if (!auth.currentUser) throw new Error("User not logged in");
    const trip = trips.value.find((t) => t.id === tripId);
    if (!trip || !trip.plans) return;

    const plans = trip.plans.map((plan) => {
      if (plan.date === date) {
        return {
          ...plan,
          activities: plan.activities.filter((a) => a.id !== activityId),
        };
      }
      return plan;
    });

    const docRef = doc(db, "trips", tripId);
    await updateDoc(docRef, {
      plans,
      updatedAt: Timestamp.now(),
    });

    // 同步更新本地狀態，觸發 UI 反應性
    trip.plans = plans;
  };

  // Sub-collection: Expenses
  const subscribeToExpenses = (
    tripId: string,
    callback: (expenses: Expense[]) => void,
  ) => {
    const expensesRef = collection(db, "trips", tripId, "expenses");
    const q = query(expensesRef, orderBy("date", "desc"));
    return onSnapshot(q, (snapshot) => {
      const rawData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(validateAndFilter<Expense>(ExpenseSchema, rawData));
    });
  };

  const addExpense = async (
    tripId: string,
    expense: Omit<Expense, "id" | "createdAt">,
  ) => {
    const expensesRef = collection(db, "trips", tripId, "expenses");
    return await addDoc(expensesRef, {
      ...expense,
      createdAt: Timestamp.now(),
    });
  };

  // Sub-collection: Collections (Research)
  const subscribeToCollections = (
    tripId: string,
    callback: (collections: ResearchCollection[]) => void,
  ) => {
    const collectionsRef = collection(db, "trips", tripId, "collections");
    const q = query(collectionsRef, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const rawData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(
        validateAndFilter<ResearchCollection>(
          ResearchCollectionSchema,
          rawData,
        ),
      );
    });
  };

  const addCollection = async (
    tripId: string,
    item: Omit<ResearchCollection, "id" | "createdAt">,
  ) => {
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
    loading,
    error,
    fetchTrips,
    fetchTripById,
    subscribeToTrips,
    updateTripActivity,
    deleteTripActivity,
    subscribeToExpenses,
    addExpense,
    subscribeToCollections,
    addCollection,
    addTrip,
  };
});
