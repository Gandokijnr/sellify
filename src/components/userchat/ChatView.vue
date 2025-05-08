<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import Navbar from "@/components/common/Navbar.vue";
import Footer from "@/components/common/Footer.vue";
import { useChatStore } from "@/stores/chat.store";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const chatStore = useChatStore();
const route = useRoute();
const router = useRouter();

const { currentUser } = storeToRefs(authStore);
const messages = ref([]);
const newMessage = ref("");
const conversationData = ref(null);
const otherUserInfo = ref(null);
const listingInfo = ref(null);
const unsubscribeMessages = ref(null);
const unsubscribeConversation = ref(null);
const sending = ref(false);

// Computed properties
const isSeller = computed(() => {
  return (
    conversationData.value?.participants?.sellerId === currentUser.value?.uid
  );
});

const otherUserId = computed(() => {
  if (!conversationData.value?.participants) return null;
  const { sellerId, buyerId } = conversationData.value.participants;
  return currentUser.value?.uid === sellerId ? buyerId : sellerId;
});

const chatTitle = computed(() => {
  return conversationData.value?.listingTitle
    ? `Chat about ${conversationData.value.listingTitle}`
    : "Chat";
});

const isActiveConversation = computed(() => {
  return conversationData.value?.active !== false;
});

// Fetch user information
const fetchUserInfo = async (userId) => {
  try {
    if (!userId) return;
    const userDoc = await getDoc(doc(db, "users", userId));
    otherUserInfo.value = userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error("Error fetching user info:", error);
    otherUserInfo.value = null;
  }
};

// Fetch listing information
const fetchListingInfo = async () => {
  try {
    const listingId = conversationData.value?.listingId;
    if (!listingId) return;

    const listingDoc = await getDoc(doc(db, "listings", listingId));
    listingInfo.value = listingDoc.exists() ? listingDoc.data() : null;
  } catch (error) {
    console.error("Error fetching listing info:", error);
    listingInfo.value = null;
  }
};

// Send message handler
const sendMessage = async () => {
  if (!newMessage.value.trim() || !isActiveConversation.value || sending.value)
    return;

  sending.value = true;
  try {
    await chatStore.sendMessage(
      route.params.conversationId,
      currentUser.value.uid,
      {
        content: newMessage.value.trim(),
        type: "text",
      }
    );
    newMessage.value = "";
  } catch (error) {
    console.error("Error sending message:", error);
  } finally {
    sending.value = false;
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

// Setup real-time listeners
const setupListeners = async () => {
  if (!currentUser.value) {
    router.push("/login");
    return;
  }

  if (!route.params.conversationId) {
    router.push("/chats");
    return;
  }

  // Subscribe to conversation data
  unsubscribeConversation.value = chatStore.subscribeToConversations(
    route.params.conversationId,
    async (conversation) => {
      conversationData.value = conversation;
      if (otherUserId.value) {
        await fetchUserInfo(otherUserId.value);
      }
      await fetchListingInfo();
    }
  );

  // Subscribe to messages
  unsubscribeMessages.value = chatStore.subscribeToMessages(
    route.params.conversationId,
    currentUser.value.uid,
    (msgs) => {
      messages.value = msgs;
      setTimeout(scrollToBottom, 100);
    }
  );

  // Mark messages as read when opening chat
  await chatStore.markMessagesAsRead(
    route.params.conversationId,
    currentUser.value.uid
  );
};

// Cleanup listeners
onUnmounted(() => {
  unsubscribeMessages.value?.();
  unsubscribeConversation.value?.();
});

// Initialize
onMounted(() => {
  setupListeners();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Navbar />

    <main class="container mx-auto px-4 py-8 max-w-3xl">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <!-- Chat Header -->
        <div
          class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between"
        >
          <div class="flex items-center">
            <router-link
              to="/chats"
              class="mr-4 text-green-600 hover:text-green-700 dark:text-green-400"
            >
              &lt; Back to chats
            </router-link>
            <div class="flex items-center">
              <img
                v-if="otherUserInfo?.photoURL"
                :src="otherUserInfo.photoURL"
                class="w-10 h-10 rounded-full mr-3"
              />
              <div
                v-else
                class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3"
              >
                <span class="text-gray-600 dark:text-gray-300 font-medium">
                  {{ otherUserInfo?.displayName?.charAt(0) || "?" }}
                </span>
              </div>
              <div>
                <h1 class="font-semibold dark:text-white">
                  {{ chatTitle }}
                </h1>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ isSeller ? "Buyer" : "Seller" }}:
                  {{ otherUserInfo?.displayName || "User" }}
                </p>
              </div>
            </div>
          </div>

          <router-link
            v-if="conversationData?.listingImage"
            :to="`/listings/${conversationData.listingId}`"
            class="w-16 h-16 flex-shrink-0"
          >
            <img
              :src="conversationData.listingImage"
              class="w-full h-full object-cover rounded"
              :alt="conversationData.listingTitle"
            />
          </router-link>
        </div>

        <!-- Messages Container -->
        <div class="messages-container h-96 overflow-y-auto p-4 space-y-4">
          <div
            v-for="message in messages"
            :key="message.id"
            :class="[
              'flex',
              message.senderId === currentUser?.uid
                ? 'justify-end'
                : 'justify-start',
            ]"
          >
            <div
              :class="[
                'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                message.senderId === currentUser?.uid
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
              ]"
            >
              <p class="break-words">{{ message.content }}</p>
              <div class="flex justify-between items-end mt-1">
                <p class="text-xs opacity-70">
                  {{ formatTimestamp(message.timestamp) }}
                </p>
                <span
                  v-if="message.senderId === currentUser?.uid"
                  class="text-xs ml-2"
                >
                  <span v-if="message.read">✓✓</span>
                  <span v-else>✓</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Message Input -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-700">
          <form @submit.prevent="sendMessage" class="flex gap-2">
            <textarea
              v-model="newMessage"
              @keydown.enter.except.prevent="sendMessage"
              placeholder="Type your message..."
              class="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows="1"
              :disabled="!isActiveConversation || sending"
            ></textarea>
            <button
              type="submit"
              :disabled="!newMessage.trim() || !isActiveConversation || sending"
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <span v-if="sending">Sending...</span>
              <span v-else>Send</span>
            </button>
          </form>

          <div
            v-if="!isActiveConversation"
            class="text-sm text-red-500 dark:text-red-400 mt-2"
          >
            This conversation has been archived and is no longer active.
          </div>
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
