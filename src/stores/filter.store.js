// src/stores/filter.store.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '@/firebase';

// Import the same category structure used for listing creation
import categoriesData from '@/stores/data/categorise';

// Convert the categoriesData structure to the format needed for filtering
const categoryHierarchy = [
  {
    id: 'electronics',
    name: 'Electronics',
    icon: '📱',
    subcategories: [
      { id: 'Mobile Phones', name: 'Mobile Phones', icon: '📱' },
      { id: 'Computers', name: 'Computers', icon: '💻' },
      { id: 'TVs & Audio', name: 'TVs & Audio', icon: '📺' },
      { id: 'Cameras', name: 'Cameras', icon: '📷' },
      { id: 'Home Appliances', name: 'Home Appliances', icon: '🏠' },
      { id: 'Accessories', name: 'Accessories', icon: '🎧' },
    ]
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    icon: '🚗',
    subcategories: [
      { id: 'Cars', name: 'Cars', icon: '🚗' },
      { id: 'Motorcycles', name: 'Motorcycles', icon: '🏍️' },
      { id: 'Commercial Vehicles', name: 'Commercial Vehicles', icon: '🚚' },
      { id: 'Watercraft', name: 'Watercraft', icon: '🚢' },
      { id: 'Vehicle Parts', name: 'Vehicle Parts', icon: '🔧' },
    ]
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    icon: '🏠',
    subcategories: [
      { id: 'Land For Sale', name: 'Land For Sale', icon: '🏡' },
      { id: 'House For Rent', name: 'House For Rent', icon: '🏢' },
    ]
  },
  {
    id: 'fashion',
    name: 'Fashion',
    icon: '👕',
    subcategories: [
      { id: 'Clothing', name: 'Clothing', icon: '👕' },
      { id: 'Footwear', name: 'Footwear', icon: '👟' },
      { id: 'Bags', name: 'Bags', icon: '👜' },
      { id: 'Jewelry', name: 'Jewelry', icon: '💍' },
      { id: 'Watches', name: 'Watches', icon: '⌚' },
    ]
  },
  {
    id: 'jobs',
    name: 'Jobs',
    icon: '💼',
    subcategories: [
      { id: 'Full-Time', name: 'Full-Time', icon: '⏰' },
      { id: 'Part-Time', name: 'Part-Time', icon: '🕐' },
      { id: 'Temporary', name: 'Temporary', icon: '📅' },
    ]
  },
  {
    id: 'services',
    name: 'Services',
    icon: '🔧',
    subcategories: [
      { id: 'Home Services', name: 'Home Services', icon: '🏠' },
      { id: 'Professional Services', name: 'Professional Services', icon: '💼' },
      { id: 'Health & Beauty', name: 'Health & Beauty', icon: '💇‍♀️' },
      { id: 'Events', name: 'Events', icon: '🎉' },
      { id: 'Transportation', name: 'Transportation', icon: '🚕' },
    ]
  },
  {
    id: 'education',
    name: 'Education',
    icon: '📚',
    subcategories: [
      { id: 'Tutoring Services', name: 'Tutoring Services', icon: '👨‍🏫' },
      { id: 'Online Courses', name: 'Online Courses', icon: '💻' },
      { id: 'Language Classes', name: 'Language Classes', icon: '🗣️' },
      { id: 'Vocational Training', name: 'Vocational Training', icon: '🔨' },
      { id: 'Test Preparation', name: 'Test Preparation', icon: '📝' },
    ]
  },
  {
    id: 'furniture',
    name: 'Furniture',
    icon: '🛋️',
    subcategories: [
      { id: 'Living Room', name: 'Living Room', icon: '🛋️' },
      { id: 'Bedroom', name: 'Bedroom', icon: '🛏️' },
      { id: 'Kitchen & Dining', name: 'Kitchen & Dining', icon: '🍽️' },
      { id: 'Office Furniture', name: 'Office Furniture', icon: '🖥️' },
      { id: 'Outdoor Furniture', name: 'Outdoor Furniture', icon: '⛱️' },
    ]
  },
];

// Define price ranges
const priceRanges = [
  { id: 'any', name: 'Any Price' },
  { id: 'under-5000', name: 'Under ₦5,000', min: 0, max: 5000 },
  { id: '5000-20000', name: '₦5,000 - ₦20,000', min: 5000, max: 20000 },
  { id: '20000-50000', name: '₦20,000 - ₦50,000', min: 20000, max: 50000 },
  { id: '50000-100000', name: '₦50,000 - ₦100,000', min: 50000, max: 100000 },
  { id: '100000-500000', name: '₦100,000 - ₦500,000', min: 100000, max: 500000 },
  { id: 'over-500000', name: 'Over ₦500,000', min: 500000, max: null },
];

// Define condition options
const conditionOptions = [
  { id: 'any', name: 'Any Condition' },
  { id: 'new', name: 'Brand New' },
  { id: 'like-new', name: 'Like New' },
  { id: 'good', name: 'Good' },
  { id: 'fair', name: 'Fair' },
];

// Define location options (top Nigerian cities)
const locationOptions = [
  { id: 'any', name: 'All Nigeria' },
  { id: 'lagos', name: 'Lagos' },
  { id: 'abuja', name: 'Abuja' },
  { id: 'ibadan', name: 'Ibadan' },
  { id: 'port-harcourt', name: 'Port Harcourt' },
  { id: 'kano', name: 'Kano' },
  { id: 'enugu', name: 'Enugu' },
  { id: 'calabar', name: 'Calabar' },
  { id: 'warri', name: 'Warri' },
  { id: 'benin', name: 'Benin City' },
  { id: 'kaduna', name: 'Kaduna' },
];

// Define brand options (organized by category)
const brandOptions = {
  // Electronics brands
  'electronics': [
    { id: 'all', name: 'All Brands' },
    { id: 'apple', name: 'Apple' },
    { id: 'samsung', name: 'Samsung' },
    { id: 'lg', name: 'LG' },
    { id: 'sony', name: 'Sony' },
    { id: 'hp', name: 'HP' },
    { id: 'dell', name: 'Dell' },
    { id: 'lenovo', name: 'Lenovo' },
    { id: 'huawei', name: 'Huawei' },
    { id: 'tecno', name: 'Tecno' },
    { id: 'infinix', name: 'Infinix' },
    { id: 'xiaomi', name: 'Xiaomi' },
    { id: 'other', name: 'Other Brands' },
  ],
  // Vehicle brands
  'vehicles': [
    { id: 'all', name: 'All Brands' },
    { id: 'toyota', name: 'Toyota' },
    { id: 'honda', name: 'Honda' },
    { id: 'mercedes', name: 'Mercedes-Benz' },
    { id: 'bmw', name: 'BMW' },
    { id: 'ford', name: 'Ford' },
    { id: 'hyundai', name: 'Hyundai' },
    { id: 'kia', name: 'Kia' },
    { id: 'nissan', name: 'Nissan' },
    { id: 'lexus', name: 'Lexus' },
    { id: 'mazda', name: 'Mazda' },
    { id: 'other', name: 'Other Brands' },
  ],
  // Fashion brands
  'fashion': [
    { id: 'all', name: 'All Brands' },
    { id: 'nike', name: 'Nike' },
    { id: 'adidas', name: 'Adidas' },
    { id: 'zara', name: 'Zara' },
    { id: 'hm', name: 'H&M' },
    { id: 'gucci', name: 'Gucci' },
    { id: 'louis-vuitton', name: 'Louis Vuitton' },
    { id: 'hermes', name: 'Hermes' },
    { id: 'prada', name: 'Prada' },
    { id: 'versace', name: 'Versace' },
    { id: 'other', name: 'Other Brands' },
  ],
  // Default brands for other categories
  'default': [
    { id: 'all', name: 'All Brands' },
    { id: 'other', name: 'Other Brands' },
  ]
};

// Sort options
const sortOptions = [
  { id: 'newest', name: 'Newest First' },
  { id: 'oldest', name: 'Oldest First' },
  { id: 'price-low', name: 'Price: Low to High' },
  { id: 'price-high', name: 'Price: High to Low' },
];

export const useFilterStore = defineStore('filter', () => {
  // Current filter state
  const selectedMainCategory = ref('all');
  const selectedSubcategory = ref('all');
  const selectedBrand = ref('all');  // Add brand filter parameter
  const selectedPriceRange = ref('any');
  const selectedCondition = ref('any');
  const selectedLocation = ref('any');
  const selectedSort = ref('newest');
  const searchQuery = ref('');
  
  // Listings
  const listings = ref([]);
  const loading = ref(false);
  const error = ref(null);
  
  // Computed properties
  const allCategories = computed(() => [
    { id: 'all', name: 'All Categories', icon: '📦' },
    ...categoryHierarchy
  ]);
  
  const currentMainCategory = computed(() => {
    return selectedMainCategory.value === 'all' 
      ? { id: 'all', name: 'All Categories', icon: '📦', subcategories: [] }
      : categoryHierarchy.find(cat => cat.id === selectedMainCategory.value) || { id: 'all', name: 'All Categories', icon: '📦', subcategories: [] };
  });
  
  const availableSubcategories = computed(() => {
    if (selectedMainCategory.value === 'all') {
      return [{ id: 'all', name: 'All', icon: '📦' }];
    }
    
    const mainCategory = categoryHierarchy.find(cat => cat.id === selectedMainCategory.value);
    if (!mainCategory) return [{ id: 'all', name: 'All', icon: '📦' }];
    
    return [
      { id: 'all', name: `All ${mainCategory.name}`, icon: mainCategory.icon },
      ...mainCategory.subcategories
    ];
  });
  
  // Computed property for available brands based on selected category
  const availableBrands = computed(() => {
    // Default to all brands if no category is selected
    if (selectedMainCategory.value === 'all') {
      return brandOptions.default;
    }
    
    // Map the selected category to the corresponding brand list
    const categoryBrandMapping = {
      'electronics': 'electronics',
      'phones': 'electronics',
      'computers': 'electronics',
      'vehicles': 'vehicles',
      'cars': 'vehicles',
      'motorcycles': 'vehicles',
      'fashion': 'fashion',
      'clothing': 'fashion',
      'footwear': 'fashion',
      'bags': 'fashion',
      'jewelry': 'fashion',
      'watches': 'fashion'
    };
    
    const brandCategory = categoryBrandMapping[selectedMainCategory.value] || 
                          categoryBrandMapping[selectedSubcategory.value] || 
                          'default';
    
    return brandOptions[brandCategory] || brandOptions.default;
  });
  
  // Helper function to apply additional filters (price, condition, location, brand, sort)
  const applyAdditionalFilters = (results) => {
    let filteredResults = [...results];
    
    // Filter by price range
    if (selectedPriceRange.value !== 'any') {
      const range = priceRanges.find(r => r.id === selectedPriceRange.value);
      if (range) {
        if (range.min !== null) {
          filteredResults = filteredResults.filter(listing => listing.price >= range.min);
        }
        if (range.max !== null) {
          filteredResults = filteredResults.filter(listing => listing.price <= range.max);
        }
      }
    }
    
    // Filter by brand
    if (selectedBrand.value !== 'all') {
      filteredResults = filteredResults.filter(listing => {
        // Get brand from any field that might contain it
        const listingBrand = listing.brand || listing.brandName;
        if (!listingBrand) return false;
        
        // Brand may be stored as an object with id and name properties in some listings
        if (typeof listingBrand === 'object' && listingBrand !== null) {
          return listingBrand.id === selectedBrand.value || 
                listingBrand.name?.toLowerCase() === selectedBrand.value.toLowerCase();
        }
        
        // Handle string brand values
        if (typeof listingBrand === 'string') {
          return listingBrand.toLowerCase() === selectedBrand.value.toLowerCase();
        }
        
        return false;
      });
    }
    
    // Filter by condition
    if (selectedCondition.value !== 'any') {
      filteredResults = filteredResults.filter(listing => listing.condition === selectedCondition.value);
    }
    
    // Filter by location
    if (selectedLocation.value !== 'any') {
      filteredResults = filteredResults.filter(listing => 
        listing.location && listing.location.includes(selectedLocation.value)
      );
    }
    
    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filteredResults = filteredResults.filter(listing => 
        listing.title?.toLowerCase().includes(query) || 
        listing.description?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    switch (selectedSort.value) {
      case 'oldest':
        filteredResults.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case 'price-low':
        filteredResults.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filteredResults.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        filteredResults.sort((a, b) => b.createdAt - a.createdAt);
        break;
    }
    
    return filteredResults;
  };
  
  // Server-side filtering
  const fetchFilteredListings = async (initialListings = null) => {
    try {
      loading.value = true;
      error.value = null;
      
      // If initialListings are provided, use them instead of querying Firestore
      if (initialListings) {
        // Apply client-side filtering
        let results = [...initialListings];
        
        // Filter by category - handle both field naming conventions
        if (selectedMainCategory.value !== 'all') {
          results = results.filter(listing => 
            listing.mainCategory === selectedMainCategory.value || 
            listing.category === selectedMainCategory.value
          );
          
          // Filter by subcategory if selected
          if (selectedSubcategory.value !== 'all') {
            results = results.filter(listing => 
              listing.subcategory === selectedSubcategory.value || 
              listing.subCategory === selectedSubcategory.value
            );
          }
        }
        
        // Filter by price range
        if (selectedPriceRange.value !== 'any') {
          const range = priceRanges.find(r => r.id === selectedPriceRange.value);
          if (range) {
            if (range.min !== null) {
              results = results.filter(listing => listing.price >= range.min);
            }
            if (range.max !== null) {
              results = results.filter(listing => listing.price <= range.max);
            }
          }
        }
        
        // Filter by condition
        if (selectedCondition.value !== 'any') {
          results = results.filter(listing => listing.condition === selectedCondition.value);
        }
        
        // Filter by location
        if (selectedLocation.value !== 'any') {
          results = results.filter(listing => listing.location && listing.location.includes(selectedLocation.value));
        }
        
        // Filter by search query
        if (searchQuery.value) {
          const query = searchQuery.value.toLowerCase();
          results = results.filter(listing => 
            listing.title?.toLowerCase().includes(query) || 
            listing.description?.toLowerCase().includes(query)
          );
        }
        
        // Apply sorting
        switch (selectedSort.value) {
          case 'oldest':
            results.sort((a, b) => a.createdAt - b.createdAt);
            break;
          case 'price-low':
            results.sort((a, b) => a.price - b.price);
            break;
          case 'price-high':
            results.sort((a, b) => b.price - a.price);
            break;
          case 'newest':
          default:
            results.sort((a, b) => b.createdAt - a.createdAt);
            break;
        }
        
        listings.value = results;
        loading.value = false;
        return;
      }
      
      // Otherwise, build a Firestore query
      let q = collection(db, 'listings');
      const constraints = [];
      
      // Only show active listings
      constraints.push(where('status', '==', 'active'));
      
      // Apply category filters - need to handle both field naming conventions
      if (selectedMainCategory.value !== 'all') {
        // For Firebase, we need to make separate queries for each field name and combine results
        let mainCategoryQuery = query(
          collection(db, 'listings'),
          where('status', '==', 'active'),
          where('mainCategory', '==', selectedMainCategory.value)
        );
        
        let categoryQuery = query(
          collection(db, 'listings'),
          where('status', '==', 'active'),
          where('category', '==', selectedMainCategory.value)
        );
        
        // If subcategory is specified, add additional filtering
        if (selectedSubcategory.value !== 'all') {
          // We'll handle subcategory filtering in the client-side results
          // since we need to query multiple field combinations
        }
        
        // Execute both queries and combine results
        const [mainCategorySnapshot, categorySnapshot] = await Promise.all([
          getDocs(mainCategoryQuery),
          getDocs(categoryQuery)
        ]);
        
        // Convert snapshots to listings
        let mainCategoryResults = [];
        mainCategorySnapshot.forEach(doc => {
          mainCategoryResults.push({ id: doc.id, ...doc.data() });
        });
        
        let categoryResults = [];
        categorySnapshot.forEach(doc => {
          categoryResults.push({ id: doc.id, ...doc.data() });
        });
        
        // Combine results, avoiding duplicates
        let combinedResults = [
          ...mainCategoryResults,
          ...categoryResults.filter(catItem => 
            !mainCategoryResults.some(mainItem => mainItem.id === catItem.id)
          )
        ];
        
        // Apply subcategory filtering if needed
        if (selectedSubcategory.value !== 'all') {
          combinedResults = combinedResults.filter(listing => 
            listing.subcategory === selectedSubcategory.value || 
            listing.subCategory === selectedSubcategory.value
          );
        }
        
        // Apply brand filtering if needed
        if (selectedBrand.value !== 'all') {
          combinedResults = combinedResults.filter(listing => {
            // Get brand from any field that might contain it
            const listingBrand = listing.brand || listing.brandName;
            
            // Brand may be stored as an object with id and name properties in some listings
            if (typeof listingBrand === 'object' && listingBrand !== null) {
              return listingBrand.id === selectedBrand.value || 
                    listingBrand.name?.toLowerCase() === selectedBrand.value.toLowerCase();
            }
            
            // Handle string brand values
            if (typeof listingBrand === 'string') {
              return listingBrand.toLowerCase() === selectedBrand.value.toLowerCase();
            }
            
            return false;
          });
        }
        
        // Apply price, condition, and location filters client-side on combined results
        listings.value = applyAdditionalFilters(combinedResults);
        loading.value = false;
        return;
      }
      
      // Apply price range filter
      if (selectedPriceRange.value !== 'any') {
        const range = priceRanges.find(r => r.id === selectedPriceRange.value);
        if (range) {
          if (range.min !== null) {
            constraints.push(where('price', '>=', range.min));
          }
          if (range.max !== null) {
            constraints.push(where('price', '<=', range.max));
          }
        }
      }
      
      // Apply condition filter
      if (selectedCondition.value !== 'any') {
        constraints.push(where('condition', '==', selectedCondition.value));
      }
      
      // Apply location filter
      if (selectedLocation.value !== 'any') {
        constraints.push(where('location', '==', selectedLocation.value));
      }
      
      // Apply sort
      let sortField = 'createdAt';
      let sortDirection = 'desc';
      
      switch (selectedSort.value) {
        case 'oldest':
          sortField = 'createdAt';
          sortDirection = 'asc';
          break;
        case 'price-low':
          sortField = 'price';
          sortDirection = 'asc';
          break;
        case 'price-high':
          sortField = 'price';
          sortDirection = 'desc';
          break;
        default:
          sortField = 'createdAt';
          sortDirection = 'desc';
      }
      
      // Create the final query (add orderBy after constraints)
      q = query(q, ...constraints, orderBy(sortField, sortDirection), limit(100));
      
      // Execute the query
      const querySnapshot = await getDocs(q);
      
      // Map the results
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Apply client-side search filter if needed (since Firestore doesn't support full text search)
      if (searchQuery.value) {
        const search = searchQuery.value.toLowerCase();
        listings.value = results.filter(listing => 
          listing.title?.toLowerCase().includes(search) || 
          listing.description?.toLowerCase().includes(search)
        );
      } else {
        listings.value = results;
      }
      
    } catch (err) {
      console.error('Error fetching filtered listings:', err);
      error.value = 'Failed to load listings. Please try again.';
    } finally {
      loading.value = false;
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    selectedMainCategory.value = 'all';
    selectedSubcategory.value = 'all';
    selectedPriceRange.value = 'any';
    selectedCondition.value = 'any';
    selectedLocation.value = 'any';
    selectedBrand.value = 'any';
    selectedSort.value = 'newest';
    searchQuery.value = '';
  };
  
  // Method to apply filters
  const applyFilter = (filterType, value) => {
    switch (filterType) {
      case 'mainCategory':
        selectedMainCategory.value = value;
        if (value !== 'all') {
          // Reset subcategory and brand when main category changes
          selectedSubcategory.value = 'all';
          selectedBrand.value = 'all';
        }
        break;
      case 'subcategory':
        selectedSubcategory.value = value;
        // Reset brand when subcategory changes to ensure relevant brands are shown
        selectedBrand.value = 'all';
        break;
      case 'brand':
        selectedBrand.value = value;
        break;
      case 'priceRange':
        selectedPriceRange.value = value;
        break;
      case 'condition':
        selectedCondition.value = value;
        break;
      case 'location':
        selectedLocation.value = value;
        break;
      case 'sort':
        selectedSort.value = value;
        break;
      case 'search':
        searchQuery.value = value;
        break;
    }
  };
  
  // Get currently applied filters for UI display
  const getActiveFilters = computed(() => {
    const activeFilters = [];
    
    if (selectedMainCategory.value !== 'all') {
      const category = categoryHierarchy.find(c => c.id === selectedMainCategory.value);
      if (category) {
        activeFilters.push({
          type: 'mainCategory',
          id: category.id,
          label: category.name,
          value: category.id
        });
      }
    }
    
    if (selectedSubcategory.value !== 'all') {
      const mainCategory = categoryHierarchy.find(c => c.id === selectedMainCategory.value);
      if (mainCategory) {
        const subcategory = mainCategory.subcategories.find(s => s.id === selectedSubcategory.value);
        if (subcategory) {
          activeFilters.push({
            type: 'subcategory',
            id: subcategory.id,
            label: `${subcategory.icon} ${subcategory.name}`,
            value: subcategory.id
          });
        }
      }
    }
    
    // Add brand filter if selected
    if (selectedBrand.value !== 'all') {
      const brand = availableBrands.value.find(b => b.id === selectedBrand.value);
      if (brand) {
        activeFilters.push({
          type: 'brand',
          id: brand.id,
          label: `Brand: ${brand.name}`,
          value: brand.id
        });
      }
    }
    
    if (selectedPriceRange.value !== 'any') {
      const priceRange = priceRanges.find(p => p.id === selectedPriceRange.value);
      if (priceRange) {
        activeFilters.push({
          type: 'priceRange',
          id: priceRange.id,
          label: priceRange.name,
          value: priceRange.id
        });
      }
    }
    
    if (selectedCondition.value !== 'any') {
      const condition = conditionOptions.find(c => c.id === selectedCondition.value);
      if (condition) {
        activeFilters.push({
          type: 'condition',
          id: condition.id,
          label: condition.name,
          value: condition.id
        });
      }
    }
    
    if (selectedLocation.value !== 'any') {
      const location = locationOptions.find(l => l.id === selectedLocation.value);
      if (location) {
        activeFilters.push({
          type: 'location',
          id: location.id,
          label: location.name,
          value: location.id
        });
      }
    }
    
    if (searchQuery.value) {
      activeFilters.push({
        type: 'search',
        id: 'search-query',
        label: `"${searchQuery.value}"`,
        value: searchQuery.value
      });
    }
    
    return activeFilters;
  });
  
  return {
    // State
    selectedMainCategory,
    selectedSubcategory,
    selectedBrand,
    selectedPriceRange,
    selectedCondition,
    selectedLocation,
    selectedSort,
    searchQuery,
    listings,
    loading,
    error,
    
    // Computed
    allCategories,
    currentMainCategory,
    availableSubcategories,
    availableBrands,
    getActiveFilters,
    
    // Reference data
    categoryHierarchy,
    priceRanges,
    conditionOptions,
    locationOptions,
    sortOptions,
    
    // Methods
    fetchFilteredListings,
    resetFilters,
    applyFilter
  };
});
