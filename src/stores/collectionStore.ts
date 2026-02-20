import { defineStore } from "pinia";
import { ref } from "vue";
import {
  collection,
  query,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuthStore } from "./authStore";
import type { Collection } from "../types/trip";
import { CollectionSchema } from "../types/trip";
import { z } from "zod";

export const useCollectionStore = defineStore("collection", () => {
  const collections = ref<Collection[]>([]);
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
          `[Collection Zod Validation Failed]`,
          result.error.flatten().fieldErrors,
          item,
        );
      }
      return acc;
    }, []);
  };

  /**
   * 監聽特定旅程的資料收集 (Collections 子集合)
   */
  const subscribeToCollections = (tripId: string) => {
    loading.value = true;
    const collectionsRef = collection(db, "trips", tripId, "collections");
    const q = query(collectionsRef, orderBy("createdAt", "desc"));

    return onSnapshot(
      q,
      (snapshot) => {
        const rawData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id, // 確保正確的 ID 蓋掉內容中可能存在的 id 欄位
        }));
        collections.value = validateAndFilter<Collection>(
          CollectionSchema,
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
   * 新增收集項目
   */
  const addCollection = async (
    tripId: string,
    item: Omit<Collection, "id" | "createdAt">,
  ) => {
    if (!authStore.user) throw new Error("User not logged in");
    const collectionsRef = collection(db, "trips", tripId, "collections");

    // 明確排除 id，防止空字串或錯誤 ID 被當作欄位存入
    const { id: _id, ...cleanItem } = item as Partial<Collection>;

    return await addDoc(collectionsRef, {
      ...cleanItem,
      createdAt: Timestamp.now(),
    });
  };

  /**
   * 更新收集項目
   */
  const updateCollection = async (
    tripId: string,
    collectionId: string,
    item: Partial<Collection>,
  ) => {
    if (!authStore.user) throw new Error("User not logged in");
    const docRef = doc(db, "trips", tripId, "collections", collectionId);

    // 過濾掉不應手動更新的內部欄位
    const { id: _id, createdAt: _createdAt, ...dataToUpdate } = item;
    return await updateDoc(docRef, dataToUpdate);
  };

  /**
   * 刪除收集項目
   */
  const deleteCollection = async (tripId: string, collectionId: string) => {
    if (!authStore.user) throw new Error("User not logged in");
    const docRef = doc(db, "trips", tripId, "collections", collectionId);
    return await deleteDoc(docRef);
  };

  return {
    collections,
    loading,
    error,
    subscribeToCollections,
    addCollection,
    updateCollection,
    deleteCollection,
  };
});
