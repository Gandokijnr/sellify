<template>
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <!-- Top Bar -->
    <div class="bg-green-600 text-white text-sm tilt-in">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-8">
          <div class="flex space-x-4">
            <routerLink to="/seller/listings/create" class="hover:text-gray-200"
              >Sell on Selify</routerLink
            >
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
            :to="authStore.isAuthenticated ? '/' : '/'"
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
            to="/saved"
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
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="size-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  </button>
                  <div
                    class="absolute right-0 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block"
                  >
                    <router-link
                      to="/dashboard"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >Dashboard</router-link
                    >
                    <router-link
                      to="/profile"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >My Profile</router-link
                    >
                    <router-link
                      to="/my-ads"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >My Ads</router-link
                    >
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
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
          <router-link
            to="/my-ads"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50"
            >My Ads</router-link
          >
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

<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};
</script>

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
</style>
