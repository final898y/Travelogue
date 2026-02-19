<script setup lang="ts">
/**
 * ActivityForm (Component)
 * Handles viewing and editing activity details.
 */
import { reactive, computed } from "vue";
import type { Activity } from "../../types/trip";

const props = defineProps<{
  initialData: Partial<Activity>;
}>();

const emit = defineEmits(["save", "cancel", "delete"]);

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

const isEditMode = computed(() => !!props.initialData.id);

const categories = [
  { value: "sight", label: "景點", color: "text-forest-400" },
  { value: "food", label: "美食", color: "text-earth-400" },
  { value: "transport", label: "交通", color: "text-blue-400" },
  { value: "hotel", label: "住宿", color: "text-purple-400" },
];

const handleSave = () => {
  if (!formData.title) return alert("請輸入活動標題");
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
            <svg
              v-if="cat.value === 'sight'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-landmark"
            >
              <line x1="3" y1="22" x2="21" y2="22" />
              <line x1="6" y1="18" x2="6" y2="11" />
              <line x1="10" y1="18" x2="10" y2="11" />
              <line x1="14" y1="18" x2="14" y2="11" />
              <line x1="18" y1="18" x2="18" y2="11" />
              <polygon points="12 2 20 7 4 7 12 2" />
            </svg>
            <svg
              v-if="cat.value === 'food'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-utensils"
            >
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
              <path d="M7 2v20" />
              <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
            </svg>
            <svg
              v-if="cat.value === 'transport'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-car"
            >
              <path
                d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"
              />
              <circle cx="7" cy="17" r="2" />
              <path d="M9 17h6" />
              <circle cx="17" cy="17" r="2" />
            </svg>
            <svg
              v-if="cat.value === 'hotel'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-bed"
            >
              <path d="M2 4v16" />
              <path d="M2 8h18a2 2 0 0 1 2 2v10" />
              <path d="M2 17h20" />
              <path d="M6 8v9" />
            </svg>
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-map-pin absolute left-3 top-1/2 -translate-y-1/2 text-forest-200"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
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
