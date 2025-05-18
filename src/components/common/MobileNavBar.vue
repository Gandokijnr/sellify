<template>
  <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden shadow-md transition-transform duration-300 ease-in-out">
    <div class="px-2 py-3">
      <div class="flex justify-around items-center">
        <!-- Home Button -->
        <router-link to="/" class="flex flex-col items-center text-xs text-gray-600 hover:text-teal-600 transition-colors" active-class="text-[#0d9488] font-medium">
          <HomeIcon size="20" class="mb-1" />
          <span>Home</span>
        </router-link>

        <!-- Browse Button -->
        <router-link to="/browse" class="flex flex-col items-center text-xs text-gray-600 hover:text-teal-600 transition-colors" active-class="text-[#0d9488] font-medium">
          <SearchIcon size="20" class="mb-1" />
          <span>Browse</span>
        </router-link>

        <!-- Sell Button (Primary Action) -->
        <router-link 
          :to="authStore.isAuthenticated ? '/seller/listings/create' : '/login'" 
          class="flex flex-col items-center relative"
        >
          <div class="flex items-center justify-center w-12 h-12 bg-[#0d9488] rounded-full -mt-5 shadow-lg hover:bg-teal-700 transition-colors">
            <PlusIcon size="24" class="text-white" />
          </div>
          <span class="text-xs mt-1 text-gray-600 font-medium">Sell</span>
        </router-link>

        <!-- Messages Button -->
        <router-link to="/chats" class="flex flex-col items-center text-xs text-gray-600 hover:text-teal-600 transition-colors relative" active-class="text-[#0d9488] font-medium">
          <MessageSquareIcon size="20" class="mb-1" />
          <span>Chats</span>
          <span 
            v-if="unreadCount > 0" 
            class="absolute -top-1 right-2 bg-red-500 text-white rounded-full text-xs px-1.5 min-w-[18px] text-center"
          >
            {{ unreadCount }}
          </span>
        </router-link>

        <!-- Profile Button -->
        <router-link 
          :to="authStore.isAuthenticated ? '/profile' : '/login'" 
          class="flex flex-col items-center text-xs text-gray-600 hover:text-teal-600 transition-colors"
          active-class="text-[#0d9488] font-medium"
        >
          <UserIcon size="20" class="mb-1" />
          <span>Profile</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { 
  HomeIcon, 
  SearchIcon, 
  PlusIcon, 
  MessageSquareIcon, 
  UserIcon 
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import chatService from '@/utils/chatService';

const authStore = useAuthStore();
const unreadCount = ref(0);
let unsubscribeUnread = null;

onMounted(() => {
  if (authStore.isAuthenticated && authStore.user?.uid) {
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", authStore.user.uid)
    );

    unsubscribeUnread = onSnapshot(q, async (snapshot) => {
      try {
        const userId = authStore.user.uid;
        const count = await chatService.getUnreadChatsCount(userId);
        unreadCount.value = count;
      } catch (error) {
        console.error('Error getting unread count:', error);
      }
    });
  }
});

onUnmounted(() => {
  if (unsubscribeUnread) unsubscribeUnread();
});
</script>

