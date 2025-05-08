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
  async sendMessage(chatId, senderId, receiverId, text) {
    try {
      // Create message data
      const messageData = {
        text: text.trim(),
        senderId,
        timestamp: serverTimestamp(),
        read: false,
      };

      // Add the message to the subcollection
      const messagesRef = collection(db, "chats", chatId, "messages");
      await addDoc(messagesRef, messageData);

      // Update the chat document
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        lastMessage: { text: messageData.text },
        lastUpdated: serverTimestamp(),
        [`unread_${receiverId}`]: increment(1),
      });

      return true;
    } catch (err) {
      console.error("Error sending message:", err);
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
};

export default chatService;
