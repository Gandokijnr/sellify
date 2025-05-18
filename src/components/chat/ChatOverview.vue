<!-- ChatOverview.vue (Main Page) -->
<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import Navbar from "@/components/common/Navbar.vue";
import Footer from "@/components/common/Footer.vue";
import SearchBar from "@/components/chat/SearchBar.vue";
import FilterTabs from "@/components/chat/FilterTabs.vue";
import ConversationList from "@/components/chat/ConversationList.vue";
import LoadingState from "@/components/chat/LoadingState.vue";
import EmptyState from "@/components/chat/EmptyState.vue";
import { MessageSquare } from "lucide-vue-next";
import chatService from "@/utils/chatService";

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
    // Check if lastUpdated already is a Date or needs conversion
    const dateA = a.lastUpdated instanceof Date ? a.lastUpdated : 
              (typeof a.lastUpdated?.toDate === 'function' ? a.lastUpdated.toDate() : new Date(0));
    const dateB = b.lastUpdated instanceof Date ? b.lastUpdated : 
              (typeof b.lastUpdated?.toDate === 'function' ? b.lastUpdated.toDate() : new Date(0));
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

// Subscribe to user's conversations directly from Firebase
const subscribeToConversations = (userId) => {
  if (!userId) return null;

  // Use getUserChats as the correct method from chatService
  return chatService.getUserChats(userId, (chatsData) => {
    chats.value = chatsData;
    isLoading.value = false;
  });
};

const updateSearchQuery = (query) => {
  searchQuery.value = query;
};

const setFilter = (filter) => {
  activeFilter.value = filter;
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
              <MessageSquare class="h-6 w-6 mr-2 text-teal-500" />
              Your Conversations
            </h1>

            <!-- Search Bar -->
            <SearchBar 
              :search-query="searchQuery" 
              @update-search="updateSearchQuery" 
            />
          </div>

          <!-- Filters -->
          <FilterTabs 
            :active-filter="activeFilter" 
            @set-filter="setFilter" 
          />
        </div>

        <!-- Content Section -->
        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <!-- Loading State -->
          <LoadingState v-if="isLoading" />

          <!-- Empty State -->
          <EmptyState 
            v-else-if="filteredChats.length === 0" 
            :has-search="!!searchQuery" 
          />

          <!-- Chat List -->
          <ConversationList 
            v-else 
            :chats="filteredChats" 
            :get-other-user="getOtherUser" 
          />
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
              class="px-4 py-2 bg-teal-500 text-white rounded text-sm font-medium hover:bg-teal-600 transition-colors"
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