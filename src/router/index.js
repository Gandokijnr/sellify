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
    meta: { requiresAuth: true, role: "seller" },
  },
  {
    path: "/seller/listings/create",
    name: "create-listing",
    component: () => import("@/views/listings/CreateListing.vue"),
    meta: { requiresAuth: true, role: "seller" },
  },
  {
    path: "/buyer/dashboard",
    name: "buyer-dashboard",
    component: () => import("@/views/dashboard/BuyerDashboard.vue"),
    meta: { requiresAuth: true, role: "buyer" },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// router.beforeEach((to, from, next) => {
//   const authStore = useAuthStore();

//   if (to.meta.requiresAuth && !authStore.token) {
//     next("/login");
//   } else if (to.meta.guest && authStore.token) {
//     next(
//       authStore.user.role === "seller"
//         ? "/seller/dashboard"
//         : "/buyer/dashboard"
//     );
//   } else if (to.meta.role && authStore.user?.role !== to.meta.role) {
//     next("/");
//   } else {
//     next();
//   }
// });

export default router;
