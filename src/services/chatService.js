import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  limit,
  getDocs,
  deleteDoc,
  or,
  arrayUnion,
  increment,
} from "firebase/firestore";
import { db } from "@/firebase";
import offlineStorage from "./offlineStorage";

// Check if the browser supports push notifications
const isPushSupported = 'serviceWorker' in navigator && 'PushManager' in window;

/**
 * Service for managing chat operations with offline support
 */
export const chatService = {
  // Request push notification permission
  async requestNotificationPermission() {
    if (!isPushSupported) return false;
    
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  },

  // Subscribe to push notifications
  async subscribeToPush() {
    if (!isPushSupported) return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY
      });
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  },
  /**
   * Create a new chat conversation between a buyer and seller for a specific listing
   * @returns {Object} Chat information including chat ID, seller and buyer info, and listing details
   */
  async startNewChat(listingId, sellerId, buyerId) {
    try {
      // Verify both users exist and are authenticated
      const sellerDoc = await getDoc(doc(db, "users", sellerId));
      const buyerDoc = await getDoc(doc(db, "users", buyerId));
      
      if (!sellerDoc.exists()) {
        throw new Error(`Seller with ID ${sellerId} not found or not authenticated`);
      }
      
      if (!buyerDoc.exists()) {
        throw new Error(`Buyer with ID ${buyerId} not found or not authenticated`);
      }
      
      // Get seller and buyer information
      const sellerData = sellerDoc.data();
      const buyerData = buyerDoc.data();
      
      // Check for existing chat
      const existingChatQuery = query(
        collection(db, "chats"),
        where("listingId", "==", listingId),
        where("participants", "array-contains", sellerId),
        where("participants", "array-contains", buyerId)
      );

      const querySnapshot = await getDocs(existingChatQuery);
      if (!querySnapshot.empty) {
        // Return existing chat with enhanced information
        const chatId = querySnapshot.docs[0].id;
        const chatData = querySnapshot.docs[0].data();
        
        return {
          chatId,
          chatData,
          sellerInfo: sellerData,
          buyerInfo: buyerData,
          listingId
        };
      }

      // Fetch listing information
      const listingDoc = await getDoc(doc(db, "listings", listingId));
      if (!listingDoc.exists()) {
        throw new Error(`Listing with ID ${listingId} not found`);
      }
      
      const listingData = listingDoc.data();
      
      // Create new chat
      const chatRef = doc(collection(db, "chats"));
      
      // Prepare chat data with detailed user information
      const chatData = {
        participants: [sellerId, buyerId],
        sellerId,
        buyerId,
        sellerName: sellerData.displayName || "Seller",
        buyerName: buyerData.displayName || "Buyer",
        sellerPhotoURL: sellerData.photoURL || null,
        buyerPhotoURL: buyerData.photoURL || null,
        listingId,
        listingTitle: listingData.title,
        listingImage: listingData.images?.[0] || null,
        listingPrice: listingData.price,
        lastUpdated: serverTimestamp(),
        lastMessage: null,
        [`unread_${sellerId}`]: 0,
        [`unread_${buyerId}`]: 0,
        created: serverTimestamp()
      };
      
      // Create the chat document
      await setDoc(chatRef, chatData);

      // Return comprehensive information about the new chat
      return {
        chatId: chatRef.id,
        chatData,
        sellerInfo: sellerData,
        buyerInfo: buyerData,
        listingInfo: {
          id: listingId,
          title: listingData.title,
          price: listingData.price,
          image: listingData.images?.[0] || null
        }
      };
    } catch (error) {
      console.error("Error creating new conversation:", error);
      throw error;
    }
  },

  /**
   * Send a message in a conversation
   */
  async sendMessage(conversationId, senderId, messageData) {
    try {
      // Prepare message data
      const messageRef = doc(collection(db, `chats/${conversationId}/messages`));
      const timestamp = serverTimestamp();

      // Add read status for all participants
      const chatDoc = await getDoc(doc(db, "chats", conversationId));
      if (!chatDoc.exists()) {
        throw new Error(`Chat with ID ${conversationId} not found`);
      }

      const chatData = chatDoc.data();
      const participants = chatData.participants || [];

      // Initialize readBy object with all participants marked as unread
      const readBy = {};
      participants.forEach(participantId => {
        readBy[participantId] = participantId === senderId;
      });

      // Store message in Firestore
      const message = {
        ...messageData,
        senderId,
        timestamp,
        readBy
      };

      // Try to send message online first
      try {
        await setDoc(messageRef, message);

        // Update chat document with last message
        const chatRef = doc(db, "chats", conversationId);
        await updateDoc(chatRef, {
          lastMessage: message,
          lastUpdated: timestamp,
          // Increment unread count for other participants
          ...Object.fromEntries(
            participants
              .filter(id => id !== senderId)
              .map(id => [`unread_${id}`, increment(1)])
          )
        });

        return messageRef.id;
      } catch (error) {
        // If offline, store in IndexedDB for later sync
        if (!navigator.onLine) {
          await offlineStorage.storeMessage({
            id: messageRef.id,
            conversationId,
            message
          });
          return messageRef.id;
        }
        throw error;
      }
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  /**
   * Subscribe to messages in a conversation
   */
  subscribeToMessages(conversationId, userId, callback) {
    // Get cached messages first if available
    offlineStorage.getCachedChat(conversationId).then(cachedChat => {
      if (cachedChat) {
        callback(cachedChat.messages || []);
      }
    }).catch(err => {
      console.error('Error getting cached chat:', err);
    });
    
    // Set up real-time listener
    const q = query(
      collection(db, `chats/${conversationId}/messages`),
      orderBy("timestamp", "asc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date()
        });
      });
      
      // Cache messages for offline use
      offlineStorage.cacheMessages(conversationId, messages);
      
      callback(messages);
    }, (error) => {
      console.error("Error subscribing to messages:", error);
    });
    
    return unsubscribe;
  },
  
  /**
   * Mark messages as read
   */
  async markMessagesAsRead(conversationId, userId) {
    try {
      const conversationRef = doc(db, "chats", conversationId);
      const conversationSnap = await getDoc(conversationRef);

      if (!conversationSnap.exists()) return;

      const conversationData = conversationSnap.data();
      const participants = conversationData.participants || [];

      if (!participants.includes(userId)) return;

      // Update unread count for the user
      await updateDoc(conversationRef, {
        [`unread_${userId}`]: 0
      });

      // Update readBy status in all messages sent by others
      const q = query(
        collection(db, `chats/${conversationId}/messages`),
        where("senderId", "!=", userId)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return;

      const batch = writeBatch(db);
      querySnapshot.forEach((messageDoc) => {
        const messageData = messageDoc.data();
        const readBy = messageData.readBy || {};
        
        if (!readBy[userId]) {
          batch.update(messageDoc.ref, {
            [`readBy.${userId}`]: true
          });
        }
      });
      
      await batch.commit();
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  },
  
  /**
   * Subscribe to user's conversations
   */
  subscribeToConversations(userId, callback) {
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", userId),
      orderBy("lastUpdated", "desc")
    );

    return onSnapshot(q, async (snapshot) => {
      const conversations = [];
      const userFetchPromises = [];
      const userMap = new Map();

      snapshot.forEach((doc) => {
        const conversation = doc.data();
        const otherUserIds = conversation.participants.filter(id => id !== userId);

        otherUserIds.forEach(otherId => {
          if (!userMap.has(otherId)) {
            userFetchPromises.push(
              getDoc(doc(db, "users", otherId)).then((userDoc) => {
                userMap.set(otherId, userDoc.exists() ? userDoc.data() : null);
              })
            );
          }
        });
      });

      await Promise.all(userFetchPromises);

      snapshot.forEach((doc) => {
        const conversation = doc.data();
        const otherUserIds = conversation.participants.filter(id => id !== userId);
        const otherUserInfo = {};
        
        otherUserIds.forEach(id => {
          otherUserInfo[id] = userMap.get(id);
        });

        conversations.push({
          id: doc.id,
          ...conversation,
          otherUserInfo,
          unreadCount: conversation[`unread_${userId}`] || 0
        });
      });

      callback(conversations);
    });
  },

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId) {
    try {
      // Delete all messages
      const messagesQuery = query(
        collection(db, `chats/${conversationId}/messages`)
      );
      const messagesSnapshot = await getDocs(messagesQuery);

      const batch = writeBatch(db);
      messagesSnapshot.forEach((messageDoc) => {
        batch.delete(messageDoc.ref);
      });

      // Delete the conversation document
      batch.delete(doc(db, "chats", conversationId));
      await batch.commit();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      throw error;
    }
  },

  /**
   * Get unread chats count
   */
  async getUnreadChatsCount(userId) {
    try {
      const q = query(
        collection(db, "chats"),
        where("participants", "array-contains", userId)
      );

      const querySnapshot = await getDocs(q);
      let unreadCount = 0;
      
      querySnapshot.forEach(doc => {
        const chatData = doc.data();
        unreadCount += chatData[`unread_${userId}`] || 0;
      });
      
      return unreadCount;
    } catch (error) {
      console.error("Error getting unread chats count:", error);
      return 0;
    }
  },

  /**
   * Report a conversation
   */
  async reportConversation(conversationId, messageId, reporterId, reason) {
    try {
      const reportRef = doc(collection(db, "reports"));
      await setDoc(reportRef, {
        conversationId,
        messageId: messageId || null,
        reporterId,
        reason,
        timestamp: serverTimestamp(),
        status: "pending",
      });
      return reportRef.id;
    } catch (error) {
      console.error("Error reporting conversation:", error);
      throw error;
    }
  },

  /**
   * Block a user
   */
  async blockUser(currentUserId, userToBlockId) {
    try {
      const userRef = doc(db, "users", currentUserId);
      await updateDoc(userRef, {
        blockedUsers: arrayUnion(userToBlockId),
      });
    } catch (error) {
      console.error("Error blocking user:", error);
      throw error;
    }
  },

  /**
   * Check if users can message each other
   */
  async canMessageUser(userId, otherUserId) {
    try {
      // Check if either user has blocked the other
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.blockedUsers?.includes(otherUserId)) {
          return false;
        }
      }

      const otherUserDoc = await getDoc(doc(db, "users", otherUserId));
      if (otherUserDoc.exists()) {
        const otherUserData = otherUserDoc.data();
        if (otherUserData.blockedUsers?.includes(userId)) {
          return false;
        }
      }

      return true; // If no blocks found, allow messaging
    } catch (error) {
      console.error("Error checking message permissions:", error);
      return false;
    }
  }
};

// Export the chatService as default
export default chatService;
