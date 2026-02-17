import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/schedule/:id",
      name: "schedule",
      component: () => import("../views/ScheduleView.vue"),
    },
    {
      path: "/trip/:id/bookings",
      name: "bookings",
      component: () => import("../views/BookingsView.vue"),
    },
    {
      path: "/trip/:id/expense",
      name: "expense",
      component: () => import("../views/ExpenseView.vue"),
    },
    {
      path: "/trip/:id/collection",
      name: "collection",
      component: () => import("../views/JournalView.vue"),
    },
    {
      path: "/trip/:id/planning",
      name: "planning",
      component: () => import("../views/PlanningView.vue"),
    },
    {
      path: "/trip/:id/settings",
      name: "settings",
      component: () => import("../views/SettingsView.vue"),
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
