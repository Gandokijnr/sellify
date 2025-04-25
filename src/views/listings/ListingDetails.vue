<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useAuthStore } from "@/stores/auth";
import Navbar from "@/components/common/Navbar.vue";
import Footer from "@/components/common/Footer.vue";

const route = useRoute();
const router = useRouter();
const listing = ref(null);
const loading = ref(true);
const error = ref(null);
const activeImage = ref(0);
const relatedListings = ref([]);
const showAllImages = ref(false);
const showChatModal = ref(false);
const sellerInfo = ref(null);
const message = ref("");
const authStore = useAuthStore();

const fetchListing = async () => {
  try {
    const listingDoc = await getDoc(doc(db, "listings", route.params.id));
    if (listingDoc.exists()) {
      listing.value = { id: listingDoc.id, ...listingDoc.data() };

      console.log("Listing data:", listing.value);
      if (listing.value.userId) {
        const userDoc = await getDoc(doc(db, "users", listing.value.userId));

        if (userDoc.exists()) {
          sellerInfo.value = userDoc.data();
        }
      }
      console.log("Seller info:", sellerInfo.value.phoneNumber);
    } else {
      router.push({ name: "not-found" });
    }
  } catch (err) {
    console.error("Error fetching data:", err);
  } finally {
    loading.value = false;
  }
};

const fetchRelatedListings = async () => {
  try {
    const q = query(
      collection(db, "listings"),
      where("category", "==", listing.value.category),
      where("id", "!=", listing.value.id),
      limit(4)
    );

    const querySnapshot = await getDocs(q);
    relatedListings.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (err) {
    console.error("Error fetching related listings:", err);
  }
};

const callSeller = () => {
  window.location.href = `tel:${sellerInfo.value.phoneNumber}`;
};

const startChat = () => {
  showChatModal.value = true;
};

const sendMessage = () => {
  alert(`Message sent to seller: ${message.value}`);
  showChatModal.value = false;
  message.value = "";
};

const formatDate = (timestamp) => {
  if (!timestamp?.toDate) return "N/A";
  const options = { year: "numeric", month: "long" };
  return timestamp.toDate().toLocaleDateString(undefined, options);
};

onMounted(() => {
  fetchListing();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-800">
    <Navbar />

    <main class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600 mb-2"
        ></div>
        <p class="text-gray-500">Loading listing details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12 text-red-500">
        {{ error }}
      </div>

      <!-- Listing Details -->
      <div
        v-else-if="listing"
        class="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <!-- Breadcrumbs -->
        <div class="px-6 py-4 border-b border-gray-100">
          <nav class="flex" aria-label="Breadcrumb">
            <ol class="inline-flex items-center space-x-1 md:space-x-2">
              <li>
                <router-link to="/" class="text-green-600 hover:text-green-700"
                  >Home</router-link
                >
              </li>
              <li>
                <span class="mx-2 text-gray-400">/</span>
              </li>
              <li>
                <router-link
                  :to="{
                    name: 'listings',
                    query: { category: listing.category },
                  }"
                  class="text-green-600 hover:text-green-700"
                >
                  {{ listing.category }}
                </router-link>
              </li>
              <li>
                <span class="mx-2 text-gray-400">/</span>
              </li>
              <li class="text-gray-500 line-clamp-1">
                {{ listing.title }}
              </li>
            </ol>
          </nav>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          <!-- Image Gallery -->
          <div>
            <!-- Main Image -->
            <div
              class="rounded-lg overflow-hidden mb-4 bg-gray-100 aspect-[4/3] flex items-center justify-center"
            >
              <img
                :src="listing.images[activeImage]"
                :alt="listing.title"
                class="w-full h-full object-contain"
              />
            </div>

            <!-- Thumbnail Gallery -->
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="(image, index) in showAllImages
                  ? listing.images
                  : listing.images.slice(0, 4)"
                :key="index"
                @click="activeImage = index"
                class="aspect-square rounded-md overflow-hidden border-2"
                :class="
                  activeImage === index
                    ? 'border-green-500'
                    : 'border-transparent'
                "
              >
                <img
                  :src="image"
                  :alt="`${listing.title} thumbnail ${index + 1}`"
                  class="w-full h-full object-cover"
                />
              </button>

              <button
                v-if="listing.images.length > 4 && !showAllImages"
                @click="showAllImages = true"
                class="aspect-square rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-green-300 hover:text-green-500"
              >
                <span class="text-sm"
                  >+{{ listing.images.length - 4 }} more</span
                >
              </button>
            </div>
          </div>

          <!-- Listing Info -->
          <div>
            <div class="flex justify-between items-start mb-2">
              <h1 class="text-2xl font-bold">{{ listing.title }}</h1>
              <span
                v-if="listing.featured"
                class="bg-green-500 text-white text-xs px-2 py-1 rounded ml-2"
              >
                Featured
              </span>
            </div>

            <div class="flex items-center text-gray-500 text-sm mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-map-pin mr-1"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{{ listing.location }}</span>
              <span class="mx-2">•</span>
              <span>Posted {{ formatDate(listing.createdAt) }}</span>
              <span class="mx-2">•</span>
              <span>Views: {{ listing.views || 0 }}</span>
            </div>

            <div class="mb-6">
              <span class="text-3xl font-bold text-green-600">{{
                listing.price
              }}</span>
              <span v-if="listing.negotiable" class="ml-2 text-sm text-gray-500"
                >(Negotiable)</span
              >
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-2 gap-3 mb-8">
              <button
                @click="callSeller"
                class="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-phone mr-2"
                >
                  <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                  />
                </svg>
                Call Seller
              </button>

              <button
                @click="startChat"
                class="bg-white border border-green-600 text-green-600 hover:bg-green-50 py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-message-square mr-2"
                >
                  <path
                    d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                  />
                </svg>
                Chat
              </button>
            </div>

            <!-- Details Section -->
            <div class="mb-8">
              <h2 class="text-xl font-semibold mb-4">Details</h2>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-gray-500">Category</p>
                  <p>{{ listing.category }}</p>
                </div>
                <div>
                  <p class="text-gray-500">Condition</p>
                  <p>{{ listing.condition || "N/A" }}</p>
                </div>
                <div>
                  <p class="text-gray-500">Brand</p>
                  <p>{{ listing.brand || "N/A" }}</p>
                </div>
                <div>
                  <p class="text-gray-500">Posted</p>
                  <p>{{ formatDate(listing.createdAt) }}</p>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="mb-8">
              <h2 class="text-xl font-semibold mb-4">Description</h2>
              <p class="whitespace-pre-line">{{ listing.description }}</p>
            </div>

            <!-- Seller Info -->
            <div class="border-t border-gray-200 pt-6">
              <h2 class="text-xl font-semibold mb-4">Seller Information</h2>
              <div class="flex items-center">
                <div
                  class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4 overflow-hidden"
                >
                  <img
                    v-if="sellerInfo?.photoURL"
                    :src="sellerInfo.photoURL"
                    alt="Seller"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-xl">👤</span>
                </div>
                <div>
                  <p class="font-medium">
                    {{ sellerInfo?.displayName || "Private Seller" }}
                  </p>
                  <p class="text-gray-500 text-sm">
                    Member since {{ formatDate(sellerInfo?.createdAt) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Listings -->
      <div v-if="relatedListings.length > 0" class="mt-12">
        <h2 class="text-2xl font-bold mb-6">Similar Listings</h2>
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          <div
            v-for="item in relatedListings"
            :key="item.id"
            class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer"
            @click="
              router.push({ name: 'listing-details', params: { id: item.id } })
            "
          >
            <div class="relative">
              <img
                :src="item.images[0]"
                :alt="item.title"
                class="w-full h-40 sm:h-48 object-cover"
              />
              <div
                v-if="item.featured"
                class="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded"
              >
                Featured
              </div>
            </div>
            <div class="p-4">
              <h3 class="font-medium text-base line-clamp-1 mb-2">
                {{ item.title }}
              </h3>
              <div class="flex items-center text-gray-500 text-xs mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-map-pin mr-1"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{{ item.location }}</span>
              </div>
              <div class="font-bold text-green-600 text-lg">
                {{ item.price }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Modal -->
      <div
        v-if="showChatModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-xl w-full max-w-md">
          <div
            class="p-4 border-b border-gray-200 flex justify-between items-center"
          >
            <h3 class="text-lg font-medium">Message Seller</h3>
            <button
              @click="showChatModal = false"
              class="text-gray-400 hover:text-gray-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-x"
              >
                <path d="M18 6 6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-4">
            <textarea
              v-model="message"
              placeholder="Type your message here..."
              class="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="4"
            ></textarea>
            <button
              @click="sendMessage"
              class="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Send Message
            </button>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.whitespace-pre-line {
  white-space: pre-line;
}
</style>
