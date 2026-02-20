<script setup lang="ts">
/**
 * BookingForm (Component)
 * Handles viewing and editing booking details.
 */
import { reactive, computed, watch, type FunctionalComponent } from "vue";
import { Plane, Bed, Car, Ticket, Package } from "../../assets/icons";
import { useUIStore } from "../../stores/uiStore";
import type { Booking, BookingType } from "../../types/trip";

const props = defineProps<{
  initialData: Partial<Booking>;
}>();

const emit = defineEmits(["save", "cancel", "delete", "update:dirty"]);

const uiStore = useUIStore();
const isEditMode = computed(() => !!props.initialData.id);

// 建立局部狀態副本
const formData = reactive({
  type: "flight" as BookingType,
  title: "",
  dateTime: "",
  confirmationNo: "",
  location: "",
  note: "",
  isConfirmed: true,
  ...props.initialData,
  // 內部轉換用欄位
  depLoc: "",
  arrLoc: "",
  depTime: "",
  arrTime: "",
});

// 初始化拆分欄位
const initSplitFields = () => {
  if (formData.type === "flight") {
    const locs = formData.location?.split("->") || [];
    formData.depLoc = locs[0]?.trim() || "";
    formData.arrLoc = locs[1]?.trim() || "";

    const times = formData.dateTime?.split("|") || [];
    formData.depTime = times[0]?.trim() || "";
    formData.arrTime = times[1]?.trim() || "";
  }
};

initSplitFields();

// 監聽變動以通知父組件是否有未儲存的變更
watch(
  formData,
  (newVal) => {
    // 建立一個不包含內部轉換欄位的物件用於比較
    const cleanData = {
      type: newVal.type,
      title: newVal.title,
      dateTime: newVal.dateTime,
      confirmationNo: newVal.confirmationNo,
      location: newVal.location,
      note: newVal.note,
      isConfirmed: newVal.isConfirmed,
      id: newVal.id,
    };

    const isDirty =
      JSON.stringify(cleanData) !==
      JSON.stringify({
        type: "flight",
        title: "",
        dateTime: "",
        confirmationNo: "",
        location: "",
        note: "",
        isConfirmed: true,
        ...props.initialData,
      });
    emit("update:dirty", isDirty);
  },
  { deep: true },
);

const bookingTypes: {
  value: BookingType;
  label: string;
  icon: FunctionalComponent;
}[] = [
  { value: "flight", label: "機票", icon: Plane as FunctionalComponent },
  { value: "hotel", label: "住宿", icon: Bed as FunctionalComponent },
  { value: "transport", label: "交通", icon: Car as FunctionalComponent },
  { value: "activity", label: "活動", icon: Ticket as FunctionalComponent },
  { value: "other", label: "其他", icon: Package as FunctionalComponent },
];

const handleSave = () => {
  if (!formData.title) return uiStore.showToast("請輸入預訂標題", "warning");

  // 如果是機票，將拆分欄位合併回主欄位
  if (formData.type === "flight") {
    formData.location = `${formData.depLoc} -> ${formData.arrLoc}`;
    formData.dateTime = `${formData.depTime} | ${formData.arrTime}`;
  }

  // 移除內部欄位後發送 (僅傳送 Booking 介面定義的欄位)
  const payload: Partial<Booking> = {
    type: formData.type,
    title: formData.title,
    dateTime: formData.dateTime,
    confirmationNo: formData.confirmationNo,
    location: formData.location,
    note: formData.note,
    isConfirmed: formData.isConfirmed,
  };

  if (formData.id) {
    payload.id = formData.id;
  }

  emit("save", payload);
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
            <component :is="bt.icon" :size="20" />
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

      <!-- Flight Specific Fields -->
      <template v-if="formData.type === 'flight'">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-xs font-bold text-forest-300 uppercase"
              >出發地</label
            >
            <input
              v-model="formData.depLoc"
              type="text"
              placeholder="TPE"
              class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm font-bold shadow-sm"
            />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-forest-300 uppercase"
              >目的地</label
            >
            <input
              v-model="formData.arrLoc"
              type="text"
              placeholder="NRT"
              class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm font-bold shadow-sm"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-xs font-bold text-forest-300 uppercase"
              >出發時間</label
            >
            <input
              v-model="formData.depTime"
              type="datetime-local"
              class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-xs font-bold shadow-sm"
            />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-forest-300 uppercase"
              >抵達時間</label
            >
            <input
              v-model="formData.arrTime"
              type="datetime-local"
              class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-xs font-bold shadow-sm"
            />
          </div>
        </div>
      </template>

      <!-- Generic Fields for Non-Flight -->
      <template v-else>
        <div class="space-y-2">
          <label class="text-xs font-bold text-forest-300 uppercase"
            >日期時間</label
          >
          <input
            v-model="formData.dateTime"
            type="datetime-local"
            class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm font-bold shadow-sm"
          />
        </div>

        <div class="space-y-2">
          <label class="text-xs font-bold text-forest-300 uppercase"
            >地點 / 路線</label
          >
          <input
            v-model="formData.location"
            type="text"
            placeholder="例如：飯店地址"
            class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm shadow-sm"
          />
        </div>
      </template>

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
