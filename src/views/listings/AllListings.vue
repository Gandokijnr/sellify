<script setup>
import { onMounted, ref, computed } from "vue";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import Navbar from "@/components/common/Navbar.vue";
import Footer from "@/components/common/Footer.vue";
import { useRouter } from "vue-router";

const router = useRouter();
const listings = ref([]);
const loading = ref(true);
const searchQuery = ref("");
const selectedCategory = ref("All");

const categories = ref([
  { id: 1, name: "All", icon: "📦" },
  { id: 2, name: "Electronics", icon: "📱" },
  { id: 3, name: "Vehicles", icon: "🚗" },
  { id: 4, name: "Property", icon: "🏠" },
  { id: 5, name: "Fashion", icon: "👕" },
  { id: 6, name: "Furniture", icon: "🛋️" },
  { id: 7, name: "Jobs", icon: "💼" },
]);

const fetchProducts = async () => {
  loading.value = true;
  try {
    const querySnapshot = await getDocs(collection(db, "listings"));
    listings.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("listing" + listings.value);
  } catch (error) {
    console.error("Failed to fetch products:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProducts();
  initializeScrollAnimations();
});

// Filter listings based on search and category
const filteredListings = computed(() => {
  let result = listings.value;

  if (selectedCategory.value !== "All") {
    result = result.filter(
      (listing) => listing.category === selectedCategory.value
    );
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (listing) =>
        listing.title.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query)
    );
  }

  return result;
});

// Utility functions
function formatNumber(num) {
  return num?.toLocaleString() || "0";
}

function callSeller(phone) {
  window.location.href = `tel:${phone}`;
}

function viewListing(id) {
  router.push({ name: "listing-details", params: { id } });
}

// Scroll animation functions
function initializeScrollAnimations() {
  const animateElements = document.querySelectorAll(".animate-on-scroll");

  function checkIfInView() {
    animateElements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add("visible");
      }
    });
  }

  // Initial check
  checkIfInView();

  // Add scroll event listener
  window.addEventListener("scroll", checkIfInView);
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-800">
    <Navbar />

    <main>
      <!-- Hero Section -->
      <div class="bg-green-700 text-white">
        <div class="container mx-auto px-4 py-12 md:py-16">
          <div class="max-w-4xl mx-auto">
            <h1 class="text-3xl md:text-4xl font-bold mb-6 animate-on-scroll">
              Browse All Listings
            </h1>
            <p class="text-lg mb-8 opacity-90 animate-on-scroll delay-1">
              Discover thousands of products and services across Nigeria
            </p>

            <div class="relative max-w-xl animate-on-scroll delay-2">
              <input
                type="text"
                placeholder="Search all listings..."
                class="w-full py-3 px-6 pl-12 rounded-xl text-gray-800 focus:outline-none bg-amber-50 shadow-lg"
                v-model="searchQuery"
              />
              <span class="absolute left-4 top-3 text-gray-400">
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
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="container mx-auto px-4 py-8">
        <div class="flex flex-col md:flex-row gap-8">
          <!-- Filters Sidebar -->
          <div class="md:hidden mb-4 animate-on-scroll">
            <div class="relative">
              <select
                v-model="selectedCategory"
                class="block p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
              >
                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.name"
                >
                  {{ category.icon }} {{ category.name }} ({{
                    category.name === "All"
                      ? formatNumber(listings.length)
                      : formatNumber(
                          listings.filter((l) => l.category === category.name)
                            .length
                        )
                  }})
                </option>
              </select>
            </div>
          </div>

          <!-- Desktop Sidebar Filters (hidden on mobile) -->
          <div
            class="hidden md:block w-full md:w-64 shrink-0 animate-on-scroll"
          >
            <div class="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <h3 class="font-bold text-lg mb-4">Categories</h3>
              <ul class="space-y-2">
                <li
                  v-for="category in categories"
                  :key="category.id"
                  @click="selectedCategory = category.name"
                  class="flex items-center p-2 rounded-lg cursor-pointer transition-colors"
                  :class="{
                    'bg-green-100 text-green-700':
                      selectedCategory === category.name,
                    'hover:bg-gray-100': selectedCategory !== category.name,
                  }"
                >
                  <span class="mr-2">{{ category.icon }}</span>
                  <span>{{ category.name }}</span>
                  <span class="ml-auto text-sm text-gray-500">
                    {{
                      category.name === "All"
                        ? formatNumber(listings.length)
                        : formatNumber(
                            listings.filter((l) => l.category === category.name)
                              .length
                          )
                    }}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Listings Grid -->
          <div class="flex-1">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-bold animate-on-scroll">
                {{
                  selectedCategory === "All" ? "All Listings" : selectedCategory
                }}
                <span class="text-sm font-normal text-gray-500 ml-2">
                  ({{ formatNumber(filteredListings.length) }} items)
                </span>
              </h2>
              <div class="animate-on-scroll delay-1">
                <select
                  class="border rounded-lg px-3 py-2 text-sm focus:outline-none"
                >
                  <option>Sort by: Newest</option>
                  <option>Sort by: Price (Low to High)</option>
                  <option>Sort by: Price (High to Low)</option>
                </select>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="text-center py-12">
              <div
                class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600 mb-2"
              ></div>
              <p class="text-gray-500">Loading listings...</p>
            </div>

            <div
              v-else-if="filteredListings.length === 0"
              class="bg-white rounded-xl p-8 text-center shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-search-x text-gray-400 mx-auto mb-4"
              >
                <path d="m13.5 8.5-5 5" />
                <path d="m8.5 8.5 5 5" />
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <h3 class="text-lg font-medium mb-2">No listings found</h3>
              <p class="text-gray-500 mb-4">
                {{
                  searchQuery
                    ? `No results for "${searchQuery}"`
                    : `No listings available in ${selectedCategory} category`
                }}
              </p>
              <button
                @click="
                  searchQuery = '';
                  selectedCategory = 'All';
                "
                class="text-green-600 hover:text-green-700 font-medium"
              >
                Clear filters
              </button>
            </div>

            <!-- Listings Grid -->
            <div
              v-else
              class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6"
            >
              <div
                v-for="listing in filteredListings"
                :key="listing.id"
                class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                @click="viewListing(listing.id)"
              >
                <div class="relative">
                  <img
                    :src="listing.images[0]"
                    :alt="listing.title"
                    class="w-full h-32 sm:h-48 object-cover cursor-pointer"
                  />

                  <button
                    class="absolute top-3 right-3 bg-white p-1.5 rounded-full shadow-sm hover:bg-gray-100"
                    @click.stop
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
                <div class="p-3 sm:p-4 cursor-pointer">
                  <div class="flex justify-between mb-2">
                    <h3 class="font-medium text-sm sm:text-lg line-clamp-1">
                      {{ listing.title }}
                    </h3>
                    <span
                      class="text-xs bg-gray-100 text-gray-600 px-1 sm:px-2 py-1 rounded ml-1"
                    >
                      {{ listing.category }}
                    </span>
                  </div>
                  <div class="flex items-center mb-2 text-gray-500 text-xs">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-map-pin mr-1"
                    >
                      <path
                        d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"
                      />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span class="line-clamp-1">{{ listing.location }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <div class="font-bold text-green-600 text-sm sm:text-lg">
                      {{ listing.price }}
                    </div>
                    <button
                      class="bg-green-100 hover:bg-green-200 text-green-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg flex items-center transition-colors text-xs sm:text-sm"
                      @click.stop="callSeller(listing.phone)"
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

            <!-- Pagination -->
            <div class="mt-8 flex justify-center animate-on-scroll">
              <nav class="inline-flex rounded-md shadow-sm">
                <button
                  class="px-3 py-1.5 rounded-l-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  class="px-3 py-1.5 border-t border-b border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                >
                  1
                </button>
                <button
                  class="px-3 py-1.5 border border-gray-300 bg-green-100 text-green-700 font-medium"
                >
                  2
                </button>
                <button
                  class="px-3 py-1.5 border-t border-b border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                >
                  3
                </button>
                <button
                  class="px-3 py-1.5 rounded-r-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.animate-on-scroll {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.animate-on-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}

.animate-on-scroll.delay-1 {
  transition-delay: 0.2s;
}
.animate-on-scroll.delay-2 {
  transition-delay: 0.4s;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sticky {
  position: sticky;
}
</style>
