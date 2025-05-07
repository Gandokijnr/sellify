<!-- ChatOverview.vue -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuthStore } from '@/stores/auth';
import Navbar from '@/components/common/Navbar.vue';
import Footer from '@/components/common/Footer.vue';

const authStore = useAuthStore();
const chats = ref([]);
const unsubscribeChats = ref(null);

onMounted(async () => {
  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', authStore.user.uid),
    orderBy('lastUpdated', 'desc')
  );

  unsubscribeChats.value = onSnapshot(q, (snapshot) => {
    chats.value = snapshot.docs.map(doc => {
      const data = doc.data();
      const otherParticipant = data.participants.find(id => id !== authStore.user.uid);
      return {
        id: doc.id,
        otherUserId: otherParticipant,
        lastMessage: data.lastMessage,
        lastUpdated: data.lastUpdated?.toDate(),
        unreadCount: data[`unread_${authStore.user.uid}`] || 0
      };
    });
  });
});

onUnmounted(() => {
  if (unsubscribeChats.value) unsubscribeChats.value();
});

const getUserInfo = async (userId) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? userDoc.data() : null;
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    
    <main class="container mx-auto px-4 py-8 max-w-3xl">
      <div class="bg-white rounded-lg shadow-sm">
        <div class="p-4 border-b border-gray-200">
          <h1 class="text-xl font-semibold">Your Conversations</h1>
        </div>

        <div class="divide-y divide-gray-200">
          <router-link 
            v-for="chat in chats"
            :key="chat.id"
            :to="{ name: 'chat', params: { sellerId: chat.otherUserId } }"
            class="flex items-center p-4 hover:bg-gray-50 transition-colors"
          >
            <img 
              v-if="chat.otherUserInfo?.photoURL"
              :src="chat.otherUserInfo.photoURL"
              class="w-12 h-12 rounded-full mr-4"
            />
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-center">
                <h2 class="font-medium truncate">
                  {{ chat.otherUserInfo?.displayName || 'Unknown User' }}
                </h2>
                <span class="text-sm text-gray-500">
                  {{ chat.lastUpdated?.toLocaleDateString() }}
                </span>
              </div>
              <p class="text-sm text-gray-500 truncate">
                {{ chat.lastMessage?.text || 'No messages yet' }}
              </p>
            </div>
            <span 
              v-if="chat.unreadCount > 0"
              class="ml-4 bg-green-500 text-white rounded-full px-2 py-1 text-xs"
            >
              {{ chat.unreadCount }}
            </span>
          </router-link>

          <div 
            v-if="chats.length === 0"
            class="p-4 text-center text-gray-500"
          >
            No conversations yet. Start a chat from a product listing!
          </div>
        </div>
      </div>
    </main>
  </div>
  <Footer />
</template>