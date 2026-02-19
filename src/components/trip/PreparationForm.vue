<script setup lang="ts">
/**
 * PreparationForm (Component)
 * Handles creating and editing checklist items.
 */
import { reactive, computed, watch } from "vue";
import {
  Briefcase,
  FileText,
  CreditCard,
  Pill,
  Smartphone,
  CheckSquare,
  Plus,
} from "../../assets/icons";
import type { ChecklistItem } from "../../types/trip";

const props = defineProps<{
  initialData: Partial<ChecklistItem>;
}>();

const emit = defineEmits(["save", "cancel", "delete", "update:dirty"]);

const isEditMode = computed(() => !!props.initialData.id);

// 建立局部狀態副本
const formData = reactive<Partial<ChecklistItem>>({
  title: "",
  category: "行李",
  isCompleted: false,
  ...props.initialData,
});

// 監聽變動以通知父組件是否有未儲存的變更
watch(
  formData,
  (newVal) => {
    const isDirty =
      JSON.stringify(newVal) !==
      JSON.stringify({
        title: "",
        category: "行李",
        isCompleted: false,
        ...props.initialData,
      });
    emit("update:dirty", isDirty);
  },
  { deep: true },
);

const categories = [
  { value: "行李", label: "行李用品", icon: "briefcase" },
  { value: "證件", label: "證件簽證", icon: "file-text" },
  { value: "金融", label: "金融外幣", icon: "credit-card" },
  { value: "醫藥", label: "醫藥保健", icon: "pill" },
  { value: "電子", label: "電子產品", icon: "smartphone" },
  { value: "其他", label: "其他事項", icon: "check-square" },
];

const handleSave = () => {
  if (!formData.title) return alert("請輸入項目名稱");
  emit("save", { ...formData });
};
</script>

<template>
  <div class="space-y-6">
    <!-- Category Selector -->
    <div class="space-y-2">
      <label class="text-xs font-bold text-forest-300 uppercase tracking-wider"
        >項目類別</label
      >
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="cat in categories"
          :key="cat.value"
          @click="formData.category = cat.value"
          type="button"
          class="flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all active:scale-95"
          :class="
            formData.category === cat.value
              ? 'border-forest-400 bg-forest-50 shadow-soft-sm'
              : 'border-transparent bg-white shadow-sm'
          "
        >
          <div class="text-forest-400">
            <Briefcase v-if="cat.icon === 'briefcase'" :size="20" />
            <FileText v-if="cat.icon === 'file-text'" :size="20" />
            <CreditCard v-if="cat.icon === 'credit-card'" :size="20" />
            <Pill v-if="cat.icon === 'pill'" :size="20" />
            <Smartphone v-if="cat.icon === 'smartphone'" :size="20" />
            <CheckSquare v-if="cat.icon === 'check-square'" :size="20" />
          </div>
          <span class="text-[10px] font-bold text-forest-600">{{
            cat.label
          }}</span>
        </button>
      </div>
    </div>

    <!-- Basic Info -->
    <div class="space-y-4">
      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase"
          >項目名稱</label
        >
        <input
          v-model="formData.title"
          type="text"
          placeholder="例如：更換日幣、帶雨傘"
          class="w-full p-4 rounded-2xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-base font-bold shadow-sm"
        />
      </div>

      <div
        v-if="!isEditMode"
        class="p-4 bg-forest-50 rounded-2xl flex items-center gap-3"
      >
        <div
          class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-forest-400"
        >
          <Plus :size="20" />
        </div>
        <div>
          <p class="text-xs font-bold text-forest-800">新增後將自動同步</p>
          <p class="text-[10px] text-forest-400">完成後點擊即可打勾</p>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="pt-4 flex flex-col gap-3">
      <button
        @click="handleSave"
        class="w-full py-4 rounded-2xl bg-forest-400 text-white font-bold shadow-soft-lg hover:bg-forest-500 active:scale-95 transition-all"
      >
        {{ isEditMode ? "儲存變更" : "加入清單" }}
      </button>

      <button
        v-if="isEditMode"
        @click="emit('delete')"
        class="w-full py-4 rounded-2xl bg-white border border-red-50 text-red-400 text-sm font-bold hover:bg-red-50 transition-all"
      >
        刪除此項目
      </button>
    </div>
  </div>
</template>
