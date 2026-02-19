<script setup lang="ts">
/**
 * BookingForm (Component)
 * Handles viewing and editing booking details.
 */
import { reactive, computed } from "vue";
import type { Booking, BookingType } from "../../types/trip";

const props = defineProps<{
  initialData: Partial<Booking>;
}>();

const emit = defineEmits(["save", "cancel", "delete"]);

const isEditMode = computed(() => !!props.initialData.id);

// 建立局部狀態副本
const formData = reactive<Partial<Booking>>({
  type: "flight",
  title: "",
  dateTime: "",
  confirmationNo: "",
  location: "",
  note: "",
  isConfirmed: true,
  ...props.initialData,
});

const bookingTypes: { value: BookingType; label: string; icon: string }[] = [
  { value: "flight", label: "機票", icon: "flight" },
  { value: "hotel", label: "住宿", icon: "hotel" },
  { value: "transport", label: "交通", icon: "transport" },
  { value: "activity", label: "活動", icon: "activity" },
  { value: "other", label: "其他", icon: "other" },
];

const handleSave = () => {
  if (!formData.title) return alert("請輸入預訂標題");
  emit("save", { ...formData });
};
</script>

<template>
  <div class="space-y-6">
    <!-- Type Selector -->
    <div class="space-y-2">
      <label class="text-xs font-bold text-forest-300 uppercase tracking-wider"
        >預訂類型</label
      >
      <div class="grid grid-cols-5 gap-2">
        <button
          v-for="bt in bookingTypes"
          :key="bt.value"
          @click="formData.type = bt.value"
          type="button"
          class="flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all active:scale-95"
          :class="
            formData.type === bt.value
              ? 'border-forest-400 bg-forest-50 shadow-soft-sm'
              : 'border-transparent bg-white shadow-sm'
          "
        >
          <div class="text-forest-400">
            <svg
              v-if="bt.value === 'flight'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"
              />
            </svg>
            <svg
              v-if="bt.value === 'hotel'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M2 4v16" />
              <path d="M2 8h18a2 2 0 0 1 2 2v10" />
              <path d="M2 17h20" />
              <path d="M6 8v9" />
            </svg>
            <svg
              v-if="bt.value === 'transport'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"
              />
              <circle cx="7" cy="17" r="2" />
              <path d="M9 17h6" />
              <circle cx="17" cy="17" r="2" />
            </svg>
            <svg
              v-if="bt.value === 'activity'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect width="20" height="12" x="2" y="6" rx="2" />
              <path d="M12 12h.01" />
              <path d="M17 12h.01" />
              <path d="M7 12h.01" />
            </svg>
            <svg
              v-if="bt.value === 'other'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
              />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
          </div>
          <span class="text-[10px] font-bold text-forest-600">{{
            bt.label
          }}</span>
        </button>
      </div>
    </div>

    <!-- Basic Info -->
    <div class="space-y-4">
      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase"
          >預訂標題</label
        >
        <input
          v-model="formData.title"
          type="text"
          placeholder="例如：長榮航空 BR198"
          class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm font-bold shadow-sm"
        />
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase"
          >時間 / 日期</label
        >
        <input
          v-model="formData.dateTime"
          type="text"
          placeholder="例如：2024-05-01 08:30"
          class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm shadow-sm"
        />
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase"
          >地點 / 路線</label
        >
        <input
          v-model="formData.location"
          type="text"
          :placeholder="
            formData.type === 'flight' ? '例如：TPE -> NRT' : '例如：飯店地址'
          "
          class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm shadow-sm"
        />
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase"
          >確認編號 (Confirmation No.)</label
        >
        <input
          v-model="formData.confirmationNo"
          type="text"
          placeholder="例如：ABC123XYZ"
          class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm font-mono shadow-sm"
        />
      </div>

      <div
        class="flex items-center gap-3 p-3 bg-white rounded-xl border border-forest-50 shadow-sm"
      >
        <input
          id="isConfirmed"
          v-model="formData.isConfirmed"
          type="checkbox"
          class="w-5 h-5 accent-forest-400"
        />
        <label for="isConfirmed" class="text-sm font-bold text-forest-700"
          >已獲得最終確認</label
        >
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase">備註</label>
        <textarea
          v-model="formData.note"
          rows="3"
          placeholder="補充預訂細節..."
          class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm shadow-sm resize-none"
        ></textarea>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="pt-4 flex flex-col gap-3">
      <button
        @click="handleSave"
        class="w-full py-4 rounded-2xl bg-forest-400 text-white font-bold shadow-soft-lg hover:bg-forest-500 active:scale-95 transition-all"
      >
        {{ isEditMode ? "儲存變更" : "新增預訂資訊" }}
      </button>

      <button
        v-if="isEditMode"
        @click="emit('delete')"
        class="w-full py-4 rounded-2xl bg-white border border-red-50 text-red-400 text-sm font-bold hover:bg-red-50 transition-all"
      >
        刪除此預訂
      </button>
    </div>
  </div>
</template>
