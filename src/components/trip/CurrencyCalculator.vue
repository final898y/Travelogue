<script setup lang="ts">
/**
 * CurrencyCalculator (Component)
 * A mobile-friendly currency exchange calculator using Firebase Functions.
 */
import { ref, reactive, onMounted, computed, watch } from "vue";
import {
  RefreshCcw,
  Coins,
  CreditCard,
  ChevronDown,
  Info,
  Check,
  RotateCcw,
  ExternalLink,
  BookOpen,
} from "../../assets/icons";
import { useUIStore } from "../../stores/uiStore";
import { useExchangeStore } from "../../stores/exchangeStore";
import type { ExchangeRateResult } from "../../stores/exchangeStore";

const uiStore = useUIStore();
const exchangeStore = useExchangeStore();

const isFetching = ref(false);
const inputAmount = ref<number | null>(null);
const currentRateResult = ref<ExchangeRateResult | null>(null);

// 幣別清單 (常用清單)
const currencies = [
  { code: "TWD", name: "台幣", symbol: "NT$" },
  { code: "JPY", name: "日幣", symbol: "¥" },
  { code: "KRW", name: "韓元", symbol: "₩" },
  { code: "USD", name: "美金", symbol: "$" },
  { code: "EUR", name: "歐元", symbol: "€" },
  { code: "HKD", name: "港幣", symbol: "HK$" },
  { code: "THB", name: "泰銖", symbol: "฿" },
];

// Tab 狀態 (calculator | info)
const activeTab = ref<"calculator" | "info">("calculator");

// 表單狀態
const state = reactive({
  from: exchangeStore.lastUsed.from,
  to: exchangeStore.lastUsed.to,
});

// Tab 選項
const tabs = [
  { label: "匯率查詢", value: "calculator", icon: Coins },
  { label: "詳細說明", value: "info", icon: BookOpen },
];

const fetchRate = async (forceUpdate = false) => {
  if (state.from === state.to) {
    return uiStore.showToast("來源與目標幣別不能相同", "warning");
  }

  try {
    isFetching.value = true;
    const result = await exchangeStore.fetchRate(
      state.from,
      state.to,
      "BOT",
      forceUpdate,
    );
    currentRateResult.value = result;
    if (forceUpdate) {
      uiStore.showToast("匯率已同步台銀最新數據", "success");
    }
  } catch (error) {
    console.error("Fetch Rate Error:", error);
    uiStore.showToast("無法取得匯率，請稍後再試", "error");
  } finally {
    isFetching.value = false;
  }
};

const handleSwap = () => {
  const temp = state.from;
  state.from = state.to;
  state.to = temp;
  fetchRate();
};

const resultAmount = computed(() => {
  if (!inputAmount.value || !currentRateResult.value) return 0;
  return Number((inputAmount.value * currentRateResult.value.rate).toFixed(4));
});

const resultWithFee = computed(() => {
  if (!resultAmount.value) return 0;
  // 試算 1.5% 海外交易手續費
  return Number((resultAmount.value * 1.015).toFixed(4));
});

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString("zh-TW", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const openExternalUrl = (url: string) => {
  window.open(url, "_blank");
};

onMounted(() => {
  exchangeStore.loadHistory();
  // 同步最後使用紀錄
  state.from = exchangeStore.lastUsed.from;
  state.to = exchangeStore.lastUsed.to;

  fetchRate();
});

// 當幣別改變時自動重新抓取
watch([() => state.from, () => state.to], () => {
  if (activeTab.value === "calculator") {
    fetchRate();
  }
});
</script>

<template>
  <div class="space-y-6">
    <!-- Segmented Button (Tab Selector) -->
    <div class="bg-forest-50 p-1 rounded-2xl flex gap-1">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="activeTab = tab.value as any"
        class="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
        :class="
          activeTab === tab.value
            ? 'bg-white text-forest-800 shadow-soft-sm'
            : 'text-forest-400 hover:text-forest-600'
        "
      >
        <component :is="tab.icon" :size="16" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab 1: Calculator -->
    <template v-if="activeTab === 'calculator'">
      <!-- Rate Info Card -->
      <div
        class="card-base !p-5 bg-gradient-to-br from-forest-500 to-forest-600 text-white relative overflow-hidden"
      >
        <div class="relative z-10 flex justify-between items-start">
          <div class="space-y-1">
            <p
              class="text-[10px] font-bold text-white/60 uppercase tracking-wider"
            >
              目前參考匯率 (台灣銀行)
            </p>
            <h2 class="text-3xl font-mono font-bold">
              1 {{ state.from }} ≈ {{ currentRateResult?.rate || "---" }}
              {{ state.to }}
            </h2>
            <div class="flex items-center gap-2 text-[10px] text-white/70">
              <RotateCcw :size="10" />
              最後更新:
              {{
                currentRateResult
                  ? formatDate(currentRateResult.timestamp)
                  : "讀取中..."
              }}
            </div>
          </div>
          <button
            @click="fetchRate(true)"
            :disabled="isFetching"
            class="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCcw :size="18" :class="{ 'animate-spin': isFetching }" />
          </button>
        </div>
        <!-- Background Decoration -->
        <div class="absolute -right-4 -bottom-4 text-white/10 rotate-12">
          <Coins :size="100" />
        </div>
      </div>

      <!-- Currency Selector Row -->
      <div class="flex items-center gap-3">
        <div class="flex-1 space-y-2">
          <label class="text-[10px] font-bold text-forest-300 uppercase ml-1"
            >來源幣別</label
          >
          <div class="relative">
            <select
              v-model="state.from"
              class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm font-bold shadow-sm appearance-none"
            >
              <option v-for="c in currencies" :key="c.code" :value="c.code">
                {{ c.code }} ({{ c.name }})
              </option>
            </select>
            <ChevronDown
              :size="16"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-forest-300 pointer-events-none"
            />
          </div>
        </div>

        <button
          @click="handleSwap"
          class="mt-6 w-10 h-10 flex items-center justify-center rounded-full bg-forest-50 text-forest-400 hover:bg-forest-100 transition-all active:rotate-180 cursor-pointer"
        >
          <RotateCcw :size="20" />
        </button>

        <div class="flex-1 space-y-2">
          <label class="text-[10px] font-bold text-forest-300 uppercase ml-1"
            >目標幣別</label
          >
          <div class="relative">
            <select
              v-model="state.to"
              class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm font-bold shadow-sm appearance-none"
            >
              <option v-for="c in currencies" :key="c.code" :value="c.code">
                {{ c.code }} ({{ c.name }})
              </option>
            </select>
            <ChevronDown
              :size="16"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-forest-300 pointer-events-none"
            />
          </div>
        </div>
      </div>

      <!-- Calculator Inputs -->
      <div class="space-y-4">
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-forest-300 uppercase ml-1"
            >輸入金額 ({{ state.from }})</label
          >
          <div class="relative">
            <input
              v-model="inputAmount"
              type="number"
              inputmode="decimal"
              placeholder="請輸入金額..."
              class="w-full p-4 rounded-2xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-xl font-mono font-bold shadow-sm"
            />
            <div
              class="absolute right-4 top-1/2 -translate-y-1/2 text-forest-300 font-bold"
            >
              {{ state.from }}
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-bold text-forest-300 uppercase ml-1"
            >換算結果 ({{ state.to }})</label
          >
          <div
            class="bg-forest-50/50 p-4 rounded-2xl border border-forest-50 space-y-3"
          >
            <div class="flex justify-between items-center">
              <span class="text-xs text-forest-400">基本換算</span>
              <span class="text-xl font-mono font-bold text-forest-800">
                {{ resultAmount.toLocaleString() }}
                <span class="text-xs">{{ state.to }}</span>
              </span>
            </div>
            <div class="h-px bg-forest-100"></div>
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-1">
                <span class="text-xs text-forest-400">含 1.5% 海外手續費</span>
                <div class="group relative">
                  <Info :size="12" class="text-forest-200 cursor-help" />
                  <div
                    class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-forest-800 text-[10px] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20"
                  >
                    大部分信用卡刷外幣會加收 1.5% 國際手續費，此金額僅供參考。
                  </div>
                </div>
              </div>
              <span class="text-xl font-mono font-bold text-honey-orange">
                {{ resultWithFee.toLocaleString() }}
                <span class="text-xs">{{ state.to }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Tab 2: Info (Visa/Mastercard Links) -->
    <div v-else class="space-y-4 animate-fade-in">
      <div class="card-base !p-5 space-y-4">
        <div class="flex items-center gap-3 text-forest-600">
          <div class="p-2 bg-forest-50 rounded-lg">
            <CreditCard :size="20" />
          </div>
          <div>
            <h3 class="font-bold text-forest-800">發卡組織即時匯率</h3>
            <p class="text-[10px] text-gray-400">
              實際刷卡匯率以發卡組織公告與請款日為準
            </p>
          </div>
        </div>

        <p class="text-xs text-forest-600 leading-relaxed">
          由於發卡組織 (Visa / Mastercard)
          的匯率查詢介面具備嚴格的安全性限制，建議您直接前往官方網站進行最準確的換算試算。
        </p>

        <div class="grid grid-cols-1 gap-3 pt-2">
          <button
            @click="
              openExternalUrl(
                'https://usa.visa.com/support/consumer/travel-support/exchange-rate-calculator.html',
              )
            "
            class="w-full p-4 rounded-xl border border-forest-100 flex items-center justify-between hover:bg-forest-50 transition-all cursor-pointer group"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold italic"
              >
                Visa
              </div>
              <span class="text-sm font-bold text-forest-800"
                >Visa 匯率計算器</span
              >
            </div>
            <ExternalLink
              :size="16"
              class="text-forest-200 group-hover:text-forest-400"
            />
          </button>

          <button
            @click="
              openExternalUrl(
                'https://www.mastercard.us/en-us/personal/get-support/convert-currency.html',
              )
            "
            class="w-full p-4 rounded-xl border border-forest-100 flex items-center justify-between hover:bg-forest-50 transition-all cursor-pointer group"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 font-bold italic"
              >
                MC
              </div>
              <span class="text-sm font-bold text-forest-800"
                >Mastercard 匯率計算器</span
              >
            </div>
            <ExternalLink
              :size="16"
              class="text-forest-200 group-hover:text-forest-400"
            />
          </button>
        </div>
      </div>

      <div class="flex items-start gap-3 p-4 bg-cream-dark/20 rounded-2xl">
        <Info :size="16" class="mt-0.5 text-forest-300 shrink-0" />
        <p class="text-[11px] text-forest-400 leading-relaxed">
          <strong>小叮嚀：</strong>
          大部分銀行針對海外刷卡會加收 1.5%
          的國外交易手續費，但某些具備「海外回饋」的信用卡可以抵銷甚至超過這筆費用。建議出國前確認您的卡片權益。
        </p>
      </div>
    </div>

    <!-- Save History Info -->
    <div
      class="flex items-center gap-2 p-3 bg-cream-dark/30 rounded-xl text-[10px] text-forest-400"
    >
      <Check :size="12" />
      <span>匯率數據來源：台灣銀行 (即期賣出/現金賣出)</span>
    </div>
  </div>
</template>

<style scoped>
/* 移除 Chrome/Safari/Edge 的數字輸入框箭頭 */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* 移除 Firefox 的數字輸入框箭頭 */
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
