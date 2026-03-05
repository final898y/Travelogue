import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "../../src/stores/authStore";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { getDoc } from "firebase/firestore";

// Mock Firebase
vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  getAuth: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  getFirestore: vi.fn(),
}));

vi.mock("../../src/services/firebase", () => ({
  auth: { currentUser: null },
  db: {},
}));

describe("authStore.ts v2.0 (安全性與邊界測試)", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe("初始狀態與基礎屬性", () => {
    it("初始狀態應該為載入中且用戶為空", () => {
      const store = useAuthStore();
      expect(store.user).toBeNull();
      expect(store.loading).toBe(true);
      expect(store.error).toBeNull();
      expect(store.isAdmin).toBe(false);
    });
  });

  describe("登入邏輯 (loginWithGoogle)", () => {
    it("登入成功且在白名單內：應正確更新 user 狀態", async () => {
      const store = useAuthStore();
      const mockUser = { email: "allowed@test.com", uid: "123" };

      (signInWithPopup as vi.Mock).mockResolvedValueOnce({ user: mockUser });
      (getDoc as vi.Mock).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ isAdmin: false }),
      });

      await store.loginWithGoogle();

      expect(store.user).toEqual(mockUser as any);
      expect(store.isAdmin).toBe(false);
      expect(store.error).toBeNull();
    });

    it("登入成功但不在白名單內：應拋出錯誤、清除狀態並強制登出", async () => {
      const store = useAuthStore();
      const mockUser = { email: "stranger@test.com", uid: "999" };

      (signInWithPopup as vi.Mock).mockResolvedValueOnce({ user: mockUser });
      (getDoc as vi.Mock).mockResolvedValueOnce({ exists: () => false });

      await expect(store.loginWithGoogle()).rejects.toThrow("NOT_IN_WHITELIST");

      expect(signOut).toHaveBeenCalled();
      expect(store.user).toBeNull();
      expect(store.error).toContain("不在授權白名單內");
    });

    it("登入時發生網路錯誤或 Popup 被關閉：應正確補獲錯誤並停止 loading", async () => {
      const store = useAuthStore();
      (signInWithPopup as vi.Mock).mockRejectedValueOnce(
        new Error("Firebase: Error (auth/popup-closed-by-user)."),
      );

      await expect(store.loginWithGoogle()).rejects.toThrow();
      expect(store.loading).toBe(false);
      expect(store.user).toBeNull();
    });

    it("白名單檢查失敗 (API 錯誤)：應將錯誤寫入 error 狀態並登出", async () => {
      const store = useAuthStore();
      const mockUser = { email: "test@test.com", uid: "123" };

      (signInWithPopup as vi.Mock).mockResolvedValueOnce({ user: mockUser });
      (getDoc as vi.Mock).mockRejectedValueOnce(new Error("Firestore Error"));

      await expect(store.loginWithGoogle()).rejects.toThrow("Firestore Error");
      expect(signOut).toHaveBeenCalled();
      expect(store.user).toBeNull();
    });
  });

  describe("初始化監聽 (init)", () => {
    it("當 Firebase 用戶變更為 null 時：應正確停止 loading 並清空 user", async () => {
      const store = useAuthStore();
      (onAuthStateChanged as vi.Mock).mockImplementationOnce(
        (_auth, callback) => callback(null),
      );

      store.init();
      expect(store.user).toBeNull();
      expect(store.loading).toBe(false);
    });

    it("當 Firebase 用戶變更為有效用戶時：應非同步進行白名單校驗", async () => {
      const store = useAuthStore();
      const mockFirebaseUser = { email: "test@test.com", uid: "123" };

      (onAuthStateChanged as vi.Mock).mockImplementationOnce(
        (_auth, callback) => callback(mockFirebaseUser),
      );
      (getDoc as vi.Mock).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ isAdmin: true }),
      });

      store.init();

      // 等待非同步微任務
      await new Promise((r) => setTimeout(r, 0));

      expect(store.user).toEqual(mockFirebaseUser as any);
      expect(store.isAdmin).toBe(true);
      expect(store.loading).toBe(false);
    });
  });

  describe("登出邏輯 (logout)", () => {
    it("應清空所有狀態，包含 user 與 isAdmin", async () => {
      const store = useAuthStore();
      store.user = { uid: "123" } as any;
      (store as any).isAdmin = true;

      await store.logout();

      expect(signOut).toHaveBeenCalled();
      expect(store.user).toBeNull();
      expect(store.isAdmin).toBe(false);
    });
  });
});
