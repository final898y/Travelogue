<script setup lang="ts">
/**
 * CollectionForm (Component)
 * Handles creating and editing travel research items.
 */
import { reactive, computed, watch, ref } from "vue";
import {
  Globe,
  AtSign,
  Instagram,
  Youtube,
  MoreHorizontal,
  X,
  Plus,
  Pencil,
  BookOpen,
  ExternalLink,
  ChevronDown,
  Palette,
} from "../../assets/icons";
import { useUIStore } from "../../stores/uiStore";
import { useAuthStore } from "../../stores/authStore";
import type { Collection, CollectionSource } from "../../types/trip";
import ImageUploader from "../ui/ImageUploader.vue";

const props = defineProps<{
  initialData: Partial<Collection>;
}>();

const emit = defineEmits(["save", "cancel", "delete", "update:dirty"]);

const uiStore = useUIStore();
const authStore = useAuthStore();
const isEditMode = computed(() => !!props.initialData.id);

// 閱覽/編輯 模式切換 (如果有 ID 則預設為閱覽模式)
const isReadOnly = ref(!!props.initialData.id);
const isDirty = ref(false);

const tagInput = ref("");

// 建立局部狀態副本
const formData = reactive<Partial<Collection>>({
  id: props.initialData.id || crypto.randomUUID(), // 確保有 ID 用於圖片儲存路徑
  title: "",
  url: "",
  mapUrl: "",
  websiteUrl: "",
  source: "web",
  category: "未分類",
  note: "",
  images: [],
  tags: [],
  ...props.initialData,
});

// 監聽變動以通知父組件是否有未儲存的變更
watch(
  formData,
  (newVal) => {
    isDirty.value =
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
        tags: [],
        ...props.initialData,
      });
    emit("update:dirty", isDirty.value);
  },
  { deep: true },
);

const toggleEditMode = async () => {
  if (!isReadOnly.value && isDirty.value) {
    const confirmed = await uiStore.showConfirm({
      title: "結束編輯？",
      message: "您有未儲存的變更，確定要直接結束編輯嗎？變更內容將不會被儲存。",
      okText: "確定結束",
      cancelText: "繼續編輯",
    });
    if (!confirmed) return;

    // 重置資料
    Object.assign(formData, JSON.parse(JSON.stringify({
      title: "",
      url: "",
      mapUrl: "",
      websiteUrl: "",
      source: "web",
      category: "未分類",
      note: "",
      imageUrl: "",
      tags: [],
      ...props.initialData,
    })));
  }
  isReadOnly.value = !isReadOnly.value;
};

// 新增標籤
const addTag = () => {
  const tag = tagInput.value.trim();
  if (tag && !formData.tags?.includes(tag)) {
    if (!formData.tags) formData.tags = [];
    formData.tags.push(tag);
  }
  tagInput.value = "";
};

// 移除標籤
const removeTag = (index: number) => {
  formData.tags?.splice(index, 1);
};

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

  // 若標籤輸入框還有文字，先自動加入
  if (tagInput.value.trim()) {
    addTag();
  }

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
    id: formData.id,
    title: formData.title,
    url: formData.url,
    mapUrl: formData.mapUrl,
    websiteUrl: formData.websiteUrl,
    source: formData.source,
    category: formData.category,
    note: formData.note,
    images: formData.images || [],
    tags: formData.tags || [],
  };

  emit("save", cleanData);
};
</script>

<template>
  <div class="space-y-6">
    <!-- Mode Toggle Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-bold text-forest-400 flex items-center gap-2">
        <component :is="isReadOnly ? BookOpen : Pencil" :size="18" />
        {{ isReadOnly ? "閱覽內容" : "編輯項目" }}
      </h3>
      <button
        @click="toggleEditMode"
        v-if="isEditMode"
        class="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all active:scale-95"
        :class="
          isReadOnly
            ? 'border-forest-100 bg-white text-forest-400 hover:border-forest-200'
            : 'border-forest-400 bg-forest-50 text-forest-600 shadow-soft-sm'
        "
      >
        <span class="text-xs font-bold">{{
          isReadOnly ? "切換編輯" : "結束編輯"
        }}</span>
      </button>
    </div>

    <!-- Source Selector (Read Only or Edit) -->
    <div class="space-y-2">
      <label class="text-xs font-bold text-forest-300 uppercase tracking-wider"
        >來源類型</label
      >
      <div
        v-if="isReadOnly"
        class="flex items-center gap-3 p-3 bg-white rounded-xl shadow-soft-sm border border-forest-50 w-fit"
      >
        <div class="text-forest-400">
          <Globe v-if="formData.source === 'web'" :size="20" />
          <AtSign v-if="formData.source === 'threads'" :size="20" />
          <Instagram v-if="formData.source === 'instagram'" :size="20" />
          <Youtube v-if="formData.source === 'youtube'" :size="20" />
          <MoreHorizontal v-if="formData.source === 'other'" :size="20" />
        </div>
        <span class="text-sm font-bold text-forest-600">{{
          sources.find((s) => s.value === formData.source)?.label || "其他"
        }}</span>
      </div>
      <div v-else class="grid grid-cols-5 gap-2">
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
        <div v-if="isReadOnly" class="text-lg font-bold text-forest-800 p-1">
          {{ formData.title }}
        </div>
        <input
          v-else
          v-model="formData.title"
          type="text"
          placeholder="例如：東京必吃拉麵清單"
          class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm font-bold shadow-sm"
        />
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase">標籤</label>
        <div class="flex flex-wrap gap-2 mb-2">
          <span
            v-for="(tag, index) in formData.tags"
            :key="index"
            class="tag-chip flex items-center gap-1 px-3 py-1 bg-forest-50 text-forest-500 rounded-full text-xs font-bold"
          >
            #{{ tag }}
            <button
              v-if="!isReadOnly"
              @click="removeTag(index)"
              class="hover:text-red-400"
            >
              <X :size="12" />
            </button>
          </span>
          <p
            v-if="isReadOnly && (!formData.tags || formData.tags.length === 0)"
            class="text-xs text-forest-200 italic"
          >
            無標籤
          </p>
        </div>
        <div v-if="!isReadOnly" class="relative">
          <input
            v-model="tagInput"
            type="text"
            placeholder="新增標籤 (輸入後按 Enter)"
            class="w-full p-3 pr-12 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm shadow-sm"
            @keydown.enter.prevent="addTag"
          />
          <button
            @click="addTag"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-forest-300 hover:text-forest-500"
          >
            <Plus :size="20" />
          </button>
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase"
          >網址 (來源 URL)</label
        >
        <div v-if="isReadOnly" class="group relative overflow-hidden">
          <a
            v-if="formData.url"
            :href="formData.url"
            target="_blank"
            class="flex items-center justify-between p-3 rounded-xl bg-white border border-forest-50 shadow-soft-sm hover:shadow-soft transition-all text-sm text-sky-blue font-mono truncate pr-10"
          >
            {{ formData.url }}
            <ExternalLink
              :size="14"
              class="absolute right-3 text-forest-300 group-hover:text-sky-blue transition-colors"
            />
          </a>
          <p v-else class="text-xs text-forest-200 italic p-1">無來源網址</p>
        </div>
        <input
          v-else
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
        <div v-if="isReadOnly" class="group relative overflow-hidden">
          <a
            v-if="formData.mapUrl"
            :href="formData.mapUrl"
            target="_blank"
            class="flex items-center justify-between p-3 rounded-xl bg-white border border-forest-50 shadow-soft-sm hover:shadow-soft transition-all text-sm text-forest-500 font-mono truncate pr-10"
          >
            {{ formData.mapUrl }}
            <ExternalLink
              :size="14"
              class="absolute right-3 text-forest-300 group-hover:text-forest-500 transition-colors"
            />
          </a>
          <p v-else class="text-xs text-forest-200 italic p-1">
            未設定地點網址
          </p>
        </div>
        <input
          v-else
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
        <div v-if="isReadOnly" class="group relative overflow-hidden">
          <a
            v-if="formData.websiteUrl"
            :href="formData.websiteUrl"
            target="_blank"
            class="flex items-center justify-between p-3 rounded-xl bg-white border border-forest-50 shadow-soft-sm hover:shadow-soft transition-all text-sm text-honey-orange font-mono truncate pr-10"
          >
            {{ formData.websiteUrl }}
            <ExternalLink
              :size="14"
              class="absolute right-3 text-forest-300 group-hover:text-honey-orange transition-colors"
            />
          </a>
          <p v-else class="text-xs text-forest-200 italic p-1">
            未設定官網網址
          </p>
        </div>
        <input
          v-else
          v-model="formData.websiteUrl"
          type="url"
          placeholder="https://tabelog.com/..."
          class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm font-mono shadow-sm"
        />
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase">分類</label>
        <div v-if="isReadOnly" class="p-1 text-sm font-bold text-forest-600">
          <span class="badge-forest">{{ formData.category }}</span>
        </div>
        <div v-else class="relative">
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
            <ChevronDown :size="16" />
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase">備註</label>
        <div
          v-if="isReadOnly"
          class="p-3 rounded-xl bg-cream-light border border-forest-50 text-sm text-forest-700 whitespace-pre-wrap min-h-[4rem]"
        >
          {{ formData.note || "無備註內容" }}
        </div>
        <textarea
          v-else
          v-model="formData.note"
          rows="3"
          placeholder="補充心得或注意事項..."
          class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm shadow-sm resize-none"
        ></textarea>
      </div>

      <div class="space-y-3">
        <label
          class="text-xs font-bold text-forest-300 uppercase tracking-wider flex items-center gap-2"
        >
          <Palette :size="14" />
          照片記錄
        </label>
        <ImageUploader
          v-model:images="formData.images"
          :user-id="authStore.user?.uid || ''"
          :document-id="formData.id || 'temp'"
          :is-read-only="isReadOnly"
        />
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="pt-4 flex flex-col gap-3">
      <button
        v-if="!isReadOnly"
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
