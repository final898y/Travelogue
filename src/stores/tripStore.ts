import { defineStore } from "pinia";
import { ref } from "vue";
import {
  collection,
  query,
  getDocs,
  getDoc,
  doc,
  addDoc,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "../services/firebase";
import type { Trip, Expense, ResearchCollection } from "../types/trip";

export const useTripStore = defineStore("trip", () => {
  const trips = ref<Trip[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Collection reference
  const tripsRef = collection(db, "trips");

  // Fetch all trips for all users (Shared mode)
  const fetchTrips = async () => {
    if (!auth.currentUser) return;
    loading.value = true;
    try {
      const q = query(tripsRef, orderBy("startDate", "desc"));
      const querySnapshot = await getDocs(q);
      trips.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Trip[];
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
      return { id: docSnap.id, ...docSnap.data() } as Trip;
    }
    return null;
  };

  // Real-time listener for all trips
  const subscribeToTrips = () => {
    if (!auth.currentUser) return () => {};
    const q = query(tripsRef, orderBy("startDate", "desc"));
    return onSnapshot(q, (snapshot) => {
      trips.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Trip[];
    });
  };

  // Sub-collection: Expenses
  const subscribeToExpenses = (
    tripId: string,
    callback: (expenses: Expense[]) => void,
  ) => {
    const expensesRef = collection(db, "trips", tripId, "expenses");
    const q = query(expensesRef, orderBy("date", "desc"));
    return onSnapshot(q, (snapshot) => {
      const expenses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Expense[];
      callback(expenses);
    });
  };

  const addExpense = async (tripId: string, expense: Omit<Expense, "id" | "createdAt">) => {
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
      const collections = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ResearchCollection[];
      callback(collections);
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
  const addTrip = async (tripData: Omit<Trip, "id">) => {
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
    subscribeToExpenses,
    addExpense,
    subscribeToCollections,
    addCollection,
    addTrip,
  };
});
