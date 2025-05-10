<!-- ConversationList.vue -->
<script setup>
import ConversationItem from './ConversationItem.vue';

defineProps({
  chats: {
    type: Array,
    required: true
  },
  getOtherUser: {
    type: Function,
    required: true
  }
});
</script>

<template>
  <div>
    <ConversationItem
      v-for="chat in chats"
      :key="chat.id"
      :chat="chat"
      :other-user="getOtherUser(chat)"
    />
  </div>
</template>