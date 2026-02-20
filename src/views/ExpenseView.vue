<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useExpenseStore } from "../stores/expenseStore";
import { useTripStore } from "../stores/tripStore";
import { useAuthStore } from "../stores/authStore";
import { useUIStore } from "../stores/uiStore";
import BaseBottomSheet from "../components/ui/BaseBottomSheet.vue";
import ExpenseForm from "../components/trip/ExpenseForm.vue";
import MemberForm from "../components/trip/MemberForm.vue";
import {
  ChevronLeft,
  Users,
  Plus,
  Utensils,
  Car,
  Bed,
  Landmark,
  ShoppingBag,
  MoreHorizontal,
  Wallet,
  Pencil,
} from "../assets/icons";
import type { Expense, TripMember } from "../types/trip";

const route = useRoute();
const router = useRouter();
const expenseStore = useExpenseStore();
const tripStore = useTripStore();
const authStore = useAuthStore();
const uiStore = useUIStore();
const { expenses } = storeToRefs(expenseStore);
const tripId = route.params.id as string;

const currentTrip = computed(() =>
  tripStore.trips.find((t) => t.id === tripId),
);
const tripMembers = computed(() => currentTrip.value?.members || []);
const currentUserEmail = authStore.user?.email || "me";

const getMemberName = (id: string) => {
  const member = tripMembers.value.find((m) => m.id === id);
  if (member) return member.name;
  return `已移除旅伴 (${id.startsWith("member_") ? id.slice(-4) : id.split("@")[0]})`;
};

const currency = ref("TWD");
const isSheetOpen = ref(false);
const isMemberSheetOpen = ref(false);
const isFormDirty = ref(false);
const isMemberFormDirty = ref(false);
const currentExpense = ref<Partial<Expense> | null>(null);
const isSaving = ref(false);

let unsubscribeExpenses: (() => void) | null = null;
let unsubscribeTrip: (() => void) | null = null;

onMounted(() => {
  if (tripId) {
    unsubscribeExpenses = expenseStore.subscribeToExpenses(tripId);
    unsubscribeTrip = tripStore.subscribeToTrip(tripId, () => {
      // 旅程資料更新時的額外邏輯（若需要）
    });
  }
});

onUnmounted(() => {
  if (unsubscribeExpenses) unsubscribeExpenses();
  if (unsubscribeTrip) unsubscribeTrip();
});

const handleSaveMembers = async (newMembers: TripMember[]) => {
  if (!tripId || isSaving.value) return;
  try {
    isSaving.value = true;
    await tripStore.updateTrip(tripId, { members: newMembers });
    uiStore.showToast("旅伴名單已更新", "success");
    isMemberSheetOpen.value = false;
    isMemberFormDirty.value = false;
  } catch (error) {
    console.error("更新旅伴失敗:", error);
    uiStore.showToast("更新成員失敗", "error");
  } finally {
    isSaving.value = false;
  }
};

const totalExpense = computed(() => {
  return expenses.value.reduce((sum, item) => sum + item.amount, 0);
});

// 計算結算現況 (誰該給誰多少錢)
const settlementSummary = computed(() => {
  const balances: Record<string, number> = {};

  expenses.value.forEach((exp) => {
    const perPerson = exp.amount / (exp.splitWith?.length || 1);

    // 付款人支出增加 (墊錢)
    balances[exp.payer] = (balances[exp.payer] || 0) + exp.amount;

    // 每個參與者債務增加 (欠錢)
    exp.splitWith?.forEach((memberId) => {
      balances[memberId] = (balances[memberId] || 0) - perPerson;
    });
  });

  return Object.entries(balances)
    .map(([id, balance]) => ({
      name: getMemberName(id),
      balance: Math.round(balance * 100) / 100,
    }))
    .sort((a, b) => b.balance - a.balance);
});

const categoryMap = computed(() => {
  const map: Record<string, number> = {};
  expenses.value.forEach((item) => {
    map[item.category] = (map[item.category] || 0) + item.amount;
  });
  return map;
});

const categories = computed(() => {
  const total = totalExpense.value || 1;
  const colors: Record<string, string> = {
    Food: "bg-earth-300",
    Transport: "bg-sky-blue",
    Hotel: "bg-lavender",
    Sight: "bg-forest-300",
    Shopping: "bg-coral-red/60",
    Other: "bg-forest-100",
  };
  const icons: Record<string, typeof Utensils> = {
    Food: Utensils,
    Transport: Car,
    Hotel: Bed,
    Sight: Landmark,
    Shopping: ShoppingBag,
    Other: MoreHorizontal,
  };

  return Object.entries(categoryMap.value).map(([name, amount]) => ({
    name,
    amount,
    percentage: Math.round((amount / total) * 100),
    color: colors[name] || colors.Other,
    icon: icons[name] || icons.Other,
  }));
});

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

const goBack = () => {
  router.push("/");
};

const openEditSheet = (item?: Expense) => {
  isFormDirty.value = false;
  currentExpense.value = item
    ? { ...item }
    : {
        date: new Date().toISOString().split("T")[0],
        category: "Food",
        amount: 0,
        currency: "TWD",
        payer: currentUserEmail,
        splitWith: tripMembers.value.map((m) => m.id),
      };
  isSheetOpen.value = true;
};

const handleCloseSheet = () => {
  isSheetOpen.value = false;
  isFormDirty.value = false;
};

const handleSaveExpense = async (updatedItem: Expense) => {
  if (!tripId || isSaving.value) return;

  try {
    isSaving.value = true;
    if (updatedItem.id) {
      await expenseStore.updateExpense(tripId, updatedItem.id, updatedItem);
      uiStore.showToast("支出更新成功", "success");
    } else {
      await expenseStore.addExpense(tripId, updatedItem);
      uiStore.showToast("新增支出成功", "success");
    }
    handleCloseSheet();
  } catch (error) {
    console.error("儲存支出失敗:", error);
    uiStore.showToast("儲存失敗，請稍後再試", "error");
  } finally {
    isSaving.value = false;
  }
};

const handleDeleteExpense = async () => {
  if (!tripId || !currentExpense.value?.id || isSaving.value) return;

  const confirmed = await uiStore.showConfirm({
    title: "確定刪除支出？",
    message: "這筆消費紀錄將會被永久移除，且無法復原。",
    okText: "刪除",
    cancelText: "取消",
  });

  if (confirmed) {
    try {
      isSaving.value = true;
      await expenseStore.deleteExpense(tripId, currentExpense.value.id);
      uiStore.showToast("支出已移除", "success");
      handleCloseSheet();
    } catch (error) {
      console.error("刪除支出失敗:", error);
      uiStore.showToast("刪除失敗", "error");
    } finally {
      isSaving.value = false;
    }
  }
};
</script>

<template>
  <div class="min-h-screen pb-32 animate-fade-in bg-cream-light/30">
    <!-- Header -->
    <header class="px-6 pt-8 pb-4">
      <div class="flex items-center gap-2 mb-1">
        <button
          @click="goBack"
          class="p-1 -ml-1 text-forest-300 hover:text-forest-500 transition-colors"
        >
          <ChevronLeft :size="24" :stroke-width="2.5" />
        </button>
        <h1 class="text-2xl font-rounded font-bold text-forest-800">
          記帳帳本
        </h1>
      </div>
      <p class="text-gray-500 text-sm ml-8">掌握每一筆旅行支出</p>
    </header>

    <main class="px-6 space-y-6 mt-4">
      <!-- Summary Dashboard -->
      <div class="card-base bg-forest-800 text-white !shadow-soft-lg">
        <div class="flex flex-col items-center text-center space-y-1 mb-6">
          <span class="text-xs opacity-70 uppercase tracking-widest font-bold"
            >總支出 ({{ currency }})</span
          >
          <span class="text-4xl font-rounded font-bold">{{
            totalExpense.toLocaleString()
          }}</span>
        </div>

        <div class="space-y-4">
          <div class="h-3 w-full bg-white/10 rounded-full flex overflow-hidden">
            <div
              v-for="cat in categories"
              :key="cat.name"
              :class="cat.color"
              :style="{ width: cat.percentage + '%' }"
              class="h-full transition-all duration-500"
            ></div>
          </div>

          <div class="grid grid-cols-2 gap-y-3 gap-x-4">
            <div
              v-for="cat in categories"
              :key="cat.name"
              class="flex items-center gap-2"
            >
              <div class="w-2 h-2 rounded-full" :class="cat.color"></div>
              <span class="text-[10px] opacity-80 truncate"
                >{{ cat.name }} {{ cat.percentage }}%</span
              >
              <span class="text-[10px] ml-auto font-bold opacity-60"
                >{{ (cat.amount / 1000).toFixed(1) }}k</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Settlement Summary (Split Logic) -->
      <section v-if="settlementSummary.length > 0" class="space-y-3">
        <div class="flex justify-between items-center">
          <h3 class="text-sm font-bold text-forest-800 flex items-center gap-2">
            <Users :size="16" />
            分帳結算匯總
          </h3>
          <button
            @click="isMemberSheetOpen = true"
            class="p-1 text-forest-300 hover:text-forest-500 transition-colors cursor-pointer"
          >
            <Pencil :size="14" />
          </button>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="person in settlementSummary"
            :key="person.name"
            class="p-3 rounded-2xl bg-white border border-forest-50 shadow-soft-sm flex flex-col items-center text-center"
          >
            <span class="text-[10px] font-bold text-gray-400 mb-1">{{
              person.name
            }}</span>
            <span
              class="text-sm font-rounded font-bold"
              :class="person.balance >= 0 ? 'text-forest-500' : 'text-red-400'"
            >
              {{ person.balance > 0 ? "+" : ""
              }}{{ person.balance.toLocaleString() }}
            </span>
            <span class="text-[8px] text-gray-300 uppercase mt-0.5">
              {{ person.balance >= 0 ? "應收回" : "應支付" }}
            </span>
          </div>
        </div>
      </section>

      <!-- Transactions List -->
      <section class="space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-bold text-forest-800">支出明細</h3>
        </div>

        <div
          v-if="expenses.length === 0"
          class="py-12 text-center bg-white/50 rounded-3xl border-2 border-dashed border-forest-100"
        >
          <div class="text-forest-200 mb-2 flex justify-center">
            <Wallet :size="40" stroke-width="1.5" />
          </div>
          <p class="text-gray-500">尚無支出記錄</p>
        </div>

        <div class="space-y-3">
          <div
            v-for="tx in expenses"
            :key="tx.id"
            @click="openEditSheet(tx)"
            class="card-base !p-4 flex items-center gap-4 cursor-pointer hover:shadow-soft-md active:scale-[0.98] transition-all"
          >
            <div
              class="w-10 h-10 rounded-xl bg-cream flex items-center justify-center text-forest-400 shadow-inner"
            >
              <component
                :is="
                  categories.find((c) => c.name === tx.category)?.icon || Wallet
                "
                :size="20"
              />
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-forest-800 truncate">
                {{ tx.description }}
              </h4>
              <p class="text-[10px] text-gray-400 font-medium">
                {{ formatDate(tx.date) }} • {{ tx.category }} •
                {{ getMemberName(tx.payer) }} 付款
              </p>
            </div>
            <div class="text-right">
              <div class="font-bold text-forest-900">
                {{ tx.amount.toLocaleString() }}
              </div>
              <div class="text-[10px] text-gray-400 uppercase font-mono">
                {{ tx.currency }}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- FAB: Add Expense -->
    <button
      @click="openEditSheet()"
      class="fixed bottom-28 right-6 w-14 h-14 bg-earth-400 text-white rounded-2xl shadow-soft-lg hover:bg-earth-500 hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer z-50"
    >
      <Plus :size="28" :stroke-width="2.5" />
    </button>

    <!-- Edit Expense Sheet -->
    <BaseBottomSheet
      :is-open="isSheetOpen"
      :title="currentExpense?.id ? '編輯支出' : '新增支出'"
      :has-unsaved-changes="isFormDirty"
      @close="handleCloseSheet"
    >
      <ExpenseForm
        v-if="currentExpense"
        :initial-data="currentExpense"
        :trip-members="tripMembers"
        @save="handleSaveExpense"
        @delete="handleDeleteExpense"
        @update:dirty="isFormDirty = $event"
      />
    </BaseBottomSheet>

    <!-- Member Management Sheet -->
    <BaseBottomSheet
      :is-open="isMemberSheetOpen"
      title="管理旅伴名單"
      :has-unsaved-changes="isMemberFormDirty"
      @close="isMemberSheetOpen = false"
    >
      <MemberForm
        :initial-members="tripMembers"
        :current-user-email="currentUserEmail"
        @save="handleSaveMembers"
        @update:dirty="isMemberFormDirty = $event"
      />
    </BaseBottomSheet>

    <!-- Global Loading Overlay -->
    <div
      v-if="isSaving"
      class="fixed inset-0 bg-white/50 backdrop-blur-sm z-[200] flex items-center justify-center"
    >
      <div
        class="w-12 h-12 border-4 border-forest-100 border-t-forest-400 rounded-full animate-spin"
      ></div>
    </div>
  </div>
</template>
