<script setup lang="ts">
/**
 * ImageUploader Component
 * Handles multiple image upload, compression, and preview.
 */
import { ref } from "vue";
import { Upload, X, DownloadCloud, RefreshCcw } from "../../assets/icons";
import { uploadImage } from "../../services/storageService";
import { useUIStore } from "../../stores/uiStore";
import type { Image } from "../../types/trip";

interface Props {
  images?: Image[];
  maxImages?: number;
  userId: string;
  documentId: string;
  isReadOnly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  images: () => [],
  maxImages: 10,
  isReadOnly: false,
});

const emit = defineEmits(["update:images"]);

const uiStore = useUIStore();
const fileInput = ref<HTMLInputElement | null>(null);

// 上傳中的狀態追蹤
interface UploadingState {
  id: string; // 臨時 ID
  file: File;
  progress: number;
  previewUrl: string;
  error?: string;
}
const uploadingFiles = ref<UploadingState[]>([]);

// 封裝核心檔案處理邏輯
const processFiles = (files: File[]) => {
  // 檢查總數量限制
  const totalCount =
    props.images.length + uploadingFiles.value.length + files.length;
  if (totalCount > props.maxImages) {
    uiStore.showToast(`最多只能上傳 ${props.maxImages} 張圖片`, "warning");
    const allowedCount =
      props.maxImages - (props.images.length + uploadingFiles.value.length);
    if (allowedCount <= 0) return;
    files.splice(allowedCount);
  }

  // 開始上傳各別檔案
  files.forEach(async (file) => {
    // 檢查檔案大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      uiStore.showToast(`${file.name} 超過 10MB，無法上傳`, "error");
      return;
    }

    const tempId = Math.random().toString(36).substring(7);
    const previewUrl = URL.createObjectURL(file);

    const uploadState: UploadingState = {
      id: tempId,
      file,
      progress: 0,
      previewUrl,
    };
    uploadingFiles.value.push(uploadState);

    try {
      // 圖片路徑設計: images/{userId}/{documentId}/{timestamp}_{filename}
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const storagePath = `images/${props.userId}/${props.documentId}/${timestamp}_${sanitizedFileName}`;

      const result = await uploadImage(file, storagePath, (progress) => {
        const item = uploadingFiles.value.find((f) => f.id === tempId);
        if (item) item.progress = progress;
      });

      // 上傳成功，更新外部 images 陣列
      const newImages = [...props.images, result];
      emit("update:images", newImages);

      // 從上傳佇列移除
      uploadingFiles.value = uploadingFiles.value.filter(
        (f) => f.id !== tempId,
      );
      URL.revokeObjectURL(previewUrl);
    } catch (error) {
      console.error("上傳失敗:", error);
      const item = uploadingFiles.value.find((f) => f.id === tempId);
      if (item) item.error = "上傳失敗";
      uiStore.showToast(`${file.name} 上傳失敗`, "error");
    }
  });
};

// 處理檔案選取
const onInputChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);
  if (files.length > 0) {
    processFiles(files);
  }
  // 清空 input
  if (fileInput.value) fileInput.value.value = "";
};

// 移除圖片 (僅從 UI 移除，實體刪除在表單儲存時執行)
const removeImage = (index: number) => {
  const newImages = [...props.images];
  newImages.splice(index, 1);
  emit("update:images", newImages);
};

// 重新上傳失敗的檔案
const retryUpload = (id: string) => {
  const item = uploadingFiles.value.find((f) => f.id === id);
  if (!item) return;

  // 移除舊的狀態，手動觸發一次選取邏輯
  const file = item.file;
  uploadingFiles.value = uploadingFiles.value.filter((f) => f.id !== id);
  URL.revokeObjectURL(item.previewUrl);

  // 重新處理該檔案
  processFiles([file]);
};

// 拖曳上傳支援
const isDragging = ref(false);
const handleDrop = (e: DragEvent) => {
  isDragging.value = false;
  const files = Array.from(e.dataTransfer?.files || []);
  if (files.length > 0) {
    processFiles(files);
  }
};
</script>

<template>
  <div class="space-y-4">
    <!-- Grid Preview -->
    <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
      <!-- Existing Images -->
      <div
        v-for="(img, idx) in images"
        :key="img.path"
        class="relative aspect-square rounded-xl overflow-hidden shadow-soft-sm group border border-forest-50"
      >
        <img
          :src="img.url"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          alt="Preview"
        />
        <button
          v-if="!isReadOnly"
          @click="removeImage(idx)"
          class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm text-forest-400 flex items-center justify-center hover:text-red-500 hover:bg-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
        >
          <X :size="14" :stroke-width="3" />
        </button>
      </div>

      <!-- Uploading Status -->
      <div
        v-for="f in uploadingFiles"
        :key="f.id"
        class="relative aspect-square rounded-xl overflow-hidden border border-forest-100 bg-forest-50/30"
      >
        <img
          :src="f.previewUrl"
          class="w-full h-full object-cover opacity-50 blur-[1px]"
        />

        <!-- Progress / Error Overlay -->
        <div
          class="absolute inset-0 flex flex-col items-center justify-center p-2"
        >
          <template v-if="!f.error">
            <div
              class="w-10 h-10 rounded-full border-2 border-forest-100 border-t-forest-400 animate-spin mb-1"
            ></div>
            <span class="text-[10px] font-bold text-forest-600"
              >{{ f.progress }}%</span
            >
          </template>
          <template v-else>
            <button
              @click="retryUpload(f.id)"
              class="w-8 h-8 rounded-full bg-red-50 text-red-400 flex items-center justify-center mb-1 hover:bg-red-100 transition-colors"
            >
              <RefreshCcw :size="16" />
            </button>
            <span class="text-[10px] font-bold text-red-400">失敗</span>
          </template>
        </div>
      </div>

      <!-- Upload Button (Placeholder) -->
      <button
        v-if="!isReadOnly && images.length + uploadingFiles.length < maxImages"
        @click="fileInput?.click()"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        type="button"
        class="relative aspect-square rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-1 group"
        :class="
          isDragging
            ? 'border-forest-400 bg-forest-50'
            : 'border-forest-100 bg-white hover:border-forest-200 hover:bg-forest-50/30'
        "
      >
        <div
          class="w-8 h-8 rounded-full bg-forest-50 flex items-center justify-center text-forest-300 group-hover:text-forest-400 group-hover:scale-110 transition-all"
        >
          <Upload :size="18" />
        </div>
        <span
          class="text-[10px] font-bold text-forest-300 group-hover:text-forest-400"
          >上傳圖片</span
        >
        <span class="text-[8px] text-forest-200 mt-1"
          >{{ images.length }}/{{ maxImages }}</span
        >
      </button>
    </div>

    <!-- Hidden Input -->
    <input
      ref="fileInput"
      type="file"
      multiple
      accept="image/*"
      class="hidden"
      @change="onInputChange"
    />

    <!-- Empty State (Read Only) -->
    <div
      v-if="isReadOnly && images.length === 0"
      class="py-8 rounded-2xl border-2 border-dashed border-forest-50 flex flex-col items-center justify-center gap-2"
    >
      <div
        class="w-12 h-12 rounded-full bg-forest-50 flex items-center justify-center text-forest-100"
      >
        <DownloadCloud :size="24" />
      </div>
      <p class="text-xs text-forest-200 italic">目前沒有相關圖片</p>
    </div>
  </div>
</template>
