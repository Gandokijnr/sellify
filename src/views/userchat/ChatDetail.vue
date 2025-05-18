<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { doc, getDoc, onSnapshot, orderBy, query, where, collection, updateDoc, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuthStore } from "@/stores/auth";
import Navbar from "@/components/common/Navbar.vue";
import Footer from "@/components/common/Footer.vue";
import chatService from "@/utils/chatService";
import { nextTick } from "vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// Reactive state
const messages = ref([]);
const newMessage = ref("");
const loading = ref(true);
const error = ref(null);
const otherUser = ref(null);
const listingId = ref(null);
const listingInfo = ref(null); // For listing details
const unsubscribeMessages = ref(null);
const sending = ref(false);
const messagesContainer = ref(null);
const userLoading = ref(false);
const conversation = ref(null); // Added for template compatibility

// Computed properties
const currentUserId = computed(() => authStore.user?.uid);

const otherUserId = ref(null); // This is now a ref since we set it after fetching chat data

const chatTitle = computed(() => {
  if (!otherUser.value) return "Chat";
  return otherUser.value.displayName || "Chat";
});

const canSendMessage = computed(() => {
  return !!currentUserId.value && !!otherUserId.value && !sending.value;
});

const isSeller = computed(() => {
  if (!conversation.value || !conversation.value.participants) return false;
  // Check if current user is the seller based on conversation data structure
  return currentUserId.value === conversation.value.sellerId;
});

// Fetch user information
const fetchUserInfo = async (userId) => {
  try {
    // Validate userId format and existence
    if (!userId) {
      console.warn("No userId provided to fetchUserInfo");
      otherUser.value = { displayName: "Unknown User", photoURL: null };
      return;
    }
    
    // Check if the ID looks like a valid Firebase ID format
    const validIdRegex = /^[A-Za-z0-9]{10,28}$/;
    if (!validIdRegex.test(userId)) {
      console.warn("Skipping user fetch - ID format is invalid:", userId);
      otherUser.value = { displayName: "Unknown User", photoURL: null };
      return;
    }

    userLoading.value = true;
    
    // First check if the user exists in the users collection
    const usersRef = collection(db, "users");
    const usersQuery = query(usersRef, where("__name__", "==", userId));
    const userSnapshot = await getDocs(usersQuery);
    
    if (userSnapshot.empty) {
      // User doesn't exist in the database
      console.info("User document doesn't exist in database for ID:", userId);
      otherUser.value = { displayName: "Unknown User", photoURL: null };
      userLoading.value = false;
      return;
    }
    
    console.log("Fetching user info for:", userId);

    // Try to fetch from listings first if it matches a listing pattern
    // (This is to handle the case where a listing ID is mistakenly passed)
    if (listingId.value === userId) {
      try {
        const listingDoc = await getDoc(doc(db, "listings", userId));
        if (listingDoc.exists()) {
          // This is a listing ID, not a user ID, fetch the seller
          const listingData = listingDoc.data();
          if (listingData.userId) {
            // We found the seller ID, now fetch the actual user
            const sellerDoc = await getDoc(doc(db, "users", listingData.userId));
            if (sellerDoc.exists()) {
              otherUser.value = sellerDoc.data();
              console.log("Seller data fetched via listing:", otherUser.value);
              return;
            }
          }
        }
      } catch (err) {
        console.log("Not a listing ID or couldn't fetch seller", err);
        // Continue with normal user fetch
      }
    }

    // Normal user fetch path
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      otherUser.value = userDoc.data();
      console.log("User data fetched:", otherUser.value);
    } else {
      console.info("User document doesn't exist for ID:", userId);
      // Set a placeholder user object instead of null
      otherUser.value = { displayName: "Unknown User", photoURL: null };
    }
  } catch (error) {
    console.error("Error fetching user info:", error);
    // Set a placeholder user object instead of null
    otherUser.value = { displayName: "Unknown User", photoURL: null };
  } finally {
    userLoading.value = false;
  }
};

// Fetch listing information
const fetchListingInfo = async (listingId) => {
  try {
    if (!listingId) {
      console.warn("No listingId available to fetch listing info");
      return;
    }

    console.log("Fetching listing info for:", listingId);
    const listingDoc = await getDoc(doc(db, "listings", listingId));

    if (listingDoc.exists()) {
      listingInfo.value = listingDoc.data();
      console.log("Listing data fetched:", listingInfo.value);
    } else {
      console.warn("Listing document doesn't exist for ID:", listingId);
      listingInfo.value = null;
    }
  } catch (error) {
    console.error("Error fetching listing info:", error);
    listingInfo.value = null;
  }
};

// Subscribe to conversation
const subscribeToConversation = (convId) => {
  if (!convId) return null;

  console.log("Subscribing to conversation:", convId);
  return onSnapshot(
    doc(db, "conversations", convId),
    (docSnap) => {
      if (docSnap.exists()) {
        conversation.value = docSnap.data();
        console.log("Conversation data received:", conversation.value);
      } else {
        console.warn("Conversation doesn't exist");
        error.value = "Conversation not found";
      }
    },
    (err) => {
      console.error("Error subscribing to conversation:", err);
      error.value = "Failed to load conversation";
    }
  );
};

// Subscribe to messages
const subscribeToMessages = (convId) => {
  if (!convId) return;

  try {
    // Clean up any existing subscription
    if (unsubscribeMessages.value) {
      unsubscribeMessages.value();
      unsubscribeMessages.value = null;
    }

    // Set up new subscription
    const unsubscribe = chatService.getChatMessages(convId, (newMessages) => {
      messages.value = newMessages.map(msg => {
        // Convert timestamp if it exists and has toDate method
        const timestamp = msg.timestamp?.toDate ? msg.timestamp.toDate() : msg.timestamp;
        return {
          ...msg,
          timestamp
        };
      });
      loading.value = false;
      scrollToBottom();
    });

    unsubscribeMessages.value = unsubscribe;
  } catch (error) {
    console.error("Error subscribing to messages:", error);
    error.value = "Failed to load messages";
    loading.value = false;
  }
};

// Send message
const sendMessage = async () => {
  // Ensure all required data is present and message is not empty
  const messageText = newMessage.value?.trim();
  if (!messageText) {
    console.warn('Message text is empty');
    return;
  }

  if (!route.params.conversationId || !currentUserId.value || !otherUserId.value) {
    console.warn('Missing required data for sending message');
    error.value = "Can't send message: missing chat information";
    return;
  }

  sending.value = true;
  try {
    const success = await chatService.sendMessage(
      route.params.conversationId, // Use correct route param name
      currentUserId.value,
      otherUserId.value,
      messageText,
      listingId.value // Pass listing ID if available
    );

    if (success) {
      newMessage.value = "";
      scrollToBottom();
      // Reset any previous errors
      error.value = null;
    } else {
      error.value = "Failed to send message";
    }
  } catch (err) {
    console.error("Error sending message:", err);
    error.value = "Failed to send message";
  } finally {
    sending.value = false;
  }
};

// Mark messages as read
const markMessagesAsRead = async () => {
  if (!route.params.conversationId || !currentUserId.value || !otherUserId.value) {
    console.warn('Missing required data for marking messages as read');
    return;
  }

  try {
    await chatService.markMessagesAsRead(
      route.params.conversationId,
      currentUserId.value,
      otherUserId.value
    );
  } catch (error) {
    console.error("Error marking messages as read:", error);
  }
};

// Format timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  try {
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

// Scroll to bottom of messages
const scrollToBottom = () => {
  const container = document.querySelector(".messages-container");
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
};

// Watch for changes in otherUserId and fetch user data accordingly
watch(otherUserId, async (newUserId, oldUserId) => {
  if (newUserId && newUserId !== oldUserId) {
    console.log("otherUserId changed, fetching user data:", newUserId);
    await fetchUserInfo(newUserId);
  }
});

// Watch for changes in listingId and fetch listing data accordingly
watch(listingId, async (newListingId) => {
  if (newListingId) {
    await fetchListingInfo(newListingId);
  }
});



// Auto-scroll to bottom when new messages arrive
watch(messages, () => {
  scrollToBottom();
}, { deep: true });

// Auto-mark messages as read when otherUserId changes
watch(otherUserId, () => {
  if (otherUserId.value && currentUserId.value && route.params.conversationId) {
    // Add console log for debugging
    console.log('Marking messages as read due to otherUserId change');
    markMessagesAsRead();
  }
});

// Also mark messages as read when messages are loaded
watch(messages, () => {
  if (messages.value.length > 0 && otherUserId.value && currentUserId.value) {
    // Add console log for debugging
    console.log('Marking messages as read due to messages update');
    markMessagesAsRead();
  }
});

// Setup listeners for chat and messages
const setupListeners = async () => {
  const chatId = route.params.conversationId; // Use the correct route param name
  if (!chatId || !currentUserId.value) {
    console.warn('Missing required data for setup');
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // Fetch chat data first
    const chatRef = doc(db, "chats", chatId);
    const chatDoc = await getDoc(chatRef);
    
    if (chatDoc.exists()) {
      const chatData = chatDoc.data();
      
      // Make sure we get a proper user ID for the other participant
      if (Array.isArray(chatData.participants) && chatData.participants.length > 0) {
        // Find the other user's ID that isn't the current user
        otherUserId.value = chatData.participants.find(
          id => id !== currentUserId.value
        );
        
        // If we couldn't find another participant, use seller/buyer fields if available
        if (!otherUserId.value && chatData.sellerId && chatData.buyerId) {
          otherUserId.value = currentUserId.value === chatData.sellerId
            ? chatData.buyerId
            : chatData.sellerId;
        }
      } else {
        console.warn("Chat has invalid participants structure:", chatData);
      }
      
      // Store listing information if available
      if (chatData.listingId) {
        listingId.value = chatData.listingId;
        
        // Fetch the listing information for display
        try {
          const listingDoc = await getDoc(doc(db, "listings", chatData.listingId));
          if (listingDoc.exists()) {
            const listingData = listingDoc.data();
            // Store listing data in conversation for the template to access
            conversation.value = {
              ...conversation.value,
              listingId: chatData.listingId,
              listingTitle: listingData.title,
              listingImage: listingData.images?.[0],
              listingPrice: listingData.price
            };
          }
        } catch (err) {
          console.error("Error fetching listing data:", err);
        }
      }

      // Now that we have otherUserId, subscribe to messages
      subscribeToMessages(chatId);

      // Mark messages as read
      await markMessagesAsRead();
    } else {
      error.value = "Chat not found";
      loading.value = false;
    }
  } catch (error) {
    console.error("Error setting up listeners:", error);
    error.value = "Failed to setup chat";
    loading.value = false;
  }
};

// Initialize - this function will be called when component mounts
const initialize = async () => {
  // Make sure we have a current user
  if (!currentUserId.value) {
    console.warn('No user logged in, redirecting to login');
    error.value = "Please log in to view chats";
    return;
  }
  
  // Make sure we have a chat ID
  if (!route.params.conversationId) {
    console.warn('No chat ID found in route');
    error.value = "Chat not found";
    return;
  }

  console.log(`Initializing chat ${route.params.conversationId} for user ${currentUserId.value}`);
  loading.value = true;
  error.value = null;
  
  try {
    await setupListeners();
    nextTick(() => scrollToBottom());
  } catch (err) {
    console.error('Error during initialization:', err);
    error.value = "Failed to load chat";
  } finally {
    loading.value = false;
  }
};

// Call initialize when component mounts
onMounted(initialize);

// Cleanup listeners
onUnmounted(() => {
  if (unsubscribeMessages.value && typeof unsubscribeMessages.value === 'function') {
    console.log("Unsubscribing from messages");
    unsubscribeMessages.value();
    unsubscribeMessages.value = null;
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Navbar />

    <main class="container mx-auto px-4 py-8 max-w-4xl">
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
      >
        <!-- Chat Header -->
        <div
          class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between"
        >
          <div class="flex items-center">
            <router-link
              to="/chats"
              class="mr-4 text-teal-600 hover:text-teal-700 dark:text-teal-400"
            >
              &lt; Back
            </router-link>
            <div class="flex items-center">
              <div
                v-if="userLoading"
                class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3 animate-pulse"
              >
                <span class="sr-only">Loading</span>
              </div>
              <img
                v-else-if="otherUser?.photoURL"
                :src="otherUser.photoURL"
                class="w-10 h-10 rounded-full mr-3"
                alt="User avatar"
              />
              <div
                v-else
                class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3"
              >
                <span class="text-gray-600 dark:text-gray-300 font-medium">
                  {{ otherUser?.displayName?.charAt(0) || "?" }}
                </span>
              </div>
              <div>
                <h1 class="font-semibold dark:text-white">
                  {{ chatTitle }}
                </h1>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  <!-- {{
                    otherUser?.displayName ||
                    (userLoading ? "Loading..." : "Unknown User")
                  }} -->
                </p>
              </div>
            </div>
          </div>


          <router-link
            v-if="conversation?.listingImage"
            :to="`/listings/${conversation.listingId}`"
            class="w-16 h-16 flex-shrink-0 relative group"
          >
            <img
              :src="conversation.listingImage"
              class="w-full h-full object-cover rounded shadow-md transition duration-300 group-hover:shadow-lg"
              :alt="conversation.listingTitle"
            />
            <div class="absolute inset-0 hover:backdrop-blur-sm hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center rounded">
              <span class="text-transparent group-hover:text-white text-xs font-medium">View</span>
            </div>
          </router-link>
        </div>

        <!-- Listing Information Panel (if chat is about a listing) -->
        <div v-if="conversation?.listingTitle" class="border-b border-gray-200 dark:border-gray-700 p-4 bg-teal-50 dark:bg-teal-900/20">
          <div class="flex items-center">
            <!-- <div class="flex-shrink-0 w-16 h-16 mr-4">
              <img 
                :src="conversation.listingImage" 
                class="w-full h-full object-cover rounded-md shadow-sm" 
                :alt="conversation.listingTitle" 
              />
            </div> -->
            <div class="flex-grow">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-white">Chatting about:</h3>
                  <h2 class="font-bold text-teal-700 dark:text-teal-300">{{ conversation.listingTitle }}</h2>
                </div>
                <div v-if="conversation.listingPrice" class="text-right">
                  <span class="text-sm text-gray-500 dark:text-gray-400">Price:</span>
                  <p class="font-semibold text-gray-900 dark:text-white">₦{{ conversation.listingPrice }}</p>
                </div>
              </div>
              <div class="mt-2">
                <router-link 
                  :to="`/listings/${conversation.listingId}`" 
                  class="text-sm text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 inline-flex items-center">
                  <span>View listing details</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Messages Container -->
        <div
          ref="messagesContainer"
          class="messages-container h-96 overflow-y-auto p-4 space-y-4"
        >
          <!-- Loading State -->
          <div v-if="loading" class="flex justify-center items-center h-full">
            <div
              class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"
            ></div>
          </div>

          <!-- Error State -->
          <div
            v-else-if="error"
            class="flex justify-center items-center h-full"
          >
            <div class="text-center p-4 bg-red-100 dark:bg-red-900 rounded-lg">
              <p class="text-red-600 dark:text-red-200">{{ error }}</p>
              <button
                @click="setupListeners"
                class="mt-2 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800"
              >
                Retry
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="messages.length === 0"
            class="flex justify-center items-center h-full text-center"
          >
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-12 w-12 text-gray-400 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p class="mt-4 text-gray-500 dark:text-gray-400">
                No messages yet. Start the conversation!
              </p>
            </div>
          </div>

          <!-- Messages -->
          <template v-else>
            <div
              v-for="message in messages"
              :key="message.id"
              :class="[
                'flex',
                message.senderId === currentUserId
                  ? 'justify-end'
                  : 'justify-start',
              ]"
            >
              <div
                :class="[
                  'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                  message.senderId === currentUserId
                    ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
                ]"
              >
                <p class="break-words">{{ message.text || message.content }}</p>
                <div class="flex justify-between items-end mt-1">
                  <p class="text-xs opacity-70">
                    {{ formatTimestamp(message.timestamp) }}
                  </p>
                  <span
                    v-if="message.senderId === currentUserId"
                    class="text-xs ml-2"
                  >
                    <span v-if="message.readBy && Array.isArray(message.readBy) && message.readBy.includes(otherUserId.value)" title="Read by recipient">✓✓</span>
                    <span v-else :title="'Not yet read by ' + otherUserId.value">✓</span>
                  </span>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Message Input -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-700">
          <form @submit.prevent="sendMessage" class="flex gap-2">
            <textarea
              v-model="newMessage"
              @keydown.enter.except.prevent="sendMessage"
              placeholder="Type your message..."
              class="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows="1"
              :disabled="sending"
            ></textarea>
            <button
              type="submit"
              :disabled="!newMessage.trim() || sending"
              class="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <span v-if="sending">Sending...</span>
              <span v-else>Send</span>
            </button>
          </form>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.messages-container {
  scroll-behavior: smooth;
}
</style>
