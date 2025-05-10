<script setup>
import { onMounted, ref, computed, onUnmounted, watch } from "vue";
import { collection, onSnapshot, doc, getDoc, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import Navbar from "@/components/common/Navbar.vue";
import Footer from "@/components/common/Footer.vue";
import { useRouter, useRoute } from "vue-router";
import ListingsGrid from "@/components/listings/ListingsGrid.vue";
import CategoriesFilter from "@/components/listings/CategoriesFilter.vue";
import SearchHeader from "@/components/listings/SearchHeader.vue";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";

const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuthStore();
const listings = ref([]);
const loading = ref(true);
const searchQuery = ref("");
const selectedCategory = ref("All");
const userProfile = ref(null);

onMounted(() => {
  const categoryParam = route.query.category;
  if (categoryParam) {
    selectedCategory.value = categoryParam;
  }

  // Get search query from URL if present
  const queryParam = route.query.query;
  if (queryParam) {
    searchQuery.value = queryParam;
  }
});

// Watch for route changes to update filters
watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.category) {
      selectedCategory.value = newQuery.category;
    }
    if (newQuery.query) {
      searchQuery.value = newQuery.query;
    }
  }
);

// Store the unsubscribe function for cleanup
let unsubscribe = null;

const categories = ref([
  { id: 1, name: "All", label: "All", icon: "📦" },
  { id: 2, name: "Mobile Phones", label: "Mobile Phones", icon: "📱" },
  { id: 3, name: "vehicles", label: "Vehicles", icon: "🚗" },
  { id: 4, name: "property", label: "Property", icon: "🏠" },
  { id: 5, name: "fashion", label: "Fashion", icon: "👕" },
  { id: 6, name: "furniture", label: "Furniture", icon: "🛋️" },
  { id: 7, name: "jobs", label: "Jobs", icon: "💼" },
]);

const fetchUserProfile = async () => {
  try {
    if (authStore.user?.uid) {
      const userDoc = await getDoc(doc(db, "users", authStore.user.uid));
      if (userDoc.exists()) {
        userProfile.value = userDoc.data();
        if (!userProfile.value.phoneNumber) {
          toast.warning("Please update your phone number in your profile", {
            timeout: false, // Doesn't auto-close
            closeOnClick: false,
            pauseOnFocusLoss: true,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    toast.error("Failed to load user profile");
  }
};

const fetchProducts = async () => {
  loading.value = true;
  try {
    const q = query(
      collection(db, "listings"),
      where("status", "==", "active")
    );

    unsubscribe = onSnapshot(q, (querySnapshot) => {
      listings.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Active listings updated in real-time");
    });
  } catch (error) {
    console.error("Error fetching active listings:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchUserProfile();
  fetchProducts();
  initializeScrollAnimations();
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

// Update URL when filters change
watch(selectedCategory, (newCategory) => {
  // Update URL with new category
  router.replace({
    query: {
      ...route.query,
      category: newCategory !== "All" ? newCategory : undefined,
    },
  });
});

watch(searchQuery, (newQuery) => {
  // Debounce search query updates to URL
  if (newQuery) {
    router.replace({
      query: {
        ...route.query,
        query: newQuery,
      },
    });
  } else if (route.query.query) {
    // Remove query param if search is cleared
    const newQuery = { ...route.query };
    delete newQuery.query;
    router.replace({ query: newQuery });
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
  if (!userProfile.value?.phoneNumber) {
    toast.error("Please update your phone number in your profile first", {
      timeout: 5000,
      closeOnClick: false,
      pauseOnFocusLoss: true,
    });
    router.push("/profile");
    return;
  }
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

  checkIfInView();
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
                :title="
                  selectedCategory === 'All'
                    ? 'Browse All Listings'
                    : `Browse ${selectedCategory} Listings`
                "
                :description="`Discover thousands of products and services across Nigeria${
                  selectedCategory !== 'All' ? ' in ' + selectedCategory : ''
                }`"
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
