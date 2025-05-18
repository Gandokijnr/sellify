<template>
  <div class="category-filter">
    <!-- Mobile View Filter Bar -->
    <div v-if="isMobile" class="mb-4 bg-white rounded-lg shadow p-4">
      <div class="flex flex-wrap items-center gap-2">
        <!-- Category Dropdown -->
        <div class="relative flex-grow min-w-[200px]">
          <select
            :value="filterStore.selectedMainCategory"
            @change="handleMainCategoryChange($event.target.value)"
            class="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none pr-10"
          >
            <option
              v-for="category in filterStore.allCategories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.icon }} {{ category.name }} ({{ formatNumber(categoryCount[category.id] || 0) }})
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </div>
        </div>
        
        <!-- More Filters Button -->
        <button
          @click="isFiltersOpen = !isFiltersOpen"
          class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50"
        >
          <span class="mr-1">{{ isFiltersOpen ? 'Hide Filters' : 'More Filters' }}</span>
          <svg
            :class="{ 'transform rotate-180': isFiltersOpen }"
            class="w-4 h-4 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        
        <!-- Sort Button -->
        <div class="relative">
          <button
            @click="isSortOpen = !isSortOpen"
            class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50"
          >
            <span class="mr-1">Sort</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path>
            </svg>
          </button>
          
          <!-- Sort Dropdown -->
          <div
            v-if="isSortOpen"
            class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            <div class="py-1">
              <a
                v-for="option in filterStore.sortOptions"
                :key="option.id"
                href="#"
                @click.prevent="handleSortChange(option.id)"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                :class="{ 'bg-gray-100 text-teal-600': filterStore.selectedSort === option.id }"
              >
                {{ option.name }}
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Mobile Expanded Filters -->
      <div v-if="isFiltersOpen" class="mt-4 border-t border-gray-200 pt-4">
        <!-- Subcategory Filter -->
        <div v-if="filterStore.availableSubcategories.length > 1" class="mb-4">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Subcategory</h4>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="subcategory in filterStore.availableSubcategories"
              :key="subcategory.id"
              @click="handleSubcategoryChange(subcategory.id)"
              class="px-3 py-1 text-sm rounded-full transition-colors flex items-center gap-1"
              :class="filterStore.selectedSubcategory === subcategory.id 
                ? 'bg-teal-100 text-teal-800 border border-teal-200' 
                : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'"
            >
              <span>{{ subcategory.icon }} {{ subcategory.name }}</span>
              <span class="ml-1 text-xs text-gray-500 bg-white px-1.5 py-0.5 rounded-full">
                {{ formatNumber(subcategoryCount[subcategory.id] || 0) }}
              </span>
            </button>
          </div>
        </div>
        
        <!-- Price Range Filter -->
        <div class="mb-4">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Price Range</h4>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="range in filterStore.priceRanges"
              :key="range.id"
              @click="handlePriceChange(range.id)"
              class="px-3 py-1 text-sm rounded transition-colors text-left"
              :class="filterStore.selectedPriceRange === range.id 
                ? 'bg-teal-100 text-teal-800 border border-teal-200' 
                : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'"
            >
              {{ range.name }}
            </button>
          </div>
        </div>
        
        <!-- Condition Filter -->
        <div class="mb-4">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Condition</h4>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="condition in filterStore.conditionOptions"
              :key="condition.id"
              @click="handleConditionChange(condition.id)"
              class="px-3 py-1 text-sm rounded transition-colors text-left"
              :class="filterStore.selectedCondition === condition.id 
                ? 'bg-teal-100 text-teal-800 border border-teal-200' 
                : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'"
            >
              {{ condition.name }}
            </button>
          </div>
        </div>
        
        <!-- Location Filter -->
        <div class="mb-4">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Location</h4>
          <select
            :value="filterStore.selectedLocation"
            @change="handleLocationChange($event.target.value)"
            class="w-full p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option
              v-for="location in filterStore.locationOptions"
              :key="location.id"
              :value="location.id"
            >
              {{ location.name }}
            </option>
          </select>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex items-center justify-between mt-4">
          <button
            @click="filterStore.resetFilters"
            class="text-gray-600 text-sm hover:text-teal-600"
          >
            Reset All Filters
          </button>
          <button
            @click="applyFilters"
            class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
    
    <!-- Desktop View Sidebar -->
    <div v-else class="h-full">
      <div class="bg-white rounded-lg shadow-sm p-4 sticky top-4">
        <h3 class="font-bold text-lg mb-4">Filter By Category</h3>
        
        <!-- Main Categories -->
        <div class="mb-6">
          <ul class="space-y-2">
            <li
              v-for="category in filterStore.allCategories"
              :key="category.id"
              @click="handleMainCategoryChange(category.id)"
              class="flex items-center p-2 rounded-lg cursor-pointer transition-colors"
              :class="{
                'bg-teal-100 text-teal-700': filterStore.selectedMainCategory === category.id,
                'hover:bg-gray-100': filterStore.selectedMainCategory !== category.id,
              }"
            >
              <span class="mr-2">{{ category.icon }}</span>
              <span>{{ category.name }}</span>
              <span 
                v-if="categoryCount[category.id]"
                class="ml-auto text-sm text-gray-500"
              >
                {{ formatNumber(categoryCount[category.id]) }}
              </span>
            </li>
          </ul>
        </div>
        
        <!-- Subcategories (if applicable) -->
        <div v-if="filterStore.availableSubcategories.length > 1" class="mb-6">
          <h4 class="font-semibold text-gray-700 mb-2 border-b pb-1">Subcategories</h4>
          <ul class="space-y-1 pl-2">
            <li
              v-for="subcategory in filterStore.availableSubcategories"
              :key="subcategory.id"
              @click="handleSubcategoryChange(subcategory.id)"
              class="flex items-center p-1.5 rounded cursor-pointer transition-colors"
              :class="{
                'bg-teal-50 text-teal-700': filterStore.selectedSubcategory === subcategory.id,
                'hover:bg-gray-50': filterStore.selectedSubcategory !== subcategory.id,
              }"
            >
              <span class="mr-2 text-sm">{{ subcategory.icon }}</span>
              <span class="text-sm">{{ subcategory.name }}</span>
              <span 
                v-if="subcategoryCount[subcategory.id]"
                class="ml-auto text-xs text-gray-500"
              >
                {{ formatNumber(subcategoryCount[subcategory.id]) }}
              </span>
            </li>
          </ul>
        </div>
        
        <!-- Brand Filter - Only show when a category or subcategory is selected -->
        <div v-if="filterStore.availableBrands.length > 1 && filterStore.selectedMainCategory !== 'all'" class="mb-6">
          <h4 class="font-semibold text-gray-700 mb-2 border-b pb-1">Brand</h4>
          <ul class="space-y-1 pl-2">
            <li
              v-for="brand in filterStore.availableBrands"
              :key="brand.id"
              @click="handleBrandChange(brand.id)"
              class="flex items-center p-1.5 rounded cursor-pointer transition-colors"
              :class="{
                'bg-teal-50 text-teal-700': filterStore.selectedBrand === brand.id,
                'hover:bg-gray-50': filterStore.selectedBrand !== brand.id,
              }"
            >
              <span class="text-sm">{{ brand.name }}</span>
              <span 
                v-if="brandCount[brand.id]"
                class="ml-auto text-xs text-gray-500"
              >
                {{ formatNumber(brandCount[brand.id]) }}
              </span>
            </li>
          </ul>
        </div>
        
        <!-- Price Range Filter -->
        <div class="mb-6">
          <h4 class="font-semibold text-gray-700 mb-2 border-b pb-1">Price</h4>
          <ul class="space-y-1">
            <li
              v-for="range in filterStore.priceRanges"
              :key="range.id"
              @click="handlePriceChange(range.id)"
              class="flex items-center p-1.5 rounded cursor-pointer transition-colors text-sm"
              :class="{
                'text-teal-700': filterStore.selectedPriceRange === range.id,
                'hover:bg-gray-50': filterStore.selectedPriceRange !== range.id,
              }"
            >
              <span>{{ range.name }}</span>
            </li>
          </ul>
        </div>
        
        <!-- Condition Filter -->
        <div class="mb-6">
          <h4 class="font-semibold text-gray-700 mb-2 border-b pb-1">Condition</h4>
          <ul class="space-y-1">
            <li
              v-for="condition in filterStore.conditionOptions"
              :key="condition.id"
              @click="handleConditionChange(condition.id)"
              class="flex items-center p-1.5 rounded cursor-pointer transition-colors text-sm"
              :class="{
                'text-teal-700': filterStore.selectedCondition === condition.id,
                'hover:bg-gray-50': filterStore.selectedCondition !== condition.id,
              }"
            >
              <span>{{ condition.name }}</span>
            </li>
          </ul>
        </div>
        
        <!-- Location Filter -->
        <div class="mb-6">
          <h4 class="font-semibold text-gray-700 mb-2 border-b pb-1">Location</h4>
          <select
            :value="filterStore.selectedLocation"
            @change="handleLocationChange($event.target.value)"
            class="w-full p-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option
              v-for="location in filterStore.locationOptions"
              :key="location.id"
              :value="location.id"
            >
              {{ location.name }}
            </option>
          </select>
        </div>
        
        <!-- Reset Filters Button -->
        <button
          @click="filterStore.resetFilters"
          class="w-full p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
        >
          Reset All Filters
        </button>
      </div>
    </div>
    
    <!-- Active Filters Display (Desktop & Mobile) -->
    <div v-if="filterStore.getActiveFilters.length > 0" class="mb-4 mt-4">
      <div class="flex flex-wrap items-center gap-2">
        <span v-if="!isMobile" class="text-sm text-gray-500">Active Filters:</span>
        <div
          v-for="filter in filterStore.getActiveFilters"
          :key="filter.id"
          class="inline-flex items-center px-2 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-800 text-sm"
        >
          <span>{{ filter.label }}</span>
          <button
            @click="removeFilter(filter)"
            class="ml-1 text-teal-600 hover:text-teal-800"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive, watch } from 'vue';
import { useFilterStore } from '@/stores/filter.store';
import { useRouter, useRoute } from 'vue-router';

const props = defineProps({
  isMobile: {
    type: Boolean,
    default: false
  },
  listings: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['filter-applied']);

const filterStore = useFilterStore();
const router = useRouter();
const route = useRoute();

// UI state
const isFiltersOpen = ref(false);
const isSortOpen = ref(false);

// Category counts
const categoryCount = reactive({});
const subcategoryCount = reactive({});
const brandCount = reactive({});

// Close sort dropdown when clicking outside
const handleClickOutside = (event) => {
  if (isSortOpen.value) {
    isSortOpen.value = false;
  }
};

// Helper functions
const formatNumber = (num) => num?.toLocaleString() || "0";

// Calculate category counts from listings
const calculateCounts = () => {
  // Reset counts for all possible categories
  filterStore.categoryHierarchy.forEach(cat => {
    categoryCount[cat.id] = 0;
    // Also initialize subcategory counts
    cat.subcategories.forEach(subcat => {
      subcategoryCount[subcat.id] = 0;
    });
  });
  
  // Reset brand counts if available
  if (filterStore.availableBrands) {
    filterStore.availableBrands.forEach(brand => {
      brandCount[brand.id] = 0;
    });
  }
  
  // Always ensure 'all' category has a count
  categoryCount['all'] = 0;
  brandCount['all'] = 0;
  
  // Count for main categories
  props.listings.forEach(listing => {
    // Increment 'all' category count for every listing
    categoryCount['all'] += 1;
    
    // Handle both possible field names for categories
    const mainCat = listing.mainCategory || listing.category || 'all';
    if (mainCat && mainCat !== 'all') {
      categoryCount[mainCat] = (categoryCount[mainCat] || 0) + 1;
    }
    
    // Count for subcategories - handle both possible field names
    const subCat = listing.subcategory || listing.subCategory;
    if (mainCat && subCat) {
      subcategoryCount[subCat] = (subcategoryCount[subCat] || 0) + 1;
    }
    
    // Count for brands - handle both brand and brandName fields
    const brand = listing.brand || listing.brandName;
    if (brand) {
      // Find matching brand in our list (case insensitive comparison)
      const matchingBrand = filterStore.availableBrands.find(b => 
        b.name.toLowerCase() === brand.toLowerCase() ||
        b.id.toLowerCase() === brand.toLowerCase()
      );
      
      if (matchingBrand) {
        brandCount[matchingBrand.id] = (brandCount[matchingBrand.id] || 0) + 1;
      } else {
        // Count under 'other' if not found
        brandCount['other'] = (brandCount['other'] || 0) + 1;
      }
      
      // Also increment all brands count
      brandCount['all'] = (brandCount['all'] || 0) + 1;
    }
  });
};

// Filter handlers
const handleMainCategoryChange = (categoryId) => {
  filterStore.applyFilter('mainCategory', categoryId);
};

const handleSubcategoryChange = (subcategoryId) => {
  filterStore.applyFilter('subcategory', subcategoryId);
};

const handleBrandChange = (brandId) => {
  filterStore.applyFilter('brand', brandId);
};

const handlePriceChange = (priceId) => {
  filterStore.applyFilter('priceRange', priceId);
};

const handleConditionChange = (conditionId) => {
  filterStore.applyFilter('condition', conditionId);
};

const handleLocationChange = (locationId) => {
  filterStore.applyFilter('location', locationId);
};

const handleSortChange = (sortId) => {
  filterStore.applyFilter('sort', sortId);
  isSortOpen.value = false;
};

const removeFilter = (filter) => {
  switch (filter.type) {
    case 'mainCategory':
      filterStore.applyFilter('mainCategory', 'all');
      filterStore.applyFilter('subcategory', 'all');
      filterStore.applyFilter('brand', 'all');
      break;
    case 'subcategory':
      filterStore.applyFilter('subcategory', 'all');
      filterStore.applyFilter('brand', 'all');
      break;
    case 'brand':
      filterStore.applyFilter('brand', 'all');
      break;
    case 'priceRange':
      filterStore.applyFilter('priceRange', 'any');
      break;
    case 'condition':
      filterStore.applyFilter('condition', 'any');
      break;
    case 'location':
      filterStore.applyFilter('location', 'any');
      break;
    case 'search':
      filterStore.applyFilter('search', '');
      break;
  }
};

const applyFilters = () => {
  isFiltersOpen.value = false;
  filterStore.fetchFilteredListings();
  emit('filter-applied');
  
  // Update URL with filters
  router.replace({
    query: {
      ...route.query,
      category: filterStore.selectedMainCategory !== 'all' ? filterStore.selectedMainCategory : undefined,
      subcategory: filterStore.selectedSubcategory !== 'all' ? filterStore.selectedSubcategory : undefined,
      price: filterStore.selectedPriceRange !== 'any' ? filterStore.selectedPriceRange : undefined,
      condition: filterStore.selectedCondition !== 'any' ? filterStore.selectedCondition : undefined,
      location: filterStore.selectedLocation !== 'any' ? filterStore.selectedLocation : undefined,
      sort: filterStore.selectedSort !== 'newest' ? filterStore.selectedSort : undefined,
      query: filterStore.searchQuery || undefined
    }
  });
};

// Initialize filters from URL
onMounted(() => {
  calculateCounts();
  
  // Get filters from URL
  const { category, subcategory, price, condition, location, sort, query } = route.query;
  
  if (category) filterStore.applyFilter('mainCategory', category);
  if (subcategory) filterStore.applyFilter('subcategory', subcategory);
  if (price) filterStore.applyFilter('priceRange', price);
  if (condition) filterStore.applyFilter('condition', condition);
  if (location) filterStore.applyFilter('location', location);
  if (sort) filterStore.applyFilter('sort', sort);
  if (query) filterStore.applyFilter('search', query);
  
  // Set up click listener
  document.addEventListener('click', handleClickOutside);
});

// Initialize counts on component mount
onMounted(() => {
  calculateCounts();
  // Set up click listener
  document.addEventListener('click', handleClickOutside);
});

// Watch for listings changes to update counts
watch(() => props.listings, () => {
  calculateCounts();
}, { deep: true });

// Clean up
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
