<template>
  <div class="min-h-screen bg-gray-100">
    <Navbar />

    <div class="py-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
          <router-link
            to="/seller/listings/create"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-700 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jiji-primary"
          >
            <PlusIcon class="-ml-1 mr-2 h-5 w-5" />
            New Listing
          </router-link>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-12">
          <div
            class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"
          ></div>
        </div>

        <!-- Error State -->
        <div
          v-else-if="error"
          class="bg-red-50 border-l-4 border-red-400 p-4 mb-6"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <ExclamationCircleIcon class="h-5 w-5 text-red-400" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">
                {{ error }}
                <a
                  href="#"
                  @click="fetchDashboardData"
                  class="font-medium text-red-700 underline"
                  >Try again</a
                >
              </p>
            </div>
          </div>
        </div>

        <!-- Success alert -->
        <div
          v-if="successMessage"
          class="bg-green-50 border-l-4 border-green-400 p-4 mb-6"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <CheckCircleIcon class="h-5 w-5 text-green-400" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-green-700">
                {{ successMessage }}
              </p>
            </div>
          </div>
        </div>

        <!-- Dashboard Content -->
        <template v-else>
          <!-- Stats Cards -->
          <div
            class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          >
            <DashboardCard
              title="Total Listings"
              :value="stats.totalListings"
              icon="ChartBarIcon"
              color="bg-blue-500"
            />
            <DashboardCard
              title="Active Listings"
              :value="stats.activeListings"
              icon="CheckCircleIcon"
              color="bg-green-500"
            />
            <DashboardCard
              title="Messages"
              :value="stats.messages"
              icon="ChatAltIcon"
              color="bg-indigo-500"
            />
            <DashboardCard
              title="Total Views"
              :value="stats.totalViews"
              icon="EyeIcon"
              color="bg-purple-500"
            />
          </div>

          <!-- Delete Confirmation Modal -->
          <div
            v-if="showDeleteModal"
            class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
          >
            <div class="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                Confirm Deletion
              </h3>
              <p class="text-gray-500 mb-6">
                Are you sure you want to delete this listing? This action cannot
                be undone.
              </p>
              <div class="flex justify-end space-x-3">
                <button
                  @click="showDeleteModal = false"
                  class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  @click="confirmDelete"
                  class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          <!-- Recent Listings -->
          <div class="bg-white shadow rounded-lg overflow-hidden">
            <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Your Recent Listings
              </h3>
              <p class="mt-1 text-sm text-gray-500">
                Showing your {{ listings.length }} most recent listings
              </p>
            </div>
            <div v-if="listings.length === 0" class="px-4 py-12 text-center">
              <p class="text-gray-500">You haven't created any listings yet.</p>
              <router-link
                to="/seller/listings/create"
                class="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-700 hover:bg-orange-700"
              >
                Create your first listing
              </router-link>
            </div>
            <div v-else class="divide-y divide-gray-200">
              <ListingItem
                v-for="listing in listings"
                :key="listing.id"
                :listing="listing"
                @edit="handleEditListing"
                @delete="openDeleteModal"
              />
            </div>
            <div
              v-if="listings.length > 0"
              class="px-4 py-4 sm:px-6 bg-gray-50 text-right"
            >
              <router-link
                to="/seller/listings"
                class="text-sm font-medium text-jiji-primary hover:text-orange-700"
              >
                View all listings →
              </router-link>
            </div>
          </div>

          <!-- Recent Messages -->
          <div class="mt-8 bg-white shadow rounded-lg overflow-hidden">
            <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Recent Messages
              </h3>
            </div>
            <div v-if="messages.length === 0" class="px-4 py-12 text-center">
              <p class="text-gray-500">You don't have any messages yet.</p>
            </div>
            <div v-else class="divide-y divide-gray-200">
              <MessageItem
                v-for="message in messages"
                :key="message.id"
                :message="message"
                @click="handleMessageClick"
              />
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import {
  PlusIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/vue/24/solid";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import Navbar from "@/components/common/Navbar.vue";
import DashboardCard from "@/components/dashboard/DashboardCard.vue";
import ListingItem from "@/components/listings/ListingItem.vue";
import MessageItem from "@/components/messages/MessageItem.vue";

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

const fetchDashboardData = async () => {
  try {
    loading.value = true;
    error.value = null;
    successMessage.value = "";

    if (!authStore.user?.uid) {
      throw new Error("User not authenticated");
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

    messages.value = [
      {
        id: 1,
        from: "John Doe",
        subject: "iPhone 13 Pro Max",
        preview: "Is this still available? I can pay ₦400,000 cash...",
        date: "2 hours ago",
        read: false,
      },
      {
        id: 2,
        from: "Sarah Johnson",
        subject: "MacBook Pro",
        preview: "Can you send me more pictures of the laptop?",
        date: "1 day ago",
        read: true,
      },
    ];
    stats.value.messages = messages.value.length;
  } catch (err) {
    console.error("Dashboard error:", err);
    error.value = err.message || "Failed to load dashboard data";
  } finally {
    loading.value = false;
  }
};

const handleEditListing = (id) => {
  router.push(`/seller/listings/edit/${id}`);
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

    // Hide modal after successful deletion
    showDeleteModal.value = false;
    pendingDeleteId.value = null;

    // Wait a moment and refresh data
    setTimeout(() => {
      successMessage.value = "";
      fetchDashboardData();
    }, 3000);
  } catch (err) {
    console.error("Delete error:", err);
    error.value =
      "Failed to delete listing: " + (err.message || "Unknown error");
    showDeleteModal.value = false;
  }
};

const deleteListing = async (id) => {
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
};

const handleMessageClick = (message) => {
  console.log("Message clicked:", message);
};

// Clear success message after a few seconds
const showSuccessMessage = (message) => {
  successMessage.value = message;
  setTimeout(() => {
    successMessage.value = "";
  }, 3000);
};

onMounted(() => {
  fetchDashboardData();
});
</script>
