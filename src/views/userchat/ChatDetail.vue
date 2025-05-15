<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  serverTimestamp,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useAuthStore } from "@/stores/auth";
import Navbar from "@/components/common/Navbar.vue";
import Footer from "@/components/common/Footer.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// Reactive state
const messages = ref([]);
const newMessage = ref("");
const loading = ref(true);
const error = ref(null);
const conversation = ref(null);
const otherUser = ref(null);
const listingInfo = ref(null);
const unsubscribeMessages = ref(null);
const unsubscribeConversation = ref(null);
const sending = ref(false);
const messagesContainer = ref(null);
const userLoading = ref(false);

// Computed properties
const currentUserId = computed(() => authStore.user?.uid);
const conversationId = computed(() => route.params.conversationId);

const isSeller = computed(() => {
  return conversation.value?.participants?.sellerId === currentUserId.value;
});

const otherUserId = computed(() => {
  if (!conversation.value?.participants) return null;
  const { sellerId, buyerId } = conversation.value.participants;
  return currentUserId.value === sellerId ? buyerId : sellerId;
});

const chatTitle = computed(() => {
  return conversation.value?.listingTitle
    ? `Chat about ${conversation.value.listingTitle}`
    : "Chat";
});

// Fetch user information
const fetchUserInfo = async (userId) => {
  try {
    if (!userId) {
      console.warn("No userId provided to fetchUserInfo");
      return;
    }

    userLoading.value = true;
    console.log("Fetching user info for:", userId);

    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      otherUser.value = userDoc.data();
      console.log("User data fetched:", otherUser.value);
    } else {
      console.warn("User document doesn't exist for ID:", userId);
      otherUser.value = null;
    }
  } catch (error) {
    console.error("Error fetching user info:", error);
    otherUser.value = null;
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
  if (!convId) return null;

  console.log("Subscribing to messages for conversation:", convId);
  const messagesRef = collection(db, "conversations", convId, "messages");
  const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));

  return onSnapshot(
    messagesQuery,
    (querySnap) => {
      const msgs = [];
      querySnap.forEach((doc) => {
        msgs.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      messages.value = msgs;
      loading.value = false;
      console.log("Messages received:", msgs.length);
      setTimeout(scrollToBottom, 100);
    },
    (err) => {
      console.error("Error subscribing to messages:", err);
      error.value = "Failed to load messages";
      loading.value = false;
    }
  );
};

// Send message
const sendMessage = async () => {
  if (
    !newMessage.value.trim() ||
    sending.value ||
    !conversationId.value ||
    !currentUserId.value
  )
    return;

  sending.value = true;
  try {
    const messagesRef = collection(
      db,
      "conversations",
      conversationId.value,
      "messages"
    );

    // Create the message document
    await addDoc(messagesRef, {
      content: newMessage.value.trim(),
      senderId: currentUserId.value,
      timestamp: serverTimestamp(),
      type: "text",
      read: false,
    });

    // Update the lastMessage in the conversation document
    await updateDoc(doc(db, "conversations", conversationId.value), {
      lastMessage: newMessage.value.trim(),
      lastMessageTimestamp: serverTimestamp(),
    });

    newMessage.value = "";
  } catch (error) {
    console.error("Error sending message:", error);
    error.value = "Failed to send message";
  } finally {
    sending.value = false;
  }
};

// Mark messages as read
const markMessagesAsRead = async () => {
  if (!conversationId.value || !currentUserId.value) return;

  try {
    const messagesRef = collection(
      db,
      "conversations",
      conversationId.value,
      "messages"
    );
    const unreadQuery = query(
      messagesRef,
      where("senderId", "!=", currentUserId.value),
      where("read", "==", false)
    );

    const unreadDocs = await getDocs(unreadQuery);

    const updatePromises = [];
    unreadDocs.forEach((doc) => {
      updatePromises.push(updateDoc(doc.ref, { read: true }));
    });

    await Promise.all(updatePromises);
    console.log(`Marked ${updatePromises.length} messages as read`);
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

// Watch for changes in conversation and fetch listing data accordingly
watch(conversation, async (newConversation) => {
  if (newConversation?.listingId) {
    await fetchListingInfo(newConversation.listingId);
  }
});

// Setup listeners
const setupListeners = async () => {
  if (!currentUserId.value) {
    console.warn("No current user ID available, redirecting to login");
    router.push("/login");
    return;
  }

  if (!conversationId.value) {
    console.warn("No conversation ID provided, redirecting to chats");
    router.push("/chats");
    return;
  }

  try {
    loading.value = true;

    // Subscribe to conversation data
    unsubscribeConversation.value = subscribeToConversation(
      conversationId.value
    );

    // Subscribe to messages
    unsubscribeMessages.value = subscribeToMessages(conversationId.value);

    // Mark messages as read when opening chat
    await markMessagesAsRead();

    // Set up interval to periodically mark messages as read
    const readInterval = setInterval(markMessagesAsRead, 5000);

    // Cleanup interval on unmount
    onUnmounted(() => {
      clearInterval(readInterval);
    });
  } catch (err) {
    console.error("Error setting up listeners:", err);
    error.value = "Failed to load chat data";
    loading.value = false;
  }
};

// Cleanup listeners
onUnmounted(() => {
  if (unsubscribeMessages.value) {
    console.log("Unsubscribing from messages");
    unsubscribeMessages.value();
  }

  if (unsubscribeConversation.value) {
    console.log("Unsubscribing from conversation");
    unsubscribeConversation.value();
  }
});

// Initialize
onMounted(() => {
  console.log("Chat component mounted, setting up listeners");
  setupListeners();
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
              &lt; Back to chats
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
                  {{ isSeller ? "Buyer" : "Seller" }}:
                  {{
                    otherUser?.displayName ||
                    (userLoading ? "Loading..." : "Unknown User")
                  }}
                </p>
              </div>
            </div>
          </div>

          <router-link
            v-if="conversation?.listingImage"
            :to="`/listings/${conversation.listingId}`"
            class="w-16 h-16 flex-shrink-0"
          >
            <img
              :src="conversation.listingImage"
              class="w-full h-full object-cover rounded"
              :alt="conversation.listingTitle"
            />
          </router-link>
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
                <p class="break-words">{{ message.content }}</p>
                <div class="flex justify-between items-end mt-1">
                  <p class="text-xs opacity-70">
                    {{ formatTimestamp(message.timestamp) }}
                  </p>
                  <span
                    v-if="message.senderId === currentUserId"
                    class="text-xs ml-2"
                  >
                    <span v-if="message.read">✓✓</span>
                    <span v-else>✓</span>
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
