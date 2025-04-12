<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useAuthStore } from "@/stores/auth"; // Assuming you're using Pinia for state management
import Navbar from "@/components/common/Navbar.vue";

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
});

const errorMessage = ref(null);
const loading = ref(false);

const handleEmailRegister = async () => {
  loading.value = true;
  errorMessage.value = null;

  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      form.value.email,
      form.value.password
    );

    // Update user profile with display name
    await updateProfile(userCredential.user, {
      displayName: `${form.value.firstName} ${form.value.lastName}`,
    });

    // Store user data in auth store
    authStore.setUser({
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName,
      // Add any other user data you need
    });

    // Store user in localStorage for persistence
    localStorage.setItem(
      "user",
      JSON.stringify({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
      })
    );

    // Redirect to dashboard or profile setup
    router.push("/");
  } catch (err) {
    console.error("Registration error:", err);
    errorMessage.value = getErrorMessage(err.code);
  } finally {
    loading.value = false;
  }
};

// Helper function to convert Firebase error codes to user-friendly messages
const getErrorMessage = (code) => {
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/operation-not-allowed":
      return "Email/password accounts are not enabled.";
    default:
      return "Registration failed. Please try again.";
  }
};

// Google Sign-In handler (if you implement it later)
const handleGoogleSignIn = async () => {
  // You would implement Google sign-in here
};
</script>

<template>
  <nav>
    <Navbar />
  </nav>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Create a new account
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Already have an account?
          <router-link
            to="/login"
            class="font-medium text-jiji-primary hover:text-orange-600"
          >
            Sign in
          </router-link>
        </p>
      </div>

      <!-- Email/Password Registration Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleEmailRegister">
        <div class="space-y-4">
          <div>
            <label for="firstName" class="sr-only">First Name</label>
            <input
              v-model="form.firstName"
              id="firstName"
              type="text"
              required
              placeholder="First Name"
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-jiji-primary focus:border-jiji-primary focus:z-10"
            />
          </div>
          <div>
            <label for="lastName" class="sr-only">Last Name</label>
            <input
              v-model="form.lastName"
              id="lastName"
              type="text"
              required
              placeholder="Last Name"
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-jiji-primary focus:border-jiji-primary focus:z-10"
            />
          </div>
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input
              v-model="form.email"
              id="email"
              name="email"
              type="email"
              required
              autocomplete="email"
              placeholder="Email address"
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-jiji-primary focus:border-jiji-primary focus:z-10"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              v-model="form.password"
              id="password"
              name="password"
              type="password"
              required
              minlength="6"
              autocomplete="new-password"
              placeholder="Password (min 6 characters)"
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-jiji-primary focus:border-jiji-primary focus:z-10"
            />
          </div>
        </div>

        <div v-if="errorMessage" class="text-red-600 text-sm text-center">
          {{ errorMessage }}
        </div>

        <div>
          <button
            type="submit"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jiji-primary transition-colors duration-200"
            :disabled="loading"
            :class="{ 'opacity-50 cursor-not-allowed': loading }"
          >
            <span v-if="loading">Creating account...</span>
            <span v-else>Create Account</span>
          </button>
        </div>
      </form>

      <!-- Divider -->
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <!-- Google Sign-in Button -->
      <div>
        <button
          @click="handleGoogleSignIn"
          type="button"
          class="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jiji-primary transition-colors duration-200"
          :disabled="loading"
          :class="{ 'opacity-50 cursor-not-allowed': loading }"
        >
          <svg
            class="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
          >
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            />
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            />
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            />
          </svg>
          <span>Sign up with Google</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
