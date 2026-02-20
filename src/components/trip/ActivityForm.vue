<script setup lang="ts">
/**
 * ActivityForm (Component)
 * Handles viewing and editing activity details.
 */
import { reactive, computed, watch } from "vue";
import {
  Landmark,
  Utensils,
  Car,
  Bed,
  MapPin,
  Plus,
  X,
} from "../../assets/icons";
import { useUIStore } from "../../stores/uiStore";
import type { Activity } from "../../types/trip";

const props = defineProps<{
  initialData: Partial<Activity>;
}>();

const emit = defineEmits(["save", "cancel", "delete", "update:dirty"]);

const uiStore = useUIStore();

// 建立局部狀態副本以供編輯
const formData = reactive<Partial<Activity>>({
  time: "09:00",
  title: "",
  subtitle: "",
  location: "",
  category: "sight",
  address: "",
  note: "",
  ...props.initialData,
});

// 監聽變動以通知父組件是否有未儲存的變更
watch(
  formData,
  (newVal) => {
    // 簡單比較，如果與初始值不同則視為 dirty
    // 注意：這裡使用 JSON 序列化來做深層比較
    const isDirty =
      JSON.stringify(newVal) !==
      JSON.stringify({
        time: "09:00",
        title: "",
        subtitle: "",
        location: "",
        category: "sight",
        address: "",
        note: "",
        ...props.initialData,
      });
    emit("update:dirty", isDirty);
  },
  { deep: true },
);

const isEditMode = computed(() => !!props.initialData.id);

const categories = [
  { value: "sight", label: "景點", color: "text-forest-400" },
  { value: "food", label: "美食", color: "text-earth-400" },
  { value: "transport", label: "交通", color: "text-blue-400" },
  { value: "hotel", label: "住宿", color: "text-purple-400" },
];

const handleSave = () => {
  if (!formData.title) return uiStore.showToast("請輸入活動標題", "warning");
  emit("save", { ...formData });
};

const addOption = () => {
  if (!formData.options) formData.options = [];
  formData.options.push({ title: "", subtitle: "" });
};

const removeOption = (idx: number) => {
  formData.options?.splice(idx, 1);
};
</script>

<template>
  <div class="space-y-6">
    <!-- Category Selector -->
    <div class="space-y-2">
      <label class="text-xs font-bold text-forest-300 uppercase tracking-wider"
        >活動類型</label
      >
      <div class="grid grid-cols-4 gap-2">
        <button
          v-for="cat in categories"
          :key="cat.value"
          @click="formData.category = cat.value as any"
          type="button"
          class="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all active:scale-95"
          :class="
            formData.category === cat.value
              ? 'border-forest-400 bg-forest-50 shadow-soft-sm'
              : 'border-transparent bg-white shadow-sm'
          "
        >
          <div :class="cat.color">
            <Landmark v-if="cat.value === 'sight'" :size="20" />
            <Utensils v-if="cat.value === 'food'" :size="20" />
            <Car v-if="cat.value === 'transport'" :size="20" />
            <Bed v-if="cat.value === 'hotel'" :size="20" />
          </div>
          <span class="text-[10px] font-bold text-forest-600">{{
            cat.label
          }}</span>
        </button>
      </div>
    </div>

    <!-- Basic Info -->
    <div class="space-y-4">
      <!-- Time & Title -->
      <div class="flex gap-4">
        <div class="w-24 space-y-2">
          <label class="text-xs font-bold text-forest-300 uppercase"
            >時間</label
          >
          <input
            v-model="formData.time"
            type="time"
            class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm font-mono shadow-sm"
          />
        </div>
        <div class="flex-1 space-y-2">
          <label class="text-xs font-bold text-forest-300 uppercase"
            >標題</label
          >
          <input
            v-model="formData.title"
            type="text"
            placeholder="例如：東京鐵塔"
            class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm font-bold shadow-sm"
          />
        </div>
      </div>

      <!-- Subtitle -->
      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase"
          >副標題</label
        >
        <input
          v-model="formData.subtitle"
          type="text"
          placeholder="例如：熱門地標、晚餐地點"
          class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm shadow-sm"
        />
      </div>

      <!-- Location -->
      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase"
          >地點名稱</label
        >
        <div class="relative">
          <input
            v-model="formData.location"
            type="text"
            placeholder="搜尋地點或手動輸入"
            class="w-full p-3 pl-10 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm shadow-sm"
          />
          <MapPin
            :size="16"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-forest-200"
          />
        </div>
      </div>

      <!-- Note -->
      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase"
          >說明 / 備註</label
        >
        <textarea
          v-model="formData.note"
          rows="3"
          placeholder="補充行程細節、預約編號或注意事項..."
          class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm shadow-sm resize-none"
        ></textarea>
      </div>

      <!-- Options (Alternatives) -->
      <div class="space-y-3 pt-2">
        <div class="flex justify-between items-center">
          <label class="text-xs font-bold text-forest-300 uppercase"
            >備選方案 ({{ formData.options?.length || 0 }})</label
          >
          <button
            @click="addOption"
            type="button"
            class="text-[10px] font-bold text-forest-400 hover:text-forest-600 flex items-center gap-1 transition-colors"
          >
            <Plus :size="14" :stroke-width="2.5" />
            新增方案
          </button>
        </div>

        <div
          v-if="formData.options && formData.options.length > 0"
          class="space-y-3"
        >
          <div
            v-for="(opt, idx) in formData.options"
            :key="idx"
            class="p-4 rounded-2xl bg-forest-50/50 border border-forest-100 space-y-3 relative group"
          >
            <!-- Option Index Badge -->
            <span
              class="absolute -left-2 -top-2 w-6 h-6 rounded-lg bg-forest-100 text-forest-500 flex items-center justify-center font-bold text-[10px] shadow-sm"
            >
              {{ String.fromCharCode(65 + idx) }}
            </span>

            <!-- Delete Button -->
            <button
              @click="removeOption(idx)"
              class="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-white border border-red-50 text-red-300 flex items-center justify-center hover:text-red-500 hover:border-red-100 shadow-sm transition-all opacity-0 group-hover:opacity-100"
            >
              <X :size="12" :stroke-width="3" />
            </button>

            <div class="space-y-2">
              <input
                v-model="opt.title"
                type="text"
                placeholder="方案標題 (例如：另一個景點)"
                class="w-full p-2 bg-transparent border-b border-forest-100 focus:border-forest-300 outline-none text-xs font-bold"
              />
              <input
                v-model="opt.subtitle"
                type="text"
                placeholder="方案副標題 (例如：門票更便宜)"
                class="w-full p-2 bg-transparent border-b border-forest-50 focus:border-forest-200 outline-none text-[10px]"
              />
            </div>
          </div>
        </div>
        <p
          v-else
          class="text-center py-4 border-2 border-dashed border-forest-50 rounded-2xl text-[10px] text-forest-200 italic"
        >
          目前沒有備選方案，點擊上方按鈕新增
        </p>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="pt-4 flex flex-col gap-3">
      <button
        @click="handleSave"
        class="w-full py-4 rounded-2xl bg-forest-400 text-white font-bold shadow-soft-lg hover:bg-forest-500 active:scale-95 transition-all"
      >
        {{ isEditMode ? "儲存變更" : "新增行程活動" }}
      </button>

      <button
        v-if="isEditMode"
        @click="emit('delete')"
        class="w-full py-4 rounded-2xl bg-white border border-red-50 text-red-400 text-sm font-bold hover:bg-red-50 transition-all"
      >
        刪除此行程
      </button>
    </div>
  </div>
</template>
