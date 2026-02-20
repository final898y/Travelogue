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
      return false;
    }
  };

  // Initialize and listen to auth changes
  const init = () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
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
      loading.value = false;
    });
  };

  const loginWithGoogle = async () => {
    error.value = null;
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
      if ((err as Error).message !== "NOT_IN_WHITELIST") {
        console.error("Login failed:", err);
        error.value = "登入失敗，請稍後再試。";
      }
      throw err;
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
