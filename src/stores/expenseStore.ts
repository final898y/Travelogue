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
import type { Expense } from "../types/trip";
import { ExpenseSchema } from "../types/trip";
import { z } from "zod";

export const useExpenseStore = defineStore("expense", () => {
  const expenses = ref<Expense[]>([]);
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
          `[Expense Store Validation Failed]`,
          result.error.flatten().fieldErrors,
          item,
        );
      }
      return acc;
    }, []);
  };

  /**
   * 監聽特定旅程的支出 (Expenses 子集合)
   */
  const subscribeToExpenses = (tripId: string) => {
    loading.value = true;
    const expensesRef = collection(db, "trips", tripId, "expenses");
    const q = query(expensesRef, orderBy("date", "desc"));

    return onSnapshot(
      q,
      (snapshot) => {
        const rawData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        expenses.value = validateAndFilter<Expense>(ExpenseSchema, rawData);
        loading.value = false;
      },
      (err) => {
        error.value = err.message;
        loading.value = false;
      },
    );
  };

  /**
   * 新增支出項目
   */
  const addExpense = async (
    tripId: string,
    item: Omit<Expense, "id" | "createdAt">,
  ) => {
    if (!authStore.user) throw new Error("User not logged in");
    const expensesRef = collection(db, "trips", tripId, "expenses");

    // 安全移除 id 避免汙染
    const { id: _id, ...cleanItem } = item as Partial<Expense>;

    return await addDoc(expensesRef, {
      ...cleanItem,
      createdAt: Timestamp.now(),
    });
  };

  /**
   * 更新支出項目
   */
  const updateExpense = async (
    tripId: string,
    expenseId: string,
    item: Partial<Expense>,
  ) => {
    if (!authStore.user) throw new Error("User not logged in");
    const docRef = doc(db, "trips", tripId, "expenses", expenseId);

    // 過濾掉不應手動更新的內部欄位
    const { id: _id, createdAt: _createdAt, ...dataToUpdate } = item;
    return await updateDoc(docRef, dataToUpdate);
  };

  /**
   * 刪除支出項目
   */
  const deleteExpense = async (tripId: string, expenseId: string) => {
    if (!authStore.user) throw new Error("User not logged in");
    const docRef = doc(db, "trips", tripId, "expenses", expenseId);
    return await deleteDoc(docRef);
  };

  return {
    expenses,
    loading,
    error,
    subscribeToExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
  };
});
