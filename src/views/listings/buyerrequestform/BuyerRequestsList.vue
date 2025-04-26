<script setup>
import { ref, onMounted, computed } from "vue";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import Navbar from "@/components/common/Navbar.vue";
import Footer from "@/components/common/Footer.vue";

const requests = ref([]);
const searchQuery = ref("");
const selectedCategory = ref("All");
const sortOption = ref("newest");
const isLoading = ref(true);

// Categories for filtering - you would ideally get these from the database
const categories = ref([
  "All",
  "electronics",
  "Vehicles",
  "Real Estate",
  "Furniture",
  "Clothing",
]);

onMounted(async () => {
  try {
    const q = query(
      collection(db, "buyerRequests"),
      where("status", "==", "active")
    );
    const snapshot = await getDocs(q);

    // Filter expired requests (client-side)
    requests.value = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          expiresAt: data.expiresAt?.toDate(), // Convert Firestore Timestamp to JS Date
          timeLeft: calculateTimeLeft(data.expiresAt?.toDate()),
          category: data.category || "Other", // Ensure category exists
        };
      })
      .filter((request) => {
        return request.expiresAt > new Date(); // Only show unexpired
      });

    isLoading.value = false;
  } catch (error) {
    console.error("Error fetching requests:", error);
    isLoading.value = false;
  }
});

// Calculate time left in a more user-friendly format
function calculateTimeLeft(expiryDate) {
  if (!expiryDate) return "Unknown";

  const now = new Date();
  const diffTime = expiryDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 1) return `${diffDays} days`;
  if (diffDays === 1) return "1 day";

  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  if (diffHours > 1) return `${diffHours} hours`;
  if (diffHours === 1) return "1 hour";

  return "Less than an hour";
}

// Computed property for filtered and sorted requests
const filteredRequests = computed(() => {
  let result = [...requests.value];

  // Apply category filter
  if (selectedCategory.value !== "All") {
    result = result.filter(
      (request) => request.category === selectedCategory.value
    );
  }

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (request) =>
        request.title.toLowerCase().includes(query) ||
        request.description.toLowerCase().includes(query)
    );
  }

  // Apply sorting
  switch (sortOption.value) {
    case "newest":
      result.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
      break;
    case "expiringSoon":
      result.sort((a, b) => a.expiresAt - b.expiresAt);
      break;
    case "budgetHigh":
      result.sort((a, b) => b.maxBudget - a.maxBudget);
      break;
    case "budgetLow":
      result.sort((a, b) => a.minBudget - b.minBudget);
      break;
  }

  return result;
});

// Function to determine budget display class based on budget amount
function getBudgetClass(maxBudget) {
  if (maxBudget >= 1000) return "text-green-600";
  if (maxBudget >= 500) return "text-green-600";
  return "text-gray-600";
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <main class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Buyer Requests</h1>
        <p class="text-gray-600 mt-2">
          Find potential clients looking for services like yours
        </p>
      </div>

      <!-- Search and Filters Bar -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Search Input -->
          <div class="relative flex-grow">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search requests..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <div class="absolute left-3 top-2.5 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <!-- Category Filter -->
          <div class="w-full md:w-48">
            <select
              v-model="selectedCategory"
              class="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option
                v-for="category in categories"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
          </div>

          <!-- Sort Options -->
          <div class="w-full md:w-48">
            <select
              v-model="sortOption"
              class="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="newest">Newest First</option>
              <option value="expiringSoon">Expiring Soon</option>
              <option value="budgetHigh">Highest Budget</option>
              <option value="budgetLow">Lowest Budget</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center my-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"
        ></div>
      </div>

      <!-- No Results State -->
      <div
        v-else-if="filteredRequests.length === 0"
        class="bg-white rounded-lg shadow-sm p-8 text-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-16 w-16 mx-auto text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 class="text-xl font-medium text-gray-700 mt-4">
          No requests found
        </h3>
        <p class="text-gray-500 mt-2">
          Try adjusting your search or filter criteria
        </p>
      </div>

      <!-- Request Cards Grid -->
      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="request in filteredRequests"
          :key="request.id"
          class="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition duration-200 overflow-hidden"
        >
          <!-- Card Header with Category Tag -->
          <div
            class="px-5 py-4 border-b border-gray-100 flex justify-between items-center"
          >
            <span
              class="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800"
            >
              {{ request.category }}
            </span>
            <span class="text-xs text-gray-500 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {{ request.timeLeft }}
            </span>
          </div>

          <!-- Card Body -->
          <div class="p-5">
            <h3 class="font-bold text-lg text-gray-900 line-clamp-1">
              {{ request.title }}
            </h3>
            <p class="text-gray-600 mt-2 text-sm line-clamp-3">
              {{ request.description }}
            </p>

            <!-- Request Details -->
            <div class="mt-4 space-y-2 text-sm">
              <div class="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span class="font-medium">Budget:</span>
                <span
                  :class="getBudgetClass(request.maxBudget)"
                  class="ml-1 font-bold"
                >
                  ${{ request.minBudget }} - ${{ request.maxBudget }}
                </span>
              </div>

              <div class="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span class="font-medium">Location:</span>
                <span class="ml-1">{{ request.location || "Remote" }}</span>
              </div>
            </div>
          </div>

          <!-- Card Footer -->
          <div class="px-5 py-4 bg-gray-50 border-t border-gray-100">
            <button
              class="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-200 flex items-center justify-center font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Contact Buyer
            </button>
          </div>
        </div>
      </div>

      <!-- Results Summary -->
      <div
        v-if="!isLoading && filteredRequests.length > 0"
        class="mt-6 text-sm text-gray-500 text-center"
      >
        Showing {{ filteredRequests.length }}
        {{ filteredRequests.length === 1 ? "request" : "requests" }}
      </div>
    </main>

    <Footer />
  </div>
</template>
