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
      path: "/schedule",
      name: "schedule",
      component: () => import("../views/ScheduleView.vue"),
    },
    {
      path: "/bookings",
      name: "bookings",
      component: () => import("../views/BookingsView.vue"),
    },
    {
      path: "/expense",
      name: "expense",
      component: () => import("../views/ExpenseView.vue"),
    },
    {
      path: "/journal",
      name: "journal",
      component: () => import("../views/JournalView.vue"),
    },
    {
      path: "/planning",
      name: "planning",
      component: () => import("../views/PlanningView.vue"),
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("../views/SettingsView.vue"),
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
