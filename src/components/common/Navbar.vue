<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useToast } from "vue-toastification";

const authStore = useAuthStore();
const toast = useToast();
const mobileMenuOpen = ref(false);
const userProfile = ref(null);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

onMounted(async () => {
  if (authStore.isAuthenticated && authStore.user?.uid) {
    try {
      const userDoc = await getDoc(doc(db, "users", authStore.user.uid));
      if (userDoc.exists()) {
        userProfile.value = userDoc.data();

        if (!userProfile.value.phoneNumber) {
          toast.warning(
            "Please verify your account by completing your profile",
            {
              timeout: false,
              closeOnClick: false,
              pauseOnFocusLoss: true,
            }
          );
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load user profile");
    }
  }
});
</script>

<template>
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <!-- Top Bar -->
    <div class="bg-green-600 text-white text-sm tilt-in">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-8">
          <div class="flex space-x-4">
            <routerLink
              :to="
                authStore.isAuthenticated ? '/seller/listings/create' : '/login'
              "
              class="hover:text-gray-200"
            >
              Sell on Selify
              <span
                v-if="
                  authStore.isAuthenticated &&
                  (!userProfile || !userProfile.phoneNumber)
                "
                class="ml-1 text-yellow-300 text-xs"
                title="Complete your profile to sell"
              >
                (!)
              </span>
            </routerLink>
            <a href="#" class="hover:text-gray-200">Customer Care</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Navigation -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo and Categories -->
        <div class="flex items-center space-x-8">
          <router-link
            to="/"
            class="hover:opacity-90 transition-opacity"
            aria-label="Selify Home"
          >
            <img
              src="https://res.cloudinary.com/dqqycsgmn/image/upload/v1745073438/selify-high-resolution-logo-transparent_yixuim.png"
              alt="Selify Logo"
              class="h-5 md:h-7 w-auto object-contain"
            />
          </router-link>
        </div>

        <!-- User Actions -->
        <div class="flex items-center space-x-4">
          <router-link
            to="/"
            class="hidden md:flex flex-col items-center text-gray-600 hover:text-green-600"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span class="text-xs">Saved</span>
          </router-link>

          <div v-if="authStore.isLoading" class="flex items-center">
            <span class="text-gray-500 text-sm">Loading...</span>
          </div>

          <template v-else>
            <template v-if="authStore.isAuthenticated && authStore.user">
              <div class="hidden sm:ml-6 sm:flex sm:items-center">
                <div class="relative group">
                  <button class="flex items-center space-x-1">
                    <span class="text-gray-700 text-sm mr-4">
                      Hi,
                      {{
                        authStore.user.displayName ||
                        authStore.user.email.split("@")[0]
                      }}
                      <span
                        v-if="userProfile && !userProfile.phoneNumber"
                        class="text-yellow-500 text-xs ml-1"
                        title="Profile incomplete"
                      >
                        (!)
                      </span>
                    </span>
                    <!-- Profile Picture with Verification Badge -->
                    <div class="relative">
                      <img
                        v-if="authStore.user.photoURL"
                        :src="authStore.user.photoURL"
                        alt="Profile"
                        class="w-8 h-8 rounded-full object-cover border-2"
                        :class="
                          userProfile?.phoneNumber
                            ? 'border-green-100'
                            : 'border-yellow-100'
                        "
                      />
                      <div
                        v-else
                        class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border-2"
                        :class="
                          userProfile?.phoneNumber
                            ? 'border-green-100'
                            : 'border-yellow-100'
                        "
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="w-5 h-5 text-gray-500"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                          />
                        </svg>
                      </div>

                      <!-- Verification Badge -->
                      <div
                        v-if="userProfile?.phoneNumber"
                        class="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm"
                        title="Phone number verified"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4 text-green-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </div>
                      <!-- Warning indicator for incomplete profile -->
                      <div
                        v-else
                        class="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm"
                        title="Profile incomplete - add phone number"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4 text-yellow-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </button>
                  <div
                    class="absolute right-0 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block"
                  >
                    <router-link
                      to="/seller/dashboard"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >Dashboard</router-link
                    >
                    <router-link
                      to="/profile"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Profile
                      <span
                        v-if="!userProfile?.phoneNumber"
                        class="ml-1 text-yellow-500 text-xs"
                      >
                        (!)
                      </span>
                    </router-link>
                    <router-link
                      to="/buyer/requests"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Submit Product Request
                    </router-link>
                    <router-link
                      to="/buyer/requests/list"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      View buyer requests
                    </router-link>
                    <button
                      @click="authStore.logout"
                      class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <router-link
                to="/login"
                class="hidden md:inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 hover:text-green-600"
              >
                Sign in
              </router-link>
              <router-link
                to="/register"
                class="hidden md:inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-gray-700"
              >
                Sign up
              </router-link>
            </template>
          </template>

          <!-- Mobile menu button -->
          <button
            @click="toggleMobileMenu"
            class="md:hidden text-gray-500 hover:text-green-600 focus:outline-none"
          >
            <div class="relative">
              <img
                v-if="authStore.isAuthenticated && authStore.user?.photoURL"
                :src="authStore.user.photoURL"
                alt="Profile"
                class="w-8 h-8 rounded-full object-cover border-2"
                :class="
                  userProfile?.phoneNumber
                    ? 'border-green-100'
                    : 'border-yellow-100'
                "
              />
              <div
                v-else
                class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border-2"
                :class="
                  userProfile?.phoneNumber
                    ? 'border-green-100'
                    : 'border-yellow-100'
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6 text-gray-500"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </div>
              <!-- Mobile verification indicator -->
              <div
                v-if="userProfile?.phoneNumber"
                class="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3 w-3 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div
                v-else-if="authStore.isAuthenticated"
                class="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3 w-3 text-yellow-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu (hidden on desktop) -->
    <div
      v-if="mobileMenuOpen"
      class="md:hidden bg-white border-t border-gray-200"
      :class="[
        mobileMenuOpen
          ? 'block absolute z-50 w-full rounded-b-lg shadow-lg animate-tilt-in'
          : 'hidden',
        'bg-white transition-all duration-300 ease-in-out transform ',
      ]"
    >
      <div class="px-2 pt-2 pb-3 space-y-1">
        <template v-if="authStore.isAuthenticated && authStore.user">
          <router-link
            to="/seller/dashboard"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50"
            >Dashboard</router-link
          >
          <router-link
            to="/profile"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50"
            >Profile</router-link
          >
          <!-- <router-link
            to="/my-ads"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50"
            >My Ads</router-link
          > -->
          <router-link
            to="/saved"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50"
            >Saved</router-link
          >
          <button
            @click="authStore.logout"
            class="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50"
          >
            Logout
          </button>
        </template>
        <template v-else>
          <router-link
            to="/login"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50"
            >Sign in</router-link
          >
          <router-link
            to="/register"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50"
            >Sign up</router-link
          >
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
@keyframes tilt-in {
  0% {
    transform: rotateY(20deg) translateY(-30px) skewY(-5deg);
    opacity: 0;
  }
  100% {
    transform: rotateY(0) translateY(0) skewY(0);
    opacity: 1;
  }
}

.animate-tilt-in {
  animation: tilt-in 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

.attention-indicator {
  animation: pulse 2s infinite;
}
</style>
