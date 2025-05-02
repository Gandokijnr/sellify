<script setup>
import { ref, computed, onMounted } from "vue";

const props = defineProps({
  listings: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  searchQuery: {
    type: String,
    default: "",
  },
  selectedCategory: {
    type: String,
    default: "All",
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
  showSort: {
    type: Boolean,
    default: true,
  },
  favorites: {
    type: Array,
    default: () => [],
  },
  showCallSeller: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits([
  "update:searchQuery",
  "update:selectedCategory",
  "viewListing",
  "callSeller",
  "toggleFavorite",
]);

const localFavorites = ref([]);
const sortOption = ref("newest");

onMounted(() => {
  const savedFavorites = localStorage.getItem("favorites");
  if (savedFavorites) {
    localFavorites.value = JSON.parse(savedFavorites);
  }
});

// Check if listing is favorite
const isFavorite = (listingId) => {
  return (
    localFavorites.value.includes(listingId) ||
    props.favorites.includes(listingId)
  );
};

// Toggle favorite status
const toggleFavorite = (listingId, event) => {
  event.stopPropagation();
  let updatedFavorites;

  if (isFavorite(listingId)) {
    updatedFavorites = localFavorites.value.filter((id) => id !== listingId);
  } else {
    updatedFavorites = [...localFavorites.value, listingId];
  }

  localFavorites.value = updatedFavorites;
  localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  emit("toggleFavorite", listingId);
};

const filteredListings = computed(() => {
  let result = props.listings;

  // Apply filters
  if (props.searchQuery) {
    result = result.filter((listing) =>
      listing.title.toLowerCase().includes(props.searchQuery.toLowerCase())
    );
  }
  if (
    props.selectedCategory &&
    props.selectedCategory !== "all" &&
    props.selectedCategory !== "All"
  ) {
    result = result.filter(
      (listing) =>
        listing.category.toLowerCase() === props.selectedCategory.toLowerCase()
    );
  }

  // Apply sorting
  const sorted = [...result];

  switch (sortOption.value) {
    case "newest":
      // Assuming each listing has a createdAt property
      sorted.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA; // Newest first
      });
      break;
    case "price-low-high":
      sorted.sort((a, b) => {
        // Extract numeric price from different possible formats
        const getNumericPrice = (price) => {
          if (typeof price === "number") return price;
          if (typeof price === "string") {
            return parseFloat(price.replace(/[^\d.]/g, "")) || 0;
          }
          return 0; // Default for other cases
        };

        const priceA = getNumericPrice(a.price);
        const priceB = getNumericPrice(b.price);
        return priceA - priceB;
      });
      break;
    case "price-high-low":
      sorted.sort((a, b) => {
        // Extract numeric price from different possible formats
        const getNumericPrice = (price) => {
          if (typeof price === "number") return price;
          if (typeof price === "string") {
            return parseFloat(price.replace(/[^\d.]/g, "")) || 0;
          }
          return 0; // Default for other cases
        };

        const priceA = getNumericPrice(a.price);
        const priceB = getNumericPrice(b.price);
        return priceB - priceA;
      });
      break;
  }

  return sorted;
});

const formatNumber = (num) => num?.toLocaleString() || "0";

const handleSortChange = (event) => {
  sortOption.value = event.target.value;
};
</script>

<template>
  <div class="flex-1">
    <div v-if="showHeader" class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold animate-on-scroll">
        {{
          selectedCategory === "all" || selectedCategory === "All"
            ? "All Listings"
            : selectedCategory
        }}
        <span class="text-sm font-normal text-gray-500 ml-2">
          ({{ formatNumber(filteredListings.length) }} items)
        </span>
      </h2>
      <div v-if="showSort" class="animate-on-scroll delay-1">
        <select
          class="border rounded-lg px-3 py-2 text-sm focus:outline-none"
          v-model="sortOption"
          @change="handleSortChange"
        >
          <option value="newest">Sort by: Newest</option>
          <option value="price-low-high">Sort by: Price (Low to High)</option>
          <option value="price-high-low">Sort by: Price (High to Low)</option>
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
          emit('update:searchQuery', '');
          emit('update:selectedCategory', 'all');
        "
        class="text-green-600 hover:text-green-700 font-medium"
      >
        Clear filters
      </button>
    </div>

    <!-- Listings Grid -->
    <div
      v-else
      class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
    >
      <div
        v-for="listing in filteredListings"
        :key="listing.id"
        class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        @click="emit('viewListing', listing.id)"
      >
        <div class="relative">
          <img
            :src="listing.images[0]"
            :alt="listing.title"
            class="w-full h-32 sm:h-48 object-cover cursor-pointer"
          />

          <button
            class="absolute top-3 right-3 bg-white p-1.5 rounded-full shadow-sm hover:bg-gray-100"
            @click.stop="toggleFavorite(listing.id, $event)"
            :title="
              isFavorite(listing.id)
                ? 'Remove from favorites'
                : 'Add to favorites'
            "
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
              class="lucide lucide-heart"
              :class="{
                'fill-red-500 text-red-500': isFavorite(listing.id),
                'text-gray-500': !isFavorite(listing.id),
              }"
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
              class="text-xs bg-gray-100 text-gray-600 px-1 sm:px-2 py-1 rounded ml-1 truncate"
            >
              {{ listing.leafCategory }}
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
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span class="line-clamp-1">{{ listing.location }}</span>
          </div>
          <div class="flex justify-between items-center">
            <div class="font-bold text-green-600 text-sm sm:text-lg">
              {{ listing.price }}
            </div>
            <button
              v-if="showCallSeller"
              class="bg-green-100 hover:bg-green-200 text-green-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg flex items-center transition-colors text-xs sm:text-sm"
              @click.stop="emit('callSeller', listing.phoneNumber)"
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
  </div>
</template>
