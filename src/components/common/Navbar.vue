<script setup>
import { ref, onMounted, onBeforeMount, onUnmounted } from "vue";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { MessageSquareIcon, UserIcon } from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";
import { doc, getDoc } from "firebase/firestore";
import chatService from "@/utils/chatService";
import { db } from "@/firebase";
import { useToast } from "vue-toastification";

const authStore = useAuthStore();
const toast = useToast();
const mobileMenuOpen = ref(false);
const userProfile = ref(null);
const unreadCount = ref(0);
let unsubscribeUnread = null;

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

onBeforeMount(async () => {
  if (authStore.isAuthenticated && authStore.user?.uid) {
    try {
      const userDoc = await getDoc(doc(db, "users", authStore.user.uid));
      if (userDoc.exists()) {
        userProfile.value = userDoc.data();

        if (!userProfile.value.phoneNumber) {
          console.log("Please update your profile");
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load user profile");
    }
  }
});

onMounted(() => {
  if (authStore.isAuthenticated && authStore.user?.uid) {
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", authStore.user.uid)
    );

    unsubscribeUnread = onSnapshot(q, async (snapshot) => {
      try {
        const userId = authStore.user.uid;
        const unreadCountPromises = snapshot.docs.map(doc => {
          const chatId = doc.id;
          return chatService.getUnreadChatsCount(userId).then(count => ({
            chatId,
            unreadCount: count
          }));
        });

        const results = await Promise.all(unreadCountPromises);
        unreadCount.value = results.reduce((acc, result) => acc + result.unreadCount, 0);
      } catch (error) {
        console.error('Error updating unread count:', error);
        toast.error('Failed to update unread count');
      }
    });
  }
});

onUnmounted(() => {
  if (unsubscribeUnread) unsubscribeUnread();
});
</script>

<template>
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <!-- Top Bar -->
    <div class="bg-teal-600 text-white text-sm tilt-in">
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
                class="ml-1 text-teal-300 text-xs"
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
          <!-- <router-link
            :to="null"
            class="flex-col items-center text-gray-400 cursor-not-allowed pointer-events-none"
            aria-disabled="true"
          >
            <MessageSquareIcon class="h-6 w-6 text-gray-400" />
          </router-link> -->

          <router-link
            :to="authStore.isAuthenticated ? '/chats' : '/login'"
            class="flex-col items-center text-gray-600 hover:text-teal-600 relative"
          >
            <MessageSquareIcon
              class="h-6 w-6 text-gray-600 hover:text-teal-600"
            />
            <span
              v-if="unreadCount > 0"
              class="absolute -top-1 -right-2 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-xs"
            >
              {{ unreadCount }}
            </span>
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
                        class="text-teal-500 text-xs ml-1"
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
                            ? 'border-teal-100'
                            : 'border-teal-100'
                        "
                      />
                      <div
                        v-else
                        class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border-2"
                        :class="
                          userProfile?.phoneNumber
                            ? 'border-teal-100'
                            : 'border-teal-100'
                        "
                      >
                        <UserIcon class="h-6 w-6 text-gray-400" />
                      </div>

                      <!-- Verification Badge -->
                      <div
                        v-if="userProfile?.phoneNumber"
                        class="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm"
                        title="Phone number verified"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4 text-teal-500"
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
                          class="h-4 w-4 text-teal-500"
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
                        class="ml-1 text-teal-500 text-xs"
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
                      :to="{ name: 'buyer-requests-list' }"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      View buyer requests
                    </router-link>
                    <router-link
                      to="/subscription"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Subscription
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
                class="hidden md:inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 hover:text-teal-600"
              >
                Sign in
              </router-link>
              <router-link
                to="/register"
                class="hidden md:inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-gray-700"
              >
                Sign up
              </router-link>
            </template>
          </template>

          <!-- Mobile menu button -->
          <button
            @click="toggleMobileMenu"
            class="md:hidden text-gray-500 hover:text-teal-600 focus:outline-none"
          >
            <div class="relative">
              <img
                v-if="authStore.isAuthenticated && authStore.user?.photoURL"
                :src="authStore.user.photoURL"
                alt="Profile"
                class="w-8 h-8 rounded-full object-cover border-2"
                :class="
                  userProfile?.phoneNumber
                    ? 'border-teal-100'
                    : 'border-teal-100'
                "
              />
              <div
                v-else
                class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border-2"
                :class="
                  userProfile?.phoneNumber
                    ? 'border-teal-100'
                    : 'border-teal-100'
                "
              >
                <UserIcon class="h-6 w-6 text-gray-400" />
              </div>
              <!-- Mobile verification indicator -->
              <div
                v-if="userProfile?.phoneNumber"
                class="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3 w-3 text-teal-500"
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
                  class="h-3 w-3 text-teal-500"
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
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50"
            >Dashboard</router-link
          >
          <router-link
            to="/profile"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50"
            >Profile</router-link
          >
          <router-link
            to="/buyer/requests"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50"
          >
            Submit Product Request
          </router-link>
          <router-link
            to="/buyer/requests/list"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50"
          >
            View buyer requests
          </router-link>
          <!-- <router-link
            to="/my-ads"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50"
            >My Ads</router-link
          > -->

          <router-link
            to="/subscription"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50"
          >
            Subscription
          </router-link>
          <button
            @click="authStore.logout"
            class="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50"
          >
            Logout
          </button>
        </template>
        <template v-else>
          <router-link
            to="/login"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50"
            >Sign in</router-link
          >
          <router-link
            to="/register"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50"
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
