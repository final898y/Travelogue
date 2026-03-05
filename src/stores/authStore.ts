import { defineStore } from "pinia";
import { ref } from "vue";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const isAdmin = ref(false);
  const loading = ref(true);
  const error = ref<string | null>(null);

  // Check if email is in whitelist and get permissions
  const checkWhitelist = async (email: string) => {
    try {
      const docRef = doc(db, "whitelist", email.toLowerCase());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        isAdmin.value = !!data.isAdmin;
        return true;
      }
      isAdmin.value = false;
      return false;
    } catch (err) {
      console.error("Whitelist check failed:", err);
      isAdmin.value = false;
      error.value = (err as Error).message;
      throw err; // 拋出原始錯誤以利外部捕捉
    }
  };

  // Initialize and listen to auth changes
  const init = () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser && firebaseUser.email) {
          const isAllowed = await checkWhitelist(firebaseUser.email);
          if (isAllowed) {
            user.value = firebaseUser;
          } else {
            await signOut(auth);
            user.value = null;
            isAdmin.value = false;
            error.value = "您的帳號不在授權白名單內，請聯繫管理員。";
          }
        } else {
          user.value = null;
          isAdmin.value = false;
        }
      } catch (_err) {
        // 若白名單檢查拋出錯誤 (如 Firestore 網路錯誤)
        await signOut(auth);
        user.value = null;
        isAdmin.value = false;
      } finally {
        loading.value = false;
      }
    });
  };

  const loginWithGoogle = async () => {
    error.value = null;
    loading.value = true; // 確保點擊登入時開啟 loading
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user.email) {
        const isAllowed = await checkWhitelist(result.user.email);
        if (!isAllowed) {
          await signOut(auth);
          user.value = null;
          isAdmin.value = false;
          error.value = "您的帳號不在授權白名單內，請聯繫管理員。";
          throw new Error("NOT_IN_WHITELIST");
        }
      }
      user.value = result.user;
    } catch (err) {
      // 不論什麼錯誤（彈窗關閉、API 失敗、不在白名單），只要有登入跡象就登出以策安全
      await signOut(auth);
      user.value = null;
      isAdmin.value = false;

      if ((err as Error).message !== "NOT_IN_WHITELIST") {
        console.error("Login failed:", err);
        error.value = "登入失敗，請稍後再試。";
      }
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      user.value = null;
      isAdmin.value = false;
      error.value = null;
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return {
    user,
    isAdmin,
    loading,
    error,
    init,
    loginWithGoogle,
    logout,
  };
});
