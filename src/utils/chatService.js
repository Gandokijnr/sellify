import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
  increment,
  writeBatch,
  setDoc,
} from "firebase/firestore";
import { db } from "@/firebase";

/**
 * Service for managing chat operations
 */
export const chatService = {
  /**
   * Fetch all chats for a specific user
   * @param {string} userId - Current user ID
   * @param {function} callback - Callback function for chat updates
   * @returns {function} - Unsubscribe function
   */
  getUserChats(userId, callback) {
    try {
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("participants", "array-contains", userId),
        orderBy("lastUpdated", "desc")
      );

      return onSnapshot(q, async (snapshot) => {
        const chatsData = [];

        for (const doc of snapshot.docs) {
          const data = doc.data();
          const otherParticipantId = data.participants.find(
            (id) => id !== userId
          );

          // Get other user's information
          let otherUserInfo = null;
          try {
            const userDoc = await getDoc(this.getUserRef(otherParticipantId));
            otherUserInfo = userDoc.exists() ? userDoc.data() : null;
          } catch (err) {
            console.error("Error fetching user info:", err);
          }

          chatsData.push({
            id: doc.id,
            otherUserId: otherParticipantId,
            otherUserInfo,
            lastMessage: data.lastMessage,
            lastUpdated: data.lastUpdated?.toDate(),
            unreadCount: data[`unread_${userId}`] || 0,
            listingId: data.listingId || null,
            listingTitle: data.listingTitle || null,
            listingImage: data.listingImage || null,
            listingPrice: data.listingPrice || null
          });
        }

        callback(chatsData);
      });
    } catch (err) {
      console.error("Error getting user chats:", err);
      callback([]);
      return () => {};
    }
  },

  /**
   * Find a chat between two users
   * @param {string} currentUserId - Current user ID
   * @param {string} otherUserId - Other user ID
   * @returns {Promise<Object|null>} - Chat object if found
   */
  async findChatBetweenUsers(currentUserId, otherUserId) {
    try {
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("participants", "array-contains", currentUserId)
      );

      const querySnapshot = await getDocs(q);
      let existingChat = null;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants.includes(otherUserId)) {
          existingChat = { id: doc.id, ...data };
        }
      });

      return existingChat;
    } catch (err) {
      console.error("Error finding chat between users:", err);
      return null;
    }
  },

  /**
   * Create a new chat between two users
   * @param {string} currentUserId - Current user ID
   * @param {string} otherUserId - Other user ID
   * @returns {Promise<string|null>} - New chat ID if created
   */
  async createChat(currentUserId, otherUserId) {
    try {
      const chatData = {
        participants: [currentUserId, otherUserId],
        lastMessage: { text: "" },
        lastUpdated: serverTimestamp(),
        [`unread_${otherUserId}`]: 0,
        [`unread_${currentUserId}`]: 0,
      };

      const chatsRef = collection(db, "chats");
      const newChatRef = await addDoc(chatsRef, chatData);
      return newChatRef.id;
    } catch (err) {
      console.error("Error creating chat:", err);
      return null;
    }
  },

  /**
   * Find or create a chat between two users
   * @param {string} currentUserId - Current user ID
   * @param {string} otherUserId - Other user ID
   * @returns {Promise<string|null>} - Chat ID
   */
  async findOrCreateChat(currentUserId, otherUserId) {
    const existingChat = await this.findChatBetweenUsers(
      currentUserId,
      otherUserId
    );

    if (existingChat) {
      return existingChat.id;
    } else {
      return this.createChat(currentUserId, otherUserId);
    }
  },
  
  /**
   * Create a new chat conversation between a buyer and seller for a specific listing
   * @param {string} listingId - Listing ID
   * @param {string} sellerId - Seller user ID
   * @param {string} buyerId - Buyer user ID
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
        where("participants", "array-contains", sellerId)
      );

      const querySnapshot = await getDocs(existingChatQuery);
      let existingChat = null;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants.includes(buyerId)) {
          existingChat = { id: doc.id, ...data };
        }
      });
      
      if (existingChat) {
        // Return existing chat with enhanced information
        return {
          chatId: existingChat.id,
          chatData: existingChat,
          sellerInfo: sellerData,
          buyerInfo: buyerData,
          listingInfo: {
            id: listingId,
            title: existingChat.listingTitle || "",
            price: existingChat.listingPrice || 0,
            image: existingChat.listingImage || null
          }
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
   * Get chat messages
   * @param {string} chatId - Chat ID
   * @param {function} callback - Callback function for message updates
   * @returns {function} - Unsubscribe function
   */
  getChatMessages(chatId, callback) {
    try {
      const messagesRef = collection(db, "chats", chatId, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));

      return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        callback(messages);
      });
    } catch (err) {
      console.error("Error getting chat messages:", err);
      callback([]);
      return () => {};
    }
  },

  /**
   * Send a message
   * @param {string} chatId - Chat ID
   * @param {string} senderId - Sender ID
   * @param {string} receiverId - Receiver ID
   * @param {string} text - Message text
   * @returns {Promise<boolean>} - Success status
   */
  async sendMessage(chatId, senderId, receiverId, text, listingId = null) {
    try {
      if (!text || !text.trim()) {
        console.warn("Message text is empty or undefined");
        return false;
      }

      const messageData = {
        text: text.trim(),
        senderId,
        receiverId,
        timestamp: serverTimestamp(),
        readBy: [senderId],
        listingId,
        listingTitle: null,
        listingImage: null,
      };

      // If listingId is provided, try to get listing data
      if (listingId) {
        try {
          const listingDoc = await getDoc(doc(db, "listings", listingId));
          if (listingDoc.exists()) {
            const listingData = listingDoc.data();
            // Safely set listing title and image with fallbacks
            messageData.listingTitle = listingData.title || null;
            
            // Handle the case where image could be in images array or direct image field
            if (listingData.images && listingData.images.length > 0) {
              messageData.listingImage = listingData.images[0] || null;
            } else if (listingData.image) {
              messageData.listingImage = listingData.image;
            }
          }
        } catch (error) {
          console.error("Error fetching listing data:", error);
        }
      }

      // Add the message to the subcollection
      const messagesRef = collection(db, "chats", chatId, "messages");
      await addDoc(messagesRef, messageData);

      // Update the chat document
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        lastMessage: { text: messageData.text },
        lastUpdated: serverTimestamp(),
        unreadCount: increment(1),
      });

      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  },

  /**
   * Mark messages as read
   * @param {string} chatId - Chat ID
   * @param {string} userId - User ID
   * @param {string} senderId - Sender ID (messages from this user will be marked as read)
   * @returns {Promise<boolean>} - Success status
   */
  async markMessagesAsRead(chatId, userId, senderId) {
    try {
      // Update the chat document to clear unread count
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        [`unread_${userId}`]: 0,
      });

      // Mark individual messages as read
      const messagesRef = collection(db, "chats", chatId, "messages");
      const q = query(
        messagesRef,
        where("senderId", "==", senderId),
        where("read", "==", false)
      );

      const querySnapshot = await getDocs(q);

      // If there are unread messages, batch update them
      if (!querySnapshot.empty) {
        const batch = writeBatch(db);

        querySnapshot.forEach((doc) => {
          batch.update(doc.ref, { read: true });
        });

        await batch.commit();
      }

      return true;
    } catch (err) {
      console.error("Error marking messages as read:", err);
      return false;
    }
  },

  /**
   * Get user reference
   * @param {string} userId - User ID
   * @returns {DocumentReference} - User document reference
   */
  getUserRef(userId) {
    return doc(db, "users", userId);
  },

  /**
   * Get chat reference
   * @param {string} chatId - Chat ID
   * @returns {DocumentReference} - Chat document reference
   */
  getChatRef(chatId) {
    return doc(db, "chats", chatId);
  },

  /**
   * Check if users can message each other
   * @param {string} userId - Current user ID
   * @param {string} otherUserId - Other user ID
   * @returns {Promise<boolean>} - Whether users can message each other
   */
  async canMessageUser(userId, otherUserId) {
    try {
      // Check if either user has blocked the other
      const blockedUsersRef = collection(db, "blockedUsers");
      const q = query(
        blockedUsersRef,
        where("blockerId", "in", [userId, otherUserId]),
        where("blockedId", "in", [userId, otherUserId])
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return false;
      }

      // Check if users have any active conversations
      const chatsRef = collection(db, "chats");
      const chatQ = query(
        chatsRef,
        where("participants", "array-contains-any", [userId, otherUserId])
      );

      const chatSnapshot = await getDocs(chatQ);
      if (!chatSnapshot.empty) {
        return true;
      }

      // If no conversations exist, check if they can start one
      // (This could be based on business rules, user roles, etc.)
      return true; // Default to allowing messaging for now
    } catch (error) {
      console.error("Error checking message permissions:", error);
      return false;
    }
  },

  /**
   * Get the total unread messages count for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} - Total unread count
   */
  async getUnreadChatsCount(userId) {
    try {
      // Get all chats for the user
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef, 
        where("participants", "array-contains", userId)
      );

      const querySnapshot = await getDocs(q);
      let totalUnread = 0;

      // Sum up all unread counts from each chat
      querySnapshot.forEach(doc => {
        const data = doc.data();
        const unreadField = `unread_${userId}`;
        if (data[unreadField]) {
          totalUnread += data[unreadField];
        }
      });

      return totalUnread;
    } catch (error) {
      console.error("Error getting unread chats count:", error);
      return 0;
    }
  },
  
  /**
   * Helper function to increment a value in Firestore
   * @param {number} value - Amount to increment by
   * @returns {FieldValue} - Firestore increment field value
   */
  increment(value) {
    return increment(value);
  },
};

export default chatService;
