<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <!-- Main Content -->
    <div class="pt-6 pb-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Page Header -->
        <div class="mb-8">
          <div
            class="flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
              <p class="mt-1 text-sm text-gray-500">
                Manage your listings and track your performance
              </p>
            </div>
            <div class="mt-4 md:mt-0">
              <button
                @click="$router.push('/seller/listings/create')"
                class="inline-flex items-center px-4 py-2 rounded-lg shadow-sm text-white bg-teal-600 hover:bg-teal-700 transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                <PlusIcon class="h-5 w-5 mr-2" />
                <span>Create New Listing</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Global Alert Container -->
        <TransitionGroup name="fade">
          <!-- Loading State -->
          <div
            v-if="loading"
            key="loading-alert"
            class="flex items-center justify-center p-4 mb-6 bg-white shadow-sm rounded-lg border border-gray-100"
          >
            <div
              class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-600 mr-3"
            ></div>
            <p class="text-gray-600 font-medium">
              Loading your dashboard data...
            </p>
          </div>

          <!-- Error State -->
          <div
            v-if="error"
            key="error-alert"
            class="p-4 mb-6 bg-white shadow-sm rounded-lg border-l-4 border-red-500"
          >
            <div class="flex">
              <div class="flex-shrink-0">
                <ExclamationCircleIcon class="h-5 w-5 text-red-500" />
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-gray-900">Error</h3>
                <p class="mt-1 text-sm text-gray-600">
                  {{ error }}
                </p>
                <div class="mt-2">
                  <button
                    @click="fetchDashboardData"
                    class="text-sm font-medium text-red-600 hover:text-red-500"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Success Message -->
          <div
            v-if="successMessage"
            key="success-alert"
            class="p-4 mb-6 bg-white shadow-sm rounded-lg border-l-4 border-teal-500"
          >
            <div class="flex">
              <div class="flex-shrink-0">
                <CheckCircleIcon class="h-5 w-5 text-teal-500" />
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-gray-900">Success</h3>
                <p class="mt-1 text-sm text-gray-600">
                  {{ successMessage }}
                </p>
              </div>
            </div>
          </div>
        </TransitionGroup>

        <!-- Dashboard Grid Layout -->
        <div
          v-if="!loading && !error"
          class="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <!-- Stats and Activity Column -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Stats Cards -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatsCard
                title="Total Listings"
                :value="stats.totalListings"
                icon="DocumentTextIcon"
                color="bg-blue-600"
              />
              <StatsCard
                title="Active Listings"
                :value="stats.activeListings"
                icon="CheckCircleIcon"
                color="bg-teal-600"
                valueLabel="Listings"
              />
              <StatsCard
                title="Unread Messages"
                :value="stats.messages"
                icon="ChatBubbleLeftIcon"
                color="bg-indigo-600"
                valueLabel="Messages"
              />
              <StatsCard
                title="Total Views"
                :value="stats.totalViews"
                icon="EyeIcon"
                color="bg-amber-500"
                valueLabel="Views"
              />
            </div>

            <!-- Recent Listings Section -->
            <div
              class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div class="p-6 border-b border-gray-100">
                <div class="flex items-center justify-between">
                  <h2 class="text-lg font-semibold text-gray-900">
                    Recent Listings
                  </h2>
                  <router-link
                    to="/browse"
                    class="text-sm font-medium text-teal-600 hover:text-teal-700"
                  >
                    View All
                  </router-link>
                </div>
              </div>

              <div
                v-if="listings.length === 0"
                class="p-12 flex flex-col items-center justify-center"
              >
                <div class="h-20 w-20 text-gray-300 mb-4">
                  <DocumentPlusIcon class="h-full w-full" />
                </div>
                <p class="text-gray-500 mb-4 text-center">
                  You haven't created any listings yet.
                </p>
                <router-link
                  to="/seller/listings/create"
                  class="px-4 py-2 text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 transition"
                >
                  Create your first listing
                </router-link>
              </div>

              <div v-else>
                <div class="px-6">
                  <ul class="divide-y divide-gray-100">
                    <ListingRow
                      v-for="listing in listings"
                      :key="listing.id"
                      :listing="listing"
                      @edit="handleEditListing"
                      @delete="openDeleteModal"
                    />
                  </ul>
                </div>
                <div class="p-4 bg-gray-50 text-right">
                  <router-link
                    to="/seller/listings"
                    class="text-sm font-medium text-teal-600 hover:text-teal-700"
                  >
                    See all listings →
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Sidebar -->
          <div class="space-y-6">
            <!-- Profile Summary -->
            <div
              class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div class="p-6">
                <div class="flex items-center">
                  <div
                    class="h-14 w-14 rounded-full bg-teal-100 flex items-center justify-center text-teal-600"
                  >
                    <UserIcon class="h-8 w-8" />
                  </div>
                  <div class="ml-4">
                    <h2 class="text-lg font-semibold text-gray-900">
                      {{ authStore.user?.displayName || "Seller" }}
                    </h2>
                    <p class="text-sm text-gray-500">
                      Member since {{ memberSince }}
                    </p>
                  </div>
                </div>
                <div class="mt-4 pt-4 border-t border-gray-100">
                  <div class="flex items-center justify-between text-sm mb-2">
                    <span class="text-gray-500">Profile completeness</span>
                    <span class="text-gray-900 font-medium">{{ profileCompleteness }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-teal-600 h-2 rounded-full"
                      :style="{ width: `${profileCompleteness}%` }"
                    ></div>
                  </div>
                  <div class="mt-4">
                    <router-link
                      v-if="profileCompleteness < 100"
                      to="/profile"
                      class="text-sm font-medium text-teal-600 hover:text-teal-700"
                    >
                      Complete your profile →
                    </router-link>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Messages -->
            <div
              class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div class="p-6 border-b border-gray-100">
                <div class="flex items-center justify-between">
                  <h2 class="text-lg font-semibold text-gray-900">
                    Recent Messages
                  </h2>
                  <router-link
                    to="/chats"
                    class="text-sm font-medium text-teal-600 hover:text-teal-700"
                  >
                    View All
                  </router-link>
                </div>
              </div>

              <div
                v-if="messages.length === 0"
                class="p-8 flex flex-col items-center justify-center"
              >
                <div class="h-16 w-16 text-gray-300 mb-2">
                  <ChatBubbleLeftRightIcon class="h-full w-full" />
                </div>
                <p class="text-gray-500 text-center">No messages yet</p>
              </div>

              <div v-else class="divide-y divide-gray-100">
                <MessagePreview
                  v-for="message in messages"
                  :key="message.id"
                  :message="message"
                  @click="handleMessageClick"
                />
              </div>
            </div>

            <!-- Quick Actions -->
            <div
              class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div class="p-6 border-b border-gray-100">
                <h2 class="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h2>
              </div>
              <div class="p-4">
                <div class="grid grid-cols-2 gap-2">
                  <button
                    @click="$router.push('/seller/listings/create')"
                    class="flex flex-col items-center justify-center p-4 rounded-lg hover:bg-gray-50 transition"
                  >
                    <PlusCircleIcon class="h-8 w-8 text-teal-600 mb-2" />
                    <span class="text-sm font-medium text-gray-700"
                      >New Listing</span
                    >
                  </button>
                  <button
                    @click="$router.push('/chats')"
                    class="flex flex-col items-center justify-center p-4 rounded-lg hover:bg-gray-50 transition"
                  >
                    <EnvelopeIcon class="h-8 w-8 text-teal-600 mb-2" />
                    <span class="text-sm font-medium text-gray-700"
                      >Messages</span
                    >
                  </button>
                  <button
                    @click="$router.push('/profile')"
                    class="flex flex-col items-center justify-center p-4 rounded-lg hover:bg-gray-50 transition"
                  >
                    <UserCircleIcon class="h-8 w-8 text-teal-600 mb-2" />
                    <span class="text-sm font-medium text-gray-700"
                      >My Profile</span
                    >
                  </button>
                  <button
                    @click="$router.push('/seller/dashboard')"
                    class="flex flex-col items-center justify-center p-4 rounded-lg hover:bg-gray-50 transition"
                  >
                    <ChartBarIcon class="h-8 w-8 text-teal-600 mb-2" />
                    <span class="text-sm font-medium text-gray-700"
                      >Analytics</span
                    >
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <Modal v-if="showDeleteModal" :visible="showDeleteModal" @close="showDeleteModal = false">
      <div class="p-6">
        <div
          class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4"
        >
          <ExclamationTriangleIcon class="h-6 w-6 text-red-600" />
        </div>
        <h3 class="text-lg font-medium text-center text-gray-900 mb-2">
          Delete Listing
        </h3>
        <p class="text-sm text-gray-500 text-center mb-6">
          Are you sure you want to delete this listing? This action cannot be
          undone.
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 text-sm font-medium rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="confirmDelete"
            class="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Delete Listing
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import {
  PlusIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  UserIcon,
  DocumentTextIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  ChatBubbleLeftRightIcon,
  DocumentPlusIcon,
  PlusCircleIcon,
  EnvelopeIcon,
  UserCircleIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
} from "@heroicons/vue/24/outline";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  orderBy,
  limit,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebase"; 
import Navbar from "@/components/common/Navbar.vue";
import Modal from "@/components/common/Modal.vue";
import StatsCard from "@/components/dashboard/StatsCard.vue";
import ListingRow from "@/components/dashboard/ListingRow.vue";
import MessagePreview from "@/components/dashboard/MessagePreview.vue";

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(true);
const error = ref(null);
const successMessage = ref("");
const showDeleteModal = ref(false);
const pendingDeleteId = ref(null);

const stats = ref({
  totalListings: 0,
  activeListings: 0,
  messages: 0,
  totalViews: 0,
});
const listings = ref([]);
const messages = ref([]);

// Computed property for formatted member since date
const memberSince = computed(() => {
  const firestoreDate = authStore.user?.createdAt;
  if (firestoreDate) {
    const date = firestoreDate instanceof Date 
      ? firestoreDate 
      : firestoreDate.toDate();
    
    return date.toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      }
    );
  }

  const authDate = authStore.user?.metadata?.creationTime;
  if (authDate) {
    const date = new Date(authDate);
    return date.toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      }
    );
  }

  return "N/A";
});

const profileCompleteness = computed(() => {
  const user = authStore.user;
  if (!user) return 0;
  
  // Check if user has phone number
  return user.phoneNumber ? 100 : 75;
});

const fetchDashboardData = async () => {
  try {
    loading.value = true;
    error.value = null;
    successMessage.value = "";

    if (!authStore.user?.uid) {
      throw new Error("User not authenticated");
    }

    // Fetch user profile data
    const userRef = doc(db, "users", authStore.user.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    // Update authStore with user data
    if (userData) {
      authStore.user = { ...authStore.user, ...userData };
    }

    // Fetch user listings
    const listingsQuery = query(
      collection(db, "listings"),
      where("userId", "==", authStore.user.uid),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const listingsSnapshot = await getDocs(listingsQuery);
    listings.value = listingsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      image:
        doc.data().images && doc.data().images.length > 0
          ? doc.data().images[0]
          : "",
      date: doc.data().createdAt?.toDate().toLocaleDateString() || "N/A",
      // Add additional formatted properties for the new UI
      price: formatPrice(doc.data().price),
      statusBadgeColor: getStatusColor(doc.data().status),
    }));

    // Calculate stats
    stats.value.totalListings = listingsSnapshot.size;
    stats.value.activeListings = listingsSnapshot.docs.filter(
      (doc) => doc.data().status === "active"
    ).length;
    stats.value.totalViews = listingsSnapshot.docs.reduce(
      (sum, doc) => sum + (doc.data().views || 0),
      0
    );

    // Sample messages data
    messages.value = [
      {
        id: 1,
        from: "John Doe",
        subject: "iPhone 13 Pro Max",
        preview: "Is this still available? I can pay ₦400,000 cash...",
        date: "2 hours ago",
        read: false,
        avatar: null, // Will use initial fallback
      },
      {
        id: 2,
        from: "Sarah Johnson",
        subject: "MacBook Pro",
        preview: "Can you send me more pictures of the laptop?",
        date: "1 day ago",
        read: true,
        avatar: null,
      },
    ];
    stats.value.messages = messages.value.filter((m) => !m.read).length;
  } catch (err) {
    console.error("Dashboard error:", err);
    error.value = err.message || "Failed to load dashboard data";
  } finally {
    loading.value = false;
  }
};

// Helper functions for formatting
const formatPrice = (price) => {
  if (!price) return "N/A";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
};

const getStatusColor = (status) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "sold":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const handleEditListing = (id) => {
  router.push(`/seller/listings/edit/${id}`);
};

const closeModal = () => {
  showDeleteModal.value = false;
  pendingDeleteId.value = null;
  error.value = null;
};

const openDeleteModal = (id) => {
  pendingDeleteId.value = id;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (!pendingDeleteId.value) return;

  try {
    await deleteListing(pendingDeleteId.value);
    successMessage.value = "Listing deleted successfully!";

    // Close modal after successful deletion
    closeModal();

    // Wait a moment and refresh data
    setTimeout(() => {
      successMessage.value = "";
      fetchDashboardData();
    }, 3000);
  } catch (err) {
    console.error("Delete error:", err);
    error.value =
      "Failed to delete listing: " + (err.message || "Unknown error");
    closeModal();
  }
};

const deleteListing = async (id) => {
  try {
    // Reference to the specific document to delete
    const listingRef = doc(db, "listings", id);

    // Delete the document from Firestore
    await deleteDoc(listingRef);

    // Update local state
    listings.value = listings.value.filter((listing) => listing.id !== id);
    stats.value.totalListings -= 1;

    // If the deleted listing was active, update active listings count
    const deletedListing = listings.value.find((listing) => listing.id === id);
    if (deletedListing && deletedListing.status === "active") {
      stats.value.activeListings -= 1;
    }

    return true;
  } catch (error) {
    console.error(`Error deleting listing with ID ${id}:`, error);
    throw error;
  }
};

const handleMessageClick = (message) => {
  console.log("Message clicked:", message);
  router.push(`/messages/${message.id}`);
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>