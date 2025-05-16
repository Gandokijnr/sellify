<script setup>
import { ref, computed, watch, reactive } from "vue";
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import Navbar from "@/components/common/Navbar.vue";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import cloudinaryConfig from "@/cloudinary/cloudinaryConfig";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { useSubscriptionStore } from "@/stores/subscription.store";
import { useToast } from "vue-toastification";
import nigeriaLocations from "@/stores/location";
import CategorySelector from "@/components/categories/CategorySelector.vue";
import categoriesData from "@/stores/data/categorise";

const router = useRouter();
const isLoading = ref(false);
const errorMessage = ref("");
const authStore = useAuthStore();
const subscriptionStore = useSubscriptionStore();
const toast = useToast();
const currentStep = ref("category"); // Start with category selection step

// Location-related refs
const selectedState = ref("");
const selectedLGA = ref("");
const selectedLocation = ref("");

const areRequiredFieldsFilled = computed(() => {
  return categoryFields.value
    .filter((field) => field.required)
});

// Available options for dropdowns
const availableStates = ref(Object.keys(nigeriaLocations));
const availableLGAs = computed(() => {
  if (!selectedState.value) return [];
  return Object.keys(nigeriaLocations[selectedState.value] || {});
});
const availableLocations = computed(() => {
  if (!selectedState.value || !selectedLGA.value) return [];
  return nigeriaLocations[selectedState.value]?.[selectedLGA.value] || [];
});

// Reset dependent dropdowns when parent selection changes
watch(selectedState, () => {
  selectedLGA.value = "";
  selectedLocation.value = "";
});

watch(selectedLGA, () => {
  selectedLocation.value = "";
});

// Computed property to get full location string
const fullLocation = computed(() => {
  if (!selectedState.value) return "";

  let locationParts = [selectedState.value];

  if (selectedLGA.value) {
    locationParts.push(selectedLGA.value);

    if (selectedLocation.value) {
      locationParts.push(selectedLocation.value);
    }
  }

  return locationParts.join(", ");
});

// Enhanced category structure
const categoryStructure = reactive({
  mainCategory: "",
  subCategory: "",
  subSubCategory: "",
  leafCategory: "",
});

// For displaying the full category path
const displayCategoryPath = computed(() => {
  const parts = [];
  if (categoryStructure.mainCategory)
    parts.push(categoryStructure.mainCategory);
  if (categoryStructure.subCategory) parts.push(categoryStructure.subCategory);
  if (categoryStructure.subSubCategory)
    parts.push(categoryStructure.subSubCategory);
  if (categoryStructure.leafCategory)
    parts.push(categoryStructure.leafCategory);
  return parts.join(" > ");
});

// Check if we've selected both main category and subcategory
const isLeafCategorySelected = computed(() => {
  return categoryStructure.mainCategory && categoryStructure.subCategory;
});

const form = reactive({
  title: "",
  description: "",
  price: "",
  condition: "used",
  location: "",
  images: [],
  isSponsored: false,

  // Category fields stored separately
  mainCategory: "",
  subCategory: "",
  subSubCategory: "",
  leafCategory: "",

  // Category-specific fields
  // Electronics
  brand: "",
  model: "",
  specifications: "",
  storage: "",
  color: "",
  processor: "",
  ram: "",
  graphicsCard: "",
  screenSize: "",
  operatingSystem: "",

  // Real Estate
  propertySize: "",
  bedrooms: "",
  bathrooms: "",

  // Vehicles
  year: "",
  mileage: "",
  transmission: "",
  fuelType: "",

  // Fashion
  size: "",
  color: "",
  material: "",

  // Furniture
  dimensions: "",
  material: "",
  style: "",

  // Jobs
  salary: "",
  employmentType: "",
  experienceLevel: "",
});

const updateCategoryStructure = (structuredCategory) => {
  // Update the structure with the values from the component
  categoryStructure.mainCategory = structuredCategory.mainCategory || "";
  categoryStructure.subCategory = structuredCategory.subCategory || "";
  categoryStructure.subSubCategory = structuredCategory.subSubCategory || "";
  categoryStructure.leafCategory = structuredCategory.leafCategory || "";
};

// Update form's category fields when categoryStructure changes
watch(
  categoryStructure,
  (newValue) => {
    form.mainCategory = newValue.mainCategory;
    form.subCategory = newValue.subCategory;
    form.subSubCategory = newValue.subSubCategory;
    form.leafCategory = newValue.leafCategory;
  },
  { deep: true }
);

// iPhone models and specifications data
const iPhoneModels = {
  "iPhone 15": [
    { value: "iPhone 15", label: "iPhone 15" },
    { value: "iPhone 15 Plus", label: "iPhone 15 Plus" },
    { value: "iPhone 15 Pro", label: "iPhone 15 Pro" },
    { value: "iPhone 15 Pro Max", label: "iPhone 15 Pro Max" }
  ],
  "iPhone 14": [
    { value: "iPhone 14", label: "iPhone 14" },
    { value: "iPhone 14 Plus", label: "iPhone 14 Plus" },
    { value: "iPhone 14 Pro", label: "iPhone 14 Pro" },
    { value: "iPhone 14 Pro Max", label: "iPhone 14 Pro Max" }
  ],
  // ... other iPhone models
};

const iPhoneStorage = [
  { value: "64GB", label: "64GB" },
  { value: "128GB", label: "128GB" },
  { value: "256GB", label: "256GB" },
  { value: "512GB", label: "512GB" },
  { value: "1TB", label: "1TB" }
];

const iPhoneColors = [
  { value: "Black", label: "Black" },
  { value: "White", label: "White" },
  { value: "Blue", label: "Blue" },
  { value: "Red", label: "Red" },
  { value: "Green", label: "Green" },
  { value: "teal", label: "teal" },
  { value: "Gold", label: "Gold" },
  { value: "Silver", label: "Silver" }
];

// Samsung models and specifications data
const SamsungModels = {
  "Galaxy S Series": [
    { value: "Galaxy S23", label: "Galaxy S23" },
    { value: "Galaxy S23+", label: "Galaxy S23+" },
    { value: "Galaxy S23 Ultra", label: "Galaxy S23 Ultra" },
    { value: "Galaxy S22", label: "Galaxy S22" },
    { value: "Galaxy S22+", label: "Galaxy S22+" },
    { value: "Galaxy S22 Ultra", label: "Galaxy S22 Ultra" },
  ],
  "Galaxy Z Series": [
    { value: "Galaxy Z Fold 5", label: "Galaxy Z Fold 5" },
    { value: "Galaxy Z Flip 5", label: "Galaxy Z Flip 5" },
    { value: "Galaxy Z Fold 4", label: "Galaxy Z Fold 4" },
    { value: "Galaxy Z Flip 4", label: "Galaxy Z Flip 4" },
  ],
  "Galaxy A Series": [
    { value: "Galaxy A54 5G", label: "Galaxy A54 5G" },
    { value: "Galaxy A55 5G", label: "Galaxy A55 5G" },
    { value: "Galaxy A34 5G", label: "Galaxy A34 5G" },
    { value: "Galaxy A14 5G", label: "Galaxy A14 5G" },
  ],
};

const SamsungStorage = [
  { value: "128GB", label: "128GB" },
  { value: "256GB", label: "256GB" },
  { value: "512GB", label: "512GB" },
  { value: "1TB", label: "1TB" },
];

const SamsungColors = [
  { value: "Phantom Black", label: "Phantom Black" },
  { value: "Cream", label: "Cream" },
  { value: "Green", label: "Green" },
  { value: "Blue", label: "Blue" },
  { value: "Lavender", label: "Lavender" },
  { value: "Graphite", label: "Graphite" },
  { value: "Bora teal", label: "Bora teal" },
];

// Google Pixel models and specifications data
const GooglePixelModels = {
  "Pixel 8 Series": [
    { value: "Pixel 8", label: "Pixel 8" },
    { value: "Pixel 8 Pro", label: "Pixel 8 Pro" },
  ],
  "Pixel 7 Series": [
    { value: "Pixel 7", label: "Pixel 7" },
    { value: "Pixel 7 Pro", label: "Pixel 7 Pro" },
    { value: "Pixel 7a", label: "Pixel 7a" },
  ],
  "Pixel 6 Series": [
    { value: "Pixel 6", label: "Pixel 6" },
    { value: "Pixel 6 Pro", label: "Pixel 6 Pro" },
    { value: "Pixel 6a", label: "Pixel 6a" },
  ],
};

const GooglePixelStorage = [
  { value: "128GB", label: "128GB" },
  { value: "256GB", label: "256GB" },
  { value: "512GB", label: "512GB" },
];

const GooglePixelColors = [
  { value: "Obsidian", label: "Obsidian" },
  { value: "Hazel", label: "Hazel" },
  { value: "Snow", label: "Snow" },
  { value: "Lemongrass", label: "Lemongrass" },
  { value: "Sorta Sunny", label: "Sorta Sunny" },
];

// Computer brands and specs
const computerBrands = [
  { value: "Apple", label: "Apple" },
  { value: "Dell", label: "Dell" },
  { value: "HP", label: "HP" },
  { value: "Lenovo", label: "Lenovo" },
  { value: "Asus", label: "Asus" },
  { value: "Microsoft", label: "Microsoft" },
  { value: "Acer", label: "Acer" },
  { value: "MSI", label: "MSI" },
  { value: "Samsung", label: "Samsung" },
  { value: "Other", label: "Other" }
];

// Apple Computer Models
const AppleComputerModels = [
  { value: "MacBook Air M3", label: "MacBook Air M3" },
  { value: "MacBook Air M2", label: "MacBook Air M2" },
  { value: "MacBook Air M1", label: "MacBook Air M1" },
  { value: "MacBook Pro 14-inch M3", label: "MacBook Pro 14-inch M3" },
  { value: "MacBook Pro 14-inch M2", label: "MacBook Pro 14-inch M2" },
  { value: "MacBook Pro 16-inch M3", label: "MacBook Pro 16-inch M3" },
  { value: "MacBook Pro 16-inch M2", label: "MacBook Pro 16-inch M2" },
  { value: "Mac Mini M2", label: "Mac Mini M2" },
  { value: "Mac Mini M1", label: "Mac Mini M1" },
  { value: "iMac 24-inch M1", label: "iMac 24-inch M1" },
  { value: "iMac 24-inch M3", label: "iMac 24-inch M3" },
  { value: "Mac Studio M2", label: "Mac Studio M2" },
  { value: "Mac Pro", label: "Mac Pro" }
];

// Dell Computer Models
const DellComputerModels = [
  { value: "XPS 13", label: "XPS 13" },
  { value: "XPS 15", label: "XPS 15" },
  { value: "XPS 17", label: "XPS 17" },
  { value: "Inspiron 14", label: "Inspiron 14" },
  { value: "Inspiron 15", label: "Inspiron 15" },
  { value: "Inspiron 16", label: "Inspiron 16" },
  { value: "Latitude 5430", label: "Latitude 5430" },
  { value: "Latitude 7430", label: "Latitude 7430" },
  { value: "Precision 5680", label: "Precision 5680" },
  { value: "Alienware m16", label: "Alienware m16" },
  { value: "Alienware m18", label: "Alienware m18" },
  { value: "Alienware x16", label: "Alienware x16" },
  { value: "OptiPlex Desktop", label: "OptiPlex Desktop" },
  { value: "Precision Desktop", label: "Precision Desktop" }
];

// HP Computer Models
const HPComputerModels = [
  { value: "Spectre x360", label: "Spectre x360" },
  { value: "Envy x360", label: "Envy x360" },
  { value: "Envy 16", label: "Envy 16" },
  { value: "Pavilion 15", label: "Pavilion 15" },
  { value: "Pavilion Gaming", label: "Pavilion Gaming" },
  { value: "Omen 16", label: "Omen 16" },
  { value: "Omen 17", label: "Omen 17" },
  { value: "EliteBook 840", label: "EliteBook 840" },
  { value: "EliteBook 860", label: "EliteBook 860" },
  { value: "ZBook Studio", label: "ZBook Studio" },
  { value: "ProBook 450", label: "ProBook 450" },
  { value: "Victus 15", label: "Victus 15" },
  { value: "HP All-in-One", label: "HP All-in-One" },
  { value: "HP Desktop", label: "HP Desktop" }
];

// Lenovo Computer Models
const LenovoComputerModels = [
  { value: "ThinkPad X1 Carbon", label: "ThinkPad X1 Carbon" },
  { value: "ThinkPad X1 Yoga", label: "ThinkPad X1 Yoga" },
  { value: "ThinkPad X1 Nano", label: "ThinkPad X1 Nano" },
  { value: "ThinkPad T14", label: "ThinkPad T14" },
  { value: "ThinkPad P16", label: "ThinkPad P16" },
  { value: "Yoga 9i", label: "Yoga 9i" },
  { value: "Yoga 7i", label: "Yoga 7i" },
  { value: "IdeaPad Slim 5", label: "IdeaPad Slim 5" },
  { value: "IdeaPad Gaming 3", label: "IdeaPad Gaming 3" },
  { value: "Legion 5", label: "Legion 5" },
  { value: "Legion 7", label: "Legion 7" },
  { value: "Legion Pro 5", label: "Legion Pro 5" },
  { value: "ThinkCentre Desktop", label: "ThinkCentre Desktop" },
  { value: "IdeaCentre Desktop", label: "IdeaCentre Desktop" }
];

// Asus Computer Models
const AsusComputerModels = [
  { value: "ZenBook 14", label: "ZenBook 14" },
  { value: "ZenBook Pro 16", label: "ZenBook Pro 16" },
  { value: "VivoBook 15", label: "VivoBook 15" },
  { value: "VivoBook Pro 16", label: "VivoBook Pro 16" },
  { value: "ROG Zephyrus G14", label: "ROG Zephyrus G14" },
  { value: "ROG Zephyrus G16", label: "ROG Zephyrus G16" },
  { value: "ROG Strix G16", label: "ROG Strix G16" },
  { value: "ROG Strix SCAR 17", label: "ROG Strix SCAR 17" },
  { value: "TUF Gaming A15", label: "TUF Gaming A15" },
  { value: "TUF Gaming F15", label: "TUF Gaming F15" },
  { value: "ProArt StudioBook 16", label: "ProArt StudioBook 16" },
  { value: "ExpertBook B9", label: "ExpertBook B9" },
  { value: "ROG Desktop", label: "ROG Desktop" },
  { value: "ASUS Desktop", label: "ASUS Desktop" }
];

// Microsoft Computer Models
const MicrosoftComputerModels = [
  { value: "Surface Laptop 5", label: "Surface Laptop 5" },
  { value: "Surface Laptop 6", label: "Surface Laptop 6" },
  { value: "Surface Laptop Studio", label: "Surface Laptop Studio" },
  { value: "Surface Laptop Go 3", label: "Surface Laptop Go 3" },
  { value: "Surface Pro 9", label: "Surface Pro 9" },
  { value: "Surface Pro 10", label: "Surface Pro 10" },
  { value: "Surface Go 3", label: "Surface Go 3" },
  { value: "Surface Go 4", label: "Surface Go 4" },
  { value: "Surface Studio", label: "Surface Studio" }
];

// Acer Computer Models
const AcerComputerModels = [
  { value: "Swift 5", label: "Swift 5" },
  { value: "Swift 3", label: "Swift 3" },
  { value: "Swift X", label: "Swift X" },
  { value: "Aspire 5", label: "Aspire 5" },
  { value: "Aspire 7", label: "Aspire 7" },
  { value: "Predator Helios 300", label: "Predator Helios 300" },
  { value: "Predator Helios 500", label: "Predator Helios 500" },
  { value: "Predator Triton 500", label: "Predator Triton 500" },
  { value: "Nitro 5", label: "Nitro 5" },
  { value: "Nitro 7", label: "Nitro 7" },
  { value: "Chromebook Spin", label: "Chromebook Spin" },
  { value: "TravelMate", label: "TravelMate" },
  { value: "Acer Desktop", label: "Acer Desktop" },
  { value: "Predator Desktop", label: "Predator Desktop" }
];

// MSI Computer Models
const MSIComputerModels = [
  { value: "GS Stealth", label: "GS Stealth" },
  { value: "GE Raider", label: "GE Raider" },
  { value: "GF Thin", label: "GF Thin" },
  { value: "GP Vector", label: "GP Vector" },
  { value: "Prestige", label: "Prestige" },
  { value: "Modern", label: "Modern" },
  { value: "Summit", label: "Summit" },
  { value: "Katana", label: "Katana" },
  { value: "Cyborg", label: "Cyborg" },
  { value: "Pulse", label: "Pulse" },
  { value: "Crosshair", label: "Crosshair" },
  { value: "Titan GT", label: "Titan GT" },
  { value: "MSI Desktop", label: "MSI Desktop" },
  { value: "MSI All-in-One", label: "MSI All-in-One" }
];

// Samsung Computer Models
const SamsungComputerModels = [
  { value: "Galaxy Book3 Pro", label: "Galaxy Book3 Pro" },
  { value: "Galaxy Book3 Ultra", label: "Galaxy Book3 Ultra" },
  { value: "Galaxy Book3 360", label: "Galaxy Book3 360" },
  { value: "Galaxy Book3", label: "Galaxy Book3" },
  { value: "Galaxy Book2 Pro", label: "Galaxy Book2 Pro" },
  { value: "Galaxy Book2 360", label: "Galaxy Book2 360" },
  { value: "Galaxy Book Flex", label: "Galaxy Book Flex" },
  { value: "Galaxy Book Ion", label: "Galaxy Book Ion" },
  { value: "Galaxy Chromebook", label: "Galaxy Chromebook" },
  { value: "Galaxy Book Go", label: "Galaxy Book Go" }
];

// Computer RAM options
const computerRAM = [
  { value: "4GB", label: "4GB" },
  { value: "8GB", label: "8GB" },
  { value: "16GB", label: "16GB" },
  { value: "24GB", label: "24GB" },
  { value: "32GB", label: "32GB" },
  { value: "64GB", label: "64GB" },
  { value: "128GB", label: "128GB" }
];

// Computer Storage options
const computerStorage = [
  { value: "128GB SSD", label: "128GB SSD" },
  { value: "256GB SSD", label: "256GB SSD" },
  { value: "512GB SSD", label: "512GB SSD" },
  { value: "1TB SSD", label: "1TB SSD" },
  { value: "2TB SSD", label: "2TB SSD" },
  { value: "500GB HDD", label: "500GB HDD" },
  { value: "1TB HDD", label: "1TB HDD" },
  { value: "2TB HDD", label: "2TB HDD" },
  { value: "4TB HDD", label: "4TB HDD" },
  { value: "Dual Storage", label: "Dual Storage" }
];

// Computer CPU options
const computerProcessors = [
  { value: "Intel Core i3", label: "Intel Core i3" },
  { value: "Intel Core i5", label: "Intel Core i5" },
  { value: "Intel Core i7", label: "Intel Core i7" },
  { value: "Intel Core i9", label: "Intel Core i9" },
  { value: "AMD Ryzen 3", label: "AMD Ryzen 3" },
  { value: "AMD Ryzen 5", label: "AMD Ryzen 5" },
  { value: "AMD Ryzen 7", label: "AMD Ryzen 7" },
  { value: "AMD Ryzen 9", label: "AMD Ryzen 9" },
  { value: "Apple M1", label: "Apple M1" },
  { value: "Apple M2", label: "Apple M2" },
  { value: "Apple M2 Pro", label: "Apple M2 Pro" },
  { value: "Apple M2 Max", label: "Apple M2 Max" },
  { value: "Apple M3", label: "Apple M3" },
  { value: "Apple M3 Pro", label: "Apple M3 Pro" },
  { value: "Apple M3 Max", label: "Apple M3 Max" }
];

// Computer Graphics Card options
const computerGraphicsCards = [
  { value: "Integrated Graphics", label: "Integrated Graphics" },
  { value: "NVIDIA GeForce RTX 4090", label: "NVIDIA GeForce RTX 4090" },
  { value: "NVIDIA GeForce RTX 4080", label: "NVIDIA GeForce RTX 4080" },
  { value: "NVIDIA GeForce RTX 4070", label: "NVIDIA GeForce RTX 4070" },
  { value: "NVIDIA GeForce RTX 4060", label: "NVIDIA GeForce RTX 4060" },
  { value: "NVIDIA GeForce RTX 3090", label: "NVIDIA GeForce RTX 3090" },
  { value: "NVIDIA GeForce RTX 3080", label: "NVIDIA GeForce RTX 3080" },
  { value: "NVIDIA GeForce RTX 3070", label: "NVIDIA GeForce RTX 3070" },
  { value: "NVIDIA GeForce RTX 3060", label: "NVIDIA GeForce RTX 3060" },
  { value: "AMD Radeon RX 7900", label: "AMD Radeon RX 7900" },
  { value: "AMD Radeon RX 7800", label: "AMD Radeon RX 7800" },
  { value: "AMD Radeon RX 7700", label: "AMD Radeon RX 7700" },
  { value: "AMD Radeon RX 7600", label: "AMD Radeon RX 7600" },
  { value: "AMD Radeon RX 6900", label: "AMD Radeon RX 6900" },
  { value: "AMD Radeon RX 6800", label: "AMD Radeon RX 6800" }
];

// Computer Operating System options
const computerOS = [
  { value: "Windows 11", label: "Windows 11" },
  { value: "Windows 10", label: "Windows 10" },
  { value: "macOS", label: "macOS" },
  { value: "Chrome OS", label: "Chrome OS" },
  { value: "Linux", label: "Linux" },
  { value: "Ubuntu", label: "Ubuntu" },
  { value: "No Operating System", label: "No Operating System" }
];

// Fields to display based on main category
const categoryFields = computed(() => {
  if (!form.mainCategory) return [];

  // Check if the category path contains "computers" or "laptops"
  const isComputerCategory = displayCategoryPath.value.toLowerCase().includes("computer") || 
                            displayCategoryPath.value.toLowerCase().includes("laptop") ||
                            displayCategoryPath.value.toLowerCase().includes("desktop");

  // Check if the category path contains "mobile phones"
  const isMobilePhoneCategory = displayCategoryPath.value.toLowerCase().includes("mobile phone") || 
                               displayCategoryPath.value.toLowerCase().includes("smartphone");

  if (isComputerCategory) {
    const brand = form.brand;
    const isApple = brand === 'Apple';
    const isDell = brand === 'Dell';
    const isHP = brand === 'HP';
    const isLenovo = brand === 'Lenovo';
    const isAsus = brand === 'Asus';
    const isMicrosoft = brand === 'Microsoft';
    const isAcer = brand === 'Acer';
    const isMSI = brand === 'MSI';
    const isSamsung = brand === 'Samsung';
    const isOther = brand === 'Other';

    // Initialize model field
    let modelField = { 
      name: "model", 
      label: "Model", 
      type: "select",
      options: [],
      required: true 
    };

    // Set model options based on selected brand
    if (isApple) {
      modelField.options = AppleComputerModels;
    } else if (isDell) {
      modelField.options = DellComputerModels;
    } else if (isHP) {
      modelField.options = HPComputerModels;
    } else if (isLenovo) {
      modelField.options = LenovoComputerModels;
    } else if (isAsus) {
      modelField.options = AsusComputerModels;
    } else if (isMicrosoft) {
      modelField.options = MicrosoftComputerModels;
    } else if (isAcer) {
      modelField.options = AcerComputerModels;
    } else if (isMSI) {
      modelField.options = MSIComputerModels;
    } else if (isSamsung) {
      modelField.options = SamsungComputerModels;
    } else if (isOther) {
      modelField.type = "text";
      modelField.options = undefined;
    } else {
      modelField.required = false;
    }

    return [
      { 
        name: "brand", 
        label: "Brand", 
        type: "select",
        options: computerBrands,
        required: true 
      },
      { name: "title", label: "Title", type: "text", required: true },
      modelField,
      { 
        name: "processor", 
        label: "Processor", 
        type: "select",
        options: computerProcessors,
        required: false 
      },
      { 
        name: "ram", 
        label: "RAM", 
        type: "select",
        options: computerRAM,
        required: false 
      },
      { 
        name: "storage", 
        label: "Storage", 
        type: "select",
        options: computerStorage,
        required: false 
      },
      { 
        name: "graphicsCard", 
        label: "Graphics Card", 
        type: "select",
        options: computerGraphicsCards,
        required: false 
      },
      { 
        name: "screenSize", 
        label: "Screen Size", 
        type: "text",
        required: false 
      },
      { 
        name: "operatingSystem", 
        label: "Operating System", 
        type: "select",
        options: computerOS,
        required: false 
      },
      { 
        name: "condition", 
        label: "Condition", 
        type: "select",
        options: [
          { value: "new", label: "New" },
          { value: "used", label: "Used" },
          { value: "refurbished", label: "Refurbished" }
        ],
        required: true 
      },
      { name: "price", label: "Price", type: "number", required: true },
      { name: "description", label: "Description", type: "textarea", required: true }
    ];
  } else if (isMobilePhoneCategory || form.mainCategory === "Electronics") {
    const brand = form.brand;
    const isApple = brand === 'Apple';
    const isSamsung = brand === 'Samsung';
    const isGoogle = brand === 'Google';
    const isOther = brand === 'Other';

    // Initialize model, storage, color fields
    let modelField = { 
      name: "model", 
      label: "Model", 
      type: "select",
      options: [],
      required: true 
    };

    let storageField = { 
      name: "storage", 
      label: "Storage", 
      type: "select",
      options: [],
      required: true 
    };

    let colorField = { 
      name: "color", 
      label: "Color", 
      type: "select",
      options: [],
      required: true 
    };

    if (isApple) {
      modelField.options = Object.values(iPhoneModels).flat();
      storageField.options = iPhoneStorage;
      colorField.options = iPhoneColors;
    } else if (isSamsung) {
      modelField.options = Object.values(SamsungModels).flat();
      storageField.options = SamsungStorage;
      colorField.options = SamsungColors;
    } else if (isGoogle) {
      modelField.options = Object.values(GooglePixelModels).flat();
      storageField.options = GooglePixelStorage;
      colorField.options = GooglePixelColors;
    } else if (isOther) {
      // For 'Other' brands, use text inputs
      modelField.type = "text";
      modelField.options = undefined;
      storageField.type = "text";
      colorField.type = "text";
    } else {
      // Default case, maybe brand not selected yet
      modelField.required = false;
      storageField.required = false;
      colorField.required = false;
    }

    return [
      { 
        name: "brand", 
        label: "Brand", 
        type: "select",
        options: [
          { value: "Apple", label: "Apple" },
          { value: "Samsung", label: "Samsung" },
          { value: "Google", label: "Google" },
          { value: "Other", label: "Other" }
        ],
        required: true 
      },
      { name: "title", label: "Title", type: "text", required: true },
      modelField,
      storageField,
      colorField,
      { 
        name: "condition", 
        label: "Condition", 
        type: "select",
        options: [
          { value: "new", label: "New" },
          { value: "used", label: "Used" },
          { value: "refurbished", label: "Refurbished" }
        ],
        required: true 
      },
      { name: "price", label: "Price", type: "number", required: true },
      { name: "description", label: "Description", type: "textarea", required: true }
    ];
  } else if (form.mainCategory === "Vehicles") {
    return [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "year", label: "Year", type: "number", required: true },
      { name: "mileage", label: "Mileage (km)", type: "number", required: true },
      { 
        name: "transmission", 
        label: "Transmission", 
        type: "select",
        options: [
          { value: "Automatic", label: "Automatic" },
          { value: "Manual", label: "Manual" },
          { value: "Semi-Automatic", label: "Semi-Automatic" }
        ],
        required: true 
      },
      { 
        name: "fuelType", 
        label: "Fuel Type", 
        type: "select",
        options: [
          { value: "Petrol", label: "Petrol" },
          { value: "Diesel", label: "Diesel" },
          { value: "Electric", label: "Electric" },
          { value: "Hybrid", label: "Hybrid" }
        ],
        required: true 
      },
      { 
        name: "condition", 
        label: "Condition", 
        type: "select",
        options: [
          { value: "new", label: "New" },
          { value: "used", label: "Used" },
          { value: "refurbished", label: "Refurbished" }
        ],
        required: true 
      },
      { name: "price", label: "Price", type: "number", required: true },
      { name: "description", label: "Description", type: "textarea", required: true }
    ];
  } else if (form.mainCategory === "Real Estate") {
    return [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "propertySize", label: "Property Size (sq ft)", type: "number", required: true },
      { name: "bedrooms", label: "Bedrooms", type: "number", required: true },
      { name: "bathrooms", label: "Bathrooms", type: "number", required: true },
      { 
        name: "condition", 
        label: "Condition", 
        type: "select",
        options: [
          { value: "new", label: "New" },
          { value: "used", label: "Used" },
          { value: "under construction", label: "Under Construction" }
        ],
        required: true 
      },
      { name: "price", label: "Price", type: "number", required: true },
      { name: "description", label: "Description", type: "textarea", required: true }
    ];
  } else if (form.mainCategory === "Fashion") {
    return [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "size", label: "Size", type: "text", required: true },
      { name: "color", label: "Color", type: "text", required: true },
      { name: "material", label: "Material", type: "text", required: false },
      { 
        name: "condition", 
        label: "Condition", 
        type: "select",
        options: [
          { value: "new", label: "New" },
          { value: "used", label: "Used" }
        ],
        required: true 
      },
      { name: "price", label: "Price", type: "number", required: true },
      { name: "description", label: "Description", type: "textarea", required: true }
    ];
  } else if (form.mainCategory === "Furniture") {
    return [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "dimensions", label: "Dimensions", type: "text", required: false },
      { name: "material", label: "Material", type: "text", required: false },
      { name: "style", label: "Style", type: "text", required: false },
      { 
        name: "condition", 
        label: "Condition", 
        type: "select",
        options: [
          { value: "new", label: "New" },
          { value: "used", label: "Used" },
          { value: "refurbished", label: "Refurbished" }
        ],
        required: true 
      },
      { name: "price", label: "Price", type: "number", required: true },
      { name: "description", label: "Description", type: "textarea", required: true }
    ];
  } else if (form.mainCategory === "Jobs") {
    return [
      { name: "title", label: "Job Title", type: "text", required: true },
      { name: "salary", label: "Salary", type: "text", required: false },
      { 
        name: "employmentType", 
        label: "Employment Type", 
        type: "select",
        options: [
          { value: "Full-time", label: "Full-time" },
          { value: "Part-time", label: "Part-time" },
          { value: "Contract", label: "Contract" },
          { value: "Temporary", label: "Temporary" },
          { value: "Internship", label: "Internship" }
        ],
        required: true 
      },
      { 
        name: "experienceLevel", 
        label: "Experience Level", 
        type: "select",
        options: [
          { value: "Entry Level", label: "Entry Level" },
          { value: "Mid Level", label: "Mid Level" },
          { value: "Senior Level", label: "Senior Level" },
          { value: "Executive", label: "Executive" }
        ],
        required: true 
      },
      { name: "description", label: "Job Description", type: "textarea", required: true }
    ];
  } else {
    // Default fields for other categories
    return [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "price", label: "Price", type: "number", required: true },
      { name: "description", label: "Description", type: "textarea", required: true }
    ];
  }
});

// Add a computed property to determine if we should show the condition field
const showConditionField = computed(() => {
  // Categories where condition makes sense
  const conditionCategories = [
    "Electronics",
    "Vehicles",
    "Fashion",
    "Furniture",
    "Mobile Phones",
    "Computers & Laptops",
    "TV & DVD Equipment",
    "Home Appliances",
  ];

  // Check if the main category or any subcategory contains these terms
  return conditionCategories.some(
    (category) =>
      form.mainCategory.includes(category) ||
      form.subCategory.includes(category) ||
      form.subSubCategory.includes(category) ||
      form.leafCategory.includes(category)
  );
});

// Update form location when any location selection changes
watch(fullLocation, (newLocation) => {
  form.location = newLocation;
});

const previewImages = ref([]);

const handleImageUpload = (e) => {
  const files = e.target.files;
  for (let i = 0; i < files.length; i++) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImages.value.push(e.target.result);
      form.images.push(files[i]);
    };
    reader.readAsDataURL(files[i]);
  }
};

const removeImage = (index) => {
  previewImages.value.splice(index, 1);
  form.images.splice(index, 1);
};

const uploadToCloudinary = async (imageFile) => {
  const cloudName = cloudinaryConfig.cloudName;
  const uploadPreset = cloudinaryConfig.uploadPreset;

  const formData = new FormData();
  formData.append("file", imageFile);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.secure_url;
  } catch (error) {
    console.error(
      "Detailed Cloudinary error:",
      error.response ? error.response.data : error
    );
    throw error;
  }
};

const uploadImages = async () => {
  const imageUrls = [];
  try {
    for (const imageFile of form.images) {
      const downloadURL = await uploadToCloudinary(imageFile);
      if (downloadURL) {
        imageUrls.push(downloadURL);
      }
    }

    if (imageUrls.length === 0) {
      throw new Error("No images were successfully uploaded");
    }

    return imageUrls;
  } catch (error) {
    console.error("Error in uploadImages:", error);
    throw error;
  }
};

const submitForm = async () => {
  // Validate that a state is selected
  if (!selectedState.value) {
    toast.error("Please select a state", {
      timeout: 3000,
    });
    return;
  }

  if (!authStore.user?.phoneNumber) {
    router.push("/profile");
    return;
  }

  try {
    isLoading.value = true;

    const imageUrls = await uploadImages();

    if (!imageUrls || imageUrls.length === 0) {
      throw new Error("Failed to upload images");
    }

    // Create base listing data with separate category fields
    const listingData = {
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      mainCategory: form.mainCategory,
      subCategory: form.subCategory,
      subSubCategory: form.subSubCategory,
      leafCategory: form.leafCategory,
      // Include full category path for easier querying/filtering
      categoryPath: displayCategoryPath.value,
      condition: form.condition,
      location: form.location,
      images: imageUrls,
      userId: authStore.user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: "active",
      views: 0,
    };

    // Check if user has an active subscription
    await subscriptionStore.fetchSubscription(authStore.user.uid);
    const hasActiveSubscription = subscriptionStore.subscription?.status === 'active';

    // Set isSponsored based on subscription status
    listingData.isSponsored = hasActiveSubscription;

    // Add category-specific fields
    categoryFields.value.forEach((field) => {
      if (form[field.name]) {
        listingData[field.name] = form[field.name];
      }
    });

    // Check if any required fields are undefined before adding to Firestore
    Object.entries(listingData).forEach(([key, value]) => {
      if (value === undefined) {
        console.error(`Field ${key} is undefined`);
      }
    });

    const docRef = await addDoc(collection(db, "listings"), listingData);
    toast.success("Listing created successfully!", {
      timeout: 3000,
    });
    // Redirect to dashboard
    router.push("/seller/dashboard");
  } catch (error) {
    console.error("Error creating listing:", error);
    toast.error("Failed to create listing. Please try again.", {
      timeout: 5000,
      closeOnClick: false,
      pauseOnFocusLoss: true,
    });
  } finally {
    isLoading.value = false;
  }
};

const goToStep = (step) => {
  // Only allow going to details if a leaf category is selected
  if (step === "details" && !isLeafCategorySelected.value) {
    toast.warning("Please select a specific category before continuing", {
      timeout: 3000,
    });
    return;
  }

  currentStep.value = step;
};

const cancel = () => {
  router.push("/seller/dashboard");
};

const dragover = (e) => {
  e.preventDefault();
  e.currentTarget.classList.add("border-jiji-primary", "bg-teal-50");
};

const dragleave = (e) => {
  e.preventDefault();
  e.currentTarget.classList.remove("border-jiji-primary", "bg-teal-50");
};

const dropFiles = (e) => {
  e.preventDefault();
  e.currentTarget.classList.remove("border-jiji-primary", "bg-teal-50");
  const files = e.dataTransfer.files;
  handleImageUpload({ target: { files } });
};

// Handle category selection change
const handleCategoryChange = (categoryPath) => {
  if (!categoryPath) return;

  // Split the full path into parts
  const parts = categoryPath.split(" > ");

  // Reset the category structure
  categoryStructure.mainCategory = parts[0] || "";
  categoryStructure.subCategory = parts[1] || "";
  categoryStructure.subSubCategory = parts[2] || "";
  categoryStructure.leafCategory = parts[3] || "";
};

onMounted(() => {
  // Check if required profile fields are complete
  const requiredFields = ["phoneNumber"];
  const isProfileComplete = requiredFields.every(
    field => authStore.user?.[field]?.trim()
  );

  if (!isProfileComplete) {
    toast.warning(
      "Please complete your profile information before creating listings",
      {
        timeout: 5000,
        closeOnClick: false,
        pauseOnFocusLoss: true,
      }
    );
    router.push("/profile");
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 class="text-2xl font-bold mb-6">Add New Product</h1>

        <!-- Progress Steps -->
        <div class="flex justify-between mb-8">
          <div class="flex flex-col items-center">
            <div
              :class="`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'category'
                  ? 'bg-green-900 text-white'
                  : 'bg-gray-200'
              }`"
            >
              1
            </div>
            <span class="text-sm mt-1">Category</span>
          </div>
          <div class="flex-1 h-0.5 bg-gray-200 self-center mx-2"></div>
          <div class="flex flex-col items-center">
            <div
              :class="`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'details'
                  ? 'bg-green-900 text-white'
                  : 'bg-gray-200'
              }`"
            >
              2
            </div>
            <span class="text-sm mt-1">Details</span>
          </div>
          <div class="flex-1 h-0.5 bg-gray-200 self-center mx-2"></div>
          <div class="flex flex-col items-center">
            <div
              :class="`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'location'
                  ? 'bg-green-900 text-white'
                  : 'bg-gray-200'
              }`"
            >
              3
            </div>
            <span class="text-sm mt-1">Location</span>
          </div>
          <div class="flex-1 h-0.5 bg-gray-200 self-center mx-2"></div>
          <div class="flex flex-col items-center">
            <div
              :class="`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'images'
                  ? 'bg-green-900 text-white'
                  : 'bg-gray-200'
              }`"
            >
              4
            </div>
            <span class="text-sm mt-1">Images</span>
          </div>
        </div>

        <div
          v-if="errorMessage"
          class="mb-4 p-3 bg-green-700 text-green-500 rounded"
        >
          {{ errorMessage }}
        </div>

        <form @submit.prevent="submitForm">
          <!-- Step 1: Category Selection -->
          <div v-if="currentStep === 'category'">
            <div class="mb-6">
              <h2 class="text-xl font-semibold mb-4">Select Category</h2>
              <p class="text-gray-600 mb-4">
                What are you selling? Choose the right category for your item.
                Please select down to the most specific category.
              </p>

              <CategorySelector
                v-model="displayCategoryPath"
                :categories="categoriesData"
                :required="true"
                @selection-object="updateCategoryStructure"
              />

              <!-- Display selected category -->
              <div
                v-if="displayCategoryPath"
                class="mt-4 text-sm text-gray-600"
              >
                Selected:
                <span class="font-medium">{{ displayCategoryPath }}</span>
                <div v-if="!isLeafCategorySelected" class="mt-2 text-amber-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 inline-block mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  Please select the most specific category before continuing
                </div>
                <div v-else class="mt-2 text-green-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 inline-block mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  Category selection complete
                </div>
              </div>
            </div>

            <div class="flex justify-between mt-8">
              <button
                type="button"
                @click="cancel"
                class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                @click="goToStep('details')"
                class="px-6 py-2 bg-green-900 text-white rounded-lg hover:bg-jiji-primary-dark transition-colors"
                :disabled="!isLeafCategorySelected"
              >
                Continue
              </button>
            </div>
          </div>

          <!-- Step 2: Product Details -->
          <div v-if="currentStep === 'details'">
            <div class="mb-6">
              <h2 class="text-xl font-semibold mb-4">Product Details</h2>

              <!-- Selected Category Display -->
              <div class="mb-4 p-3 bg-gray-50 rounded-lg">
                <div class="text-sm text-gray-600">Category:</div>
                <div class="font-medium">{{ displayCategoryPath }}</div>
              </div>

              <!-- Form Fields -->
              <div v-if="showConditionField" class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Condition*</label>
                <div class="flex space-x-4">
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      v-model="form.condition"
                      value="new"
                      class="form-radio text-jiji-primary"
                    />
                    <span class="ml-2">New</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      v-model="form.condition"
                      value="used"
                      class="form-radio text-jiji-primary"
                    />
                    <span class="ml-2">Used</span>
                  </label>
                </div>
              </div>

              <!-- Category-specific fields -->
              <div
                v-for="field in categoryFields"
                :key="field.name"
                class="mb-4"
              >
                <label
                  :for="field.name"
                  class="block text-gray-700 font-medium mb-2"
                >
                  {{ field.label }}{{ field.required ? "*" : "" }}
                </label>

                <!-- Text input -->
                <input
                  v-if="field.type === 'text' || field.type === 'number'"
                  :type="field.type"
                  :id="field.name"
                  v-model="form[field.name]"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jiji-primary"
                  :placeholder="`Enter ${field.label.toLowerCase()}`"
                  :required="field.required"
                />

                <!-- Textarea -->
                <textarea
                  v-else-if="field.type === 'textarea'"
                  :id="field.name"
                  v-model="form[field.name]"
                  rows="3"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jiji-primary"
                  :placeholder="`Enter ${field.label.toLowerCase()}`"
                  :required="field.required"
                ></textarea>

                <!-- Select dropdown -->
                <select
                  v-else-if="field.type === 'select'"
                  :id="field.name"
                  v-model="form[field.name]"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jiji-primary"
                  :required="field.required"
                >
                  <option value="" disabled selected>
                    Select {{ field.label }}
                  </option>
                  <option
                    v-for="option in field.options"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>

            </div>

            <div class="flex justify-between mt-8">
              <button
                type="button"
                @click="goToStep('category')"
                class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                @click="goToStep('location')"
                class="px-6 py-2 bg-green-900 text-white rounded-lg hover:bg-jiji-primary-dark transition-colors"
              >
                Continue
              </button>
            </div>
          </div>

          <!-- Step 3: Location -->
          <div v-if="currentStep === 'location'">
            <div class="mb-6">
              <h2 class="text-xl font-semibold mb-4">Location</h2>
              <p class="text-gray-600 mb-4">Where is your item located?</p>

              <!-- State Dropdown -->
              <div class="mb-3">
                <label for="state" class="block text-gray-700 font-medium mb-2"
                  >State*</label
                >
                <select
                  id="state"
                  v-model="selectedState"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jiji-primary"
                  required
                >
                  <option value="" disabled selected>Select State</option>
                  <option
                    v-for="state in availableStates"
                    :key="state"
                    :value="state"
                  >
                    {{ state }}
                  </option>
                </select>
              </div>

              <!-- LGA Dropdown (only shows if state is selected) -->
              <div class="mb-3" v-if="selectedState">
                <label for="lga" class="block text-gray-700 font-medium mb-2"
                  >Local Government Area</label
                >
                <select
                  id="lga"
                  v-model="selectedLGA"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jiji-primary"
                >
                  <option value="" disabled selected>Select LGA</option>
                  <option v-for="lga in availableLGAs" :key="lga" :value="lga">
                    {{ lga }}
                  </option>
                </select>
              </div>

              <!-- Location Dropdown (only shows if LGA is selected) -->
              <div class="mb-3" v-if="selectedLGA">
                <label
                  for="specific-location"
                  class="block text-gray-700 font-medium mb-2"
                  >Area/Location</label
                >
                <select
                  id="specific-location"
                  v-model="selectedLocation"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jiji-primary"
                >
                  <option value="" disabled selected>Select Location</option>
                  <option
                    v-for="location in availableLocations"
                    :key="location"
                    :value="location"
                  >
                    {{ location }}
                  </option>
                </select>
              </div>

              <!-- Display full location path -->
              <div v-if="form.location" class="mt-4 text-sm text-gray-600">
                Selected location:
                <span class="font-medium">{{ form.location }}</span>
              </div>
            </div>

            <div class="flex justify-between mt-8">
              <button
                type="button"
                @click="goToStep('details')"
                class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                @click="goToStep('images')"
                class="px-6 py-2 bg-green-900 text-white rounded-lg hover:bg-jiji-primary-dark transition-colors"
                :disabled="!selectedState"
              >
                Continue
              </button>
            </div>
          </div>

          <!-- Step 4: Images -->
          <div v-if="currentStep === 'images'">
            <div class="mb-6">
              <h2 class="text-xl font-semibold mb-4">Product Images</h2>
              <p class="text-gray-600 mb-4">
                Add photos of your item (maximum 10 images)
              </p>

              <div
                @dragover.prevent="dragover"
                @dragleave.prevent="dragleave"
                @drop.prevent="dropFiles"
                class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-jiji-primary transition-colors"
              >
                <div class="flex flex-col items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-12 w-12 text-gray-400 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  <p class="text-gray-700 mb-2">Drag and drop images here</p>
                  <p class="text-gray-500 text-sm mb-4">or</p>
                  <label
                    class="px-4 py-2 bg-jiji-primary text-white rounded-lg cursor-pointer hover:bg-jiji-primary-dark transition-colors"
                  >
                    <span class="text-gray-400">Select Files</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      class="hidden"
                      @change="handleImageUpload"
                    />
                  </label>
                </div>
              </div>

              <!-- Image Preview -->
              <div v-if="previewImages.length > 0" class="mt-4">
                <div class="grid grid-cols-3 gap-4">
                  <div
                    v-for="(image, index) in previewImages"
                    :key="index"
                    class="relative"
                  >
                    <img
                      :src="image"
                      class="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      @click="removeImage(index)"
                      class="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 text-gray-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-between mt-8">
              <button
                type="button"
                @click="goToStep('location')"
                class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                class="px-6 py-2 bg-green-900 text-white rounded-lg hover:bg-jiji-primary-dark transition-colors disabled:opacity-50"
                :disabled="isLoading || form.images.length === 0"
              >
                <span v-if="isLoading">
                  <svg
                    class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Uploading...
                </span>
                <span v-else>Submit Listing</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
