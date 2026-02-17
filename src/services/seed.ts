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
    startDate: "2024-03-20",
    endDate: "2024-03-22",
    days: 3,
    coverImage:
      "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?q=80&w=800&auto=format&fit=crop",
    status: "upcoming",
    plans: [
      {
        date: "2024-03-20",
        activities: [
          { time: "08:00", title: "桃園機場第一航廈", category: "transport" },
          {
            time: "12:30",
            title: "抵達成田機場",
            location: "千葉縣",
            category: "transport",
          },
          {
            time: "14:30",
            title: "京王飯店 Check-in",
            location: "新宿",
            category: "hotel",
          },
          {
            time: "16:00",
            title: "新宿御苑賞櫻",
            location: "新宿",
            category: "sight",
          },
          {
            time: "19:00",
            title: "六歌仙燒肉",
            location: "新宿",
            category: "food",
          },
        ],
      },
      {
        date: "2024-03-21",
        activities: [
          {
            time: "09:00",
            title: "築地場外市場",
            location: "築地",
            category: "food",
          },
          {
            time: "11:30",
            title: "淺草寺參拜",
            location: "淺草",
            category: "sight",
          },
          {
            time: "13:00",
            title: "今半壽喜燒",
            location: "淺草",
            category: "food",
          },
          {
            time: "15:30",
            title: "上野恩賜公園",
            location: "上野",
            category: "sight",
          },
          {
            time: "20:00",
            title: "阿美橫町逛街",
            location: "上野",
            category: "sight",
            isLast: true,
          },
        ],
      },
      {
        date: "2024-03-22",
        activities: [
          {
            time: "10:00",
            title: "明治神宮",
            location: "原宿",
            category: "sight",
          },
          {
            time: "13:00",
            title: "竹下通散策",
            location: "原宿",
            category: "sight",
          },
          { time: "15:00", title: "前往成田機場", category: "transport" },
          {
            time: "18:00",
            title: "搭機返家",
            category: "transport",
            isLast: true,
          },
        ],
      },
    ],
  },
  {
    title: "京都古都漫步",
    startDate: "2024-02-15",
    endDate: "2024-02-16",
    days: 2,
    coverImage:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop",
    status: "ongoing",
    plans: [
      {
        date: "2024-02-15",
        activities: [
          { time: "09:00", title: "京都車站抵達", category: "transport" },
          {
            time: "10:30",
            title: "清水寺",
            location: "東山區",
            category: "sight",
          },
          { time: "12:30", title: "三年坂午餐", category: "food" },
          {
            time: "15:00",
            title: "伏見稻荷大社",
            location: "伏見區",
            category: "sight",
          },
          {
            time: "18:30",
            title: "祇園花見小路",
            location: "祇園",
            category: "sight",
          },
        ],
      },
      {
        date: "2024-02-16",
        activities: [
          {
            time: "09:30",
            title: "嵐山渡月橋",
            location: "嵐山",
            category: "sight",
          },
          { time: "11:30", title: "天龍寺", category: "sight" },
          { time: "13:00", title: "嵐山豆腐料理", category: "food" },
          { time: "16:00", title: "金閣寺", category: "sight", isLast: true },
        ],
      },
    ],
  },
  {
    title: "北海道冬季祭典",
    startDate: "2024-01-10",
    endDate: "2024-01-14",
    days: 5,
    coverImage:
      "https://images.unsplash.com/photo-1542641728-6ca359b085f4?q=80&w=800&auto=format&fit=crop",
    status: "finished",
    plans: [
      {
        date: "2024-01-10",
        activities: [
          { time: "11:00", title: "抵達新千歲機場", category: "transport" },
          {
            time: "13:00",
            title: "札幌拉麵共和國",
            location: "札幌車站",
            category: "food",
          },
          {
            time: "15:00",
            title: "大通公園雪祭 (日間)",
            location: "札幌",
            category: "sight",
          },
          {
            time: "19:00",
            title: "成吉思汗烤羊肉",
            location: "薄野",
            category: "food",
          },
        ],
      },
      {
        date: "2024-01-11",
        activities: [
          { time: "09:00", title: "二條市場海鮮丼", category: "food" },
          {
            time: "13:00",
            title: "白色戀人公園",
            location: "札幌",
            category: "sight",
          },
          {
            time: "17:00",
            title: "藻岩山展望台看夜景",
            location: "札幌",
            category: "sight",
          },
          { time: "20:00", title: "湯咖哩晚餐", category: "food" },
        ],
      },
      {
        date: "2024-01-12",
        activities: [
          { time: "09:00", title: "前往小樽", category: "transport" },
          {
            time: "10:30",
            title: "小樽運河散策",
            location: "小樽",
            category: "sight",
          },
          {
            time: "12:30",
            title: "政壽司",
            location: "小樽",
            category: "food",
          },
          {
            time: "15:00",
            title: "北一硝子館",
            location: "小樽",
            category: "sight",
          },
          {
            time: "18:00",
            title: "小樽雪燈路",
            location: "小樽運河",
            category: "sight",
          },
        ],
      },
      {
        date: "2024-01-13",
        activities: [
          { time: "08:30", title: "前往旭川", category: "transport" },
          {
            time: "11:00",
            title: "旭山動物園 (企鵝散步)",
            location: "旭川",
            category: "sight",
          },
          { time: "15:00", title: "旭川冬祭場地", category: "sight" },
          { time: "19:00", title: "回札幌享受飯店溫泉", category: "hotel" },
        ],
      },
      {
        date: "2024-01-14",
        activities: [
          { time: "10:00", title: "札幌市區最後採買", category: "sight" },
          { time: "13:00", title: "前往新千歲機場", category: "transport" },
          {
            time: "16:00",
            title: "搭機返程",
            category: "transport",
            isLast: true,
          },
        ],
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
