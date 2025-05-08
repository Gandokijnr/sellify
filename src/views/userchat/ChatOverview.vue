<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import Navbar from "@/components/common/Navbar.vue";
import Footer from "@/components/common/Footer.vue";
import { chatService } from "@/utils/chatService";
import { Search, Clock, MessageSquare, User, Inbox } from "lucide-vue-next";

const authStore = useAuthStore();
const chats = ref([]);
const unsubscribeChats = ref(null);
const isLoading = ref(true);
const searchQuery = ref("");
const activeFilter = ref("all"); // 'all', 'unread', 'recent'

// Filtered chats based on search and selected filter
const filteredChats = computed(() => {
  let filtered = chats.value;

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((chat) =>
      (chat.otherUserInfo?.displayName || "Unknown User")
        .toLowerCase()
        .includes(query)
    );
  }

  // Apply category filter
  if (activeFilter.value === "unread") {
    filtered = filtered.filter((chat) => chat.unreadCount > 0);
  } else if (activeFilter.value === "recent") {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    filtered = filtered.filter((chat) => chat.lastUpdated > oneDayAgo);
  }

  return filtered;
});

// Get relative time (e.g., "2 hours ago", "Yesterday")
const getRelativeTime = (date) => {
  if (!date) return "";

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;

  // Check if it was yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  // If it's within the last week
  if (diffInSeconds < 604800) {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.getDay()];
  }

  // Otherwise return the date
  return date.toLocaleDateString();
};

onMounted(async () => {
  isLoading.value = true;

  // Subscribe to user's chats using our service
  unsubscribeChats.value = chatService.getUserChats(
    authStore.user.uid,
    (chatData) => {
      chats.value = chatData;
      isLoading.value = false;
    }
  );
});

onUnmounted(() => {
  if (unsubscribeChats.value) unsubscribeChats.value();
});

const truncateText = (text, maxLength = 60) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const setFilter = (filter) => {
  activeFilter.value = filter;
};

const getInitials = (name) => {
  if (!name || name === "Unknown User") return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Navbar />

    <main class="container mx-auto px-4 py-8 max-w-5xl">
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
      >
        <!-- Header Section -->
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div
            class="flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <h1
              class="text-2xl font-semibold text-gray-800 dark:text-white flex items-center"
            >
              <MessageSquare class="h-6 w-6 mr-2 text-green-500" />
              Your Conversations
            </h1>

            <!-- Search Bar -->
            <div class="relative w-full md:w-64">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <Search class="h-5 w-5 text-gray-400" />
              </div>

              <!-- Content Section -->
              <div class="divide-y divide-gray-200 dark:divide-gray-700">
                <!-- Loading State -->
                <div v-if="isLoading" class="p-8 text-center">
                  <div
                    class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"
                  ></div>
                  <p class="mt-4 text-gray-500 dark:text-gray-400">
                    Loading your conversations...
                  </p>
                </div>

                <!-- Empty State -->
                <div
                  v-else-if="filteredChats.length === 0"
                  class="p-12 flex flex-col items-center justify-center text-center"
                >
                  <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-full">
                    <Inbox class="h-12 w-12 text-gray-400" />
                  </div>
                  <h3
                    class="mt-4 text-lg font-medium text-gray-900 dark:text-white"
                  >
                    {{
                      searchQuery
                        ? "No matching conversations"
                        : "No conversations yet"
                    }}
                  </h3>
                  <p class="mt-2 text-gray-500 dark:text-gray-400 max-w-md">
                    {{
                      searchQuery
                        ? "Try adjusting your search terms or clearing the filters."
                        : "Your message history will appear here. Start a chat from a product listing!"
                    }}
                  </p>
                </div>

                <!-- Chat List -->
                <router-link
                  v-for="chat in filteredChats"
                  :key="chat.id"
                  :to="{ name: 'chat', params: { chatId: chat.id } }"
                  class="flex items-center p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer relative"
                  :class="{
                    'bg-green-50 dark:bg-green-900/20': chat.unreadCount > 0,
                  }"
                >
                  <!-- User Avatar -->
                  <div class="flex-shrink-0 mr-4">
                    <div v-if="chat.otherUserInfo?.photoURL" class="relative">
                      <img
                        :src="chat.otherUserInfo.photoURL"
                        :alt="`${
                          chat.otherUserInfo?.displayName || 'Unknown User'
                        }'s profile`"
                        class="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-gray-700"
                      />
                      <span
                        v-if="chat.unreadCount > 0"
                        class="absolute -top-1 -right-1 bg-green-500 text-white rounded-full px-2 py-0.5 text-xs font-bold"
                      >
                        {{ chat.unreadCount }}
                      </span>
                    </div>
                    <div
                      v-else
                      class="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg font-medium text-gray-600 dark:text-gray-300 relative"
                    >
                      {{ getInitials(chat.otherUserInfo?.displayName) }}
                      <span
                        v-if="chat.unreadCount > 0"
                        class="absolute -top-1 -right-1 bg-green-500 text-white rounded-full px-2 py-0.5 text-xs font-bold"
                      >
                        {{ chat.unreadCount }}
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
                        {{ chat.otherUserInfo?.displayName || "Unknown User" }}
                      </h2>
                      <div class="flex items-center mt-1 sm:mt-0">
                        <span
                          class="text-sm text-gray-500 dark:text-gray-400"
                          :class="{
                            'font-medium text-green-600 dark:text-green-400':
                              chat.unreadCount > 0,
                          }"
                        >
                          {{ getRelativeTime(chat.lastUpdated) }}
                        </span>
                      </div>
                    </div>

                    <p
                      class="text-sm mt-1 text-gray-600 dark:text-gray-300 line-clamp-1"
                      :class="{ 'font-medium': chat.unreadCount > 0 }"
                    >
                      {{
                        truncateText(chat.lastMessage?.text) ||
                        "No messages yet"
                      }}
                    </p>
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
              </div>

              <!-- Pagination for future scaling -->
              <div
                v-if="filteredChats.length > 20"
                class="p-4 flex justify-center border-t border-gray-200 dark:border-gray-700"
              >
                <div class="flex space-x-2">
                  <button
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    class="px-4 py-2 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search conversations..."
                class="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-400 dark:focus:border-green-400 transition-colors"
              />
            </div>
          </div>

          <!-- Filters -->
          <div class="mt-4 flex items-center space-x-2 overflow-x-auto pb-2">
            <button
              @click="setFilter('all')"
              :class="[
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                activeFilter === 'all'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
              ]"
            >
              All Conversations
            </button>
            <button
              @click="setFilter('unread')"
              :class="[
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                activeFilter === 'unread'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
              ]"
            >
              Unread
            </button>
            <button
              @click="setFilter('recent')"
              :class="[
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                activeFilter === 'recent'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
              ]"
            >
              <Clock class="h-4 w-4 mr-1 inline" />
              Recent
            </button>
          </div>
        </div>

        <!-- Content Section -->
        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <!-- Loading State -->
          <div v-if="isLoading" class="p-8 text-center">
            <div
              class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"
            ></div>
            <p class="mt-4 text-gray-500 dark:text-gray-400">
              Loading your conversations...
            </p>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="filteredChats.length === 0"
            class="p-12 flex flex-col items-center justify-center text-center"
          >
            <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-full">
              <Inbox class="h-12 w-12 text-gray-400" />
            </div>
            <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              {{
                searchQuery
                  ? "No matching conversations"
                  : "No conversations yet"
              }}
            </h3>
            <p class="mt-2 text-gray-500 dark:text-gray-400 max-w-md">
              {{
                searchQuery
                  ? "Try adjusting your search terms or clearing the filters."
                  : "Your message history will appear here. Start a chat from a product listing!"
              }}
            </p>
          </div>

          <!-- Chat List -->
          <router-link
            v-for="chat in filteredChats"
            :key="chat.id"
            :to="{ name: 'chat', params: { sellerId: chat.otherUserId } }"
            class="flex items-center p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer relative"
            :class="{
              'bg-green-50 dark:bg-green-900/20': chat.unreadCount > 0,
            }"
          >
            <!-- User Avatar -->
            <div class="flex-shrink-0 mr-4">
              <div v-if="chat.otherUserInfo?.photoURL" class="relative">
                <img
                  :src="chat.otherUserInfo.photoURL"
                  :alt="`${
                    chat.otherUserInfo?.displayName || 'Unknown User'
                  }'s profile`"
                  class="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-gray-700"
                />
                <span
                  v-if="chat.unreadCount > 0"
                  class="absolute -top-1 -right-1 bg-green-500 text-white rounded-full px-2 py-0.5 text-xs font-bold"
                >
                  {{ chat.unreadCount }}
                </span>
              </div>
              <div
                v-else
                class="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg font-medium text-gray-600 dark:text-gray-300 relative"
              >
                {{ getInitials(chat.otherUserInfo?.displayName) }}
                <span
                  v-if="chat.unreadCount > 0"
                  class="absolute -top-1 -right-1 bg-green-500 text-white rounded-full px-2 py-0.5 text-xs font-bold"
                >
                  {{ chat.unreadCount }}
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
                  {{ chat.otherUserInfo?.displayName || "Unknown User" }}
                </h2>
                <div class="flex items-center mt-1 sm:mt-0">
                  <span
                    class="text-sm text-gray-500 dark:text-gray-400"
                    :class="{
                      'font-medium text-green-600 dark:text-green-400':
                        chat.unreadCount > 0,
                    }"
                  >
                    {{ getRelativeTime(chat.lastUpdated) }}
                  </span>
                </div>
              </div>

              <p
                class="text-sm mt-1 text-gray-600 dark:text-gray-300 line-clamp-1"
                :class="{ 'font-medium': chat.unreadCount > 0 }"
              >
                {{ truncateText(chat.lastMessage?.text) || "No messages yet" }}
              </p>

              <!-- Optional: Add tags or context -->
              <div
                v-if="chat.otherUserInfo?.tags?.length"
                class="mt-2 flex flex-wrap gap-1"
              >
                <span
                  v-for="(tag, index) in chat.otherUserInfo.tags.slice(0, 2)"
                  :key="index"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                >
                  {{ tag }}
                </span>
              </div>
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
        </div>

        <!-- Pagination for future scaling -->
        <div
          v-if="filteredChats.length > 20"
          class="p-4 flex justify-center border-t border-gray-200 dark:border-gray-700"
        >
          <div class="flex space-x-2">
            <button
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Previous
            </button>
            <button
              class="px-4 py-2 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
