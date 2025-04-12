<template>
  <transition
    enter-active-class="transition ease-out duration-100"
    enter-from-class="transform opacity-0 scale-95"
    enter-to-class="transform opacity-100 scale-100"
    leave-active-class="transition ease-in duration-75"
    leave-from-class="transform opacity-100 scale-100"
    leave-to-class="transform opacity-0 scale-95"
  >
    <div
      v-if="isOpen"
      class="md:hidden bg-white border-t border-gray-200 shadow-lg absolute w-full left-0 right-0 z-40"
    >
      <div class="px-2 pt-2 pb-3 space-y-1">
        <template v-if="isAuthenticated">
          <router-link
            to="/dashboard"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-jiji-primary hover:bg-gray-50"
            @click="$emit('close')"
          >
            Dashboard
          </router-link>
          <router-link
            to="/profile"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-jiji-primary hover:bg-gray-50"
            @click="$emit('close')"
          >
            Profile
          </router-link>
          <router-link
            to="/my-ads"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-jiji-primary hover:bg-gray-50"
            @click="$emit('close')"
          >
            My Ads
          </router-link>
          <router-link
            to="/favorites"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-jiji-primary hover:bg-gray-50"
            @click="$emit('close')"
          >
            Favorites
          </router-link>
          <router-link
            to="/cart"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-jiji-primary hover:bg-gray-50"
            @click="$emit('close')"
          >
            Cart ({{ cartCount }})
          </router-link>
        </template>
        <template v-else>
          <router-link
            to="/login"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-jiji-primary hover:bg-gray-50"
            @click="$emit('close')"
          >
            Sign in
          </router-link>
          <router-link
            to="/register"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-jiji-primary hover:bg-gray-50"
            @click="$emit('close')"
          >
            Sign up
          </router-link>
        </template>
      </div>
      <div class="pt-4 pb-3 border-t border-gray-200" v-if="isAuthenticated">
        <button
          @click="handleLogout"
          class="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:text-jiji-primary hover:bg-gray-50"
        >
          Logout
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  isOpen: Boolean,
  isAuthenticated: Boolean,
  cartCount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["close", "logout"]);

const handleLogout = () => {
  emit("logout");
  emit("close");
};
</script>
