<!-- ChatView.vue -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  getDoc,
  getDocs,
  doc,
  updateDoc, 
  arrayUnion,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const messages = ref([]);
const newMessage = ref('');
const sellerInfo = ref(null);
const unsubscribeMessages = ref(null);
const chatRef = ref(null);
const chatRoomId = ref('');
const sellerId = ref('');

// Fetch seller information
const fetchSellerInfo = async () => {
  try {
    const sellerDoc = await getDoc(doc(db, 'users', route.params.sellerId));
    if (sellerDoc.exists()) {
      sellerInfo.value = sellerDoc.data();
    }
  } catch (error) {
    console.error('Error fetching seller info:', error);
  }
};


onUnmounted(() => {
  if (unsubscribeMessages.value) unsubscribeMessages.value();
});

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  try {
    // Update chat metadata
    await updateDoc(chatRef.value, {
      lastMessage: {
        text: newMessage.value.trim(),
        senderId: authStore.user.uid,
        timestamp: serverTimestamp()
      },
      lastUpdated: serverTimestamp(),
      [`unread_${sellerId.value}`]: (await getDoc(chatRef.value)).data()[`unread_${sellerId.value}`] + 1 || 1,
      participants: arrayUnion(authStore.user.uid, sellerId.value)
    });

    // Add message
    await addDoc(
      collection(db, 'chats', chatRoomId.value, 'messages'), 
      {
        text: newMessage.value.trim(),
        senderId: authStore.user.uid,
        timestamp: serverTimestamp(),
        read: false
      }
    );
    
    newMessage.value = '';
  } catch (error) {
    console.error('Error sending message:', error);
  }
};


// Setup real-time messages listener
onMounted(async () => {
  if (!authStore.user) return router.push('/login');
  
  await fetchSellerInfo();
  
  sellerId.value = route.params.sellerId;
  chatRoomId.value = [authStore.user.uid, sellerId.value].sort().join('_');
  chatRef.value = doc(db, 'chats', chatRoomId.value);

  const messagesRef = collection(
    db, 
    'chats', 
    chatRoomId.value, 
    'messages'
  );
  
  const q = query(
    messagesRef,
    orderBy('timestamp', 'asc')
  );

  unsubscribeMessages.value = onSnapshot(q, (snapshot) => {
    messages.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    }));
    // Scroll to bottom
    setTimeout(() => {
      const container = document.querySelector('.messages-container');
      if (container) container.scrollTop = container.scrollHeight;
    }, 100);
  });

  // Mark messages as read when opening chat
  const markAsRead = async () => {
    const messagesSnapshot = await getDocs(query(
      collection(db, 'chats', chatRoomId.value, 'messages'),
      where('read', '==', false),
      where('senderId', '==', sellerId.value)
    ));

    messagesSnapshot.forEach(async (msgDoc) => {
      await updateDoc(msgDoc.ref, { read: true });
    });

    await updateDoc(chatRef.value, {
      [`unread_${authStore.user.uid}`]: 0
    });
  };

  markAsRead();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    
    <main class="container mx-auto px-4 py-8 max-w-3xl">
      <div class="bg-white rounded-lg shadow-sm">
        <!-- Chat Header -->
        <div class="p-4 border-b border-gray-200 flex items-center">
          <router-link 
            to="/" 
            class="mr-4 text-green-600 hover:text-green-700"
          >
            &lt; Back
          </router-link>
          <div class="flex items-center">
            <img 
              v-if="sellerInfo?.photoURL"
              :src="sellerInfo.photoURL" 
              class="w-10 h-10 rounded-full mr-3"
            />
            <div>
              <h1 class="font-semibold">
                Chat with {{ sellerInfo?.displayName || 'Seller' }}
              </h1>
              <p class="text-sm text-gray-500">
                {{ sellerInfo?.email }}
              </p>
            </div>
          </div>
        </div>

        <!-- Messages Container -->
        <div class="messages-container h-96 overflow-y-auto p-4 space-y-4">
          <div 
            v-for="message in messages"
            :key="message.id"
            :class="[
              'flex',
              message.senderId === authStore.user.uid 
                ? 'justify-end' 
                : 'justify-start'
            ]"
          >
            <div
              :class="[
                'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                message.senderId === authStore.user.uid
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              ]"
            >
              <p class="break-words">{{ message.text }}</p>
              <p class="text-xs mt-1 text-opacity-70">
                {{ message.timestamp?.toLocaleTimeString() }}
              </p>
            </div>
          </div>
        </div>

        <!-- Message Input -->
        <div class="p-4 border-t border-gray-200">
          <div class="flex gap-2">
            <textarea
              v-model="newMessage"
              @keydown.enter.prevent="sendMessage"
              placeholder="Type your message..."
              class="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="1"
            ></textarea>
            <button
              @click="sendMessage"
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.messages-container {
  scroll-behavior: smooth;
}
</style>