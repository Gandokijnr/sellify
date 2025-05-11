<template>
  <div class="min-h-screen flex items-center justify-center p-8">
    <div v-if="loading" class="text-center max-w-md mx-auto p-8 rounded-lg">
      <div class="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full mx-auto mb-5 animate-spin"></div>
      <p>Verifying payment...</p>
    </div>
    <div v-else-if="success" class="text-center max-w-md mx-auto p-8 rounded-lg bg-green-100 text-green-800">
      <h2 class="text-xl font-bold mb-2">Payment Successful!</h2>
      <p>Your subscription has been activated.</p>
      <p>Redirecting you to create listing...</p>
    </div>
    <div v-else-if="error" class="text-center max-w-md mx-auto p-8 rounded-lg bg-red-100 text-red-800">
      <h2 class="text-xl font-bold mb-2">Payment Failed</h2>
      <p>{{ error }}</p>
      <button @click="goBack" class="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">Try Again</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useSubscriptionStore } from '@/stores/subscription.store';
import { useRoute, useRouter } from 'vue-router';
import { paymentService } from '@/services/payment.service';

const subscriptionStore = useSubscriptionStore();
const route = useRoute();
const router = useRouter();
const loading = ref(true);
const success = ref(false);
const error = ref('');

onMounted(async () => {
  try {
    // Get payment reference from URL
    const reference = route.query.reference;
    const redirect = route.query.redirect || '/';

    if (!reference) {
      throw new Error('Missing payment reference');
    }

    // Verify payment
    const { success: isPaymentSuccess, metadata } = await paymentService.verifyPayment(reference);

    if (!isPaymentSuccess) {
      throw new Error('Payment verification failed');
    }

    // Activate subscription
    await subscriptionStore.verifyAndActivateSubscription(reference);

    // Success
    loading.value = false;
    success.value = true;

    // Redirect after 2 seconds
    setTimeout(() => {
      router.push(redirect);
    }, 2000);
  } catch (err) {
    loading.value = false;
    error.value = err.message || 'Payment verification failed';
  }
});

const goBack = () => {
  router.push('/subscription');
};
</script>