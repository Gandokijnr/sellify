<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import ListingsGrid from "../listings/ListingsGrid.vue";
import CategoryGrid from "@/components/categories/CategoryGrid.vue";
import { Search, ArrowRight, Check, Shield, Phone, MessageSquare, Truck, Users, Lock, Award, Clock, ThumbsUp, Star } from 'lucide-vue-next';
import { db } from "@/firebase";
import Navbar from "@/components/common/Navbar.vue";
import Footer from "@/components/common/Footer.vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const listings = ref([]);
const loading = ref(true);
const searchQuery = ref("");
const favorites = ref([]);
const authStore = useAuthStore();
let unsubscribe = null;

const fetchProducts = () => {
  loading.value = true;
  try {
    const activeListingsQuery = query(
      collection(db, "listings"),
      where("status", "==", "active")
    );
    
    unsubscribe = onSnapshot(activeListingsQuery, (querySnapshot) => {
      listings.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Active listings updated in real-time");
    });
  } catch (error) {
    console.error("Failed to set up real-time listener:", error);
  } finally {
    loading.value = false;
  }
};
function viewListing(id) {
  router.push({ name: "listing-details", params: { id } });
}

onMounted(() => {
  fetchProducts();
  initializeScrollAnimations();
});

onUnmounted(() => {
  // Clean up listeners
  if (unsubscribe) {
    unsubscribe();
  }
});

// Utility functions
function formatNumber(num) {
  return num.toLocaleString();
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
      <div class="bg-teal-700 text-white">
        <div class="container mx-auto px-4 py-16 md:py-24">
          <div class="max-w-3xl mx-auto text-center">
            <h1
              class="text-4xl md:text-5xl font-bold mb-6 slide-in-top fade-in-fwd"
            >
              Buy & Sell Anything in Nigeria
            </h1>
            <p class="text-xl mb-8 opacity-90 fade-in-fwd">
              Discover the best deals across the country on Selify
            </p>

            <div class="relative max-w-xl mx-auto">
              <input
                type="text"
                placeholder="What are you looking for?"
                class="w-full py-4 px-6 pl-12 rounded-xl text-gray-800 focus:outline-none bg-amber-50 shadow-lg"
                v-model="searchQuery"
              />
              <span class="absolute left-4 top-4 text-gray-400">
                <Search class="h-5 w-5" />
              </span>
              <button
                class="absolute right-2 top-2 bg-teal-700 text-white py-2 px-6 rounded-lg hover:bg-teal-600 transition-colors shadow"
                @click="$router.push(`/listings?query=${searchQuery}`)"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Categories - Now using the CategoryGrid component -->
      <CategoryGrid
        title="Popular Categories"
        :showCounts="true"
        containerClass="py-12 bg-white"
      />

      <!-- Featured Listings -->
      <div class="py-12">
        <div class="container mx-auto px-4">
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-2xl font-bold animate-on-scroll">
              Latest Listings
            </h2>

            <router-link
              :to="{ name: 'enhanced-listings' }"
              class="flex items-center text-teal-600 hover:text-teal-700 cursor-pointer animate-on-scroll delay-1"
            >
              <span class="font-medium">View all</span>
              <ArrowRight class="h-4 w-4 ml-1" />
            </router-link>
          </div>

          <!-- Listings Grid -->
          <ListingsGrid
            :listings="listings || []"
            :loading="loading"
            v-model:searchQuery="searchQuery"
            @viewListing="viewListing"
            :showSort="false"
            :showHeader="false"
            :showCallSeller="false"
          />
        </div>
      </div>

      <!-- How It Works -->
      <div class="py-12 bg-white">
        <div class="container mx-auto px-4">
          <h2 class="text-2xl font-bold mb-12 text-center animate-on-scroll">
            How Selify Works
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="text-center animate-on-scroll">
              <div
                class="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Shield class="h-6 w-6 text-teal-600" />
              </div>
              <h3 class="text-lg font-medium mb-2">Find What You Need</h3>
              <p class="text-gray-600">
                Browse thousands of items across all categories throughout
                Nigeria.
              </p>
            </div>

            <div class="text-center animate-on-scroll delay-1">
              <div
                class="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Phone class="h-6 w-6 text-teal-600" />
              </div>
              <h3 class="text-lg font-medium mb-2">Contact the Seller</h3>
              <p class="text-gray-600">
                Connect directly with sellers to negotiate and make
                arrangements.
              </p>
            </div>

            <div class="text-center animate-on-scroll delay-2">
              <div
                class="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Truck class="h-6 w-6 text-teal-600" />
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
      <div class="bg-teal-50 py-12">
        <div class="container mx-auto px-4">
          <div class="max-w-3xl mx-auto text-center">
            <h2 class="text-2xl md:text-3xl font-bold mb-4 animate-on-scroll">
              Have Something to Sell?
            </h2>
            <p class="text-gray-600 mb-8 animate-on-scroll delay-1">
              List your items for free and reach millions of buyers across
              Nigeria
            </p>
            <router-link
              :to="
                authStore.isAuthenticated ? '/seller/listings/create' : '/login'
              "
              class="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 font-medium transition-colors shadow-sm animate-on-scroll delay-2"
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
.fade-in-fwd {
  -webkit-animation: fade-in-fwd 0.6s cubic-bezier(0.39, 0.575, 0.565, 1) both;
  animation: fade-in-fwd 0.6s cubic-bezier(0.39, 0.575, 0.565, 1) both;
}

@-webkit-keyframes fade-in-fwd {
  0% {
    -webkit-transform: translateZ(-80px);
    transform: translateZ(-80px);
    opacity: 0;
  }
  100% {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    opacity: 1;
  }
}
@keyframes fade-in-fwd {
  0% {
    -webkit-transform: translateZ(-80px);
    transform: translateZ(-80px);
    opacity: 0;
  }
  100% {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    opacity: 1;
  }
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
.animate-on-scroll.delay-3 {
  transition-delay: 0.6s;
}

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
