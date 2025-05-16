// conversationUtils.js
import { doc, updateDoc, Timestamp, getFirestore } from "firebase/firestore";

const db = getFirestore();

export const getRelativeTime = (timestamp) => {
  if (!timestamp) return "";

  const date = timestamp.toDate();
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;

  // Check if it was yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  // If it's within the last week
  if (diffInSeconds < 604800) {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.getDay()];
  }

  // Otherwise return the date
  return date.toLocaleDateString();
};

export const isSeller = (chat, userId) => {
  return chat.participants?.sellerId === userId;
};

export const getUnreadCount = (conversation, userId) => {
  if (!conversation.readBy || !userId) return 0;
  return conversation.readBy[userId] ? 0 : 1;
};

export const markAsRead = (conversationId, userId) => {
  if (!conversationId || !userId) return;

  const conversationRef = doc(db, "conversations", conversationId);

  // Update the readBy field for this user
  updateDoc(conversationRef, {
    [`readBy.${userId}`]: Timestamp.now(),
  }).catch((error) => {
    console.error("Error marking conversation as read:", error);
  });
};

export const truncateText = (text, maxLength = 60) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

export const getInitials = (name) => {
  if (!name || name === "Unknown User") return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};
