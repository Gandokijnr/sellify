<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  addDoc,
  serverTimestamp,
  getDoc,
  getDocs,
  updateDoc,
  increment,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useAuthStore } from "@/stores/auth";
import Navbar from "@/components/common/Navbar.vue";
import Footer from "@/components/common/Footer.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const messages = ref([]);
const newMessage = ref("");
const loading = ref(true);
const error = ref(null);
const chatId = ref(null);
const otherUser = ref(null);
const unsubscribeMessages = ref(null);
const sending = ref(false);
const messagesContainer = ref(null);

// Get the seller ID from route params or query params
const sellerId = computed(() => {
  // First check route params
  if (route.params.sellerId) {
    return route.params.sellerId;
  }

  // Fall back to query params if available
  if (route.query.sellerId) {
    return route.query.sellerId;
  }

  return null;
});

const currentUserId = computed(() => authStore.user?.uid || null);

// Watch for changes in route or auth state
watch([sellerId, currentUserId], ([newSellerId, newUserId]) => {
  if (newSellerId && newUserId && newSellerId !== newUserId) {
    // Only reinitialize if we have both IDs and they're not the same user
    initializeChat();
  }
});

// Determine which messages are from the current user
const isCurrentUserMessage = (message) => {
  return message.senderId === currentUserId.value;
};

// Find or create a chat between the current user and the seller
const findOrCreateChat = async () => {
  try {
    // Validate required user IDs before proceeding
    if (!currentUserId.value) {
      console.error("Current user ID is missing");
      error.value = "You must be logged in to chat.";
      return null;
    }

    if (!sellerId.value) {
      console.error("Seller ID is missing");
      error.value = "Invalid seller profile. Missing seller ID.";
      return null;
    }

    // First, check if a chat already exists between these two users
    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("participants", "array-contains", currentUserId.value)
    );

    const querySnapshot = await getDocs(q);
    let existingChat = null;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (
        data.participants &&
        Array.isArray(data.participants) &&
        data.participants.includes(sellerId.value)
      ) {
        existingChat = { id: doc.id, ...data };
      }
    });

    if (existingChat) {
      // Use existing chat
      chatId.value = existingChat.id;
      return existingChat.id;
    } else {
      // Create a new chat document
      const chatData = {
        participants: [currentUserId.value, sellerId.value],
        lastMessage: { text: "" },
        lastUpdated: serverTimestamp(),
        [`unread_${sellerId.value}`]: 0,
        [`unread_${currentUserId.value}`]: 0,
      };

      // Make sure all values in chatData are defined
      Object.keys(chatData).forEach((key) => {
        if (chatData[key] === undefined) {
          console.warn(`Fixing undefined value for ${key} in chatData`);
          chatData[key] = null; // Replace undefined with null for Firestore
        }
      });

      const newChatRef = await addDoc(chatsRef, chatData);
      chatId.value = newChatRef.id;
      return newChatRef.id;
    }
  } catch (err) {
    console.error("Error finding or creating chat:", err);
    error.value = "Failed to load or create chat.";
    return null;
  }
};

// Fetch other user's info
const fetchOtherUserInfo = async () => {
  try {
    // Check if sellerId is valid before proceeding
    if (!sellerId.value) {
      console.error("No seller ID available");
      error.value = "Missing seller information.";
      otherUser.value = { displayName: "Unknown User" };
      return;
    }

    const userDoc = await getDoc(doc(db, "users", sellerId.value));
    if (userDoc.exists()) {
      otherUser.value = { id: userDoc.id, ...userDoc.data() };
    } else {
      console.error("Seller document doesn't exist");
      error.value = "Seller profile not found.";
      otherUser.value = { id: sellerId.value, displayName: "Unknown User" };
    }
  } catch (err) {
    console.error("Error fetching user info:", err);
    error.value = "Error loading seller information.";
    // Set a default user to prevent further errors
    otherUser.value = { displayName: "Unknown User" };
  }
};

// Send a new message
const sendMessage = async () => {
  if (!newMessage.value.trim() || !chatId.value || sending.value) return;

  sending.value = true;
  try {
    const messageData = {
      text: newMessage.value.trim(),
      senderId: currentUserId.value,
      timestamp: serverTimestamp(),
      read: false,
    };

    // Add message to the messages subcollection
    const messagesRef = collection(db, "chats", chatId.value, "messages");
    await addDoc(messagesRef, messageData);

    // Update the chat document with the last message and timestamp
    const chatRef = doc(db, "chats", chatId.value);
    await updateDoc(chatRef, {
      lastMessage: { text: messageData.text },
      lastUpdated: serverTimestamp(),
      [`unread_${sellerId.value}`]: increment(1),
    });

    // Clear the input
    newMessage.value = "";

    // Scroll to bottom after sending
    setTimeout(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop =
          messagesContainer.value.scrollHeight;
      }
    }, 100);
  } catch (err) {
    console.error("Error sending message:", err);
    error.value = "Failed to send message.";
  } finally {
    sending.value = false;
  }
};

// Mark messages as read
const markMessagesAsRead = async () => {
  if (!chatId.value) return;

  try {
    // Update the chat document to clear unread count for current user
    const chatRef = doc(db, "chats", chatId.value);
    await updateDoc(chatRef, {
      [`unread_${currentUserId.value}`]: 0,
    });

    // Optionally, mark individual messages as read
    const messagesRef = collection(db, "chats", chatId.value, "messages");
    const q = query(
      messagesRef,
      where("senderId", "==", sellerId.value),
      where("read", "==", false)
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();
  } catch (err) {
    console.error("Error marking messages as read:", err);
  }
};

// Format timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";

  try {
    // Check if timestamp is a Firestore Timestamp that needs conversion
    if (typeof timestamp.toDate === "function") {
      const date = timestamp.toDate();
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString();
    } else {
      // Handle case where timestamp might be a different format
      return "Unknown time";
    }
  } catch (err) {
    console.error("Error formatting timestamp:", err);
    return "Unknown time";
  }
};

// Scroll to the bottom of the messages container
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// Redirect to listings page with error
const redirectToListings = () => {
  router.push({
    name: "listings",
    query: {
      error: "Invalid chat. Please select a valid seller to chat with.",
    },
  });
};

// Initialize chat (can be called when params change or component mounts)
const initializeChat = async () => {
  loading.value = true;
  error.value = null;

  // Reset state when reinitializing
  if (unsubscribeMessages.value) {
    unsubscribeMessages.value();
    unsubscribeMessages.value = null;
  }

  messages.value = [];
  chatId.value = null;
  otherUser.value = null;

  try {
    // First check if user is authenticated
    if (!authStore.user || !authStore.user.uid) {
      console.error("User not logged in");
      error.value = "You must be logged in to view this chat.";
      loading.value = false;
      return;
    }

    // Check if sellerId is available
    if (!sellerId.value) {
      console.error("No seller ID available");
      error.value = "Invalid chat. Seller information is missing.";
      loading.value = false;
      // Consider redirecting to listings page after a delay
      setTimeout(redirectToListings, 3000);
      return;
    }

    // Fetch other user's info
    await fetchOtherUserInfo();

    // Find or create a chat
    const activeChatId = await findOrCreateChat();

    if (activeChatId) {
      // Subscribe to messages in this chat
      const messagesRef = collection(db, "chats", activeChatId, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));

      unsubscribeMessages.value = onSnapshot(
        q,
        (snapshot) => {
          try {
            const newMessages = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              newMessages.push({
                id: doc.id,
                ...data,
                timestamp: data.timestamp, // This will be a Firestore Timestamp
              });
            });

            messages.value = newMessages;
            loading.value = false;

            // Mark messages as read when they're loaded
            markMessagesAsRead();

            // Scroll to bottom after messages load
            setTimeout(scrollToBottom, 100);
          } catch (err) {
            console.error("Error processing messages snapshot:", err);
            error.value = "Error loading messages.";
            loading.value = false;
          }
        },
        (err) => {
          // Handle snapshot error
          console.error("Error in messages snapshot listener:", err);
          error.value = "Error listening for new messages.";
          loading.value = false;
        }
      );
    } else {
      loading.value = false;
    }
  } catch (err) {
    console.error("Error initializing chat:", err);
    error.value = "Failed to load chat history.";
    loading.value = false;
  }
};

// Initialize everything when component mounts
onMounted(() => {
  initializeChat();
});

// Clean up when component unmounts
onUnmounted(() => {
  if (unsubscribeMessages.value) {
    unsubscribeMessages.value();
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
              :to="{ name: 'chats' }"
              class="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </router-link>

            <div v-if="otherUser" class="flex items-center">
              <div class="relative">
                <img
                  v-if="otherUser.photoURL"
                  :src="otherUser.photoURL"
                  :alt="`${otherUser.displayName}'s profile`"
                  class="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700"
                />
                <div
                  v-else
                  class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg font-medium text-gray-600 dark:text-gray-300"
                >
                  {{
                    otherUser.displayName
                      ? otherUser.displayName.charAt(0).toUpperCase()
                      : "?"
                  }}
                </div>
              </div>

              <div class="ml-3">
                <h2 class="font-semibold text-gray-900 dark:text-white">
                  {{ otherUser.displayName || "Unknown User" }}
                </h2>
                <p
                  v-if="otherUser.status"
                  class="text-xs text-gray-500 dark:text-gray-400"
                >
                  {{ otherUser.status }}
                </p>
              </div>
            </div>

            <div v-else class="flex items-center animate-pulse">
              <div
                class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"
              ></div>
              <div class="ml-3">
                <div
                  class="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Banner for Missing Seller ID -->
        <div
          v-if="!sellerId"
          class="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100"
        >
          <p class="text-center">
            Missing seller information. Redirecting to listings page...
          </p>
        </div>

        <!-- Chat Messages -->
        <div
          class="h-96 p-4 overflow-y-auto flex flex-col space-y-4"
          ref="messagesContainer"
        >
          <!-- Loading State -->
          <div v-if="loading" class="flex justify-center items-center h-full">
            <div
              class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"
            ></div>
          </div>

          <!-- Error State -->
          <div
            v-else-if="error"
            class="flex justify-center items-center h-full"
          >
            <div class="text-center">
              <p class="text-red-500">{{ error }}</p>
              <button
                @click="initializeChat"
                class="mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="messages.length === 0 && !error && !loading"
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
              v-for="(message, index) in messages"
              :key="message.id"
              :class="[
                'flex',
                isCurrentUserMessage(message) ? 'justify-end' : 'justify-start',
                index === 0 ||
                (messages[index - 1] &&
                  messages[index - 1].senderId !== message.senderId)
                  ? 'mt-4'
                  : 'mt-1',
              ]"
            >
              <div
                :class="[
                  'max-w-xs md:max-w-md px-4 py-2 rounded-lg',
                  isCurrentUserMessage(message)
                    ? 'bg-green-500 text-white rounded-br-none'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none',
                ]"
              >
                <p>{{ message.text }}</p>
                <p
                  :class="[
                    'text-xs mt-1 text-right',
                    isCurrentUserMessage(message)
                      ? 'text-green-100'
                      : 'text-gray-500 dark:text-gray-400',
                  ]"
                >
                  {{
                    message.timestamp
                      ? formatTimestamp(message.timestamp)
                      : "Sending..."
                  }}
                </p>
              </div>
            </div>
          </template>
        </div>

        <!-- Message Input -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-700">
          <form
            @submit.prevent="sendMessage"
            class="flex items-center space-x-2"
          >
            <input
              v-model="newMessage"
              type="text"
              placeholder="Type your message..."
              class="flex-1 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-400 dark:focus:border-green-400 transition-colors"
              :disabled="sending || !sellerId || error"
            />
            <button
              type="submit"
              class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              :disabled="!newMessage.trim() || sending || !sellerId || error"
            >
              <svg
                v-if="sending"
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>
