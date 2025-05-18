import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useSubscriptionStore } from "@/stores/subscription.store";
import { useListingsStore } from "@/stores/listing.store";

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/HomeView.vue"),
  },
  {
    path: "/subscription",
    name: "subscription",
    component: () => import("@/views/Subscription.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/payment-success",
    name: "payment-success",
    component: () => import("@/views/PaymentSuccess.vue"),
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
    path: "/chats",
    name: "chats",
    component: () => import("@/views/userchat/ChatOverview.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/chat/:conversationId",
    name: "chat",
    component: () => import("@/views/userchat/ChatDetail.vue"),
    meta: { requiresAuth: true },
    props: true,
  },
  // Backwards compatibility with old route pattern
  // {
  //   path: "/chat/seller/:chatId",
  //   name: "chatWithSeller",
  //   component: () => import("@/views/userchat/ChatDetail.vue"),
  //   meta: { requiresAuth: true },
  //   props: true,
  // },
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
  const subscriptionStore = useSubscriptionStore();
  const listingsStore = useListingsStore();
  const isAuthenticated = !!authStore.token;

  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
    return;
  }

  // Handle guest-only routes (like login/register) for authenticated users
  if (to.meta.guestOnly && isAuthenticated) {
    next("/seller/dashboard");
    return;
  }
  
  // Double-check auth requirement (this seems redundant with the first check)
  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/");
    return;
  }
  
  // Check if user needs subscription for create-listing route
  if (isAuthenticated && to.name === "create-listing") {
    try {
      // Check if user has exceeded free listing limit
      const userListings = await listingsStore.fetchUserListings(
        authStore.user.uid
      );
      const hasFreeListing = userListings.some(
        (listing) => listing.isFreeListing
      );
      const totalListings = userListings.length;

      // If user has used their free listing, require subscription
      if (totalListings >= 1) {
        // Check if user has active subscription
        await subscriptionStore.fetchSubscription(authStore.user.uid);
        const hasActiveSubscription =
          subscriptionStore.subscription &&
          subscriptionStore.subscription.status === "active";

        if (!hasActiveSubscription) {
          next("/subscription");
          return;
        }
      }
    } catch (error) {
      console.error("Subscription check failed:", error);
      next("/subscription");
      return;
    }
  }

  // Check if route requires phone number verification
  if (isAuthenticated && to.meta.requiresPhoneNumber) {
    try {
      const userDoc = await getDoc(doc(db, "users", authStore.user.uid));
      if (!userDoc.data()?.phoneNumber) {
        next("/profile");
        return;
      }
    } catch (error) {
      console.error("Phone number check failed:", error);
    }
  }

  // Allow navigation in all other cases - only call next() once at the end
  next();
});

export default router;
