<template>
  <div class="min-h-screen bg-gray-50 text-gray-800">
    <PageSeo
      pageName="listings"
      :category="filterStore.selectedCategory !== 'All' ? filterStore.selectedCategory : null"
      structuredDataType="category"
      :structuredData="{
        category: filterStore.selectedCategory !== 'All' ? filterStore.selectedCategory : 'All Products'
      }"
    />
    <Navbar />

    <main>
      <!-- Hero Section with SearchHeader Component -->
      <SearchHeader
        :title="pageTitle"
        :description="pageDescription"
        :search-query="filterStore.searchQuery"
        @update:search-query="(val) => filterStore.searchQuery = val"
        @search="handleSearch"
      />

      <!-- Main Content -->
      <div class="container mx-auto px-4 py-8">
        <!-- Filter Summary & Sort Controls (Mobile) -->
        <div class="md:hidden mb-6">
          <EnhancedCategoryFilter
            :isMobile="true"
            :listings="allListings"
            @filter-applied="handleFilterApplied"
          />
        </div>

        <!-- Results Content -->
        <div class="flex flex-col md:flex-row gap-8">
          <!-- Desktop Sidebar Filters -->
          <div class="hidden md:block w-full md:w-64 shrink-0">
            <EnhancedCategoryFilter
              :isMobile="false"
              :listings="allListings"
              @filter-applied="handleFilterApplied"
            />
          </div>

          <!-- Listings Display -->
          <div class="flex-1">
            <!-- Results Stats & Controls -->
            <div class="flex flex-wrap items-center justify-between mb-6">
              <div class="text-gray-600 mb-2 md:mb-0">
                <p v-if="filterStore.loading">
                  <span class="animate-pulse">Loading listings...</span>
                </p>
                <p v-else>
                  Found <span class="font-semibold">{{ filterStore.listings.length }}</span> 
                  {{ filterStore.listings.length === 1 ? 'listing' : 'listings' }}
                </p>
              </div>
              
              <!-- Sort Dropdown (Desktop) -->
              <div class="hidden md:block relative">
                <select
                  v-model="filterStore.selectedSort"
                  @change="handleSortChange"
                  class="bg-white border border-gray-300 rounded-lg py-2 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option 
                    v-for="option in filterStore.sortOptions" 
                    :key="option.id" 
                    :value="option.id"
                  >
                    {{ option.name }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Loading Skeleton -->
            <div v-if="filterStore.loading" class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <ListingSkeleton v-for="i in 8" :key="i" />
            </div>

            <!-- Error State -->
            <div v-else-if="filterStore.error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 class="text-lg font-medium text-red-800 mb-2">Error Loading Listings</h3>
              <p class="text-red-600">{{ filterStore.error }}</p>
              <button 
                @click="filterStore.fetchFilteredListings" 
                class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
            </div>

            <!-- Empty State -->
            <div v-else-if="filterStore.listings.length === 0" class="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 class="text-lg font-medium text-gray-800 mb-2">No Listings Found</h3>
              <p class="text-gray-600">
                No listings match your current filters. Try adjusting your search criteria or check back later.
              </p>
              <button 
                @click="filterStore.resetFilters" 
                class="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Reset All Filters
              </button>
            </div>

            <!-- Results Grid using ListingsGrid component -->
            <div v-else class="mt-4 sticky top-30">
              <ListingsGrid
                :listings="filterStore.listings"
                :loading="false"
                :search-query="filterStore.searchQuery"
                :selected-category="filterStore.selectedMainCategory"
                :selected-subcategory="filterStore.selectedSubcategory"
                :selected-brand="filterStore.selectedBrand"
                :show-header="false"
                :show-sort="false"
                :show-call-seller="true"
                @viewListing="viewListing"
                @callSeller="callSeller"
              />
            </div>

            <!-- Load More Button -->
            <div v-if="hasMoreListings" class="text-center mt-8">
              <button 
                @click="loadMoreListings"
                class="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors inline-flex items-center"
                :disabled="loadingMore"
              >
                <span v-if="loadingMore" class="mr-2">
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                {{ loadingMore ? 'Loading...' : 'Load More' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import PageSeo from '@/components/seo/PageSeo.vue';
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import SearchHeader from '@/components/listings/SearchHeader.vue';
import { db } from '@/firebase';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/stores/auth';
import { useFilterStore } from '@/stores/filter.store';

import Navbar from '@/components/common/Navbar.vue';
import Footer from '@/components/common/Footer.vue';
import ListingsGrid from '@/components/listings/ListingsGrid.vue';
import ListingSkeleton from '@/components/listings/ListingSkeleton.vue';
import EnhancedCategoryFilter from '@/components/listings/EnhancedCategoryFilter.vue';

// Setup
const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuthStore();
const filterStore = useFilterStore();

// State
const allListings = ref([]);
const loadingMore = ref(false);
const hasMoreListings = ref(false);
const lastVisibleListing = ref(null);
const loadLimit = ref(20);
const userProfile = ref(null);
const sellerInfo = ref(null);

// Computed properties
const pageTitle = computed(() => {
  
  if (filterStore.selectedMainCategory === 'all') {
    return 'Browse All Listings';
  }
  
  const mainCategory = filterStore.categoryHierarchy.find(c => c.id === filterStore.selectedMainCategory);
  if (!mainCategory) return 'Browse Listings';
  
  if (filterStore.selectedSubcategory === 'all') {
    return `Browse ${mainCategory.name} Listings`;
  }
  
  const subcategory = mainCategory.subcategories.find(s => s.id === filterStore.selectedSubcategory);
  if (!subcategory) return `Browse ${mainCategory.name} Listings`;
  
  return `Browse ${subcategory.name} Listings`;
});

const pageDescription = computed(() => {
  return `Discover thousands of products and services across Nigeria${
    filterStore.selectedMainCategory !== 'all' ? 
      (' in ' + (filterStore.selectedMainCategory.charAt(0).toUpperCase() + filterStore.selectedMainCategory.slice(1))) : 
      ''
  }`;
});

// Methods
const fetchAllListings = async () => {
  try {
    const q = query(
      collection(db, 'listings'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const querySnapshot = await getDocs(q);
    allListings.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Initialize filters with this complete data
    if (allListings.value.length > 0) {
      // Set the listings in the store directly
      filterStore.listings = allListings.value;
      // Then apply any filters
      filterStore.fetchFilteredListings(allListings.value);
    } else {
      console.log('No listings found');
    }
    
  } catch (error) {
    console.error('Error fetching all listings:', error);
  }
};

const fetchUserProfile = async () => {
  try {
    if (authStore.user?.uid) {
      const userDoc = await getDoc(doc(db, 'users', authStore.user.uid));
      if (userDoc.exists()) {
        userProfile.value = userDoc.data();
        if (!userProfile.value.phoneNumber) {
          toast.warning('Please update your phone number in your profile', {
            timeout: false,
            closeOnClick: false,
            pauseOnFocusLoss: true,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    toast.error('Failed to load user profile');
  }
};

const handleSearch = () => {
  filterStore.fetchFilteredListings();
};

const handleFilterApplied = () => {
  // Additional logic if needed when filters are applied
  initializeScrollAnimations();
};

const handleSortChange = () => {
  filterStore.fetchFilteredListings();
};

const loadMoreListings = async () => {
  // Implement pagination logic here if needed
  loadingMore.value = true;
  
  try {
    // In a real implementation, you would use lastVisibleListing to query the next batch
    // For now, we'll just simulate loading more
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Set hasMoreListings to false when there are no more listings to load
    hasMoreListings.value = false;
  } catch (error) {
    console.error('Error loading more listings:', error);
    toast.error('Failed to load more listings');
  } finally {
    loadingMore.value = false;
  }
};

const viewListing = (id) => {
  router.push({ name: 'listing-details', params: { id } });
};

const callSeller = async (listingId) => {
  try {
    if (!authStore.user) {
      router.push({ name: 'login', query: { redirect: route.fullPath } });
      return;
    }

    if (!userProfile.value?.phoneNumber) {
      toast.warning('Please update your phone number in your profile before contacting sellers.');
      router.push({ name: 'profile' });
      return;
    }

    const listingDoc = await getDoc(doc(db, 'listings', listingId));
    if (!listingDoc.exists()) {
      toast.error('Listing details not found');
      return;
    }

    const listingData = listingDoc.data();
    const userDoc = await getDoc(doc(db, 'users', listingData.userId));

    if (!userDoc.exists()) {
      toast.warning('Seller information not available');
      return;
    }

    sellerInfo.value = { id: userDoc.id, ...userDoc.data() };
    
    if (!sellerInfo.value.phoneNumber) {
      toast.warning('Seller\'s phone number is not available');
      return;
    }

    // Format phone number
    const formattedNumber = formatPhoneNumber(sellerInfo.value.phoneNumber);
    window.location.href = `tel:${formattedNumber}`;
  } catch (error) {
    console.error('Error fetching seller info:', error);
    toast.error('Failed to fetch seller information');
  }
};

const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove any non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if the number starts with country code (assuming Nigeria +234)
  if (cleaned.startsWith('234')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    // If it starts with 0, replace with +234
    return `+234${cleaned.substring(1)}`;
  } else {
    // Otherwise, assume it's a local number and add +234
    return `+234${cleaned}`;
  }
};

function initializeScrollAnimations() {
  const animateElements = document.querySelectorAll('.animate-on-scroll');

  function checkIfInView() {
    animateElements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add('visible');
      }
    });
  }

  checkIfInView();
  window.addEventListener('scroll', checkIfInView);
}

// Lifecycle hooks
onMounted(async () => {
  filterStore.loading = true;
  await fetchAllListings();
  await fetchUserProfile();
  
  // Log what's happening with the listings
  
  // Initialize from URL if needed
  const { query: searchQuery, category, subcategory, price, condition, location, sort } = route.query;
  
  if (category) filterStore.applyFilter('mainCategory', category);
  if (subcategory) filterStore.applyFilter('subcategory', subcategory);
  if (price) filterStore.applyFilter('priceRange', price);
  if (condition) filterStore.applyFilter('condition', condition);
  if (location) filterStore.applyFilter('location', location);
  if (sort) filterStore.applyFilter('sort', sort);
  if (searchQuery) filterStore.applyFilter('search', searchQuery);
  
  // Make sure we actually have listings in the filter store
  if (filterStore.listings.length === 0 && allListings.value.length > 0) {
    filterStore.listings = [...allListings.value];
  }
  
  // Force a fresh filter application
  if (allListings.value.length > 0) {
    filterStore.fetchFilteredListings(allListings.value);
  }
  
  initializeScrollAnimations();
});

onUnmounted(() => {
  window.removeEventListener('scroll', initializeScrollAnimations);
});
</script>

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
</style>
