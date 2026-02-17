import {
  collection,
  addDoc,
  Timestamp,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Trip } from "../types/trip";

type ExistingTrip = Trip & { id: string };

const seedTrips = [
  {
    title: "2024 東京賞櫻之旅",
    startDate: "2024/03/20",
    endDate: "2024/03/24",
    days: 5,
    coverImage:
      "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?q=80&w=800&auto=format&fit=crop",
    status: "upcoming",
    scheduleItems: [
      {
        time: "09:00",
        title: "淺草寺",
        location: "台東區淺草 2-3-1",
        category: "sight",
      },
      {
        time: "12:00",
        title: "一蘭拉麵",
        location: "台東區西淺草 1-1-1",
        category: "food",
      },
      {
        time: "18:00",
        title: "京王飯店 Check-in",
        location: "新宿區西新宿 2-2-1",
        category: "hotel",
        isLast: true,
      },
    ],
  },
  {
    title: "京都古都漫步",
    startDate: "2024/02/15",
    endDate: "2024/02/20",
    days: 6,
    coverImage:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop",
    status: "ongoing",
    scheduleItems: [
      {
        time: "10:00",
        title: "金閣寺",
        location: "京都市北區金閣寺町 1",
        category: "sight",
      },
      {
        time: "13:00",
        title: "嵐山豆腐料理",
        category: "food",
      },
    ],
  },
  {
    title: "北海道冬季祭典",
    startDate: "2024/01/10",
    endDate: "2024/01/15",
    days: 6,
    coverImage:
      "https://images.unsplash.com/photo-1542641728-6ca359b085f4?q=80&w=800&auto=format&fit=crop",
    status: "finished",
    scheduleItems: [
      {
        time: "17:00",
        title: "札幌雪祭",
        location: "大通公園",
        category: "sight",
      },
    ],
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

    // 2. 獲取現有資料以進行比對或更新
    const existingSnapshot = await getDocs(tripsRef);
    const existingDocsMap = new Map<string, ExistingTrip>(
      existingSnapshot.docs.map((d) => [
        d.data().title,
        { id: d.id, ...d.data() } as ExistingTrip,
      ]),
    );

    let updateCount = 0;
    let addCount = 0;

    const operations = seedTrips.map(async (seedTrip) => {
      const existingDoc = existingDocsMap.get(seedTrip.title);
      if (existingDoc) {
        // 更新現有資料
        const docRef = doc(db, "trips", existingDoc.id);
        await updateDoc(docRef, {
          ...seedTrip,
          updatedAt: Timestamp.now(),
        });
        updateCount++;
      } else {
        // 新增資料
        await addDoc(tripsRef, {
          ...seedTrip,
          createdAt: Timestamp.now(),
        });
        addCount++;
      }
    });

    await Promise.all(operations);
    console.log(`導入完成：更新 ${updateCount} 筆，新增 ${addCount} 筆資料`);

    return { success: true, updated: updateCount, added: addCount };
  } catch (error) {
    console.error("導入種子資料失敗:", error);
    throw error;
  }
};
