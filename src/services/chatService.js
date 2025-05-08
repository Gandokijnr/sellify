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
} from "firebase/firestore";
import { db } from "@/firebase";

/**
 * Create a new chat conversation between a buyer and seller for a specific listing
 */
export const startNewChat = async (listingId, sellerId, buyerId) => {
  try {
    const existingChatQuery = query(
      collection(db, "conversations"),
      where("listingId", "==", listingId),
      where("participants.sellerId", "==", sellerId),
      where("participants.buyerId", "==", buyerId)
    );

    const querySnapshot = await getDocs(existingChatQuery);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }

    const chatRef = doc(collection(db, "conversations"));
    const listingDoc = await getDoc(doc(db, "listings", listingId));
    const listingData = listingDoc.exists() ? listingDoc.data() : {};

    await setDoc(chatRef, {
      participants: { sellerId, buyerId },
      listingId,
      listingTitle: listingData.title || "Unknown Item",
      listingImage: listingData.images?.[0] || null,
      lastUpdated: serverTimestamp(),
      lastMessage: null,
      readBy: { [sellerId]: true, [buyerId]: true },
      created: serverTimestamp(),
    });

    return chatRef.id;
  } catch (error) {
    console.error("Error creating new conversation:", error);
    throw error;
  }
};

/**
 * Send a message in a conversation
 */
export const sendMessage = async (conversationId, senderId, messageData) => {
  try {
    const conversationRef = doc(db, "conversations", conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (!conversationSnap.exists()) {
      throw new Error("Conversation not found");
    }

    const conversationData = conversationSnap.data();
    const { sellerId, buyerId } = conversationData.participants;
    const receiverId = senderId === sellerId ? buyerId : sellerId;

    const messagesRef = collection(
      db,
      `conversations/${conversationId}/messages`
    );
    const messageRef = await addDoc(messagesRef, {
      senderId,
      content: messageData.content,
      type: messageData.type || "text",
      timestamp: serverTimestamp(),
      read: false,
    });

    await updateDoc(conversationRef, {
      lastMessage: messageData.content,
      lastMessageType: messageData.type || "text",
      lastSenderId: senderId,
      lastUpdated: serverTimestamp(),
      [`readBy.${senderId}`]: true,
      [`readBy.${receiverId}`]: false,
    });

    return messageRef.id;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Subscribe to messages in a conversation
 */
export const subscribeToMessages = (conversationId, userId, callback) => {
  const q = query(
    collection(db, `conversations/${conversationId}/messages`),
    orderBy("timestamp", "asc")
  );

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const messages = [];
    let hasUnread = false;

    snapshot.forEach((doc) => {
      const messageData = doc.data();
      if (!messageData.read && messageData.senderId !== userId) {
        hasUnread = true;
      }
      messages.push({ id: doc.id, ...messageData });
    });

    callback(messages);

    if (hasUnread) {
      markMessagesAsRead(conversationId, userId);
    }
  });

  return unsubscribe;
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (conversationId, userId) => {
  try {
    const conversationRef = doc(db, "conversations", conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (!conversationSnap.exists()) return;

    const conversationData = conversationSnap.data();
    const { sellerId, buyerId } = conversationData.participants;

    if (userId !== sellerId && userId !== buyerId) return;

    await updateDoc(conversationRef, {
      [`readBy.${userId}`]: true,
    });

    const q = query(
      collection(db, `conversations/${conversationId}/messages`),
      where("senderId", "!=", userId),
      where("read", "==", false)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return;

    const batch = writeBatch(db);
    querySnapshot.forEach((messageDoc) => {
      batch.update(messageDoc.ref, { read: true });
    });
    await batch.commit();
  } catch (error) {
    console.error("Error marking messages as read:", error);
  }
};

/**
 * Subscribe to user's conversations
 */
export const subscribeToConversations = (userId, callback) => {
  const q = query(
    collection(db, "conversations"),
    or(
      where("participants.sellerId", "==", userId),
      where("participants.buyerId", "==", userId)
    ),
    orderBy("lastUpdated", "desc")
  );

  return onSnapshot(q, async (snapshot) => {
    const conversations = [];
    const userFetchPromises = [];
    const userMap = new Map();

    snapshot.forEach((doc) => {
      const conversation = doc.data();
      const { sellerId, buyerId } = conversation.participants;
      const otherUserId = userId === sellerId ? buyerId : sellerId;

      if (!userMap.has(otherUserId)) {
        userFetchPromises.push(
          getDoc(doc(db, "users", otherUserId)).then((userDoc) => {
            userMap.set(otherUserId, userDoc.exists() ? userDoc.data() : null);
          })
        );
      }
    });

    await Promise.all(userFetchPromises);

    snapshot.forEach((doc) => {
      const conversation = doc.data();
      const { sellerId, buyerId } = conversation.participants;
      const otherUserId = userId === sellerId ? buyerId : sellerId;

      conversations.push({
        id: doc.id,
        ...conversation,
        otherUserInfo: {
          [otherUserId]: userMap.get(otherUserId),
        },
        lastMessage: conversation.lastMessage || "No messages yet",
        isUnread: !conversation.readBy?.[userId],
      });
    });

    callback(conversations);
  });
};

/**
 * Delete a conversation
 */
export const deleteConversation = async (conversationId) => {
  try {
    // Delete all messages
    const messagesQuery = query(
      collection(db, `conversations/${conversationId}/messages`)
    );
    const messagesSnapshot = await getDocs(messagesQuery);

    const batch = writeBatch(db);
    messagesSnapshot.forEach((messageDoc) => {
      batch.delete(messageDoc.ref);
    });

    // Delete the conversation document
    batch.delete(doc(db, "conversations", conversationId));
    await batch.commit();
  } catch (error) {
    console.error("Error deleting conversation:", error);
    throw error;
  }
};

/**
 * Get unread chats count
 */
export const getUnreadChatsCount = async (userId) => {
  try {
    const q = query(
      collection(db, "conversations"),
      or(
        where("participants.buyerId", "==", userId),
        where("participants.sellerId", "==", userId)
      ),
      where("readBy." + userId, "==", false)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error("Error getting unread chats count:", error);
    return 0;
  }
};

/**
 * Report a conversation
 */
export const reportConversation = async (
  conversationId,
  messageId,
  reporterId,
  reason
) => {
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
};

/**
 * Block a user
 */
export const blockUser = async (currentUserId, userToBlockId) => {
  try {
    const userRef = doc(db, "users", currentUserId);
    await updateDoc(userRef, {
      blockedUsers: arrayUnion(userToBlockId),
    });
  } catch (error) {
    console.error("Error blocking user:", error);
    throw error;
  }
};

/**
 * Check if users can message each other
 */
export const canMessageUser = async (userId, otherUserId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) return true;

    const userData = userDoc.data();
    if (userData.blockedUsers?.includes(otherUserId)) return false;

    const otherUserDoc = await getDoc(doc(db, "users", otherUserId));
    if (!otherUserDoc.exists()) return true;

    const otherUserData = otherUserDoc.data();
    return !otherUserData.blockedUsers?.includes(userId);
  } catch (error) {
    console.error("Error checking if user can message:", error);
    return false;
  }
};

export default {
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
};
