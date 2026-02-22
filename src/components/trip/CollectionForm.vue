<script setup lang="ts">
/**
 * CollectionForm (Component)
 * Handles creating and editing travel research items.
 */
import { reactive, computed, watch } from "vue";
import {
  Globe,
  AtSign,
  Instagram,
  Youtube,
  MoreHorizontal,
} from "../../assets/icons";
import { useUIStore } from "../../stores/uiStore";
import type { Collection, CollectionSource } from "../../types/trip";

const props = defineProps<{
  initialData: Partial<Collection>;
}>();

const emit = defineEmits(["save", "cancel", "delete", "update:dirty"]);

const uiStore = useUIStore();
const isEditMode = computed(() => !!props.initialData.id);

// 建立局部狀態副本
const formData = reactive<Partial<Collection>>({
  title: "",
  url: "",
  mapUrl: "",
  websiteUrl: "",
  source: "web",
  category: "未分類",
  note: "",
  imageUrl: "",
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
        url: "",
        mapUrl: "",
        websiteUrl: "",
        source: "web",
        category: "未分類",
        note: "",
        imageUrl: "",
        ...props.initialData,
      });
    emit("update:dirty", isDirty);
  },
  { deep: true },
);

const sources: { value: CollectionSource; label: string; icon: string }[] = [
  { value: "web", label: "網頁", icon: "globe" },
  { value: "threads", label: "Threads", icon: "at-sign" },
  { value: "instagram", label: "IG", icon: "instagram" },
  { value: "youtube", label: "YouTube", icon: "youtube" },
  { value: "other", label: "其他", icon: "more-horizontal" },
];

const categories = [
  "未分類",
  "美食",
  "景點",
  "住宿",
  "交通",
  "購物",
  "攻略/工具",
  "行程參考",
  "其他",
];

const handleSave = () => {
  if (!formData.title) return uiStore.showToast("請輸入標題", "warning");
  if (!formData.url) return uiStore.showToast("請輸入網址", "warning");

  // 網址校驗函式
  const isValidUrl = (url?: string) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (!isValidUrl(formData.url))
    return uiStore.showToast("請輸入有效的來源網址", "warning");
  if (formData.mapUrl && !isValidUrl(formData.mapUrl))
    return uiStore.showToast("請輸入有效的地點網址", "warning");
  if (formData.websiteUrl && !isValidUrl(formData.websiteUrl))
    return uiStore.showToast("請輸入有效的官網網址", "warning");

  const cleanData: Partial<Collection> = {
    title: formData.title,
    url: formData.url,
    mapUrl: formData.mapUrl,
    websiteUrl: formData.websiteUrl,
    source: formData.source,
    category: formData.category,
    note: formData.note,
    imageUrl: formData.imageUrl,
  };

  // Conditionally add id if it exists (meaning it's an edit operation)
  if (formData.id) {
    cleanData.id = formData.id;
  }
  emit("save", cleanData);
};
</script>

<template>
  <div class="space-y-6">
    <!-- Source Selector -->
    <div class="space-y-2">
      <label class="text-xs font-bold text-forest-300 uppercase tracking-wider"
        >來源類型</label
      >
      <div class="grid grid-cols-5 gap-2">
        <button
          v-for="src in sources"
          :key="src.value"
          @click="formData.source = src.value"
          type="button"
          class="flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all active:scale-95"
          :class="
            formData.source === src.value
              ? 'border-forest-400 bg-forest-50 shadow-soft-sm'
              : 'border-transparent bg-white shadow-sm'
          "
        >
          <div class="text-forest-400">
            <Globe v-if="src.icon === 'globe'" :size="20" />
            <AtSign v-if="src.icon === 'at-sign'" :size="20" />
            <Instagram v-if="src.icon === 'instagram'" :size="20" />
            <Youtube v-if="src.icon === 'youtube'" :size="20" />
            <MoreHorizontal v-if="src.icon === 'more-horizontal'" :size="20" />
          </div>
          <span class="text-[10px] font-bold text-forest-600">{{
            src.label
          }}</span>
        </button>
      </div>
    </div>

    <!-- Basic Info -->
    <div class="space-y-4">
      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase">標題</label>
        <input
          v-model="formData.title"
          type="text"
          placeholder="例如：東京必吃拉麵清單"
          class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm font-bold shadow-sm"
        />
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase"
          >網址 (來源 URL)</label
        >
        <input
          v-model="formData.url"
          type="url"
          placeholder="https://... (來源貼文或網頁)"
          class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm font-mono shadow-sm"
        />
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase"
          >地點連結 (Google Maps)</label
        >
        <input
          v-model="formData.mapUrl"
          type="url"
          placeholder="https://maps.app.goo.gl/..."
          class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm font-mono shadow-sm"
        />
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase"
          >官網 / 訂餐連結 (可選)</label
        >
        <input
          v-model="formData.websiteUrl"
          type="url"
          placeholder="https://tabelog.com/..."
          class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm font-mono shadow-sm"
        />
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase">分類</label>
        <div class="relative">
          <select
            v-model="formData.category"
            class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm shadow-sm appearance-none"
          >
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
          <div
            class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-forest-300"
          >
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
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase">備註</label>
        <textarea
          v-model="formData.note"
          rows="3"
          placeholder="補充心得或注意事項..."
          class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm shadow-sm resize-none"
        ></textarea>
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase"
          >預覽圖片網址 (可選)</label
        >
        <input
          v-model="formData.imageUrl"
          type="url"
          placeholder="https://... (留空則不顯示)"
          class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm font-mono shadow-sm"
        />
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="pt-4 flex flex-col gap-3">
      <button
        @click="handleSave"
        class="w-full py-4 rounded-2xl bg-forest-400 text-white font-bold shadow-soft-lg hover:bg-forest-500 active:scale-95 transition-all"
      >
        {{ isEditMode ? "儲存變更" : "新增收集項目" }}
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
