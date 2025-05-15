<!-- CategoryGrid.vue -->
<script setup>
import { onMounted, onUnmounted, ref, computed, watch } from "vue";
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useRouter } from "vue-router";
import { db } from "@/firebase";

const props = defineProps({
  title: {
    type: String,
    default: "Popular Categories",
  },
  showCounts: {
    type: Boolean,
    default: true,
  },
  maxCategories: {
    type: Number,
    default: null, // Show all categories if null
  },
  containerClass: {
    type: String,
    default: "py-12 bg-white",
  },
});

const router = useRouter();
let categoriesUnsubscribes = []; // Array to store all category unsubscribe functions

// Categories data
const categories = ref([
  {
    id: 1,
    name: "Mobile Phones",
    icon: "📱",
    count: 0,
    isValid: true,
    url: "/listings?subcategory=Mobile phones",
  },
  {
    id: 2,
    name: "Laptops",
    icon: "💻",
    count: 0,
    isValid: true,
    url: "/listings?leafCategory=Laptops",
  },
  {
    id: 3,
    name: "Land For Sale",
    icon: "🏞️",
    count: 0,
    isValid: true,
    url: "/listings?subcategory=Land for sale",
  },
  {
    id: 4,
    name: "House For Rent",
    icon: "🏠",
    count: 0,
    isValid: true,
    url: "/listings?subcategory=House for rent",
  },
  {
    id: 5,
    name: "Jobs",
    icon: "💼",
    count: 0,
    isValid: true,
    url: "/listings?category=Jobs",
  },
  {
    id: 6,
    name: "Vehicles",
    icon: "🚗",
    count: 0,
    isValid: true,
    url: "/listings?category=Vehicles",
  },
  {
    id: 7,
    name: "Clothing",
    icon: "👕",
    count: 0,
    isValid: true,
    url: "/listings?subcategory=Clothing",
  },
]);

// Function to navigate to category listings
const navigateToCategory = (category) => {
  if (category.isValid) {
    router.push(category.url);
  }
};

// Function to fetch counts for all categories
const fetchAllCategoryCounts = () => {
  try {
    // Unsubscribe from any existing listeners
    if (categoriesUnsubscribes.length > 0) {
      categoriesUnsubscribes.forEach((unsubscribe) => unsubscribe());
      categoriesUnsubscribes = [];
    }

    // For each category, set up a real-time listener
    categories.value.forEach((category, index) => {
      const categoryMapping = {
        "Mobile Phones": "Mobile Phones",
        Laptops: "Laptops",
        "Land For Sale": "land for sale",
        "House For Rent": "house for rent",
        Jobs: "Jobs",
        Vehicles: "Vehicles",
        Clothing: "Clothing",
      };

      // Get the correct database value for this category
      const categoryValue = categoryMapping[category.name];

      console.log(
        `Setting up listener for category: ${category.name} → ${categoryValue}`
      );

      // Create a combined query handler that avoids double-counting
      const handleCategoryCounts = () => {
        const uniqueIds = new Set();

        // Create first query
        const qSubCategory = query(
          collection(db, "listings"),
          where("subCategory", "==", categoryValue),
          where("status", "==", "active")
        );

        // Create second query
        const qLeafCategory = query(
          collection(db, "listings"),
          where("leafCategory", "==", categoryValue),
          where("status", "==", "active")
        );

        // Set up listeners for both queries
        const subCategoryUnsubscribe = onSnapshot(
          qSubCategory,
          (subCategorySnapshot) => {
            // Add all document IDs to the Set
            subCategorySnapshot.docs.forEach((doc) => uniqueIds.add(doc.id));
            updateCount();
          }
        );

        const leafCategoryUnsubscribe = onSnapshot(
          qLeafCategory,
          (leafCategorySnapshot) => {
            // Add all document IDs to the Set
            leafCategorySnapshot.docs.forEach((doc) => uniqueIds.add(doc.id));
            updateCount();
          }
        );

        // Update the count based on the unique document IDs
        const updateCount = () => {
          const count = uniqueIds.size;
          console.log(`${category.name} total unique count: ${count}`);
          categories.value[index].count = count;
        };

        // Store the unsubscribe functions
        categoriesUnsubscribes.push(subCategoryUnsubscribe);
        categoriesUnsubscribes.push(leafCategoryUnsubscribe);
      };

      // Start listening
      handleCategoryCounts();
    });
  } catch (error) {
    console.error("Error fetching category counts:", error);
  }
};

// Compute categories to display based on props
const displayCategories = computed(() => {
  if (props.maxCategories) {
    return categories.value.slice(0, props.maxCategories);
  }
  return categories.value;
});

// Utility functions
function formatNumber(num) {
  return num.toLocaleString();
}

onMounted(() => {
  fetchAllCategoryCounts();
  initializeScrollAnimations();
});

onUnmounted(() => {
  // Clean up category listeners
  if (categoriesUnsubscribes.length > 0) {
    categoriesUnsubscribes.forEach((unsubscribe) => unsubscribe());
  }
});

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
  <div :class="containerClass">
    <div class="container mx-auto px-4">
      <h2 class="text-2xl font-bold mb-8 animate-on-scroll">
        {{ title }}
      </h2>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-6">
        <div
          v-for="(category, index) in displayCategories"
          :key="category.id"
          class="bg-white rounded-xl p-4 sm:p-6 flex flex-col items-center shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-200 transition-all cursor-pointer animate-on-scroll relative"
          :class="`delay-${index % 3}`"
          @click="navigateToCategory(category)"
        >
          <span class="text-3xl mb-2">{{ category.icon }}</span>
          <h3 class="font-medium text-gray-800 text-center">
            {{ category.name }}
          </h3>
          <p v-if="showCounts" class="text-sm text-gray-500 mt-1">
            {{ formatNumber(category.count) }} ads
          </p>
          <div
            v-if="!category.isValid"
            class="absolute opacity-90 top-0 left-0 right-0 bg-amber-100 text-amber-800 text-xs font-medium text-center py-1 rounded-t-xl"
          >
            Coming Soon
          </div>
        </div>
      </div>
    </div>
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

.animate-on-scroll.delay-3 {
  transition-delay: 0.6s;
}
</style>
