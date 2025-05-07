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
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/auth/RegisterView.vue"),
  },
  {
    path: "/listings",
    name: "listings",
    component: () => import("@/views/listings/AllListings.vue"),
  },
  {
    path: "/listings/:id",
    name: "listing-details",
    component: () => import("@/views/listings/ListingDetails.vue"),
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
  // edit listing from dashboard
  {
    path: "/seller/listings/edit/:id",
    name: "edit-listing",
    component: () => import("@/views/listings/EditListing.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "profile",
    component: () => import("@/views/userprofile/Profile.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/buyer/dashboard",
    name: "buyer-dashboard",
    component: () => import("@/views/dashboard/BuyerDashboard.vue"),
    meta: { requiresAuth: true },
  },
  //buyers requests form
  {
    path: "/buyer/requests",
    name: "buyer-requests",
    component: () =>
      import("@/views/listings/buyerrequestform/BuyerRequestForm.vue"),
    meta: { requiresAuth: true },
  },
  //buyers requests list
  {
    path: "/buyer/requests/list",
    name: "buyer-requests-list",
    component: () =>
      import("@/views/listings/buyerrequestform/BuyerRequestsList.vue"),
  },

  //forgot password
  {
    path: "/forgot-password",
    name: "forgotpassword",
    component: () => import("@/views/auth/ForgotPassword.vue"),
    meta: {
      requiresAuth: false,
    },
  },

  //user chat route
  {
    path: '/chat/:sellerId',
    name: 'chat',
    component: () => import('@/views/userchat/ChatView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/chats',
    name: 'chats',
    component: () => import('@/views/userchat/ChatOverview.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0, left: 0, behavior: "smooth" };
    }
  },
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = !!authStore.token;

  if (to.meta.guestOnly && isAuthenticated) {
    next("/seller/dashboard");
    return;
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/");
    return;
  }

  if (to.meta.requiresPhoneNumber) {
    const userDoc = await getDoc(doc(db, "users", authStore.user.uid));
    if (!userDoc.data()?.phoneNumber) {
      next("/profile");
      return;
    }
  }

  // Allow navigation in all other cases
  next();
});

export default router;
