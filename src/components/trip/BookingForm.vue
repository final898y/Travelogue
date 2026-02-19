<script setup lang="ts">
/**
 * BookingForm (Component)
 * Handles viewing and editing booking details.
 */
import { reactive, computed, watch } from "vue";
import { Plane, Bed, Car, Ticket, Package } from "../../assets/icons";
import type { Booking, BookingType } from "../../types/trip";

const props = defineProps<{
  initialData: Partial<Booking>;
}>();

const emit = defineEmits(["save", "cancel", "delete", "update:dirty"]);

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

// 監聽變動以通知父組件是否有未儲存的變更
watch(
  formData,
  (newVal) => {
    const isDirty =
      JSON.stringify(newVal) !==
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
            <Plane v-if="bt.value === 'flight'" :size="20" />
            <Bed v-if="bt.value === 'hotel'" :size="20" />
            <Car v-if="bt.value === 'transport'" :size="20" />
            <Ticket v-if="bt.value === 'activity'" :size="20" />
            <Package v-if="bt.value === 'other'" :size="20" />
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
