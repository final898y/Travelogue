<script setup lang="ts">
/**
 * TripForm (Component)
 * Handles creating a new trip.
 */
import { reactive, computed, watch } from "vue";
import { Check } from "../../assets/icons";
import type { Trip } from "../../types/trip";

const emit = defineEmits<{
  (e: "save", trip: Omit<Trip, "id" | "userId" | "createdAt">): void;
  (e: "cancel"): void;
  (e: "update:dirty", isDirty: boolean): void;
}>();

// 預設值與初始狀態
const today = new Date().toISOString().split("T")[0]!;
const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]!;
const initialCoverImage =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop";

interface TripFormData {
  title: string;
  startDate: string;
  endDate: string;
  coverImage: string;
  status: "ongoing" | "upcoming" | "finished";
}

const formData = reactive<TripFormData>({
  title: "",
  startDate: today,
  endDate: tomorrow,
  coverImage: initialCoverImage,
  status: "upcoming",
});

// 偵測是否已修改
watch(
  formData,
  (newVal) => {
    const isDirty =
      newVal.title !== "" ||
      newVal.startDate !== today ||
      newVal.endDate !== tomorrow ||
      newVal.coverImage !== initialCoverImage;
    emit("update:dirty", isDirty);
  },
  { deep: true },
);

// 自動計算天數
const daysCount = computed(() => {
  if (!formData.startDate || !formData.endDate) return 0;
  const start = new Date(formData.startDate);
  const end = new Date(formData.endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
});

const handleSave = () => {
  if (!formData.title) return alert("請輸入旅程標題");
  const start = new Date(formData.startDate);
  const end = new Date(formData.endDate);
  if (start > end) {
    return alert("開始日期不能晚於結束日期");
  }

  emit("save", {
    ...formData,
    days: daysCount.value,
  });
};

const coverImages = [
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop", // Mountain
  "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop", // Kyoto
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop", // Nature
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop", // Lake
];
</script>

<template>
  <div class="space-y-6">
    <!-- Title Input -->
    <div class="space-y-2">
      <label class="text-xs font-bold text-forest-300 uppercase tracking-wider"
        >旅程標題</label
      >
      <input
        v-model="formData.title"
        type="text"
        placeholder="例如：東京 5 天 4 夜賞櫻趣"
        class="w-full p-4 rounded-2xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-base font-bold shadow-sm"
      />
    </div>

    <!-- Dates -->
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase"
          >開始日期</label
        >
        <input
          v-model="formData.startDate"
          type="date"
          class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm shadow-sm"
        />
      </div>
      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase"
          >結束日期</label
        >
        <input
          v-model="formData.endDate"
          type="date"
          class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm shadow-sm"
        />
      </div>
    </div>

    <!-- Days Info Badge -->
    <div class="p-3 bg-forest-50 rounded-xl flex items-center justify-between">
      <span class="text-xs font-medium text-forest-600">預計總天數</span>
      <span class="text-sm font-bold text-forest-800">{{ daysCount }} 天</span>
    </div>

    <!-- Cover Image Selection -->
    <div class="space-y-3">
      <label class="text-xs font-bold text-forest-300 uppercase"
        >封面圖片</label
      >
      <div class="grid grid-cols-4 gap-2">
        <button
          v-for="img in coverImages"
          :key="img"
          @click="formData.coverImage = img"
          class="aspect-square rounded-xl overflow-hidden border-2 transition-all relative"
          :class="
            formData.coverImage === img
              ? 'border-forest-400 scale-95'
              : 'border-transparent opacity-60'
          "
        >
          <img :src="img" class="w-full h-full object-cover" />
          <div
            v-if="formData.coverImage === img"
            class="absolute inset-0 bg-forest-400/20 flex items-center justify-center"
          >
            <Check :size="16" :stroke-width="3" color="white" />
          </div>
        </button>
      </div>
    </div>

    <!-- Action Button -->
    <div class="pt-4">
      <button
        @click="handleSave"
        class="w-full py-4 rounded-2xl bg-forest-400 text-white font-bold shadow-soft-lg hover:bg-forest-500 active:scale-95 transition-all"
      >
        開啟新旅程
      </button>
    </div>
  </div>
</template>
