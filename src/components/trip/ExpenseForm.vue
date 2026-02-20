<script setup lang="ts">
/**
 * ExpenseForm (Component)
 * Handles creating and editing expense items with splitting logic.
 */
import { reactive, computed, watch } from "vue";
import {
  Utensils,
  Car,
  Bed,
  Landmark,
  ShoppingBag,
  MoreHorizontal,
  Check,
} from "../../assets/icons";
import { useAuthStore } from "../../stores/authStore";
import { useUIStore } from "../../stores/uiStore";
import type { Expense, TripMember } from "../../types/trip";

const props = defineProps<{
  initialData: Partial<Expense>;
  tripMembers?: TripMember[]; // 接收 TripMember 物件陣列
}>();

const emit = defineEmits(["save", "cancel", "delete", "update:dirty"]);

const authStore = useAuthStore();
const uiStore = useUIStore();
const currentUserEmail = authStore.user?.email || "me";
const defaultMemberName =
  authStore.user?.displayName || currentUserEmail.split("@")[0] || "成員";

const isEditMode = computed(() => !!props.initialData.id);

// 建立局部狀態副本
const formData = reactive<Partial<Expense>>({
  date: new Date().toISOString().split("T")[0],
  category: "Food",
  amount: 0,
  currency: "TWD",
  description: "",
  payer: currentUserEmail, // 預設付款人 ID
  splitWith: [currentUserEmail], // 預設均分者 ID 包含自己
  ...props.initialData,
});

// 監聽變動以通知父組件是否有未儲存的變更
watch(
  formData,
  (newVal) => {
    const isDirty =
      JSON.stringify(newVal) !==
      JSON.stringify({
        date: new Date().toISOString().split("T")[0],
        category: "Food",
        amount: 0,
        currency: "TWD",
        description: "",
        payer: currentUserEmail,
        splitWith: [currentUserEmail],
        ...props.initialData,
      });
    emit("update:dirty", isDirty);
  },
  { deep: true },
);

const categories = [
  { value: "Food", label: "餐飲美食", icon: "utensils" },
  { value: "Transport", label: "交通接駁", icon: "car" },
  { value: "Hotel", label: "住宿飯店", icon: "bed" },
  { value: "Sight", label: "門票景點", icon: "landmark" },
  { value: "Shopping", label: "購物血拼", icon: "shopping-bag" },
  { value: "Other", label: "其他支出", icon: "more-horizontal" },
];

const currencies = ["TWD", "JPY", "USD", "EUR", "KRW"];

const handleSave = () => {
  if (!formData.description)
    return uiStore.showToast("請輸入支出描述", "warning");
  if (!formData.amount || formData.amount <= 0)
    return uiStore.showToast("請輸入有效金額", "warning");
  if (!formData.payer) return uiStore.showToast("請指定付款人", "warning");
  if (!formData.splitWith || formData.splitWith.length === 0)
    return uiStore.showToast("至少需有一人均分", "warning");

  emit("save", { ...formData });
};

const toggleSplitMember = (memberId: string) => {
  if (!formData.splitWith) formData.splitWith = [];
  const idx = formData.splitWith.indexOf(memberId);
  if (idx > -1) {
    if (formData.splitWith.length > 1) {
      formData.splitWith.splice(idx, 1);
    }
  } else {
    formData.splitWith.push(memberId);
  }
};

// 預設成員列表（若 tripMembers 未提供）
const members = computed(
  () =>
    props.tripMembers || [{ id: currentUserEmail, name: defaultMemberName }],
);

// 計算每人平均
const perPersonAmount = computed(() => {
  if (
    !formData.amount ||
    !formData.splitWith ||
    formData.splitWith.length === 0
  )
    return 0;
  return Math.round((formData.amount / formData.splitWith.length) * 100) / 100;
});
</script>

<template>
  <div class="space-y-6">
    <!-- Amount & Currency -->
    <div class="flex gap-3">
      <div class="flex-1 space-y-2">
        <label
          class="text-xs font-bold text-forest-300 uppercase tracking-wider"
          >金額</label
        >
        <div class="relative">
          <input
            v-model.number="formData.amount"
            type="number"
            inputmode="decimal"
            placeholder="0.00"
            class="w-full p-4 rounded-2xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-2xl font-rounded font-bold shadow-sm pl-10"
          />
          <span
            class="absolute left-4 top-1/2 -translate-y-1/2 text-forest-200 font-bold"
            >$</span
          >
        </div>
      </div>
      <div class="w-28 space-y-2">
        <label
          class="text-xs font-bold text-forest-300 uppercase tracking-wider"
          >幣別</label
        >
        <select
          v-model="formData.currency"
          class="w-full p-4 rounded-2xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm font-bold shadow-sm appearance-none text-center"
        >
          <option v-for="c in currencies" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
    </div>

    <!-- Category Selector -->
    <div class="space-y-2">
      <label class="text-xs font-bold text-forest-300 uppercase tracking-wider"
        >支出類別</label
      >
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="cat in categories"
          :key="cat.value"
          @click="formData.category = cat.value"
          type="button"
          class="flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all active:scale-95 cursor-pointer"
          :class="
            formData.category === cat.value
              ? 'border-forest-400 bg-forest-50 shadow-soft-sm'
              : 'border-transparent bg-white shadow-sm'
          "
        >
          <div class="text-forest-400">
            <Utensils v-if="cat.icon === 'utensils'" :size="20" />
            <Car v-if="cat.icon === 'car'" :size="20" />
            <Bed v-if="cat.icon === 'bed'" :size="20" />
            <Landmark v-if="cat.icon === 'landmark'" :size="20" />
            <ShoppingBag v-if="cat.icon === 'shopping-bag'" :size="20" />
            <MoreHorizontal v-if="cat.icon === 'more-horizontal'" :size="20" />
          </div>
          <span class="text-[10px] font-bold text-forest-600">{{
            cat.label
          }}</span>
        </button>
      </div>
    </div>

    <!-- Details -->
    <div class="space-y-4">
      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase">描述</label>
        <input
          v-model="formData.description"
          type="text"
          placeholder="例如：築地市場壽司"
          class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm font-bold shadow-sm"
        />
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase">日期</label>
        <input
          v-model="formData.date"
          type="date"
          class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm shadow-sm"
        />
      </div>
    </div>

    <!-- Splitting Logic -->
    <div class="space-y-4 pt-2">
      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase"
          >付款人</label
        >
        <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            v-for="m in members"
            :key="m.id"
            @click="formData.payer = m.id"
            type="button"
            class="px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
            :class="
              formData.payer === m.id
                ? 'bg-forest-500 text-white shadow-soft-sm'
                : 'bg-forest-50 text-forest-400 hover:bg-forest-100'
            "
          >
            {{ m.name }}
          </button>
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase"
          >均分對象</label
        >
        <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            v-for="m in members"
            :key="m.id"
            @click="toggleSplitMember(m.id)"
            type="button"
            class="px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer"
            :class="
              formData.splitWith?.includes(m.id)
                ? 'bg-earth-400 text-white shadow-soft-sm'
                : 'bg-earth-50 text-earth-300 hover:bg-earth-100'
            "
          >
            <Check
              v-if="formData.splitWith?.includes(m.id)"
              :size="12"
              :stroke-width="3"
            />
            {{ m.name }}
          </button>
        </div>
      </div>

      <!-- Settlement Preview -->
      <div
        v-if="formData.amount && formData.amount > 0"
        class="p-4 bg-forest-50 rounded-2xl space-y-2 border border-forest-100/50 shadow-inner"
      >
        <div
          class="flex justify-between items-center text-xs font-bold text-forest-600"
        >
          <span>均分試算</span>
          <span>每人需支付</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-[10px] text-forest-400 font-medium"
            >共 {{ formData.splitWith?.length }} 人均分</span
          >
          <span class="text-lg font-rounded font-bold text-forest-800"
            >{{ perPersonAmount }}
            <span class="text-[10px]">{{ formData.currency }}</span></span
          >
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="pt-4 flex flex-col gap-3">
      <button
        @click="handleSave"
        class="w-full py-4 rounded-2xl bg-forest-400 text-white font-bold shadow-soft-lg hover:bg-forest-500 active:scale-95 transition-all cursor-pointer"
      >
        {{ isEditMode ? "儲存變更" : "新增支出" }}
      </button>

      <button
        v-if="isEditMode"
        @click="emit('delete')"
        class="w-full py-4 rounded-2xl bg-white border border-red-50 text-red-400 text-sm font-bold hover:bg-red-50 transition-all cursor-pointer"
      >
        刪除此紀錄
      </button>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
