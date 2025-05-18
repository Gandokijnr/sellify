import { defineStore } from "pinia";
import chatService from "@/utils/chatService";
import { doc, getDoc, collection, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

export const useChatStore = defineStore("chat", {
  state: () => ({
    activeChatInfo: null,
    recentChats: [],
  }),
  
  actions: {
    /**
     * Start a new chat or get existing one with comprehensive user verification
     * @returns {Object} Full chat information including user details and listing info
     */
    async startNewChat(listingId, sellerId, buyerId) {
      try {
        // Call the enhanced chatService.startNewChat that verifies both users
        const chatInfo = await chatService.startNewChat(listingId, sellerId, buyerId);
        
        // Store the active chat info in the store for quick access
        this.activeChatInfo = chatInfo;
        
        return chatInfo;
      } catch (error) {
        console.error('Failed to start chat with verified users:', error);
        throw error;
      }
    },

    async sendMessage(chatId, senderId, messageData) {
      try {
        // Get the chat information to determine the receiver
        const chatRef = doc(db, "chats", chatId);
        const chatSnap = await getDoc(chatRef);
        
        if (!chatSnap.exists()) {
          throw new Error(`Chat with ID ${chatId} not found`);
        }
        
        const chatData = chatSnap.data();
        const participants = chatData.participants || [];
        const receiverId = participants.find(id => id !== senderId);
        
        if (!receiverId) {
          throw new Error('Could not determine message recipient');
        }
        
        // Handle different parameter formats - support both direct text and message object
        let content, type;
        
        if (typeof messageData === 'string') {
          // Simple text message
          content = messageData;
          type = 'text';
        } else if (messageData && typeof messageData === 'object') {
          // Object with content and type
          content = messageData.content;
          type = messageData.type || 'text';
          
          // Validate content is actually provided
          if (!content) {
            throw new Error('Message content is required');
          }
        } else {
          throw new Error('Invalid message data format');
        }
        
        // Sanitize and validate content
        if (typeof content !== 'string') {
          content = String(content);
        }
        
        // Add the message to the messages subcollection with only required fields
        const messagesRef = collection(db, `chats/${chatId}/messages`);
        const messageRef = await addDoc(messagesRef, {
          senderId,
          receiverId,
          content,
          type,
          timestamp: serverTimestamp(),
          read: false,
        });
        
        // Update the chat document with the last message info
        await updateDoc(doc(db, "chats", chatId), {
          lastMessage: content,
          lastMessageType: type,
          lastSenderId: senderId,
          lastUpdated: serverTimestamp(),
          [`unread_${receiverId}`]: chatService.increment(1),
        });
        
        return messageRef.id;
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    },

    subscribeToMessages(chatId, userId, callback) {
      return chatService.getChatMessages(chatId, callback);
    },

    async markMessagesAsRead(chatId, userId, senderId) {
      await chatService.markMessagesAsRead(chatId, userId, senderId);
    },

    subscribeToConversations(userId, callback) {
      return chatService.getUserChats(userId, callback);
    },

    async deleteConversation(conversationId) {
      await chatService.deleteConversation(conversationId);
    },

    async getUnreadChatsCount(userId) {
      return chatService.getUnreadChatsCount(userId);
    },

    async reportConversation(conversationId, messageId, reporterId, reason) {
      await chatService.reportConversation(conversationId, messageId, reporterId, reason);
    },

    async blockUser(currentUserId, userToBlockId) {
      await chatService.blockUser(currentUserId, userToBlockId);
    },

    async canMessageUser(userId, otherUserId) {
      return chatService.canMessageUser(userId, otherUserId);
    }
  }
});
