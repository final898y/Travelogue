import {
  collection,
  addDoc,
  Timestamp,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const seedTrips = [
  {
    title: "2024 東京賞櫻之旅",
    startDate: "2024/03/20",
    endDate: "2024/03/24",
    days: 5,
    coverImage:
      "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?q=80&w=800&auto=format&fit=crop",
    status: "upcoming",
  },
  {
    title: "京都古都漫步",
    startDate: "2024/02/15",
    endDate: "2024/02/20",
    days: 6,
    coverImage:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop",
    status: "ongoing",
  },
  {
    title: "北海道冬季祭典",
    startDate: "2024/01/10",
    endDate: "2024/01/15",
    days: 6,
    coverImage:
      "https://images.unsplash.com/photo-1542641728-6ca359b085f4?q=80&w=800&auto=format&fit=crop",
    status: "finished",
  },
];

/**
 * 導入種子資料至 Firestore
 * @param clearExisting 是否先刪除現有資料
 */
export const importSeedData = async (clearExisting = false) => {
  console.log("開始導入種子資料...");
  const tripsRef = collection(db, "trips");

  try {
    // 1. 選擇性清理現有資料
    if (clearExisting) {
      const snapshot = await getDocs(tripsRef);
      const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      console.log("已清理現有資料");
    }

    // 2. 獲取現有標題以進行比對
    const existingSnapshot = await getDocs(tripsRef);
    const existingTitles = new Set(
      existingSnapshot.docs.map((doc) => doc.data().title),
    );

    // 3. 僅導入不存在的旅程
    const tripsToImport = seedTrips.filter(
      (trip) => !existingTitles.has(trip.title),
    );

    if (tripsToImport.length === 0) {
      console.log("所有資料皆已存在，跳過導入。");
      return { success: true, count: 0, message: "資料已是最新狀態" };
    }

    const addPromises = tripsToImport.map((trip) =>
      addDoc(tripsRef, {
        ...trip,
        createdAt: Timestamp.now(),
      }),
    );

    const results = await Promise.all(addPromises);
    console.log(`成功導入 ${results.length} 筆新旅程資料`);

    return { success: true, count: results.length };
  } catch (error) {
    console.error("導入種子資料失敗:", error);
    throw error;
  }
};
