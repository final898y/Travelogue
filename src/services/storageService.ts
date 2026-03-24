import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./firebase";
import imageCompression from "browser-image-compression";

export interface UploadResult {
  url: string; // 圖片的公開存取 URL
  path: string; // 圖片在 Storage 中的儲存路徑 (用於刪除)
}

/**
 * 壓縮圖片 (使用 Web Worker)
 */
async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1, // 目標大小 1MB
    maxWidthOrHeight: 1920, // 最大尺寸 1920px
    useWebWorker: true, // 啟用 Web Worker
    initialQuality: 0.85,
    maxIteration: 10,
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error("圖片壓縮失敗:", error);
    return file; // 壓縮失敗時回傳原始檔案
  }
}

/**
 * 上傳單張圖片
 * @param file - 原始 File 物件
 * @param path - 儲存路徑 (例如 images/{userId}/{documentId}/{fileName})
 * @param onProgress - 上傳進度回調 (0-100)
 */
export async function uploadImage(
  file: File,
  path: string,
  onProgress?: (progress: number) => void,
): Promise<UploadResult> {
  // 1. 壓縮圖片
  const compressedFile = await compressImage(file);

  // 2. 建立 Storage 引用
  const storageRef = ref(storage, path);

  // 3. 執行上傳
  const uploadTask = uploadBytesResumable(storageRef, compressedFile);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(Math.round(progress));
        }
      },
      (error) => {
        console.error("圖片上傳失敗:", error);
        reject(error);
      },
      async () => {
        // 上傳完成，取得下載 URL
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            url: downloadURL,
            path: path,
          });
        } catch (error) {
          console.error("取得圖片 URL 失敗:", error);
          reject(error);
        }
      },
    );
  });
}

/**
 * 根據儲存路徑刪除單張圖片
 * @param path - 圖片在 Storage 中的儲存路徑
 */
export async function deleteImage(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  try {
    await deleteObject(storageRef);
  } catch (error) {
    // 如果圖片已經不存在，忽略錯誤
    console.warn(`刪除圖片失敗 (路徑: ${path}):`, error);
  }
}
