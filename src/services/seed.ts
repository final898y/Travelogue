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
import type { Trip, Expense, ResearchCollection } from "../types/trip";

type ExistingTrip = Trip & { id: string };

const seedTrips: Partial<Trip>[] = [
  {
    title: "2024 東京賞櫻之旅",
    startDate: "2024-03-20",
    endDate: "2024-03-22",
    days: 3,
    coverImage:
      "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?q=80&w=800&auto=format&fit=crop",
    status: "upcoming",
    bookings: [
      {
        id: "b1",
        type: "flight",
        title: "長榮航空 BR-198",
        dateTime: "2024-03-20 13:30",
        confirmationNo: "ABC12345",
        location: "TPE -> NRT",
        isConfirmed: true,
      },
      {
        id: "b2",
        type: "hotel",
        title: "京王廣場大飯店",
        dateTime: "2024-03-20 15:00",
        confirmationNo: "KEIO-9988",
        location: "新宿",
        isConfirmed: true,
      },
    ],
    preparation: [
      { id: "p1", title: "辦理日幣換匯", isCompleted: true, category: "財務" },
      {
        id: "p2",
        title: "購買西瓜卡 (Suica)",
        isCompleted: false,
        category: "交通",
      },
      { id: "p3", title: "打包春季衣物", isCompleted: false, category: "行李" },
    ],
    plans: [
      {
        date: "2024-03-20",
        activities: [
          {
            time: "08:00",
            title: "早起出發前往機場",
            subtitle: "桃園機場第一航廈",
            location: "桃園",
            category: "transport",
          },
          {
            time: "12:30",
            title: "抵達日本並完成入關",
            subtitle: "成田機場",
            location: "千葉縣",
            category: "transport",
          },
          {
            time: "14:30",
            title: "辦理飯店入住手續",
            subtitle: "京王飯店",
            location: "新宿",
            category: "hotel",
          },
          {
            time: "16:00",
            title: "新宿御苑賞櫻散策",
            subtitle: "新宿御苑",
            location: "新宿",
            category: "sight",
          },
          {
            time: "19:00",
            title: "享用美味燒肉晚餐",
            subtitle: "六歌仙燒肉",
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
            title: "築地市場品嚐海鮮",
            subtitle: "築地場外市場",
            location: "築地",
            category: "food",
            address: "東京都中央區築地4-16-2",
            placeId: "ChIJW2cLzSGLGGARXAKXv6EkbqI",
          },
          {
            time: "11:30",
            title: "淺草寺參拜與雷門拍照",
            subtitle: "淺草寺",
            location: "淺草",
            category: "sight",
            address: "東京都台東區淺草2-3-1",
            placeId: "ChIJ8T1GpMGOGGARDYGSgpooDWw",
            coordinates: { lat: 35.7148, lng: 139.7967 },
          },
          {
            time: "13:00",
            title: "百年老店壽喜燒午餐",
            subtitle: "今半壽喜燒",
            location: "淺草",
            category: "food",
          },
          {
            time: "15:30",
            title: "上野公園文化行程選擇",
            subtitle: "上野公園",
            location: "上野",
            category: "sight",
            options: [
              {
                title: "參觀科學博物館",
                subtitle: "國立科學博物館",
                address: "東京都台東區上野公園7-20",
                placeId: "ChIJ8Vuh65yOGGARyj4L5IBFiIk",
              },
              {
                title: "看超萌大熊貓",
                subtitle: "上野動物園",
                address: "東京都台東區上野公園9-83",
              },
              {
                title: "欣賞當代藝術",
                subtitle: "東京都美術館",
                address: "東京都台東區上野公園8-36",
              },
            ],
            address: "東京都台東區上野公園",
          },
          {
            time: "20:00",
            title: "阿美橫町藥妝最後採買",
            subtitle: "阿美橫町",
            location: "上野",
            category: "sight",
            address: "6 Chome-10-7 Ueno, Taito City, Tokyo 110-0005日本",
            isLast: true,
          },
        ],
      },
      {
        date: "2024-03-22",
        activities: [
          {
            time: "10:00",
            title: "明治神宮大鳥居祈福",
            subtitle: "明治神宮",
            location: "原宿",
            category: "sight",
          },
          {
            time: "13:00",
            title: "原宿流行文化散策",
            subtitle: "竹下通",
            location: "原宿",
            category: "sight",
          },
          {
            time: "15:00",
            title: "搭乘 Skyliner 前往機場",
            subtitle: "成田機場",
            category: "transport",
          },
          {
            time: "18:00",
            title: "搭機返回桃園",
            subtitle: "成田機場",
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
    bookings: [
      {
        id: "b3",
        type: "transport",
        title: "新幹線 Nozomi 號",
        dateTime: "2024-02-15 08:30",
        location: "東京 -> 京都",
        isConfirmed: true,
      },
    ],
    preparation: [
      { id: "p4", title: "預約和服體驗", isCompleted: true, category: "活動" },
      { id: "p5", title: "查好巴士路線", isCompleted: true, category: "交通" },
    ],
    plans: [
      {
        date: "2024-02-15",
        activities: [
          {
            time: "09:00",
            title: "抵達京都展開古都之旅",
            subtitle: "京都車站",
            location: "京都",
            category: "transport",
          },
          {
            time: "10:30",
            title: "清水舞台遠眺市景",
            subtitle: "清水寺",
            location: "東山區",
            category: "sight",
            address: "京都市東山區清水1-294",
            placeId: "ChIJB_vchdMIAWARujTEUIZlr2I",
            coordinates: { lat: 34.9949, lng: 135.785 },
          },
          {
            time: "12:30",
            title: "三年坂懷石午餐",
            subtitle: "三年坂",
            location: "東山區",
            category: "food",
          },
          {
            time: "15:00",
            title: "千本鳥居隧道巡禮",
            subtitle: "伏見稻荷大社",
            location: "伏見區",
            category: "sight",
          },
          {
            time: "18:30",
            title: "祇園古街尋覓舞妓蹤跡",
            subtitle: "祇園花見小路",
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
            title: "渡月橋欣賞河岸風光",
            subtitle: "嵐山渡月橋",
            location: "嵐山",
            category: "sight",
          },
          {
            time: "11:30",
            title: "天龍寺禪意庭園參觀",
            subtitle: "天龍寺",
            location: "嵐山",
            category: "sight",
          },
          {
            time: "13:00",
            title: "品嚐道地豆腐料理",
            subtitle: "嵐山豆腐料理",
            location: "嵐山",
            category: "food",
          },
          {
            time: "16:00",
            title: "閃耀金閣寺倒影拍照",
            subtitle: "金閣寺",
            location: "北區",
            category: "sight",
            isLast: true,
          },
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
    bookings: [],
    preparation: [],
    plans: [
      {
        date: "2024-01-10",
        activities: [
          {
            time: "11:00",
            title: "抵達北國雪境",
            subtitle: "新千歲機場",
            location: "千歲",
            category: "transport",
          },
          {
            time: "13:00",
            title: "第一餐就吃道地拉麵",
            subtitle: "札幌拉麵共和國",
            location: "札幌車站",
            category: "food",
          },
          {
            time: "15:00",
            title: "欣賞世界級冰雕作品",
            subtitle: "大通公園雪祭",
            location: "札幌",
            category: "sight",
            placeId: "ChIJKdPFSFEpC18RnuAg7TaybA4",
            coordinates: { lat: 43.0598, lng: 141.3469 },
          },
          {
            time: "19:00",
            title: "晚餐後自由活動規劃",
            subtitle: "薄野周邊",
            location: "薄野",
            category: "sight",
            options: [
              {
                title: "藻岩山百萬夜景",
                subtitle: "藻岩山",
                placeId: "ChIJ6WyfEO7VCl8RITH5sM3AG8M",
                coordinates: { lat: 43.0219, lng: 141.3323 },
              },
              {
                title: "逛街採買藥妝點心",
                subtitle: "狸小路商店街",
                placeId: "ChIJyWjcFIMpC18RoRfh7HqDCT4",
              },
            ],
          },
        ],
      },
      {
        date: "2024-01-11",
        activities: [
          {
            time: "09:00",
            title: "海鮮控必訪的晨間市場",
            subtitle: "二條市場",
            location: "札幌",
            category: "food",
          },
          {
            time: "13:00",
            title: "夢幻巧克力工廠參觀",
            subtitle: "白色戀人公園",
            location: "札幌",
            category: "sight",
          },
          {
            time: "17:00",
            title: "搭乘纜車看市區全景",
            subtitle: "藻岩山展望台",
            location: "札幌",
            category: "sight",
          },
          {
            time: "20:00",
            title: "札幌必吃湯咖哩",
            subtitle: "湯咖哩奧芝商店",
            location: "札幌",
            category: "food",
          },
        ],
      },
      {
        date: "2024-01-12",
        activities: [
          {
            time: "09:00",
            title: "前往浪漫小樽運河",
            subtitle: "小樽車站",
            location: "小樽",
            category: "transport",
          },
          {
            time: "10:30",
            title: "漫步在白雪覆蓋的運河畔",
            subtitle: "小樽運河",
            location: "小樽",
            category: "sight",
          },
          {
            time: "12:30",
            title: "品嚐最新鮮的壽司",
            subtitle: "政壽司",
            location: "小樽",
            category: "food",
          },
          {
            time: "15:00",
            title: "參觀精緻玻璃工藝",
            subtitle: "北一硝子館",
            location: "小樽",
            category: "sight",
          },
          {
            time: "18:00",
            title: "雪地裡的微光漫步",
            subtitle: "小樽雪燈路",
            location: "小樽",
            category: "sight",
          },
        ],
      },
      {
        date: "2024-01-13",
        activities: [
          {
            time: "08:30",
            title: "出發前往旭川動物園",
            subtitle: "旭川車站",
            location: "旭川",
            category: "transport",
          },
          {
            time: "11:00",
            title: "超萌企鵝散步表演",
            subtitle: "旭山動物園",
            location: "旭川",
            category: "sight",
          },
          {
            time: "15:00",
            title: "旭川冬祭冰雕體驗",
            subtitle: "旭川冬祭場地",
            location: "旭川",
            category: "sight",
          },
          {
            time: "19:00",
            title: "回飯店享用溫泉設施",
            subtitle: "札幌飯店",
            location: "札幌",
            category: "hotel",
          },
        ],
      },
      {
        date: "2024-01-14",
        activities: [
          {
            time: "10:00",
            title: "最後的伴手禮採購",
            subtitle: "札幌大丸百貨",
            location: "札幌",
            category: "sight",
          },
          {
            time: "13:00",
            title: "依依不捨前往機場",
            subtitle: "新千歲機場",
            location: "千歲",
            category: "transport",
          },
          {
            time: "16:00",
            title: "平安飛抵家門",
            subtitle: "桃園機場",
            category: "transport",
            isLast: true,
          },
        ],
      },
    ],
  },
];

// 子集合範例資料
const expenseSeeds: Record<string, Omit<Expense, "id">[]> = {
  "2024 東京賞櫻之旅": [
    {
      date: "2024-03-20",
      category: "Food",
      amount: 4500,
      currency: "JPY",
      description: "六歌仙燒肉",
    },
    {
      date: "2024-03-20",
      category: "Transport",
      amount: 1500,
      currency: "JPY",
      description: "Suica 加值",
    },
    {
      date: "2024-03-21",
      category: "Food",
      amount: 3200,
      currency: "JPY",
      description: "今半壽喜燒",
    },
  ],
};

const collectionSeeds: Record<
  string,
  Omit<ResearchCollection, "id" | "createdAt">[]
> = {
  "2024 東京賞櫻之旅": [
    {
      title: "2024東京櫻花預測",
      url: "https://example.com/sakura",
      source: "web",
      category: "景點",
      note: "注意滿開時間",
    },
    {
      title: "Threads 上熱門的新宿美食",
      url: "https://threads.net/tokyo-food",
      source: "threads",
      category: "美食",
    },
  ],
};

/**
 * 導入種子資料至 Firestore
 */
export const importSeedData = async (clearExisting = false) => {
  console.log("開始導入種子資料...");
  const tripsRef = collection(db, "trips");

  try {
    if (clearExisting) {
      const snapshot = await getDocs(tripsRef);
      const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      console.log("已清理現有資料");
    }

    const existingSnapshot = await getDocs(tripsRef);
    const existingDocsMap = new Map<string, ExistingTrip>(
      existingSnapshot.docs.map((d) => [
        d.data().title,
        { id: d.id, ...d.data() } as ExistingTrip,
      ]),
    );

    for (const seedTrip of seedTrips) {
      let tripId: string;
      const existingDoc = existingDocsMap.get(seedTrip.title!);

      if (existingDoc) {
        tripId = existingDoc.id;
        const docRef = doc(db, "trips", tripId);
        await updateDoc(docRef, {
          ...seedTrip,
          updatedAt: Timestamp.now(),
        });
      } else {
        const docRef = await addDoc(tripsRef, {
          ...seedTrip,
          createdAt: Timestamp.now(),
        });
        tripId = docRef.id;
      }

      // 導入子集合：Expenses
      const expenses = expenseSeeds[seedTrip.title!] || [];
      const expRef = collection(db, "trips", tripId, "expenses");
      const expSnapshot = await getDocs(expRef);
      if (expSnapshot.empty) {
        for (const exp of expenses) {
          await addDoc(expRef, { ...exp, createdAt: Timestamp.now() });
        }
      }

      // 導入子集合：Collections
      const collections = collectionSeeds[seedTrip.title!] || [];
      const collRef = collection(db, "trips", tripId, "collections");
      const collSnapshot = await getDocs(collRef);
      if (collSnapshot.empty) {
        for (const coll of collections) {
          await addDoc(collRef, { ...coll, createdAt: Timestamp.now() });
        }
      }
    }

    console.log("導入完成");
    return { success: true };
  } catch (error) {
    console.error("導入種子資料失敗:", error);
    throw error;
  }
};
