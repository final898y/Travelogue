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

describe("Auth Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("初始狀態應該為載入中且用戶為空", () => {
    const store = useAuthStore();
    expect(store.user).toBeNull();
    expect(store.loading).toBe(true);
    expect(store.error).toBeNull();
  });

  it("loginWithGoogle - 登入成功且在白名單內", async () => {
    const store = useAuthStore();
    const mockUser = { email: "allowed@test.com", uid: "123" };

    // Mock 登入結果
    (signInWithPopup as vi.Mock).mockResolvedValueOnce({ user: mockUser });
    // Mock 白名單檢查結果 (Exists)
    (getDoc as vi.Mock).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({}),
    });

    await store.loginWithGoogle();

    expect(store.user).toEqual(mockUser as any);
    expect(store.error).toBeNull();
  });

  it("loginWithGoogle - 登入成功但不在白名單內，應強制登出並報錯", async () => {
    const store = useAuthStore();
    const mockUser = { email: "not-allowed@test.com", uid: "123" };

    (signInWithPopup as vi.Mock).mockResolvedValueOnce({ user: mockUser });
    // Mock 白名單檢查結果 (Not Exists)
    (getDoc as vi.Mock).mockResolvedValueOnce({ exists: () => false });

    await expect(store.loginWithGoogle()).rejects.toThrow("NOT_IN_WHITELIST");

    expect(signOut).toHaveBeenCalled();
    expect(store.user).toBeNull();
    expect(store.error).toContain("不在授權白名單內");
  });

  it("loginWithGoogle - 登入成功且具備 Admin 權限", async () => {
    const store = useAuthStore();
    const mockUser = { email: "admin@test.com", uid: "admin-123" };

    (signInWithPopup as vi.Mock).mockResolvedValueOnce({ user: mockUser });
    // Mock 白名單且 isAdmin 為 true
    (getDoc as vi.Mock).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ isAdmin: true }),
    });

    await store.loginWithGoogle();

    expect(store.user).toEqual(mockUser as any);
    expect(store.isAdmin).toBe(true);
  });

  it("loginWithGoogle - 登入成功但僅為普通用戶 (無 isAdmin 欄位)", async () => {
    const store = useAuthStore();
    const mockUser = { email: "user@test.com", uid: "user-123" };

    (signInWithPopup as vi.Mock).mockResolvedValueOnce({ user: mockUser });
    // Mock 白名單且 isAdmin 為 false (或不存在)
    (getDoc as vi.Mock).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ isAdmin: false }),
    });

    await store.loginWithGoogle();

    expect(store.user).toEqual(mockUser as any);
    expect(store.isAdmin).toBe(false);
  });

  it("logout - 應呼叫 signOut 並清空狀態 (包含 isAdmin)", async () => {
    const store = useAuthStore();
    store.user = { uid: "123" } as any;

    await store.logout();

    expect(signOut).toHaveBeenCalled();
    expect(store.user).toBeNull();
  });

  it("init - 應監聽狀態變化並驗證白名單", async () => {
    const store = useAuthStore();

    // 模擬 Firebase 回傳一個已登入但不在白名單的用戶
    const mockFirebaseUser = { email: "test@test.com" };
    (onAuthStateChanged as vi.Mock).mockImplementationOnce(
      (_auth: any, callback: any) => {
        callback(mockFirebaseUser);
      },
    );
    (getDoc as vi.Mock).mockResolvedValueOnce({
      exists: () => false,
      data: () => ({}),
    });

    store.init();

    // 等待非同步白名單檢查完成
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(signOut).toHaveBeenCalled();
    expect(store.loading).toBe(false);
  });
});
