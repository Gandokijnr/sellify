<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  Timestamp,
  getFirestore,
} from "firebase/firestore";
import Navbar from "@/components/common/Navbar.vue";
import Footer from "@/components/common/Footer.vue";
import { Search, Clock, MessageSquare, User, Inbox } from "lucide-vue-next";

const db = getFirestore();
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
    filtered = filtered.filter((chat) => {
      const otherUser = getOtherUser(chat);
      const listingTitle = chat.listingTitle || "";
      return (
        (otherUser?.displayName || "Unknown User")
          .toLowerCase()
          .includes(query) || listingTitle.toLowerCase().includes(query)
      );
    });
  }

  // Apply category filter
  if (activeFilter.value === "unread") {
    filtered = filtered.filter((chat) => !chat.readBy?.[authStore.user.uid]);
  } else if (activeFilter.value === "recent") {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    filtered = filtered.filter((chat) => {
      const lastUpdated = chat.lastUpdated?.toDate();
      return lastUpdated && lastUpdated > oneDayAgo;
    });
  }

  return filtered.sort((a, b) => {
    const dateA = a.lastUpdated?.toDate() || new Date(0);
    const dateB = b.lastUpdated?.toDate() || new Date(0);
    return dateB - dateA; // Newest first
  });
});

// Get the other user in the conversation
const getOtherUser = (chat) => {
  if (!chat.participants || !authStore.user) return null;
  const { sellerId, buyerId } = chat.participants;
  const otherUserId = authStore.user.uid === sellerId ? buyerId : sellerId;
  return chat.otherUserInfo?.[otherUserId] || { displayName: "Unknown User" }; // Ensure fallback
};

const isSeller = (chat) => {
  return chat.participants?.sellerId === authStore.user.uid;
};

// Get relative time (e.g., "2 hours ago", "Yesterday")
const getRelativeTime = (timestamp) => {
  if (!timestamp) return "";

  const date = timestamp.toDate();
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

// Subscribe to user's conversations directly from Firebase
const subscribeToConversations = (userId) => {
  if (!userId) return null;

  // Query for conversations where user is either buyer or seller
  const conversationsRef = collection(db, "conversations");
  const buyerQuery = query(
    conversationsRef,
    where("participants.buyerId", "==", userId),
    orderBy("lastUpdated", "desc")
  );

  const sellerQuery = query(
    conversationsRef,
    where("participants.sellerId", "==", userId),
    orderBy("lastUpdated", "desc")
  );

  // Use two separate subscriptions and merge results
  const unsubscribeBuyer = onSnapshot(buyerQuery, (buyerSnapshot) => {
    const buyerChats = buyerSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Only update if seller data is also loaded (after first load)
    if (!isLoading.value || chats.value.length > 0) {
      // Merge and deduplicate with existing seller chats
      const existingSellerChats = chats.value.filter(
        (chat) => chat.participants?.sellerId === userId
      );
      const merged = [...buyerChats, ...existingSellerChats];
      // Remove duplicates by conversation ID
      const uniqueChats = Array.from(
        new Map(merged.map((chat) => [chat.id, chat])).values()
      );
      chats.value = uniqueChats;
    } else {
      // First load - save buyer chats
      chats.value = buyerChats;
    }
    isLoading.value = false;
  });

  const unsubscribeSeller = onSnapshot(sellerQuery, (sellerSnapshot) => {
    const sellerChats = sellerSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Only update if buyer data is also loaded (after first load)
    if (!isLoading.value || chats.value.length > 0) {
      // Merge and deduplicate with existing buyer chats
      const existingBuyerChats = chats.value.filter(
        (chat) => chat.participants?.buyerId === userId
      );
      const merged = [...sellerChats, ...existingBuyerChats];
      // Remove duplicates by conversation ID
      const uniqueChats = Array.from(
        new Map(merged.map((chat) => [chat.id, chat])).values()
      );
      chats.value = uniqueChats;
    } else {
      // First load - save seller chats
      chats.value = sellerChats;
    }
    isLoading.value = false;
  });

  // Return combined unsubscribe function
  return () => {
    unsubscribeBuyer();
    unsubscribeSeller();
  };
};

// Mark a conversation as read
const markAsRead = (conversationId, userId) => {
  if (!conversationId || !userId) return;

  const conversationRef = doc(db, "conversations", conversationId);

  // Update the readBy field for this user
  updateDoc(conversationRef, {
    [`readBy.${userId}`]: Timestamp.now(),
  }).catch((error) => {
    console.error("Error marking conversation as read:", error);
  });
};

onMounted(() => {
  isLoading.value = true;

  // Subscribe to user's conversations
  if (authStore.user && authStore.user.uid) {
    unsubscribeChats.value = subscribeToConversations(authStore.user.uid);
  }
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

// Get unread count for a conversation
const getUnreadCount = (conversation) => {
  if (!conversation.readBy || !authStore.user) return 0;
  return conversation.readBy[authStore.user.uid] ? 0 : 1;
};

// Navigate to chat and mark as read
const navigateToChat = (conversationId) => {
  if (authStore.user && authStore.user.uid) {
    markAsRead(conversationId, authStore.user.uid);
  }
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
            :to="{ name: 'chat', params: { conversationId: chat.id } }"
            class="flex items-center p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer relative"
            :class="{
              'bg-green-50 dark:bg-green-900/20': getUnreadCount(chat) > 0,
            }"
            @click="navigateToChat(chat.id)"
          >
            <!-- User Avatar -->
            <div class="flex-shrink-0 mr-4">
              <div v-if="getOtherUser(chat)?.photoURL" class="relative">
                <img
                  :src="getOtherUser(chat).photoURL"
                  :alt="`${
                    getOtherUser(chat)?.displayName || 'Unknown User'
                  }'s profile`"
                  class="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-gray-700"
                />
                <span
                  v-if="getUnreadCount(chat) > 0"
                  class="absolute -top-1 -right-1 bg-green-500 text-white rounded-full px-2 py-0.5 text-xs font-bold"
                >
                  {{ getUnreadCount(chat) }}
                </span>
              </div>
              <div
                v-else
                class="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg font-medium text-gray-600 dark:text-gray-300 relative"
              >
                {{ getInitials(getOtherUser(chat)?.displayName) }}
                <span
                  v-if="getUnreadCount(chat) > 0"
                  class="absolute -top-1 -right-1 bg-green-500 text-white rounded-full px-2 py-0.5 text-xs font-bold"
                >
                  {{ getUnreadCount(chat) }}
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
                  {{ getOtherUser(chat)?.displayName || "Unknown User" }}
                  <span class="text-sm font-normal text-gray-500 ml-2">
                    {{ isSeller(chat) ? "(Seller)" : "(Buyer)" }}
                  </span>
                </h2>
                <div class="flex items-center mt-1 sm:mt-0">
                  <span
                    class="text-sm text-gray-500 dark:text-gray-400"
                    :class="{
                      'font-medium text-green-600 dark:text-green-400':
                        getUnreadCount(chat) > 0,
                    }"
                  >
                    {{ getRelativeTime(chat.lastUpdated) }}
                  </span>
                </div>
              </div>

              <p
                class="text-sm mt-1 text-gray-600 dark:text-gray-300 line-clamp-1"
                :class="{ 'font-medium': getUnreadCount(chat) > 0 }"
              >
                {{ chat.listingTitle ? `About: ${chat.listingTitle}` : "" }}
              </p>

              <p
                class="text-sm mt-1 text-gray-600 dark:text-gray-300 line-clamp-1"
                :class="{ 'font-medium': getUnreadCount(chat) > 0 }"
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
