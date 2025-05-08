<template>
  <div class="flex flex-col h-[500px] border rounded-lg">
    <!-- Header -->
    <div class="p-4 border-b flex items-center">
      <img :src="otherUser.photoURL" class="w-10 h-10 rounded-full" />
      <div class="ml-3">
        <h3 class="font-medium">{{ otherUser.displayName }}</h3>
        <p class="text-xs text-gray-500">
          {{ typing ? "Typing..." : lastActive }}
        </p>
      </div>
    </div>

    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3">
      <MessageItem
        v-for="message in messages"
        :key="message.id"
        :message="message"
        :is-current-user="message.senderId === currentUser.uid"
      />
    </div>

    <!-- Input -->
    <div class="p-4 border-t">
      <form @submit.prevent="sendMessage">
        <div class="flex">
          <input
            v-model="newMessage"
            @input="handleTyping"
            class="flex-1 border rounded-l-lg p-2 focus:outline-none"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            class="bg-jiji-primary text-white px-4 rounded-r-lg"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";
import MessageItem from "./MessageItem.vue";

const props = defineProps({
  conversationId: String,
  currentUser: Object,
  otherUser: Object,
});

const messages = ref([]);
const newMessage = ref("");
const typing = ref(false);
const messagesContainer = ref(null);

// Real-time subscription
const unsubscribe = subscribeToMessages(
  props.conversationId,
  (updatedMessages) => {
    messages.value = updatedMessages;
    scrollToBottom();
  }
);

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  await sendMessage(
    props.conversationId,
    props.currentUser.uid,
    newMessage.value
  );
  newMessage.value = "";
};

const scrollToBottom = () => {
  nextTick(() => {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  });
};

// Cleanup on unmount
onUnmounted(() => unsubscribe());
</script>
