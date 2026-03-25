<script setup lang="ts">
/**
 * ActivityForm (Component)
 * Handles viewing and editing activity details.
 */
import { reactive, computed, watch, ref, onMounted } from "vue";
import {
  Landmark,
  Utensils,
  Car,
  Bed,
  MapPin,
  Plus,
  X,
  Globe,
  Map,
  Pencil,
  BookOpen,
  ExternalLink,
  Palette,
} from "../../assets/icons";
import { useUIStore } from "../../stores/uiStore";
import { useAuthStore } from "../../stores/authStore";
import type { Activity } from "../../types/trip";
import ImageUploader from "../ui/ImageUploader.vue";

const props = defineProps<{
  initialData: Partial<Activity>;
}>();

const emit = defineEmits(["save", "cancel", "delete", "update:dirty"]);

const uiStore = useUIStore();
const authStore = useAuthStore();

// 統一初始資料生成邏輯
const getInitialData = (data: Partial<Activity>) => ({
  id: data.id || crypto.randomUUID(),
  time: data.time || "09:00",
  title: data.title || "",
  subtitle: data.subtitle || "",
  location: data.location || "",
  category: data.category || "sight",
  address: data.address || "",
  mapUrl: data.mapUrl || "",
  coordinates: data.coordinates || { lat: 0, lng: 0 },
  note: data.note || "",
  images: data.images || [],
  options: data.options || [],
});

// 閱覽/編輯 模式切換 (如果有 ID 則預設為閱覽模式)
const isReadOnly = ref(!!props.initialData.id);
const isDirty = ref(false);

// 地點輸入類型
type LocationType = "name" | "address" | "coordinates" | "link";
const activeLocationType = ref<LocationType>("name");

// 初始化時判斷地點類型
onMounted(() => {
  if (formData.mapUrl) activeLocationType.value = "link";
  else if (formData.coordinates?.lat) activeLocationType.value = "coordinates";
  else if (formData.address) activeLocationType.value = "address";
  else activeLocationType.value = "name";
});

// 建立局部狀態副本以供編輯
const formData = reactive<Partial<Activity>>(getInitialData(props.initialData));

// 從座標生成 Google Maps 連結
const coordinatesLink = computed(() => {
  if (formData.coordinates?.lat && formData.coordinates?.lng) {
    return `https://www.google.com/maps/search/?api=1&query=${formData.coordinates.lat},${formData.coordinates.lng}`;
  }
  return "#";
});

const locationOptions = [
  { value: "name", label: "名稱", icon: MapPin },
  { value: "address", label: "地址", icon: Landmark },
  { value: "coordinates", label: "座標", icon: Map },
  { value: "link", label: "連結", icon: Globe },
];

// 監聽變動以通知父組件是否有未儲存的變更
watch(
  formData,
  (newVal) => {
    // 使用相同的初始基準進行比較
    isDirty.value =
      JSON.stringify(newVal) !== JSON.stringify(getInitialData(props.initialData));
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
    Object.assign(formData, getInitialData(props.initialData));
    isDirty.value = false;
    emit("update:dirty", false);
  }
  isReadOnly.value = !isReadOnly.value;
};

const isEditMode = computed(() => !!props.initialData.id);

const categories = [
  { value: "sight", label: "景點", color: "text-forest-400" },
  { value: "food", label: "美食", color: "text-earth-400" },
  { value: "transport", label: "交通", color: "text-blue-400" },
  { value: "hotel", label: "住宿", color: "text-purple-400" },
];

const handleSave = () => {
  if (!formData.title) return uiStore.showToast("請輸入活動標題", "warning");
  emit("save", { ...formData });
};

const addOption = () => {
  if (!formData.options) formData.options = [];
  formData.options.push({ title: "", subtitle: "" });
};

const removeOption = (idx: number) => {
  formData.options?.splice(idx, 1);
};
</script>

<template>
  <div class="space-y-6">
    <!-- Mode Toggle Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-bold text-forest-400 flex items-center gap-2">
        <component :is="isReadOnly ? BookOpen : Pencil" :size="18" />
        {{ isReadOnly ? "閱覽內容" : "編輯活動" }}
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

    <!-- Category Selector -->
    <div class="space-y-2">
      <label class="text-xs font-bold text-forest-300 uppercase tracking-wider"
        >活動類型</label
      >
      <div
        v-if="isReadOnly"
        class="flex items-center gap-3 p-3 bg-white rounded-xl shadow-soft-sm border border-forest-50 w-fit"
      >
        <div
          :class="
            categories.find((c) => c.value === formData.category)?.color ||
            'text-forest-400'
          "
        >
          <Landmark v-if="formData.category === 'sight'" :size="20" />
          <Utensils v-if="formData.category === 'food'" :size="20" />
          <Car v-if="formData.category === 'transport'" :size="20" />
          <Bed v-if="formData.category === 'hotel'" :size="20" />
        </div>
        <span class="text-sm font-bold text-forest-600">{{
          categories.find((c) => c.value === formData.category)?.label || "景點"
        }}</span>
      </div>
      <div v-else class="grid grid-cols-4 gap-2">
        <button
          v-for="cat in categories"
          :key="cat.value"
          @click="formData.category = cat.value as any"
          type="button"
          class="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all active:scale-95"
          :class="
            formData.category === cat.value
              ? 'border-forest-400 bg-forest-50 shadow-soft-sm'
              : 'border-transparent bg-white shadow-sm'
          "
        >
          <div :class="cat.color">
            <Landmark v-if="cat.value === 'sight'" :size="20" />
            <Utensils v-if="cat.value === 'food'" :size="20" />
            <Car v-if="cat.value === 'transport'" :size="20" />
            <Bed v-if="cat.value === 'hotel'" :size="20" />
          </div>
          <span class="text-[10px] font-bold text-forest-600">{{
            cat.label
          }}</span>
        </button>
      </div>
    </div>

    <!-- Basic Info -->
    <div class="space-y-4">
      <!-- Time & Title -->
      <div class="flex gap-4">
        <div class="w-24 space-y-2">
          <label class="text-xs font-bold text-forest-300 uppercase"
            >時間</label
          >
          <div v-if="isReadOnly" class="p-3 text-sm font-mono text-forest-800">
            {{ formData.time }}
          </div>
          <input
            v-else
            v-model="formData.time"
            type="time"
            class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm font-mono shadow-sm"
          />
        </div>
        <div class="flex-1 space-y-2">
          <label class="text-xs font-bold text-forest-300 uppercase"
            >標題</label
          >
          <div v-if="isReadOnly" class="p-1 text-lg font-bold text-forest-800">
            {{ formData.title }}
          </div>
          <input
            v-else
            v-model="formData.title"
            type="text"
            placeholder="例如：東京鐵塔"
            class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm font-bold shadow-sm"
          />
        </div>
      </div>

      <!-- Subtitle -->
      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase"
          >副標題</label
        >
        <div v-if="isReadOnly" class="p-1 text-sm text-forest-600">
          {{ formData.subtitle || "無" }}
        </div>
        <input
          v-else
          v-model="formData.subtitle"
          type="text"
          placeholder="例如：熱門地標、晚餐地點"
          class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm shadow-sm"
        />
      </div>

      <!-- Location Section -->
      <div v-if="!isReadOnly" class="space-y-3">
        <div class="flex justify-between items-center">
          <label class="text-xs font-bold text-forest-300 uppercase"
            >地點資訊</label
          >
          <div class="flex bg-forest-50 p-0.5 rounded-lg">
            <button
              v-for="opt in locationOptions"
              :key="opt.value"
              type="button"
              @click="activeLocationType = opt.value as LocationType"
              class="px-2 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1"
              :class="
                activeLocationType === opt.value
                  ? 'bg-white text-forest-500 shadow-sm'
                  : 'text-forest-200 hover:text-forest-300'
              "
            >
              <component :is="opt.icon" :size="10" />
              {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- Location Name Input -->
        <div v-if="activeLocationType === 'name'" class="relative">
          <input
            v-model="formData.location"
            type="text"
            placeholder="例如：東京鐵塔"
            class="w-full p-3 pl-10 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm shadow-sm"
          />
          <MapPin
            :size="16"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-forest-200"
          />
        </div>

        <!-- Address Input -->
        <div v-if="activeLocationType === 'address'" class="relative">
          <input
            v-model="formData.address"
            type="text"
            placeholder="請輸入完整地址"
            class="w-full p-3 pl-10 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm shadow-sm"
          />
          <Landmark
            :size="16"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-forest-200"
          />
        </div>

        <!-- Coordinates Input -->
        <div
          v-if="activeLocationType === 'coordinates'"
          class="grid grid-cols-2 gap-3"
        >
          <div class="relative">
            <input
              v-model.number="formData.coordinates!.lat"
              type="number"
              step="any"
              placeholder="緯度 (Lat)"
              class="w-full p-3 pl-10 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm shadow-sm"
            />
            <Map
              :size="16"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-forest-200"
            />
          </div>
          <div class="relative">
            <input
              v-model.number="formData.coordinates!.lng"
              type="number"
              step="any"
              placeholder="經度 (Lng)"
              class="w-full p-3 pl-10 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm shadow-sm"
            />
            <Map
              :size="16"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-forest-200"
            />
          </div>
        </div>

        <!-- Map URL Input -->
        <div v-if="activeLocationType === 'link'" class="relative">
          <input
            v-model="formData.mapUrl"
            type="url"
            placeholder="貼上 Google Maps 或其他地圖連結"
            class="w-full p-3 pl-10 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm shadow-sm"
          />
          <Globe
            :size="16"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-forest-200"
          />
        </div>
      </div>

      <!-- Location Section ReadOnly -->
      <div v-else class="space-y-4">
        <div class="space-y-2">
          <label class="text-xs font-bold text-forest-300 uppercase"
            >地點名稱</label
          >
          <div class="p-1 text-sm text-forest-600 flex items-center gap-2">
            <MapPin :size="14" /> {{ formData.location || "未提供" }}
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-xs font-bold text-forest-300 uppercase"
            >地址</label
          >
          <div class="p-1 text-sm text-forest-600 flex items-center gap-2">
            <Landmark :size="14" /> {{ formData.address || "未提供" }}
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-xs font-bold text-forest-300 uppercase"
            >地圖連結 / 座標</label
          >
          <div class="space-y-2">
            <a
              v-if="formData.mapUrl"
              :href="formData.mapUrl"
              target="_blank"
              class="flex items-center gap-2 p-3 rounded-xl bg-white border border-forest-50 shadow-soft-sm hover:shadow-soft transition-all text-sm text-sky-blue font-mono truncate group"
            >
              <Globe :size="16" class="text-forest-400" />
              <span class="truncate flex-1">{{ formData.mapUrl }}</span>
              <ExternalLink
                :size="14"
                class="text-forest-300 group-hover:text-sky-blue transition-colors"
              />
            </a>
            <a
              v-if="formData.coordinates?.lat"
              :href="coordinatesLink"
              target="_blank"
              class="flex items-center gap-2 p-3 rounded-xl bg-white border border-forest-50 shadow-soft-sm hover:shadow-soft transition-all text-sm text-forest-500 font-mono truncate group"
            >
              <Map :size="16" class="text-forest-400" />
              <span class="truncate flex-1"
                >{{ formData.coordinates.lat }},
                {{ formData.coordinates.lng }}</span
              >
              <ExternalLink
                :size="14"
                class="text-forest-300 group-hover:text-forest-500 transition-colors"
              />
            </a>
            <p
              v-if="!formData.mapUrl && !formData.coordinates?.lat"
              class="text-xs text-forest-200 italic p-1"
            >
              未提供地圖資訊
            </p>
          </div>
        </div>
      </div>

      <!-- Image Section -->
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

      <!-- Note -->
      <div class="space-y-2">
        <label class="text-xs font-bold text-forest-300 uppercase"
          >說明 / 備註</label
        >
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
          placeholder="補充行程細節、預約編號或注意事項..."
          class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm shadow-sm resize-none"
        ></textarea>
      </div>

      <!-- Options (Alternatives) -->
      <div class="space-y-3 pt-2">
        <div class="flex justify-between items-center">
          <label class="text-xs font-bold text-forest-300 uppercase"
            >備選方案 ({{ formData.options?.length || 0 }})</label
          >
          <button
            v-if="!isReadOnly"
            @click="addOption"
            type="button"
            class="text-[10px] font-bold text-forest-400 hover:text-forest-600 flex items-center gap-1 transition-colors"
          >
            <Plus :size="14" :stroke-width="2.5" />
            新增方案
          </button>
        </div>

        <div
          v-if="formData.options && formData.options.length > 0"
          class="space-y-3"
        >
          <div
            v-for="(opt, idx) in formData.options"
            :key="idx"
            class="p-4 rounded-2xl bg-forest-50/50 border border-forest-100 space-y-3 relative group"
          >
            <!-- Option Index Badge -->
            <span
              class="absolute -left-2 -top-2 w-6 h-6 rounded-lg bg-forest-100 text-forest-500 flex items-center justify-center font-bold text-[10px] shadow-sm"
            >
              {{ String.fromCharCode(65 + idx) }}
            </span>

            <!-- Delete Button -->
            <button
              v-if="!isReadOnly"
              @click="removeOption(idx)"
              class="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-white border border-red-50 text-red-300 flex items-center justify-center hover:text-red-500 hover:border-red-100 shadow-sm transition-all"
            >
              <X :size="12" :stroke-width="3" />
            </button>

            <div class="space-y-2">
              <div v-if="isReadOnly" class="text-xs font-bold text-forest-700">
                {{ opt.title }}
              </div>
              <input
                v-else
                v-model="opt.title"
                type="text"
                placeholder="方案標題 (例如：另一個景點)"
                class="w-full p-2 bg-transparent border-b border-forest-100 focus:border-forest-300 outline-none text-xs font-bold"
              />
              <div v-if="isReadOnly" class="text-[10px] text-forest-500">
                {{ opt.subtitle }}
              </div>
              <input
                v-else
                v-model="opt.subtitle"
                type="text"
                placeholder="方案副標題 (例如：門票更便宜)"
                class="w-full p-2 bg-transparent border-b border-forest-50 focus:border-forest-200 outline-none text-[10px]"
              />
            </div>
          </div>
        </div>
        <p
          v-else
          class="text-center py-4 border-2 border-dashed border-forest-50 rounded-2xl text-[10px] text-forest-200 italic"
        >
          {{
            isReadOnly ? "沒有備選方案" : "目前沒有備選方案，點擊上方按鈕新增"
          }}
        </p>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="pt-4 flex flex-col gap-3">
      <button
        v-if="!isReadOnly"
        @click="handleSave"
        class="w-full py-4 rounded-2xl bg-forest-400 text-white font-bold shadow-soft-lg hover:bg-forest-500 active:scale-95 transition-all"
      >
        {{ isEditMode ? "儲存變更" : "新增行程活動" }}
      </button>

      <button
        v-if="isEditMode"
        @click="emit('delete')"
        class="w-full py-4 rounded-2xl bg-white border border-red-50 text-red-400 text-sm font-bold hover:bg-red-50 transition-all"
      >
        刪除此行程
      </button>
    </div>
  </div>
</template>
