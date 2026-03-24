import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  collection,
  query,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuthStore } from "./authStore";
import { deleteImage } from "../services/storageService";
import type { Collection } from "../types/trip";
import { CollectionSchema } from "../types/trip";
import { z } from "zod";

export const useCollectionStore = defineStore("collection", () => {
  const collections = ref<Collection[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const authStore = useAuthStore();

  /**
   * 提取所有不重複的標籤
   */
  const allTags = computed(() => {
    const tagsSet = new Set<string>();
    collections.value.forEach((item) => {
      // 確保 item.tags 存在且為陣列
      if (item && Array.isArray(item.tags)) {
        item.tags.forEach((tag) => {
          // 嚴格檢查：必須是字串且 trim 後不為空
          if (typeof tag === "string" && tag.trim() !== "") {
            tagsSet.add(tag.trim());
          }
        });
      }
    });
    return Array.from(tagsSet).sort();
  });

  /**
   * 提取所有不重複的分類
   */
  const allCategories = computed(() => {
    const catSet = new Set<string>();
    collections.value.forEach((item) => {
      // 確保 item.category 為字串且 trim 後不為空
      if (
        item &&
        typeof item.category === "string" &&
        item.category.trim() !== ""
      ) {
        catSet.add(item.category.trim());
      }
    });
    return Array.from(catSet).sort();
  });

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
  const addCollection = async (tripId: string, item: Partial<Collection>) => {
    if (!authStore.user) throw new Error("User not logged in");
    const collectionsRef = collection(db, "trips", tripId, "collections");

    const { id, ...cleanItem } = item;
    const dataToSave = {
      ...cleanItem,
      createdAt: Timestamp.now(),
    };

    if (id) {
      // 如果有預產生的 ID (為了圖片路徑一致性)，使用 setDoc
      await setDoc(doc(db, "trips", tripId, "collections", id), dataToSave);
      return id;
    } else {
      const docRef = await addDoc(collectionsRef, dataToSave);
      return docRef.id;
    }
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

    // 取得舊資料以供圖片比對
    const oldItem = collections.value.find((c) => c.id === collectionId);

    // 過濾掉不應手動更新的內部欄位
    const { id: _id, createdAt: _createdAt, ...dataToUpdate } = item;
    await updateDoc(docRef, dataToUpdate);

    // 延遲刪除邏輯
    if (oldItem && oldItem.images) {
      const oldPaths = oldItem.images.map((img) => img.path);
      const newPaths = new Set((item.images || []).map((img) => img.path));
      const pathsToDelete = oldPaths.filter((path) => !newPaths.has(path));

      pathsToDelete.forEach((path) => {
        deleteImage(path).catch((err) =>
          console.error("延遲刪除收集圖片失敗:", err),
        );
      });
    }
  };

  /**
   * 刪除收集項目
   */
  const deleteCollection = async (tripId: string, collectionId: string) => {
    if (!authStore.user) throw new Error("User not logged in");
    const docRef = doc(db, "trips", tripId, "collections", collectionId);

    const itemToDelete = collections.value.find((c) => c.id === collectionId);

    await deleteDoc(docRef);

    // 清理所有圖片
    if (itemToDelete && itemToDelete.images) {
      itemToDelete.images.forEach((img) => {
        deleteImage(img.path).catch((err) =>
          console.error("清理收集圖片失敗:", err),
        );
      });
    }
  };

  return {
    collections,
    allTags,
    allCategories,
    loading,
    error,
    subscribeToCollections,
    addCollection,
    updateCollection,
    deleteCollection,
  };
});
