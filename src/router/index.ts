import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { useAuthStore } from "../stores/authStore";
import { watch } from "vue";

const router = createRouter({
  // ... (保持原有的 routes 配置)
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: "/schedule/:id",
      name: "schedule",
      component: () => import("../views/ScheduleView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/trip/:id/bookings",
      name: "bookings",
      component: () => import("../views/BookingsView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/trip/:id/expense",
      name: "expense",
      component: () => import("../views/ExpenseView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/trip/:id/collection",
      name: "collection",
      component: () => import("../views/CollectionView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/trip/:id/planning",
      name: "planning",
      component: () => import("../views/PlanningView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/settings/:id?",
      name: "settings",
      component: () => import("../views/SettingsView.vue"),
      meta: { requiresAuth: true },
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Wait for auth to initialize
  if (authStore.loading) {
    await new Promise<void>((resolve) => {
      const unwatch = watch(
        () => authStore.loading,
        (isLoading) => {
          if (!isLoading) {
            unwatch();
            resolve();
          }
        },
      );
    });
  }

  // If page requires auth and user is not logged in, redirect to login
  if (to.meta.requiresAuth && !authStore.user) {
    next({ name: "login" });
  } else if (to.name === "login" && authStore.user) {
    // If user is already logged in and tries to go to login page, redirect to home
    next({ name: "home" });
  } else {
    next();
  }
});

export default router;
