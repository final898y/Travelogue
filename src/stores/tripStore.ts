import { defineStore } from "pinia";
import { ref } from "vue";
import {
  collection,
  query,
  getDocs,
  addDoc,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import type { Trip } from "../types/trip";

export const useTripStore = defineStore("trip", () => {
  const trips = ref<Trip[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Collection reference
  const tripsRef = collection(db, "trips");

  // Fetch trips once
  const fetchTrips = async () => {
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
      console.error("Error fetching trips:", err);
    } finally {
      loading.value = false;
    }
  };

  // Real-time listener
  const subscribeToTrips = () => {
    const q = query(tripsRef, orderBy("startDate", "desc"));
    return onSnapshot(
      q,
      (snapshot) => {
        trips.value = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Trip[];
      },
      (err) => {
        error.value = err.message;
        console.error("Snapshot error:", err);
      },
    );
  };

  // Add a new trip
  const addTrip = async (tripData: Omit<Trip, "id">) => {
    try {
      const docRef = await addDoc(tripsRef, {
        ...tripData,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (err) {
      error.value = (err as Error).message;
      throw err;
    }
  };

  return {
    trips,
    loading,
    error,
    fetchTrips,
    subscribeToTrips,
    addTrip,
  };
});
