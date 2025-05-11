<template>
  <Navbar />
  <div class="bg-gradient-to-b from-green-50 to-white min-h-screen pb-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
      <!-- Header section -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h1 class="text-4xl font-extrabold text-green-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          Choose Your Plan
        </h1>
        <p class="mt-5 text-xl text-gray-600 max-w-2xl mx-auto">
          Select the subscription that best fits your needs and unlock premium features today.
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
                ? 'bg-white shadow-sm text-green-700' 
                : 'text-gray-700 hover:text-gray-900'
            ]"
          >
            Monthly
          </button>
          <button 
            @click="toggleBillingPeriod('yearly')"
            :class="[
              'relative py-2 px-6 rounded-full text-sm font-medium focus:outline-none transition-colors',
              billingPeriod === 'yearly' 
                ? 'bg-white shadow-sm text-green-700' 
                : 'text-gray-700 hover:text-gray-900'
            ]"
          >
            Yearly <span class="ml-1 text-xs text-green-600 font-semibold">Save 20%</span>
          </button>
        </div>
      </div>

      <!-- Plan cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div 
          v-for="(plan, index) in plans" 
          :key="plan.id" 
          :class="[
            'relative rounded-2xl overflow-hidden transition-all duration-300',
            'flex flex-col h-full',
            index === 1 ? 'border-2 border-green-500 transform md:scale-105 z-10 shadow-xl' : 'border border-gray-200 shadow-lg'
          ]"
        >
          <!-- Popular badge -->
          <div v-if="index === 1" class="absolute top-0 inset-x-0 bg-green-500 text-white text-center py-2 text-sm font-medium">
            MOST POPULAR
          </div>

          <!-- Card header -->
          <div 
            :class="[
              'p-8 text-center',
              index === 1 ? 'bg-green-600 text-white' : 'bg-white',
              index === 1 && 'pt-12'
            ]"
          >
            <h3 
              :class="[
                'text-2xl font-bold mb-1',
                index === 1 ? 'text-white' : 'text-gray-900'
              ]"
            >
              {{ plan.name }}
            </h3>
            <p 
              :class="[
                'text-sm mb-4',
                index === 1 ? 'text-green-100' : 'text-gray-500'
              ]"
            >
              {{ index === 0 ? 'Get started with basic features' : index === 1 ? 'Perfect for growing businesses' : 'For large scale enterprises' }}
            </p>
            <div class="flex items-end justify-center">
              <span 
                :class="[
                  'text-5xl font-extrabold tracking-tight',
                  index === 1 ? 'text-white' : 'text-green-600'
                ]"
              >
                ₦{{ plan.price }}
              </span>
              <span 
                :class="[
                  'ml-1 text-xl font-medium mb-1',
                  index === 1 ? 'text-green-100' : 'text-gray-500'
                ]"
              >
                /mo
              </span>
            </div>
          </div>

          <!-- Features -->
          <div class="bg-white p-8 flex-grow">
            <p 
              :class="[
                'font-medium text-sm uppercase mb-4 tracking-wider',
                index === 1 ? 'text-green-600' : 'text-gray-500'
              ]"
            >
              What's included
            </p>
            <ul class="space-y-4">
              <li 
                v-for="feature in plan.features" 
                :key="feature" 
                class="flex items-start"
              >
                <svg class="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">{{ feature }}</span>
              </li>
            </ul>
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
                  ? 'bg-green-500 text-white cursor-not-allowed'
                  : index === 1
                    ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                    : 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500'
              ]"
            >
              <div class="flex items-center justify-center">
                <span v-if="isSubscribed(plan)" class="mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </span>
                {{ isSubscribed(plan) ? 'Current Plan' : 'Subscribe Now' }}
              </div>
            </button>
            <p v-if="isSubscribed(plan)" class="mt-2 text-sm text-center text-green-600">
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
        <svg class="h-5 w-5 text-red-500 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
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
        <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
        <div class="space-y-6">
          <div class="border-b border-gray-200 pb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-2">How does billing work?</h3>
            <p class="text-gray-600">Your subscription will be billed at the beginning of each period. You can cancel anytime from your account settings.</p>
          </div>
          <div class="border-b border-gray-200 pb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Can I change plans later?</h3>
            <p class="text-gray-600">Yes! You can upgrade or downgrade your plan at any time. The new charges will be prorated for the remainder of your billing period.</p>
          </div>
          <div class="pb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Is there a free trial?</h3>
            <p class="text-gray-600">We offer a 14-day free trial on all our plans. No credit card required to start your trial.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script setup>
import { onMounted, computed, ref, watch } from 'vue'
import { useSubscriptionStore } from '@/stores/subscription.store'
import { useAuthStore } from '@/stores/auth'
import Navbar from '@/components/common/Navbar.vue'
import Footer from '@/components/common/Footer.vue'
import { useToast } from 'vue-toastification'

// Store instances
const subscriptionStore = useSubscriptionStore()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')
const toast = useToast()

// Computed properties
const plans = computed(() => subscriptionStore.currentPlans)
const billingPeriod = computed(() => subscriptionStore.billingPeriod)

// Watch for billing period changes
// watch(() => subscriptionStore.billingPeriod, (newPeriod) => {
//   if (newPeriod === 'yearly') {
//     toast.success('Switched to yearly billing (20% discount)')
//   } else {
//     toast.success('Switched to monthly billing')
//   }
// })

// Check if user is subscribed to a plan
const isSubscribed = (plan) => {
  if (!subscriptionStore.subscription) return false
  return subscriptionStore.subscription.planId === plan.id
}

// Subscribe to a plan
const subscribe = async (plan) => {
  if (!authStore.user) return
  try {
    loading.value = true
    await subscriptionStore.createSubscription(authStore.user.uid, plan)
    error.value = ''
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Toggle between monthly and yearly billing
const toggleBillingPeriod = (period) => {
  subscriptionStore.billingPeriod = period
}

// Fetch subscription on component mount
const fetchSubscription = async () => {
  if (!authStore.user) return
  try {
    loading.value = true
    await subscriptionStore.fetchSubscription(authStore.user.uid)
    error.value = ''
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchSubscription)
</script>