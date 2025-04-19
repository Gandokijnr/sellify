import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/HomeView.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/auth/LoginView.vue"),
    meta: { guest: true },
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/auth/RegisterView.vue"),
    meta: { guest: true },
  },
  {
    path: "/seller/dashboard",
    name: "seller-dashboard",
    component: () => import("@/views/dashboard/SellerDashboard.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/seller/listings/create",
    name: "create-listing",
    component: () => import("@/views/listings/CreateListing.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/buyer/dashboard",
    name: "buyer-dashboard",
    component: () => import("@/views/dashboard/BuyerDashboard.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = !!authStore.token;

  // Redirect authenticated users away from guest-only pages
  if (to.meta.guestOnly && isAuthenticated) {
    next("/seller/dashboard");
    return;
  }

  // Redirect unauthenticated users away from protected pages
  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
    return;
  }

  // Allow navigation in all other cases
  next();
});

export default router;
