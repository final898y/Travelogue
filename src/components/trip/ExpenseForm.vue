<script setup lang="ts">
/**
 * ExpenseForm (Component)
 * Handles creating and editing expense items with splitting logic.
 */
import { reactive, computed, watch, ref } from "vue";
import {
  Utensils,
  Car,
  Bed,
  Landmark,
  ShoppingBag,
  MoreHorizontal,
  Check,
  RefreshCcw,
  FileText,
} from "../../assets/icons";
import { useAuthStore } from "../../stores/authStore";
import { useUIStore } from "../../stores/uiStore";
import type { Expense, TripMember } from "../../types/trip";

const props = defineProps<{
  initialData: Partial<Expense>;
  tripMembers?: TripMember[]; // 接收 TripMember 物件陣列
}>();

const emit = defineEmits(["save", "cancel", "delete", "update:dirty", "repay"]);

const authStore = useAuthStore();
const uiStore = useUIStore();
const currentUserEmail = authStore.user?.email || "me";
const defaultMemberName =
  authStore.user?.displayName || currentUserEmail.split("@")[0] || "成員";

const isEditMode = computed(() => !!props.initialData.id);

// 統一初始資料生成邏輯
const getInitialData = (data: Partial<Expense>) => ({
  id: data.id,
  type: data.type || "expense",
  date: data.date || new Date().toISOString().split("T")[0],
  category: data.category || "Food",
  amount: data.amount || 0,
  currency: data.currency || "TWD",
  description: data.description || "",
  payer: data.payer || currentUserEmail,
  splitWith: data.splitWith || [currentUserEmail],
  customAmounts: data.customAmounts || {},
});

// 建立局部狀態副本
const formData = reactive<Partial<Expense>>(getInitialData(props.initialData));

const isCustomMode = ref(Object.keys(formData.customAmounts || {}).length > 0);

// 監聽變動以通知父組件是否有未儲存的變更
watch(
  formData,
  (newVal) => {
    // 使用相同的初始基準進行比較
    const isDirty =
      JSON.stringify(newVal) !==
      JSON.stringify(getInitialData(props.initialData));
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

const currentCustomTotal = computed(() => {
  return Object.values(formData.customAmounts || {}).reduce(
    (sum, val) => sum + (Number(val) || 0),
    0,
  );
});

const customTotalMatches = computed(() => {
  if (!isCustomMode.value) return true;
  return Math.abs(currentCustomTotal.value - (formData.amount || 0)) < 0.01;
});

const handleSave = () => {
  if (formData.type === "expense" && !formData.description)
    return uiStore.showToast("請輸入支出描述", "warning");
  if (!formData.amount || formData.amount <= 0)
    return uiStore.showToast("請輸入有效金額", "warning");
  if (!formData.payer) return uiStore.showToast("請指定付款人", "warning");
  if (!formData.splitWith || formData.splitWith.length === 0)
    return uiStore.showToast(
      formData.type === "repayment" ? "請指定收款人" : "至少需有一人均分",
      "warning",
    );

  if (
    formData.type === "repayment" &&
    formData.payer === formData.splitWith[0]
  ) {
    return uiStore.showToast("付款人與收款人不能相同", "warning");
  }

  // 自訂模式金額驗證
  if (formData.type === "expense" && isCustomMode.value) {
    if (!customTotalMatches.value) {
      return uiStore.showToast(
        `自訂金額總和 (${currentCustomTotal.value}) 與支出金額 (${formData.amount}) 不符`,
        "warning",
      );
    }
  } else {
    // 均分模式清空自訂金額
    formData.customAmounts = {};
  }

  // 還款自動生成描述 (若未手動輸入)
  if (formData.type === "repayment" && !formData.description) {
    formData.description = "還款紀錄";
    formData.category = "Repayment";
  }

  emit("save", { ...formData });
};

const toggleSplitMember = (memberId: string) => {
  if (!formData.splitWith) formData.splitWith = [];

  if (formData.type === "repayment") {
    // 還款模式：單選收款人
    formData.splitWith = [memberId];
    return;
  }

  // 支出模式：複選均分
  const idx = formData.splitWith.indexOf(memberId);
  if (idx > -1) {
    if (formData.splitWith.length > 1) {
      formData.splitWith.splice(idx, 1);
      // 同步移除自訂金額
      if (formData.customAmounts) {
        delete formData.customAmounts[memberId];
      }
    }
  } else {
    formData.splitWith.push(memberId);
    // 同步新增自訂金額 (如果是自訂模式)
    if (isCustomMode.value && formData.customAmounts) {
      formData.customAmounts[memberId] = 0;
    }
  }
};

// 切換均分/自訂模式
const toggleCustomMode = () => {
  isCustomMode.value = !isCustomMode.value;
  if (isCustomMode.value) {
    // 初始化自訂金額為 0
    formData.customAmounts = {};
    formData.splitWith?.forEach((id) => {
      if (formData.customAmounts) formData.customAmounts[id] = 0;
    });
  } else {
    formData.customAmounts = {};
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
  if (formData.type === "repayment") return formData.amount;
  return Math.round((formData.amount / formData.splitWith.length) * 100) / 100;
});

// 是否可以顯示還款按鈕 (編輯模式、支出類型)
const canRepay = computed(() => {
  return isEditMode.value && formData.type === "expense";
});

const handleRepayClick = () => {
  emit("repay", {
    amount: perPersonAmount.value,
    description: `還款：${formData.description}`,
    receiver: formData.payer,
  });
};
</script>

<template>
  <div class="space-y-6">
    <!-- Type Selector -->
    <div class="flex p-1 bg-forest-50 rounded-2xl border border-forest-100/50">
      <button
        @click="formData.type = 'expense'"
        type="button"
        class="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
        :class="
          formData.type === 'expense'
            ? 'bg-white text-forest-800 shadow-sm font-bold'
            : 'text-forest-300'
        "
      >
        <FileText :size="18" />
        <span>新增支出</span>
      </button>
      <button
        @click="formData.type = 'repayment'"
        type="button"
        class="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
        :class="
          formData.type === 'repayment'
            ? 'bg-white text-honey-orange shadow-sm font-bold'
            : 'text-forest-300'
        "
      >
        <RefreshCcw :size="18" />
        <span>紀錄還款</span>
      </button>
    </div>

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
            class="w-full p-4 rounded-2xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-2xl font-rounded font-bold shadow-sm pl-10 transition-colors"
            :class="
              formData.type === 'repayment'
                ? 'text-honey-orange'
                : 'text-forest-800'
            "
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

    <!-- Category Selector (Only for Expense) -->
    <div v-if="formData.type === 'expense'" class="space-y-2 animate-fade-in">
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
      <div class="space-y-2 animate-fade-in">
        <label class="text-xs font-bold text-forest-300 uppercase">描述</label>
        <input
          v-model="formData.description"
          type="text"
          :placeholder="
            formData.type === 'repayment'
              ? '例如：還款給某人'
              : '例如：築地市場壽司'
          "
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

    <!-- Splitting / Repayment Logic -->
    <div class="space-y-4 pt-2">
      <div class="space-y-2">
        <label
          class="text-xs font-bold text-forest-300 uppercase tracking-wider"
          >{{
            formData.type === "repayment" ? "付款人 (還錢的人)" : "付款人"
          }}</label
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
                ? formData.type === 'repayment'
                  ? 'bg-honey-orange text-white shadow-soft-sm'
                  : 'bg-forest-500 text-white shadow-soft-sm'
                : 'bg-forest-50 text-forest-400 hover:bg-forest-100'
            "
          >
            {{ m.name }}
          </button>
        </div>
      </div>

      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <label
            class="text-xs font-bold text-forest-300 uppercase tracking-wider"
            >{{
              formData.type === "repayment" ? "收款人 (被還錢的人)" : "均分對象"
            }}</label
          >
          <!-- Custom Split Toggle (Only for Expense) -->
          <button
            v-if="formData.type === 'expense'"
            @click="toggleCustomMode"
            class="text-[10px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer"
            :class="
              isCustomMode
                ? 'bg-honey-orange text-white'
                : 'bg-forest-50 text-forest-400'
            "
          >
            {{ isCustomMode ? "自訂金額" : "平均分攤" }}
          </button>
        </div>

        <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            v-for="m in members"
            :key="m.id"
            @click="toggleSplitMember(m.id)"
            type="button"
            class="px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer"
            :class="
              formData.splitWith?.includes(m.id)
                ? formData.type === 'repayment'
                  ? 'bg-honey-orange text-white shadow-soft-sm'
                  : 'bg-earth-400 text-white shadow-soft-sm'
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

        <!-- Custom Amount Inputs -->
        <div
          v-if="isCustomMode && formData.type === 'expense'"
          class="space-y-2 pt-2 animate-fade-in"
        >
          <div
            v-for="id in formData.splitWith"
            :key="id"
            class="flex items-center gap-3 p-3 bg-white border border-forest-50 rounded-xl shadow-sm"
          >
            <span class="text-xs font-bold text-forest-600 flex-1 truncate">{{
              members.find((m) => m.id === id)?.name
            }}</span>
            <div class="relative w-32">
              <input
                v-if="formData.customAmounts"
                v-model.number="formData.customAmounts[id]"
                type="number"
                inputmode="decimal"
                class="w-full pl-6 pr-3 py-1 rounded-lg border border-forest-100 outline-none text-right font-mono font-bold text-sm"
              />
              <span
                class="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-forest-200"
                >$</span
              >
            </div>
          </div>
          <div
            class="flex justify-between items-center px-2 py-1 text-[10px] font-bold"
            :class="customTotalMatches ? 'text-forest-400' : 'text-red-400'"
          >
            <span>合計: {{ currentCustomTotal }}</span>
            <span>剩餘: {{ (formData.amount || 0) - currentCustomTotal }}</span>
          </div>
        </div>
      </div>

      <!-- Settlement Preview -->
      <div
        v-if="formData.amount && formData.amount > 0 && !isCustomMode"
        class="p-4 rounded-2xl space-y-2 border border-forest-100/50 shadow-inner transition-colors"
        :class="
          formData.type === 'repayment' ? 'bg-honey-orange/10' : 'bg-forest-50'
        "
      >
        <div
          class="flex justify-between items-center text-xs font-bold"
          :class="
            formData.type === 'repayment'
              ? 'text-honey-orange'
              : 'text-forest-600'
          "
        >
          <span>{{
            formData.type === "repayment" ? "還款試算" : "均分試算"
          }}</span>
          <span>{{
            formData.type === "repayment" ? "總還款額" : "每人需支付"
          }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-[10px] text-forest-400 font-medium">
            {{
              formData.type === "repayment"
                ? `從 ${members.find((m) => m.id === formData.payer)?.name} 到 ${members.find((m) => m.id === formData.splitWith?.[0])?.name}`
                : `共 ${formData.splitWith?.length} 人均分`
            }}
          </span>
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
        v-if="canRepay"
        @click="handleRepayClick"
        type="button"
        class="w-full py-4 rounded-2xl bg-honey-orange text-white font-bold shadow-soft-lg hover:bg-honey-600 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
      >
        <RefreshCcw :size="20" />
        即刻還款
      </button>

      <button
        @click="handleSave"
        class="w-full py-4 rounded-2xl bg-forest-400 text-white font-bold shadow-soft-lg hover:bg-forest-500 active:scale-95 transition-all cursor-pointer"
      >
        {{ isEditMode ? "儲存變更" : "新增紀錄" }}
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
