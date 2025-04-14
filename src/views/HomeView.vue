<script setup>
import { onMounted, ref, watch, computed } from "vue";
import Navbar from "@/components/common/Navbar.vue";
import Footer from "@/components/common/Footer.vue";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_BASE_URL;

const listings = ref([]);
const loading = ref(true);

const fetchProducts = async () => {
  loading.value = true;

  try {
    const response = await axios.get(`${apiUrl}`);
    listings.value = response.data;
  } catch (error) {
    console.error("Failed to fetch products:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProducts();
});

// Utility functions
function formatNumber(num) {
  return num.toLocaleString();
}

function callSeller(index) {
  alert(`Calling seller for listing ${listings.value[index].title}`);
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-800">
    <Navbar />

    <main>
      <!-- Hero Section -->
      <div class="bg-green-700 text-white">
        <div class="container mx-auto px-4 py-16 md:py-24">
          <div class="max-w-3xl mx-auto text-center">
            <h1 class="text-4xl md:text-5xl font-bold mb-6">
              Buy & Sell Anything in Nigeria
            </h1>
            <p class="text-xl mb-8 opacity-90">
              Discover the best deals across the country on Sellify
            </p>

            <div class="relative max-w-xl mx-auto">
              <input
                type="text"
                placeholder="What are you looking for?"
                class="w-full py-4 px-6 pl-12 rounded-xl text-gray-800 focus:outline-none bg-amber-50 shadow-lg"
                v-model="searchQuery"
              />
              <span class="absolute left-4 top-4 text-gray-400">
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
                  class="lucide lucide-search"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </span>
              <button
                class="absolute right-2 top-2 bg-green-700 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition-colors shadow"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Categories -->
      <div class="py-12 bg-white">
        <div class="container mx-auto px-4">
          <h2 class="text-2xl font-bold mb-8">Popular Categories</h2>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div
              v-for="category in categories"
              :key="category.id"
              class="bg-white rounded-xl p-4 sm:p-6 flex flex-col items-center shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all cursor-pointer"
            >
              <span class="text-3xl mb-2">{{ category.icon }}</span>
              <h3 class="font-medium text-gray-800 text-center">
                {{ category.name }}
              </h3>
              <p class="text-sm text-gray-500 mt-1">
                {{ formatNumber(category.count) }} ads
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Featured Listings -->
      <div class="py-12">
        <div class="container mx-auto px-4">
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-2xl font-bold">Latest Listings</h2>
            <div
              class="flex items-center text-green-600 hover:text-green-700 cursor-pointer"
            >
              <span class="font-medium">View all</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-arrow-right ml-1"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
          </div>

          <div v-if="loading" class="text-center py-8">
            <span class="text-gray-500 text-lg">Loading products...</span>
          </div>

          <div
            v-else
            class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            <div
              v-for="listing in listings"
              :key="listing.id"
              class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div class="relative">
                <img
                  :src="listing.images"
                  :alt="listing.title"
                  class="w-full h-40 sm:h-48 object-cover"
                />
                <button
                  class="absolute top-3 right-3 bg-white p-1.5 rounded-full shadow-sm hover:bg-gray-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-heart text-gray-500"
                  >
                    <path
                      d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
                    />
                  </svg>
                </button>
                <div
                  v-if="listing.featured"
                  class="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded"
                >
                  Featured
                </div>
              </div>
              <div class="p-4">
                <div class="flex justify-between mb-2">
                  <h3 class="font-medium text-base sm:text-lg line-clamp-1">
                    {{ listing.title }}
                  </h3>
                </div>
                <div
                  class="flex items-center mb-3 text-gray-500 text-xs sm:text-sm"
                >
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
                  <span>{{ listing.location }}</span>
                  <span class="mx-2">•</span>
                  <span>{{ listing.date }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <div class="font-bold text-green-600 text-base sm:text-lg">
                    {{ listing.price }}
                  </div>
                  <button
                    class="bg-green-100 hover:bg-green-200 text-green-700 px-2 sm:px-3 py-1 rounded-lg flex items-center transition-colors text-sm"
                    @click="callSeller(listing.id)"
                  >
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
                      class="lucide lucide-phone mr-1"
                    >
                      <path
                        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                      />
                    </svg>
                    <span class="font-medium">Call</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- How It Works -->
      <div class="py-12 bg-white">
        <div class="container mx-auto px-4">
          <h2 class="text-2xl font-bold mb-12 text-center">
            How Sellify Works
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="text-center">
              <div
                class="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-search text-green-600"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <h3 class="text-lg font-medium mb-2">Find What You Need</h3>
              <p class="text-gray-600">
                Browse thousands of items across all categories throughout
                Nigeria.
              </p>
            </div>

            <div class="text-center">
              <div
                class="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-phone text-green-600"
                >
                  <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-medium mb-2">Contact the Seller</h3>
              <p class="text-gray-600">
                Connect directly with sellers to negotiate and make
                arrangements.
              </p>
            </div>

            <div class="text-center">
              <div
                class="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-star text-green-600"
                >
                  <polygon
                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-medium mb-2">Complete Your Purchase</h3>
              <p class="text-gray-600">
                Meet in person to complete the transaction safely.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="bg-green-50 py-12">
        <div class="container mx-auto px-4">
          <div class="max-w-3xl mx-auto text-center">
            <h2 class="text-2xl md:text-3xl font-bold mb-4">
              Have Something to Sell?
            </h2>
            <p class="text-gray-600 mb-8">
              List your items for free and reach millions of buyers across
              Nigeria
            </p>
            <router-link
              :to="{ name: 'create-listing' }"
              class="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-medium transition-colors shadow-sm"
            >
              Post Your Ad Now
            </router-link>
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

/* Optional: Add responsive font sizes */
@media (max-width: 640px) {
  .text-base {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
}
</style>
