import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useDeviceStore } from "./stores/device";
import { useSessionStore } from "./stores/session";

const routes: RouteRecordRaw[] = [
  {
    path: "/pair",
    name: "pair",
    component: () => import("./pages/PairPage.vue"),
    meta: { public: true },
  },
  {
    path: "/pin",
    name: "pin",
    component: () => import("./pages/PinPage.vue"),
    meta: { requiresPaired: true },
  },
  {
    path: "/",
    name: "home",
    component: () => import("./pages/HomePage.vue"),
    meta: { requiresSession: true },
  },
  {
    path: "/residents/:id",
    name: "resident",
    component: () => import("./pages/ResidentPage.vue"),
    meta: { requiresSession: true },
  },
  {
    path: "/residents/:id/vital",
    name: "vital",
    component: () => import("./pages/QuickVitalPage.vue"),
    meta: { requiresSession: true },
  },
  {
    path: "/residents/:id/care-log",
    name: "care-log",
    component: () => import("./pages/QuickCareLogPage.vue"),
    meta: { requiresSession: true },
  },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const device = useDeviceStore();
  const session = useSessionStore();

  if (to.meta.public) return true;
  if (!device.paired) return { path: "/pair" };
  if (to.meta.requiresSession && !session.token) return { path: "/pin" };
  return true;
});
