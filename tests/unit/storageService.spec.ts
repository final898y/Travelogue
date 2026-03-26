import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadImage, deleteImage } from "../../src/services/storageService";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import imageCompression from "browser-image-compression";

// Mock Firebase Storage
vi.mock("firebase/storage", () => ({
  getStorage: vi.fn(() => ({})),
  ref: vi.fn(() => ({})),
  uploadBytesResumable: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
}));

// Mock browser-image-compression
vi.mock("browser-image-compression", () => ({
  default: vi.fn(),
}));

describe("storageService.ts", () => {
  const mockFile = new File(["test content"], "test.jpg", {
    type: "image/jpeg",
  });
  const mockPath = "images/user1/doc1/test.jpg";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("uploadImage", () => {
    it("應該在壓縮後成功上傳圖片並取得 URL", async () => {
      const compressedFile = new File(["compressed"], "test.jpg");
      (imageCompression as any).mockResolvedValue(compressedFile);

      const mockSnapshot = { ref: {} };
      const mockUploadTask = {
        on: vi.fn((event, progressCb, errorCb, successCb) => {
          // 模擬進度
          progressCb({ bytesTransferred: 50, totalBytes: 100 });
          // 模擬完成
          successCb();
        }),
        snapshot: mockSnapshot,
      };

      (uploadBytesResumable as any).mockReturnValue(mockUploadTask);
      (getDownloadURL as any).mockResolvedValue("http://example.com/test.jpg");

      const onProgress = vi.fn();
      const result = await uploadImage(mockFile, mockPath, onProgress);

      expect(imageCompression).toHaveBeenCalled();
      expect(uploadBytesResumable).toHaveBeenCalledWith(
        expect.anything(),
        compressedFile,
      );
      expect(onProgress).toHaveBeenCalledWith(50);
      expect(result).toEqual({
        url: "http://example.com/test.jpg",
        path: mockPath,
      });
    });

    it("當壓縮失敗時，應該使用原始檔案繼續上傳", async () => {
      (imageCompression as any).mockRejectedValue(
        new Error("Compression Failed"),
      );

      const mockUploadTask = {
        on: vi.fn((event, p, e, successCb) => successCb()),
        snapshot: { ref: {} },
      };
      (uploadBytesResumable as any).mockReturnValue(mockUploadTask);
      (getDownloadURL as any).mockResolvedValue("url");

      await uploadImage(mockFile, mockPath);

      // 檢查是否用原始 mockFile 上傳
      expect(uploadBytesResumable).toHaveBeenCalledWith(
        expect.anything(),
        mockFile,
      );
    });

    it("當上傳發生錯誤時應拋出異常", async () => {
      (imageCompression as any).mockResolvedValue(mockFile);
      const mockError = new Error("Upload Error");

      const mockUploadTask = {
        on: vi.fn((event, p, errorCb) => errorCb(mockError)),
      };
      (uploadBytesResumable as any).mockReturnValue(mockUploadTask);

      await expect(uploadImage(mockFile, mockPath)).rejects.toThrow(
        "Upload Error",
      );
    });
  });

  describe("deleteImage", () => {
    it("應該調用 deleteObject 刪除指定路徑檔案", async () => {
      (deleteObject as any).mockResolvedValue(undefined);

      await deleteImage(mockPath);

      expect(ref).toHaveBeenCalledWith(expect.anything(), mockPath);
      expect(deleteObject).toHaveBeenCalled();
    });

    it("刪除失敗時應捕捉錯誤但不中斷流程 (console.warn)", async () => {
      (deleteObject as any).mockRejectedValue(new Error("Not Found"));
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await deleteImage(mockPath);

      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });
});
