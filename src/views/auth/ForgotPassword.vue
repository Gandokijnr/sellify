<!-- ForgotPassword.vue -->
<template>
  <Navbar />
  <div
    class="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handlePasswordReset">
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input
              v-model="email"
              id="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-500 text-sm mt-2">
          {{ error }}
        </div>

        <div v-if="success" class="text-teal-600 text-sm mt-2">
          {{ success }}
        </div>

        <div>
          <button
            type="submit"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            :disabled="loading"
          >
            <span v-if="loading">Sending reset link...</span>
            <span v-else>Send reset link</span>
          </button>
        </div>
      </form>

      <div class="text-center text-sm mt-4">
        <router-link
          to="/login"
          class="font-medium text-teal-600 hover:text-teal-500"
        >
          Back to sign in
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useToast } from "vue-toastification";
import Navbar from "@/components/common/Navbar.vue";

const router = useRouter();
const toast = useToast();
const auth = getAuth();

const email = ref("");
const loading = ref(false);
const error = ref(null);
const success = ref(null);

const handlePasswordReset = async () => {
  loading.value = true;
  error.value = null;
  success.value = null;

  try {
    await sendPasswordResetEmail(auth, email.value);
    success.value = "Password reset email sent. Please check your inbox.";
    toast.success("Password reset email sent");
  } catch (err) {
    error.value = getErrorMessage(err.code);
    toast.error(error.value);
    console.error("Password reset error:", err);
  } finally {
    loading.value = false;
  }
};

const getErrorMessage = (code) => {
  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/too-many-requests":
      return "Too many requests. Please try again later.";
    default:
      return "Failed to send reset email. Please try again.";
  }
};
</script>
