<template>
  <Navbar />
  <div class="bg-gradient-to-b from-teal-50 to-white min-h-screen pb-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
      <!-- Header section -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h1
          class="text-4xl font-extrabold text-teal-900 sm:text-5xl sm:tracking-tight lg:text-6xl"
        >
          Choose Your Plan
        </h1>
        <p class="mt-5 text-xl text-gray-600 max-w-2xl mx-auto">
          Select the subscription that best fits your needs and unlock premium
          features today.
        </p>
      </div>

      <!-- Toggle between monthly/yearly billing -->
      <div class="flex justify-center mb-12">
        <div class="relative bg-gray-100 p-1 rounded-full inline-flex">
          <button
            @click="toggleBillingPeriod('monthly')"
            :class="[
              'relative py-2 px-6 rounded-full text-sm font-medium focus:outline-none transition-colors',
              billingPeriod === 'monthly'
                ? 'bg-white shadow-sm text-teal-700'
                : 'text-gray-700 hover:text-gray-900',
            ]"
          >
            Monthly
          </button>
          <button
            @click="toggleBillingPeriod('yearly')"
            :class="[
              'relative py-2 px-6 rounded-full text-sm font-medium focus:outline-none transition-colors',
              billingPeriod === 'yearly'
                ? 'bg-white shadow-sm text-teal-700'
                : 'text-gray-700 hover:text-gray-900',
            ]"
          >
            Yearly
            <span class="ml-1 text-xs text-teal-600 font-semibold"
              >Save 20%</span
            >
          </button>
        </div>
      </div>

      <!-- Plan cards -->
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12"
      >
        <div
          v-for="(plan, index) in plans"
          :key="plan.id"
          :class="[
            'relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl',
            'flex flex-col h-full',
            plan.isPopular
              ? 'border-2 border-teal-500 transform md:scale-105 z-10 shadow-xl'
              : 'border border-gray-200 shadow-lg',
          ]"
        >
          <!-- Popular badge -->
          <div
            v-if="plan.isPopular"
            class="absolute top-0 inset-x-0 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-center py-2 text-xs font-medium tracking-wider"
          >
            MOST POPULAR
          </div>

          <!-- Card header -->
          <div
            :class="[
              'p-8 text-center',
              plan.isPopular
                ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white'
                : 'bg-white',
              plan.isPopular && 'pt-12',
              plan.isFree
                ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white'
                : '',
            ]"
          >
            <h3
              :class="[
                'text-2xl font-bold mb-1',
                plan.isPopular || plan.isFree ? 'text-white' : 'text-gray-900',
              ]"
            >
              {{ plan.name }}
            </h3>
            <p
              :class="[
                'text-sm mb-4',
                plan.isPopular
                  ? 'text-teal-100'
                  : plan.isFree
                  ? 'text-teal-100'
                  : 'text-gray-500',
              ]"
            >
              {{ plan.targetAudience }}
            </p>
            <div class="flex items-end justify-center">
              <span
                :class="[
                  'text-5xl font-extrabold tracking-tight',
                  plan.isPopular || plan.isFree
                    ? 'text-white'
                    : 'text-teal-600',
                ]"
              >
                ₦{{ plan.price }}
              </span>
              <span
                :class="[
                  'ml-1 text-xl font-medium mb-1',
                  plan.isPopular
                    ? 'text-teal-100'
                    : plan.isFree
                    ? 'text-teal-100'
                    : 'text-gray-500',
                ]"
              >
                /{{ billingPeriod === "yearly" ? "year" : "mo" }}
              </span>
            </div>
            <p
              v-if="billingPeriod === 'yearly'"
              :class="[
                'mt-2 text-sm',
                plan.isPopular ? 'text-teal-100' : 'text-gray-400',
              ]"
            >
              Save 20% with annual billing
            </p>
          </div>

          <!-- Features -->
          <div class="bg-white p-8 flex-grow">
            <p
              :class="[
                'font-medium text-sm uppercase mb-4 tracking-wider',
                plan.isPopular ? 'text-teal-600' : 'text-gray-500',
              ]"
            >
              What's included
            </p>
            <ul class="space-y-3">
              <li
                v-for="(feature, idx) in plan.features"
                :key="idx"
                class="flex items-start group"
              >
                <svg
                  :class="[
                    'h-5 w-5 mt-0.5 mr-3 flex-shrink-0',
                    plan.isPopular ? 'text-teal-500' : 'text-teal-400',
                  ]"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <div class="relative inline-block">
                  <span class="text-gray-700">{{ feature }}</span>
                  <span
                    v-if="featureExplanations[feature]"
                    class="ml-1 text-gray-400 hover:text-gray-600 transition-colors cursor-help"
                  >
                    <svg
                      class="h-4 w-4 inline"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div
                      class="absolute z-10 hidden group-hover:block w-64 p-3 -mt-2 -ml-2 text-xs text-gray-700 bg-white rounded shadow-lg border border-gray-200"
                    >
                      {{ featureExplanations[feature] }}
                    </div>
                  </span>
                </div>
              </li>
            </ul>

            <!-- Special highlights -->
            <div
              v-if="plan.id === 'premium'"
              class="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-100"
            >
              <h4 class="font-medium text-teal-800 mb-2">Premium Perks</h4>
              <ul class="space-y-2 text-sm text-teal-700">
                <li class="flex items-start">
                  <svg
                    class="h-4 w-4 text-teal-500 mr-2 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>72-hour top placement</span>
                </li>
                <li class="flex items-start">
                  <svg
                    class="h-4 w-4 text-teal-500 mr-2 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>Cross-platform posting</span>
                </li>
                <li class="flex items-start">
                  <svg
                    class="h-4 w-4 text-teal-500 mr-2 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>Custom storefront</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- CTA -->
          <div class="bg-white px-8 pb-8 pt-4">
            <button
              @click="subscribe(plan)"
              :disabled="loading || isSubscribed(plan)"
              :class="[
                'w-full py-4 px-8 rounded-lg text-center font-medium text-base transition-all',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                isSubscribed(plan)
                  ? 'bg-teal-500 text-white cursor-not-allowed'
                  : plan.isPopular
                  ? 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500'
                  : 'bg-teal-100 text-teal-700 hover:bg-teal-200 focus:ring-teal-500',
              ]"
            >
              <div class="flex items-center justify-center">
                <span v-if="isSubscribed(plan)" class="mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </span>
                {{ isSubscribed(plan) ? "Current Plan" : "Subscribe Now" }}
              </div>
            </button>
            <p
              v-if="isSubscribed(plan)"
              class="mt-2 text-sm text-center text-teal-600"
            >
              Your subscription is active
            </p>
            <p v-else class="mt-2 text-xs text-center text-gray-500">
              Cancel anytime. No hidden fees.
            </p>
          </div>
        </div>
      </div>

      <!-- Error message -->
      <div
        v-if="error"
        class="mt-10 max-w-lg mx-auto p-4 bg-red-50 border border-red-200 rounded-lg flex items-center"
      >
        <svg
          class="h-5 w-5 text-red-500 mr-3 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        <span class="text-red-700">{{ error }}</span>
      </div>

      <!-- Testimonials/trust indicators -->
      <!-- <div class="mt-24 max-w-4xl mx-auto text-center">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Trusted by businesses worldwide</h2>
        <div class="flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-60">
          <div class="h-8 text-gray-400">COMPANY LOGO</div>
          <div class="h-8 text-gray-400">COMPANY LOGO</div>
          <div class="h-8 text-gray-400">COMPANY LOGO</div>
          <div class="h-8 text-gray-400">COMPANY LOGO</div>
        </div>
      </div> -->

      <!-- FAQ section -->
      <div class="mt-24 max-w-3xl mx-auto">
        <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div class="space-y-6">
          <div class="border-b border-gray-200 pb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              How does billing work?
            </h3>
            <p class="text-gray-600">
              Your subscription will be billed at the beginning of each period.
              You can cancel anytime from your account settings.
            </p>
          </div>
          <div class="border-b border-gray-200 pb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              Can I change plans later?
            </h3>
            <p class="text-gray-600">
              Yes! You can upgrade or downgrade your plan at any time. The new
              charges will be prorated for the remainder of your billing period.
            </p>
          </div>
          <div class="pb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              Is there a free trial?
            </h3>
            <p class="text-gray-600">
              We offer a 14-day free trial on all our plans. No credit card
              required to start your trial.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script setup>
import { onMounted, computed, ref, watch } from "vue";
import { useSubscriptionStore } from "@/stores/subscription.store";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import Navbar from "@/components/common/Navbar.vue";
import Footer from "@/components/common/Footer.vue";

const subscriptionStore = useSubscriptionStore();
const authStore = useAuthStore();
const router = useRouter();

const loading = ref(false);
const error = ref("");
const billingPeriod = ref("monthly");

// Feature explanations for tooltips
const featureExplanations = {
  "AI-Powered Optimization":
    "Get AI suggestions for titles, descriptions, and optimal pricing based on market data",
  "Priority Visibility (72h top placement)":
    "Your listings stay at the top of search results for 72 hours",
  "Cross-Post to Partner Platforms":
    "Automatically post to Facebook Marketplace, Instagram Shops, and more",
  "Secure Escrow Payments":
    "Safe transactions where we hold funds until delivery is confirmed",
  "24/7 Dedicated Support": "Get help anytime with our priority support team",
  "Advanced Market Insights":
    "Detailed analytics on your listings and market trends",
  "Customizable Storefront":
    "Your own branded page (e.g., selify.netlify.app/yourbrand)",
  "Competitor Price Tracking":
    "Monitor and compare your prices with competitors",
  "Peak Traffic Analytics": "See when your items get the most views",
  "Social Media Auto-Share":
    "Automatically share new listings on your social media",
  "1 Free Boost Monthly":
    "Highlight one listing in search results for 24 hours",
  "Basic Fraud Detection":
    "Get alerts for potentially suspicious buyer messages",
};

const plans = computed(() => {
  return subscriptionStore.plans.map((plan) => ({
    ...plan,
    price: billingPeriod.value === "yearly" ? plan.yearlyPrice : plan.price,
    // Set isPopular based on the plan's isPopular property
    isPopular: plan.isPopular || false,
  }));
});

const isSubscribed = (plan) => {
  return subscriptionStore.subscription?.planId === plan.id;
};

const subscribe = async (plan) => {
  if (!authStore.user) {
    router.push("/login?redirect=/subscription");
    return;
  }

  try {
    loading.value = true;
    error.value = "";
    await subscriptionStore.createSubscription(authStore.user.uid, plan);
  } catch (err) {
    error.value =
      err.message || "Failed to process subscription. Please try again.";
  } finally {
    loading.value = false;
  }
};

const toggleBillingPeriod = (period) => {
  billingPeriod.value = period;
};

const fetchSubscription = async () => {
  if (authStore.user) {
    try {
      loading.value = true;
      await subscriptionStore.fetchSubscription(authStore.user.uid);
    } catch (err) {
      error.value = err.message || "Failed to fetch subscription";
    } finally {
      loading.value = false;
    }
    if (!authStore.user) return;
    try {
      loading.value = true;
      await subscriptionStore.fetchSubscription(authStore.user.uid);
      error.value = "";
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }
};

onMounted(fetchSubscription);
</script>
