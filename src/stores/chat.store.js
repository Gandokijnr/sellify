import { defineStore } from "pinia";
import {
  startNewChat,
  sendMessage,
  subscribeToMessages,
  markMessagesAsRead,
  subscribeToConversations,
  deleteConversation,
  getUnreadChatsCount,
  reportConversation,
  blockUser,
  canMessageUser,
} from "@/services/chatService"; // Move your existing code to chatService.js

export const useChatStore = defineStore("chat", {
  actions: {
    async startNewChat(listingId, sellerId, buyerId) {
      return startNewChat(listingId, sellerId, buyerId);
    },

    async sendMessage(conversationId, senderId, messageData) {
      return sendMessage(conversationId, senderId, messageData);
    },

    subscribeToMessages(conversationId, userId, callback) {
      return subscribeToMessages(conversationId, userId, callback);
    },

    async markMessagesAsRead(conversationId, userId) {
      return markMessagesAsRead(conversationId, userId);
    },

    subscribeToConversations(userId, callback) {
      return subscribeToConversations(userId, callback);
    },

    async deleteConversation(conversationId, userId, hardDelete = false) {
      return deleteConversation(conversationId, userId, hardDelete);
    },

    async getUnreadChatsCount(userId) {
      return getUnreadChatsCount(userId);
    },

    async reportConversation(conversationId, messageId, reporterId, reason) {
      return reportConversation(conversationId, messageId, reporterId, reason);
    },

    async blockUser(currentUserId, userToBlockId) {
      return blockUser(currentUserId, userToBlockId);
    },

    async canMessageUser(userId, otherUserId) {
      return canMessageUser(userId, otherUserId);
    },
  },
});
