import { defineStore } from "pinia";
import { ref } from "vue";

export type ToastType = "success" | "error" | "info" | "warning";

export const useUIStore = defineStore("ui", () => {
  // Toast State
  const isToastVisible = ref(false);
  const toastMessage = ref("");
  const toastType = ref<ToastType>("info");
  const toastTimeout = ref<number | null>(null);

  // Confirm Dialog State
  const isConfirmVisible = ref(false);
  const confirmTitle = ref("");
  const confirmMessage = ref("");
  const confirmOkText = ref("確定");
  const confirmCancelText = ref("取消");
  const confirmResolve = ref<((value: boolean) => void) | null>(null);

  const showToast = (
    message: string,
    type: ToastType = "info",
    duration = 3000,
  ) => {
    if (toastTimeout.value) {
      clearTimeout(toastTimeout.value);
    }
    toastMessage.value = message;
    toastType.value = type;
    isToastVisible.value = true;
    toastTimeout.value = window.setTimeout(() => {
      isToastVisible.value = false;
    }, duration);
  };

  const hideToast = () => {
    isToastVisible.value = false;
    if (toastTimeout.value) clearTimeout(toastTimeout.value);
  };

  const showConfirm = (options: {
    title: string;
    message: string;
    okText?: string;
    cancelText?: string;
  }): Promise<boolean> => {
    confirmTitle.value = options.title;
    confirmMessage.value = options.message;
    confirmOkText.value = options.okText || "確定";
    confirmCancelText.value = options.cancelText || "取消";
    isConfirmVisible.value = true;

    return new Promise((resolve) => {
      confirmResolve.value = resolve;
    });
  };

  const handleConfirm = (result: boolean) => {
    isConfirmVisible.value = false;
    if (confirmResolve.value) {
      confirmResolve.value(result);
      confirmResolve.value = null;
    }
  };

  return {
    isToastVisible,
    toastMessage,
    toastType,
    showToast,
    hideToast,
    isConfirmVisible,
    confirmTitle,
    confirmMessage,
    confirmOkText,
    confirmCancelText,
    showConfirm,
    handleConfirm,
  };
});
