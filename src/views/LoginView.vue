<script setup lang="ts">
import { useAuthStore } from "../stores/authStore";
import { useRouter } from "vue-router";
import BaseCard from "../components/ui/BaseCard.vue";

const authStore = useAuthStore();
const router = useRouter();

const handleGoogleLogin = async () => {
  try {
    await authStore.loginWithGoogle();
    router.push("/");
  } catch (error) {
    console.error("Login Error:", error);
  }
};
</script>

<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center p-4 bg-cream-light"
  >
    <div class="mb-8 text-center">
      <h1 class="text-4xl font-bold text-forest-700 mb-2 font-rounded">
        Travelogue
      </h1>
      <p class="text-forest-600">記錄每一趟說走就走的旅程</p>
    </div>

    <BaseCard class="w-full max-w-md p-8">
      <h2 class="text-xl font-bold text-gray-800 mb-6 text-center">歡迎回來</h2>

      <!-- Error Message -->
      <div
        v-if="authStore.error"
        class="mb-6 p-4 bg-coral-red/10 border border-coral-red/20 rounded-xl text-coral-red text-sm text-center font-medium animate-shake"
      >
        {{ authStore.error }}
      </div>

      <button
        @click="handleGoogleLogin"
        class="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          width="20"
          height="20"
          alt="Google icon"
        />
        <span class="font-medium text-gray-700">使用 Google 帳號登入</span>
      </button>

      <div class="mt-8 text-center text-sm text-gray-500">
        登入即代表您同意服務條款與隱私政策
      </div>
    </BaseCard>
  </div>
</template>
