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
  type Trip,
  type DailyPlan,
  type Activity,
  type Expense,
  type Booking,
  type ChecklistItem,
} from "../types/trip";

export const useTripStore = defineStore("trip", () => {
  const trips = ref<Trip[]>([]);
  const currentTripPlans = ref<DailyPlan[]>([]);
  const currentTripExpenses = ref<Expense[]>([]);
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

  /**
   * 更新預訂資訊 (Trip 主文件中的 bookings 陣列)
   */
  const updateTripBooking = async (tripId: string, booking: Booking) => {
    if (!auth.currentUser) throw new Error("User not logged in");
    const tripRef = doc(db, "trips", tripId);
    const tripSnap = await getDoc(tripRef);
    if (!tripSnap.exists()) throw new Error("Trip not found");

    const tripData = tripSnap.data() as Trip;
    const bookings = [...(tripData.bookings || [])];

    // 建立預訂副本並處理 ID
    const bookingToSave = booking.id
      ? { ...booking }
      : ({ ...booking, id: crypto.randomUUID() } as Booking);

    const idx = bookings.findIndex((b: Booking) => b.id === bookingToSave.id);
    if (idx !== -1) {
      bookings[idx] = bookingToSave;
    } else {
      bookings.push(bookingToSave);
    }

    await updateDoc(tripRef, { bookings });
  };

  /**
   * 刪除預訂資訊
   */
  const deleteTripBooking = async (tripId: string, bookingId: string) => {
    if (!auth.currentUser) throw new Error("User not logged in");
    const tripRef = doc(db, "trips", tripId);
    const tripSnap = await getDoc(tripRef);
    if (!tripSnap.exists()) throw new Error("Trip not found");

    const tripData = tripSnap.data() as Trip;
    const bookings = (tripData.bookings || []).filter(
      (b: Booking) => b.id !== bookingId,
    );

    await updateDoc(tripRef, { bookings });
  };

  /**
   * 更新準備清單項目 (Trip 主文件中的 preparation 陣列)
   */
  const updateTripPreparationItem = async (
    tripId: string,
    item: Partial<ChecklistItem>,
  ) => {
    if (!auth.currentUser) throw new Error("User not logged in");
    const tripRef = doc(db, "trips", tripId);
    const tripSnap = await getDoc(tripRef);
    if (!tripSnap.exists()) throw new Error("Trip not found");

    const tripData = tripSnap.data() as Trip;
    const preparation = [...(tripData.preparation || [])];

    // 建立項目副本並處理 ID
    const itemToSave = item.id
      ? { ...item }
      : ({
          ...item,
          id: crypto.randomUUID(),
          isCompleted: false,
        } as ChecklistItem);

    const idx = preparation.findIndex(
      (p: ChecklistItem) => p.id === itemToSave.id,
    );
    if (idx !== -1) {
      preparation[idx] = itemToSave as ChecklistItem;
    } else {
      preparation.push(itemToSave as ChecklistItem);
    }

    await updateDoc(tripRef, { preparation });
  };

  /**
   * 刪除準備清單項目
   */
  const deleteTripPreparationItem = async (tripId: string, itemId: string) => {
    if (!auth.currentUser) throw new Error("User not logged in");
    const tripRef = doc(db, "trips", tripId);
    const tripSnap = await getDoc(tripRef);
    if (!tripSnap.exists()) throw new Error("Trip not found");

    const tripData = tripSnap.data() as Trip;
    const preparation = (tripData.preparation || []).filter(
      (p: ChecklistItem) => p.id !== itemId,
    );

    await updateDoc(tripRef, { preparation });
  };

  /**
   * 切換準備清單項目的完成狀態 (原子化操作優化)
   */
  const togglePreparationItem = async (tripId: string, itemId: string) => {
    if (!auth.currentUser) throw new Error("User not logged in");
    const tripRef = doc(db, "trips", tripId);
    const tripSnap = await getDoc(tripRef);
    if (!tripSnap.exists()) throw new Error("Trip not found");

    const tripData = tripSnap.data() as Trip;
    const preparation = (tripData.preparation || []).map((p: ChecklistItem) => {
      if (p.id === itemId) {
        return { ...p, isCompleted: !p.isCompleted };
      }
      return p;
    });

    await updateDoc(tripRef, { preparation });
  };

  return {
    trips,
    currentTripPlans,
    currentTripExpenses,
    loading,
    error,
    subscribeToTrips,
    fetchTripById,
    subscribeToPlans,
    updateTripActivity,
    deleteTripActivity,
    subscribeToExpenses,
    addExpense,
    addTrip,
    updateTripBooking,
    deleteTripBooking,
    updateTripPreparationItem,
    deleteTripPreparationItem,
    togglePreparationItem,
  };
});
