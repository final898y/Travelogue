<script setup lang="ts">
/**
 * TripForm (Component)
 * Handles creating or editing a trip.
 */
import { reactive, computed, watch, ref } from "vue";
import { Check, UserPlus, X } from "../../assets/icons";
import { useAuthStore } from "../../stores/authStore";
import { useUIStore } from "../../stores/uiStore";
import type { Trip, TripMember } from "../../types/trip";

const props = defineProps<{
  initialData?: Partial<Trip>;
}>();

const emit = defineEmits<{
  (e: "save", trip: Omit<Trip, "id" | "userId" | "createdAt">): void;
  (e: "cancel"): void;
  (e: "update:dirty", isDirty: boolean): void;
}>();

const authStore = useAuthStore();
const uiStore = useUIStore();
const currentUserEmail = authStore.user?.email || "me";
const defaultMemberName =
  authStore.user?.displayName || currentUserEmail.split("@")[0] || "成員";

// 預設值與初始狀態
const today = new Date().toISOString().split("T")[0]!;
const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]!;
const defaultCoverImage =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop";

interface TripFormData {
  title: string;
  startDate: string;
  endDate: string;
  coverImage: string;
  status: "ongoing" | "upcoming" | "finished";
  members: TripMember[];
}

const formData = reactive<TripFormData>({
  title: props.initialData?.title || "",
  startDate: props.initialData?.startDate || today,
  endDate: props.initialData?.endDate || tomorrow,
  coverImage: props.initialData?.coverImage || defaultCoverImage,
  status: props.initialData?.status || "upcoming",
  members: props.initialData?.members || [
    { id: currentUserEmail, name: defaultMemberName },
  ],
});

const newMemberName = ref("");

const addMember = () => {
  const name = newMemberName.value.trim();
  if (!name) return;
  if (formData.members.some((m) => m.name === name)) {
    return uiStore.showToast("旅伴名稱重複", "warning");
  }
  // 生成簡單唯一 ID
  const newId = `member_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  formData.members.push({ id: newId, name });
  newMemberName.value = "";
};

const removeMember = (id: string) => {
  if (id === currentUserEmail) return; // 不能刪除自己
  formData.members = formData.members.filter((m) => m.id !== id);
};

const isEditing = computed(() => !!props.initialData?.id);

// 偵測是否已修改
watch(
  formData,
  (newVal) => {
    let isDirty = false;
    if (props.initialData?.id) {
      isDirty =
        newVal.title !== (props.initialData.title || "") ||
        newVal.startDate !== (props.initialData.startDate || today) ||
        newVal.endDate !== (props.initialData.endDate || tomorrow) ||
        newVal.coverImage !==
          (props.initialData.coverImage || defaultCoverImage) ||
        newVal.status !== (props.initialData.status || "upcoming") ||
        JSON.stringify(newVal.members) !==
          JSON.stringify(
            props.initialData.members || [
              { id: currentUserEmail, name: defaultMemberName },
            ],
          );
    } else {
      isDirty =
        newVal.title !== "" ||
        newVal.startDate !== today ||
        newVal.endDate !== tomorrow ||
        newVal.coverImage !== defaultCoverImage ||
        newVal.members.length > 1 ||
        newVal.members?.[0]?.id !== currentUserEmail ||
        newVal.members?.[0]?.name !== defaultMemberName;
    }
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
  if (!formData.title) return uiStore.showToast("請輸入旅程標題", "warning");
  const start = new Date(formData.startDate);
  const end = new Date(formData.endDate);
  if (start > end) {
    return uiStore.showToast("開始日期不能晚於結束日期", "warning");
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

    <!-- Status Selection (Visible only when editing) -->
    <div v-if="isEditing" class="space-y-2">
      <label class="text-xs font-bold text-forest-300 uppercase"
        >旅程狀態</label
      >
      <select
        v-model="formData.status"
        class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm shadow-sm appearance-none"
      >
        <option value="upcoming">即將到來 (Upcoming)</option>
        <option value="ongoing">進行中 (Ongoing)</option>
        <option value="finished">已結束 (Finished)</option>
      </select>
    </div>

    <!-- Days Info Badge -->
    <div class="p-3 bg-forest-50 rounded-xl flex items-center justify-between">
      <span class="text-xs font-medium text-forest-600">預計總天數</span>
      <span class="text-sm font-bold text-forest-800">{{ daysCount }} 天</span>
    </div>

    <!-- Member Management -->
    <div class="space-y-3">
      <label class="text-xs font-bold text-forest-300 uppercase tracking-wider"
        >旅伴名單 ({{ formData.members.length }})</label
      >
      <div class="flex gap-2">
        <div class="relative flex-1">
          <input
            v-model="newMemberName"
            type="text"
            placeholder="輸入旅伴姓名"
            class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm shadow-sm"
            @keyup.enter="addMember"
          />
        </div>
        <button
          @click="addMember"
          type="button"
          class="px-4 bg-forest-50 text-forest-500 rounded-xl hover:bg-forest-100 transition-colors cursor-pointer"
        >
          <UserPlus :size="20" />
        </button>
      </div>

      <!-- Member Tags -->
      <div class="flex flex-wrap gap-2">
        <div
          v-for="member in formData.members"
          :key="member.id"
          class="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-forest-100 text-xs font-bold text-forest-600 shadow-soft-sm"
        >
          <span>{{ member.name }}</span>
          <button
            v-if="member.id !== currentUserEmail"
            @click="removeMember(member.id)"
            class="text-forest-300 hover:text-red-400 p-0.5 cursor-pointer"
          >
            <X :size="14" :stroke-width="2.5" />
          </button>
        </div>
      </div>
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
          class="aspect-square rounded-xl overflow-hidden border-2 transition-all relative cursor-pointer"
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
        class="w-full py-4 rounded-2xl bg-forest-400 text-white font-bold shadow-soft-lg hover:bg-forest-500 active:scale-95 transition-all cursor-pointer"
      >
        {{ isEditing ? "儲存變更" : "開啟新旅程" }}
      </button>
    </div>
  </div>
</template>
