import { defineStore } from "pinia";
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { paymentService } from "@/services/payment.service";
import { useAuthStore } from "@/stores/auth";

export const useSubscriptionStore = defineStore("subscription", {
  state: () => ({
    subscription: null,
    loading: false,
    error: null,
    billingPeriod: "monthly", // 'monthly' or 'yearly'
    plans: [
      {
        id: "free",
        name: "Free Tier",
        price: 0,
        yearlyPrice: 0,
        features: [
          "3 Free Listings/Month",
          "Watermarked AI Optimization",
          "1-2 Fraud Alerts/Month",
          "Basic Support",
          "Try Before You Buy",
        ],
        isFree: true,
      },
      {
        id: "basic",
        name: "Basic Plan",
        price: 3000, // Monthly price in NGN (₦3,000-5,000 range)
        yearlyPrice: 30000, // ~17% discount for yearly
        features: [
          "Unlimited Listings",
          "Basic Analytics Dashboard",
          "Social Media Auto-Share",
          "1 Free Boost Monthly",
          "Basic Fraud Detection",
          "Email Support",
        ],
        isFree: false,
        isPopular: true,
        targetAudience: "Casual sellers & budget-conscious users",
        boostIncluded: 1,
      },
      {
        id: "premium",
        name: "Premium Plan",
        price: 10000, // Monthly price in NGN (₦10,000-15,000 range)
        yearlyPrice: 100000, // ~17% discount for yearly
        features: [
          "AI-Powered Optimization",
          "Priority Visibility (72h top placement)",
          "Cross-Post to Partner Platforms",
          "Secure Escrow Payments",
          "24/7 Dedicated Support",
          "Advanced Market Insights",
          "Customizable Storefront",
          "Unlimited Listings & Boosts",
          "Competitor Price Tracking",
          "Peak Traffic Analytics",
        ],
        isFree: false,
        isPopular: false,
        targetAudience: "Power sellers & small businesses",
        boostIncluded: "unlimited",
        prioritySupport: true,
        storefront: true,
        escrowPayments: true,
        crossPosting: true,
      },
    ],
  }),
  getters: {
    currentPlans: (state) => {
      return state.plans.map((plan) => ({
        ...plan,
        price: state.billingPeriod === "yearly" ? plan.yearlyPrice : plan.price,
        duration: state.billingPeriod === "yearly" ? "year" : "month",
      }));
    },
  },
  actions: {
    async fetchSubscription(userId) {
      try {
        this.loading = true;
        const docRef = doc(db, "subscriptions", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          this.subscription = {
            ...docSnap.data(),
            id: docSnap.id,
          };
        } else {
          this.subscription = null;
        }
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async createSubscription(userId, plan) {
      try {
        this.loading = true;
        const authStore = useAuthStore();

        if (!authStore.user) {
          throw new Error("User not authenticated");
        }

        // Initialize payment
        const paymentUrl = await paymentService.initializePayment(
          plan.price,
          authStore.user.email,
          {
            userId,
            planId: plan.id,
            planName: plan.name,
          }
        );

        // Store plan info temporarily
        localStorage.setItem(
          "pending_subscription",
          JSON.stringify({
            userId,
            plan,
            createdAt: new Date(),
          })
        );

        // Redirect to payment
        window.location.href = paymentUrl;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async fetchSubscription(userId) {
      try {
        this.loading = true;
        const docRef = doc(db, "subscriptions", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          this.subscription = {
            ...docSnap.data(),
            id: docSnap.id,
          };
        } else {
          this.subscription = null;
        }
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async createSubscription(userId, plan) {
      try {
        this.loading = true;
        const authStore = useAuthStore();

        if (!authStore.user) {
          throw new Error("User not authenticated");
        }

        // Initialize payment
        const paymentUrl = await paymentService.initializePayment(
          plan.price,
          authStore.user.email,
          {
            userId,
            planId: plan.id,
            planName: plan.name,
          }
        );

        // Store plan info temporarily
        localStorage.setItem(
          "pending_subscription",
          JSON.stringify({
            userId,
            plan,
            createdAt: new Date(),
          })
        );

        // Redirect to payment
        window.location.href = paymentUrl;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async verifyAndActivateSubscription(reference) {
      try {
        this.loading = true;
        const { success, metadata } = await paymentService.verifyPayment(
          reference
        );

        if (!success) {
          throw new Error("Payment verification failed");
        }

        const { userId, planId } = metadata;
        const plan = this.plans.find((p) => p.id === planId);

        if (!plan) {
          throw new Error("Invalid subscription plan");
        }

        // Create or update subscription
        const subscriptionRef = doc(db, "subscriptions", userId);
        await setDoc(subscriptionRef, {
          userId,
          planId,
          planName: plan.name,
          status: "active",
          startDate: new Date(),
          nextRenewalDate: new Date(
            Date.now() + (plan.id === "premium" ? 60 : 30) * 24 * 60 * 60 * 1000
          ),
          paymentReference: reference,
          createdAt: new Date(),
        });

        // Update user's subscription status
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          hasSubscription: true,
          subscriptionPlan: plan.id,
        });

        await this.fetchSubscription(userId);
        return true;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async cancelSubscription(userId) {
      try {
        this.loading = true;
        const subscriptionRef = doc(db, "subscriptions", userId);
        await updateDoc(subscriptionRef, {
          status: "cancelled",
          cancelledAt: new Date(),
        });

        // Update user's subscription status
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          hasSubscription: false,
          subscriptionPlan: null,
        });

        await this.fetchSubscription(userId);
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
