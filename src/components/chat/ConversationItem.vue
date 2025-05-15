<!-- ConversationItem.vue -->
<script setup>
import { useAuthStore } from "@/stores/auth";
import { 
  getRelativeTime, 
  isSeller, 
  getUnreadCount, 
  markAsRead, 
  truncateText, 
  getInitials 
} from "@/utils/conversationUtils";

const props = defineProps({
  chat: {
    type: Object,
    required: true
  },
  otherUser: {
    type: Object,
    default: () => ({ displayName: "Unknown User" })
  }
});

const authStore = useAuthStore();

const handleNavigate = () => {
  if (authStore.user && authStore.user.uid) {
    markAsRead(props.chat.id, authStore.user.uid);
  }
};
</script>

<template>
  <router-link
    :to="{ name: 'chat', params: { conversationId: chat.id } }"
    class="flex items-center p-4 md:p-6 hover:bg-gray-700 dark:hover:bg-gray-750 transition-colors cursor-pointer relative"
    :class="{
      'bg-teal-100 dark:bg-teal-900/20': getUnreadCount(chat, authStore.user?.uid) > 0,
    }"
    @click="handleNavigate"
  >
    <!-- User Avatar -->
    <div class="flex-shrink-0 mr-4">
      <div v-if="otherUser?.photoURL" class="relative">
        <img
          :src="otherUser.photoURL"
          :alt="`${otherUser?.displayName || 'Unknown User'}'s profile`"
          class="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-gray-700"
        />
        <span
          v-if="getUnreadCount(chat, authStore.user?.uid) > 0"
          class="absolute -top-1 -right-1 bg-teal-500 text-white rounded-full px-2 py-0.5 text-xs font-bold"
        >
          {{ getUnreadCount(chat, authStore.user?.uid) }}
        </span>
      </div>
      <div
        v-else
        class="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg font-medium text-gray-600 dark:text-gray-300 relative"
      >
        {{ getInitials(otherUser?.displayName) }}
        <span
          v-if="getUnreadCount(chat, authStore.user?.uid) > 0"
          class="absolute -top-1 -right-1 bg-teal-500 text-white rounded-full px-2 py-0.5 text-xs font-bold"
        >
          {{ getUnreadCount(chat, authStore.user?.uid) }}
        </span>
      </div>
    </div>

    <!-- Chat Details -->
    <div class="flex-1 min-w-0">
      <div
        class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline"
      >
        <h2
          class="font-semibold text-gray-900 dark:text-white truncate"
        >
          {{ otherUser?.displayName || "Unknown User" }}
          <span class="text-sm font-normal text-gray-500 ml-2">
            {{ isSeller(chat, authStore.user?.uid) ? "(Seller)" : "(Buyer)" }}
          </span>
        </h2>
        <div class="flex items-center mt-1 sm:mt-0">
          <span
            class="text-sm text-gray-500 dark:text-gray-400"
            :class="{
              'font-medium text-teal-600 dark:text-teal-400':
                getUnreadCount(chat, authStore.user?.uid) > 0,
            }"
          >
            {{ getRelativeTime(chat.lastUpdated) }}
          </span>
        </div>
      </div>

      <p
        class="text-sm mt-1 text-gray-600 dark:text-gray-300 line-clamp-1"
        :class="{ 'font-medium': getUnreadCount(chat, authStore.user?.uid) > 0 }"
      >
        {{ chat.listingTitle ? `About: ${chat.listingTitle}` : "" }}
      </p>

      <p
        class="text-sm mt-1 text-gray-600 dark:text-gray-300 line-clamp-1"
        :class="{ 'font-medium': getUnreadCount(chat, authStore.user?.uid) > 0 }"
      >
        {{ truncateText(chat.lastMessage) || "No messages yet" }}
      </p>
    </div>

    <!-- Listing Thumbnail -->
    <div v-if="chat.listingImage" class="ml-4 w-16 h-16 flex-shrink-0">
      <img
        :src="chat.listingImage"
        class="w-full h-full object-cover rounded"
        :alt="chat.listingTitle || 'Listing image'"
      />
    </div>

    <!-- Arrow indicator -->
    <div class="ml-4 text-gray-400">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clip-rule="evenodd"
        />
      </svg>
    </div>
  </router-link>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>