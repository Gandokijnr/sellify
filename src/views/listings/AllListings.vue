<script setup>
import { onMounted, ref, computed, onUnmounted } from "vue";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import Navbar from "@/components/common/Navbar.vue";
import Footer from "@/components/common/Footer.vue";
import { useRouter } from "vue-router";
import ListingsGrid from "@/components/listings/ListingsGrid.vue";
import CategoriesFilter from "@/components/listings/CategoriesFilter.vue";
import SearchHeader from "@/components/listings/SearchHeader.vue";

const router = useRouter();
const listings = ref([]);
const loading = ref(true);
const searchQuery = ref("");
const selectedCategory = ref("All");

// Store the unsubscribe function for cleanup
let unsubscribe = null;

const categories = ref([
  { id: 1, name: "All", icon: "📦" },
  { id: 2, name: "Electronics", icon: "📱" },
  { id: 3, name: "Vehicles", icon: "🚗" },
  { id: 4, name: "Property", icon: "🏠" },
  { id: 5, name: "Fashion", icon: "👕" },
  { id: 6, name: "Furniture", icon: "🛋️" },
  { id: 7, name: "Jobs", icon: "💼" },
]);

const fetchProducts = () => {
  loading.value = true;
  try {
    unsubscribe = onSnapshot(collection(db, "listings"), (querySnapshot) => {
      listings.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Listings updated in real-time");
    });
  } catch (error) {
    console.error("Failed to set up real-time listener:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProducts();
  initializeScrollAnimations();
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

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

function formatNumber(num) {
  return num?.toLocaleString() || "0";
}

function callSeller(phone) {
  window.location.href = `tel:${phone}`;
}

function viewListing(id) {
  router.push({ name: "listing-details", params: { id } });
}

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
            <div class="relative max-w-xl animate-on-scroll delay-2">
              <SearchHeader
                v-model:searchQuery="searchQuery"
                title="Browse All Listings"
                description="Discover thousands of products and services across Nigeria"
              />
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
              <CategoriesFilter
                :categories="categories"
                :listings="listings"
                v-model:selectedCategory="selectedCategory"
                mobile
              />
            </div>
          </div>

          <!-- Desktop Sidebar Filters (hidden on mobile) -->
          <div
            class="hidden md:block w-full md:w-64 shrink-0 animate-on-scroll"
          >
            <CategoriesFilter
              :categories="categories"
              :listings="listings"
              v-model:selectedCategory="selectedCategory"
            />
          </div>

          <!-- Listings Grid -->
          <ListingsGrid
            :listings="filteredListings || []"
            :loading="loading"
            v-model:searchQuery="searchQuery"
            v-model:selectedCategory="selectedCategory"
            @viewListing="viewListing"
            @callSeller="callSeller"
          />
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  text-indent: 1px;
  text-overflow: "";
}

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
