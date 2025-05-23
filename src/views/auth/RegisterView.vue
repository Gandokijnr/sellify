<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import PageSeo from "@/components/seo/PageSeo.vue";
import Navbar from "@/components/common/Navbar.vue";
import { useToast } from "vue-toastification";
import { validateEmail, validatePassword } from "@/utils/validators";

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const googleLoading = ref(false);

const form = ref({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const errors = ref({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
});
const loading = ref(false);
const showPassword = ref(false);
const termsAccepted = ref(false);

const validateForm = () => {
  let isValid = true;
  errors.value = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  if (!form.value.firstName.trim()) {
    errors.value.firstName = "First name is required";
    isValid = false;
  } else if (form.value.firstName.length < 2) {
    errors.value.firstName = "First name must be at least 2 characters";
    isValid = false;
  }

  if (!form.value.lastName.trim()) {
    errors.value.lastName = "Last name is required";
    isValid = false;
  }

  if (!form.value.email) {
    errors.value.email = "Email is required";
    isValid = false;
  } else if (!validateEmail(form.value.email)) {
    errors.value.email = "Please enter a valid email address";
    isValid = false;
  }

  if (!form.value.password) {
    errors.value.password = "Password is required";
    isValid = false;
  } else {
    const passwordError = validatePassword(form.value.password);
    if (passwordError) {
      errors.value.password = passwordError;
      isValid = false;
    }
  }

  if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = "Passwords do not match";
    isValid = false;
  }

  if (!termsAccepted.value) {
    toast.error("You must accept the terms and conditions");
    isValid = false;
  }

  return isValid;
};

const handleEmailRegister = async () => {
  if (!validateForm()) return;

  loading.value = true;

  try {
    await authStore.register({
      email: form.value.email,
      password: form.value.password,
      firstName: form.value.firstName,
      lastName: form.value.lastName,
    });


    router.push("/");
  } catch (error) {
    let errorMessage = "Registration failed. Please try again.";

    if (error.code === "auth/email-already-in-use") {
      errorMessage = "This email is already registered.";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Password should be at least 6 characters.";
    }

    toast.error(errorMessage);
    console.error("Registration error:", error);
  } finally {
    loading.value = false;
  }
};

const handleGoogleSignIn = async () => {
  googleLoading.value = true;
  try {
    await authStore.handleGoogleSignIn();
    router.push("/");
  } catch (error) {
    let errorMessage = "Google sign-in failed. Please try again.";

    if (error.code === "auth/account-exists-with-different-credential") {
      errorMessage = "This email is already registered with another method.";
    } else if (error.code === "auth/popup-closed-by-user") {
      errorMessage = "Sign-in popup was closed before completing.";
    } else if (error.code === "auth/cancelled-popup-request") {
      return;
    }

    toast.error(errorMessage);
    console.error("Google sign-in error:", error);
  } finally {
    googleLoading.value = false;
  }
};

onMounted(async () => {
  try {
    if (authStore.handleGoogleRedirectResult) {
      await authStore.handleGoogleRedirectResult();
    }
  } catch (error) {
    console.error("Error handling redirect result:", error);
  }
});

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <PageSeo
    pageName="register"
  />
  <nav>
    <Navbar />
  </nav>
  <div
    class="bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Create your account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Already have an account?
        <router-link
          to="/login"
          class="font-medium text-teal-600 hover:text-teal-500"
        >
          Sign in here
        </router-link>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
        <form class="mb-0 space-y-6" @submit.prevent="handleEmailRegister">
          <div class="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
            <!-- First Name -->
            <div>
              <label
                for="firstName"
                class="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <div class="mt-1">
                <input
                  v-model="form.firstName"
                  id="firstName"
                  type="text"
                  required
                  :class="{
                    'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500':
                      errors.firstName,
                    'border-gray-300 focus:ring-teal-500 focus:border-teal-500':
                      !errors.firstName,
                  }"
                  class="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm"
                />
                <p v-if="errors.firstName" class="mt-2 text-sm text-red-600">
                  {{ errors.firstName }}
                </p>
              </div>
            </div>

            <!-- Last Name -->
            <div>
              <label
                for="lastName"
                class="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <div class="mt-1">
                <input
                  v-model="form.lastName"
                  id="lastName"
                  type="text"
                  required
                  :class="{
                    'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500':
                      errors.lastName,
                    'border-gray-300 focus:ring-teal-500 focus:border-teal-500':
                      !errors.lastName,
                  }"
                  class="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm"
                />
                <p v-if="errors.lastName" class="mt-2 text-sm text-red-600">
                  {{ errors.lastName }}
                </p>
              </div>
            </div>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div class="mt-1">
              <input
                v-model="form.email"
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                :class="{
                  'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500':
                    errors.email,
                  'border-gray-300 focus:ring-teal-500 focus:border-teal-500':
                    !errors.email,
                }"
                class="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm"
              />
              <p v-if="errors.email" class="mt-2 text-sm text-red-600">
                {{ errors.email }}
              </p>
            </div>
          </div>

          <!-- Password -->
          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div class="mt-1 relative">
              <input
                v-model="form.password"
                id="password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                :class="{
                  'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500':
                    errors.password,
                  'border-gray-300 focus:ring-teal-500 focus:border-teal-500':
                    !errors.password,
                }"
                class="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="togglePasswordVisibility"
              >
                <span class="text-sm text-gray-500 hover:text-gray-700">
                  {{ showPassword ? "Hide" : "Show" }}
                </span>
              </button>
              <p v-if="errors.password" class="mt-2 text-sm text-red-600">
                {{ errors.password }}
              </p>
              <p v-else class="mt-2 text-xs text-gray-500">
                Must be at least 8 characters with one number and one special
                character
              </p>
            </div>
          </div>

          <!-- Confirm Password -->
          <div>
            <label
              for="confirmPassword"
              class="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <div class="mt-1">
              <input
                v-model="form.confirmPassword"
                id="confirmPassword"
                name="confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                :class="{
                  'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500':
                    errors.confirmPassword,
                  'border-gray-300 focus:ring-teal-500 focus:border-teal-500':
                    !errors.confirmPassword,
                }"
                class="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm"
              />
              <p
                v-if="errors.confirmPassword"
                class="mt-2 text-sm text-red-600"
              >
                {{ errors.confirmPassword }}
              </p>
            </div>
          </div>

          <!-- Terms and Conditions -->
          <div class="flex items-center">
            <input
              v-model="termsAccepted"
              id="terms"
              name="terms"
              type="checkbox"
              class="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label for="terms" class="ml-2 block text-sm text-gray-900">
              I agree to the
              <a href="#" class="text-teal-600 hover:text-teal-500"
                >Terms of Service</a
              >
              and
              <a href="#" class="text-teal-600 hover:text-teal-500"
                >Privacy Policy</a
              >
            </label>
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="loading"
              :class="{
                'bg-teal-600 hover:bg-teal-700': !loading,
                'bg-gray-400 cursor-not-allowed': loading,
              }"
              class="w-full flex item-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200"
            >
              <span v-if="loading">
                <svg
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating account...
              </span>
              <span v-else>Create Account</span>
            </button>
          </div>
        </form>

        <!-- Divider -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or sign up with</span>
            </div>
          </div>

          <!-- Social Sign-in Buttons -->
          <div class="mt-6 grid grid-cols-1 gap-3">
            <button
              @click="handleGoogleSignIn"
              type="button"
              :disabled="loading"
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200"
            >
              <svg class="w-5 h-5" viewBox="0 0 48 48">
                <path
                  fill="#4285F4"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                ></path>
                <path
                  fill="#EA4335"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                ></path>
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                ></path>
              </svg>
              <span class="ml-2">Continue with Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
