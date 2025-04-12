<template>
  <div class="relative group">
    <button
      class="flex items-center space-x-1 text-gray-600 hover:text-jiji-primary transition-colors"
      aria-label="User menu"
    >
      <div
        class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center"
      >
        <span class="text-sm font-medium">{{ initials }}</span>
      </div>
      <span class="text-sm hidden lg:inline">{{ user.name || "Account" }}</span>
      <ChevronDownIcon class="w-4 h-4 hidden lg:inline" />
    </button>
    <div
      class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 divide-y divide-gray-100 origin-top-right transition-all duration-100 transform opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100"
    >
      <router-link
        to="/dashboard"
        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        @click="$emit('close')"
      >
        Dashboard
      </router-link>
      <router-link
        to="/profile"
        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        @click="$emit('close')"
      >
        My Profile
      </router-link>
      <router-link
        to="/my-ads"
        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        @click="$emit('close')"
      >
        My Ads
      </router-link>
      <button
        @click="handleLogout"
        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        Logout
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { ChevronDownIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["logout", "close"]);

const initials = computed(() => {
  if (!props.user?.name) return "U";
  const names = props.user.name.split(" ");
  return names
    .map((name) => name[0])
    .join("")
    .toUpperCase();
});

const handleLogout = () => {
  emit("logout");
  emit("close");
};
</script>
