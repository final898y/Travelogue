<script setup lang="ts">
/**
 * ExpenseForm (Component)
 * Handles creating and editing expense items with splitting logic.
 */
import { reactive, computed } from "vue";
import type { Expense } from "../../types/trip";

const props = defineProps<{
  initialData: Partial<Expense>;
  tripMembers?: string[]; // 假設從 Trip 取得成員名單，若無則手動輸入
}>();

const emit = defineEmits(["save", "cancel", "delete"]);

const isEditMode = computed(() => !!props.initialData.id);

// 建立局部狀態副本
const formData = reactive<Partial<Expense>>({
  date: new Date().toISOString().split("T")[0],
  category: "Food",
  amount: 0,
  currency: "TWD",
  description: "",
  payer: "我", // 預設付款人
  splitWith: ["我"], // 預設均分者包含自己
  ...props.initialData,
});

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
  if (!formData.description) return alert("請輸入支出描述");
  if (!formData.amount || formData.amount <= 0) return alert("請輸入有效金額");
  if (!formData.payer) return alert("請指定付款人");
  if (!formData.splitWith || formData.splitWith.length === 0)
    return alert("至少需有一人均分");

  emit("save", { ...formData });
};

const toggleSplitMember = (member: string) => {
  if (!formData.splitWith) formData.splitWith = [];
  const idx = formData.splitWith.indexOf(member);
  if (idx > -1) {
    if (formData.splitWith.length > 1) {
      formData.splitWith.splice(idx, 1);
    }
  } else {
    formData.splitWith.push(member);
  }
};

// 預設成員列表（若 tripMembers 未提供）
const members = computed(() => props.tripMembers || ["我", "夥伴A", "夥伴B"]);

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
            class="w-full p-4 pl-10 rounded-2xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-2xl font-rounded font-bold shadow-sm"
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
          class="flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all active:scale-95"
          :class="
            formData.category === cat.value
              ? 'border-forest-400 bg-forest-50 shadow-soft-sm'
              : 'border-transparent bg-white shadow-sm'
          "
        >
          <div class="text-forest-400">
            <svg
              v-if="cat.icon === 'utensils'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
              <path d="M7 2v20" />
              <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
            </svg>
            <svg
              v-if="cat.icon === 'car'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
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
              v-if="cat.icon === 'bed'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M2 4v16" />
              <path d="M2 8h18a2 2 0 0 1 2 2v10" />
              <path d="M2 17h20" />
              <path d="M6 8v9" />
            </svg>
            <svg
              v-if="cat.icon === 'landmark'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="3" y1="22" x2="21" y2="22" />
              <line x1="6" y1="18" x2="6" y2="11" />
              <line x1="10" y1="18" x2="10" y2="11" />
              <line x1="14" y1="18" x2="14" y2="11" />
              <line x1="18" y1="18" x2="18" y2="11" />
              <polygon points="12 2 20 7 4 7 12 2" />
            </svg>
            <svg
              v-if="cat.icon === 'shopping-bag'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <svg
              v-if="cat.icon === 'more-horizontal'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
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
            :key="m"
            @click="formData.payer = m"
            type="button"
            class="px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap"
            :class="
              formData.payer === m
                ? 'bg-forest-500 text-white'
                : 'bg-forest-50 text-forest-400'
            "
          >
            {{ m }}
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
            :key="m"
            @click="toggleSplitMember(m)"
            type="button"
            class="px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1"
            :class="
              formData.splitWith?.includes(m)
                ? 'bg-earth-400 text-white'
                : 'bg-earth-50 text-earth-300'
            "
          >
            <svg
              v-if="formData.splitWith?.includes(m)"
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
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {{ m }}
          </button>
        </div>
      </div>

      <!-- Settlement Preview -->
      <div
        v-if="formData.amount && formData.amount > 0"
        class="p-4 bg-forest-50 rounded-2xl space-y-2"
      >
        <div
          class="flex justify-between items-center text-xs font-bold text-forest-600"
        >
          <span>均分試算</span>
          <span>每人需支付</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-[10px] text-forest-400"
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
        class="w-full py-4 rounded-2xl bg-forest-400 text-white font-bold shadow-soft-lg hover:bg-forest-500 active:scale-95 transition-all"
      >
        {{ isEditMode ? "儲存變更" : "新增支出" }}
      </button>

      <button
        v-if="isEditMode"
        @click="emit('delete')"
        class="w-full py-4 rounded-2xl bg-white border border-red-50 text-red-400 text-sm font-bold hover:bg-red-50 transition-all"
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
