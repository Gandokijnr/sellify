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
import { useToast } from "vue-toastification";
import nigeriaLocations from "@/stores/location";
import CategorySelector from "@/components/categories/CategorySelector.vue";
import categoriesData from "@/stores/data/categorise";

const router = useRouter();
const isLoading = ref(false);
const errorMessage = ref("");
const authStore = useAuthStore();
const toast = useToast();
const currentStep = ref("category"); // Start with category selection step

// Location-related refs
const selectedState = ref("");
const selectedLGA = ref("");
const selectedLocation = ref("");

const areRequiredFieldsFilled = computed(() => {
  return categoryFields.value
    .filter((field) => field.required)
    .every((field) => !!form[field.name]);
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

// Check if we've reached a leaf category
const isLeafCategorySelected = computed(() => {
  // Logic to determine if we're at a leaf node in the category hierarchy
  if (!categoryStructure.mainCategory) return false;

  const mainCat = categoriesData[categoryStructure.mainCategory];
  if (!mainCat) return false;

  if (!categoryStructure.subCategory) return false;
  const subCat = mainCat[categoryStructure.subCategory];
  if (!subCat) return false;

  // If subCategory is an array, it means we've reached leaf level
  if (Array.isArray(subCat)) {
    return categoryStructure.leafCategory !== "";
  }

  // Otherwise, check if subSubCategory exists and is a leaf
  if (!categoryStructure.subSubCategory) return false;
  const subSubCat = subCat[categoryStructure.subSubCategory];
  if (!subSubCat) return false;

  // If we have array at subSubCategory level, check for leafCategory
  if (Array.isArray(subSubCat)) {
    return categoryStructure.leafCategory !== "";
  }

  return false;
});

const form = reactive({
  title: "",
  description: "",
  price: "",
  condition: "used",
  location: "",
  images: [],

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

// Fields to display based on main category
const categoryFields = computed(() => {
  if (!form.mainCategory) return [];

  switch (form.mainCategory) {
    case "Electronics":
      return [
        { name: "title", label: "Title", type: "text", required: true },
        { name: "model", label: "Model", type: "text", required: true },
        {
          name: "specifications",
          label: "Specifications",
          type: "textarea",
          required: false,
        },
        { name: "brand", label: "Brand", type: "text", required: true },

        {
          name: "condition",
          label: "Condition",
          type: "select",
          options: ["New", "Used"],
          required: true,
        },
        { name: "price", label: "Price", type: "number", required: true },
      ];
    case "Real Estate":
      return [
        {
          name: "property name",
          label: "Property Name",
          type: "text",
          required: true,
        },

        {
          name: "price",
          label: "Price",
          type: "number",
          required: true,
        },
        {
          name: "location",
          label: "Location",
          type: "text",
          required: true,
        },
        {
          name: "propertySize",
          label: "Property Size (sqm)",
          type: "number",
          required: true,
        },
        {
          name: "bedrooms",
          label: "Bedrooms",
          type: "number",
          required: false,
        },
        {
          name: "bathrooms",
          label: "Bathrooms",
          type: "number",
          required: false,
        },
      ];
    case "Vehicles":
      return [
        {
          name: "title",
          label: "Title",
          type: "text",
          required: true,
        },
        { name: "price", label: "Price", type: "number", required: true },

        { name: "model", label: "Model", type: "text", required: true },

        { name: "brand", label: "Brand", type: "text", required: true },
        { name: "year", label: "Year", type: "number", required: true },
        { name: "mileage", label: "Mileage", type: "number", required: true },
        {
          name: "transmission",
          label: "Transmission",
          type: "select",
          options: ["Automatic", "Manual", "CVT", "Semi-automatic"],
          required: true,
        },
        {
          name: "fuelType",
          label: "Fuel Type",
          type: "select",
          options: ["Petrol", "Diesel", "Electric", "Hybrid", "CNG/LPG"],
          required: true,
        },
      ];
    case "Fashion":
      return [
        {
          name: "title",
          label: "Title",
          type: "text",
          required: true,
        },
        { name: "price", label: "Price", type: "number", required: true },
        { name: "size", label: "Size", type: "text", required: true },
        { name: "color", label: "Color", type: "text", required: true },
        { name: "material", label: "Material", type: "text", required: false },
      ];
    case "Furniture":
      return [
        {
          name: "title",
          label: "Title",
          type: "text",
          required: true,
        },
        { name: "price", label: "Price", type: "number", required: true },
        {
          name: "dimensions",
          label: "Dimensions (L x W x H)",
          type: "text",
          required: true,
        },
        { name: "material", label: "Material", type: "text", required: true },
        { name: "style", label: "Style", type: "text", required: false },
      ];
    case "Jobs":
      return [
        {
          name: "title",
          label: "Job Title",
          type: "text",
          required: true,
        },
        { name: "description", label: "Job Description", type: "textarea" },
        { name: "location", label: "Location", type: "text", required: true },

        {
          name: "salary",
          label: "Salary Range",
          type: "text",
          required: false,
        },
        {
          name: "employmentType",
          label: "Employment Type",
          type: "select",
          options: [
            "Full-time",
            "Part-time",
            "Contract",
            "Temporary",
            "Internship",
          ],
          required: true,
        },
        {
          name: "experienceLevel",
          label: "Experience Level",
          type: "select",
          options: [
            "Entry Level",
            "Mid Level",
            "Senior Level",
            "Manager",
            "Executive",
          ],
          required: true,
        },
      ];
    default:
      return [];
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
  e.currentTarget.classList.add("border-jiji-primary", "bg-orange-50");
};

const dragleave = (e) => {
  e.preventDefault();
  e.currentTarget.classList.remove("border-jiji-primary", "bg-orange-50");
};

const dropFiles = (e) => {
  e.preventDefault();
  e.currentTarget.classList.remove("border-jiji-primary", "bg-orange-50");
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
  if (!authStore.user?.phoneNumber) {
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

              <!-- Title -->
              <!-- <div class="mb-4">
                <label for="title" class="block text-gray-700 font-medium mb-2"
                  >Title*</label
                >
                <input
                  type="text"
                  id="title"
                  v-model="form.title"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jiji-primary"
                  placeholder="Product title"
                  required
                />
              </div>

              <-- Price -->
              <!-- <div class="mb-4">
                <label for="price" class="block text-gray-700 font-medium mb-2"
                  >Price*</label
                >
                <input
                  type="number"
                  id="price"
                  v-model="form.price"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jiji-primary"
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                  required
                />
              </div> -->

              <!-- Condition -->
              <!-- <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2"
                  >Condition</label
                >
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
              </div> -->

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
                    :key="option"
                    :value="option"
                  >
                    {{ option }}
                  </option>
                </select>
              </div>

              <!-- Description -->
              <div class="mb-4">
                <label
                  for="description"
                  class="block text-gray-700 font-medium mb-2"
                  >Description</label
                >
                <textarea
                  id="description"
                  v-model="form.description"
                  rows="4"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jiji-primary"
                  placeholder="Describe your product"
                ></textarea>
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
