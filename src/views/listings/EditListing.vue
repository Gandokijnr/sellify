<template>
  <div class="min-h-screen bg-gray-100">
    <Navbar />

    <div class="py-10">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Page Header -->
        <div class="mb-8">
          <div class="flex items-center">
            <button
              @click="router.back()"
              class="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon class="h-5 w-5" />
            </button>
            <h1 class="text-2xl font-bold text-gray-900">Edit Listing</h1>
          </div>
          <p class="mt-2 text-sm text-gray-500">
            Update your listing information below.
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-12">
          <div
            class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"
          ></div>
        </div>

        <!-- Error State -->
        <div
          v-else-if="error"
          class="bg-red-50 border-l-4 border-red-400 p-4 mb-6"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <ExclamationCircleIcon class="h-5 w-5 text-red-400" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">
                {{ error }}
                <button
                  @click="fetchListing"
                  class="font-medium text-red-700 underline"
                >
                  Try again
                </button>
              </p>
            </div>
          </div>
        </div>

        <!-- Success Message -->
        <div
          v-if="successMessage"
          class="bg-green-50 border-l-4 border-green-400 p-4 mb-6"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <CheckCircleIcon class="h-5 w-5 text-green-400" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-green-700">{{ successMessage }}</p>
            </div>
          </div>
        </div>

        <!-- Edit Form -->
        <div
          v-if="!loading && !error"
          class="bg-white shadow overflow-hidden sm:rounded-lg"
        >
          <form @submit.prevent="handleSubmit">
            <div class="px-4 py-5 sm:p-6">
              <!-- Title -->
              <div class="mb-6">
                <label
                  for="title"
                  class="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  v-model="form.title"
                  class="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>

              <!-- Price -->
              <div class="mb-6">
                <label
                  for="price"
                  class="block text-sm font-medium text-gray-700"
                >
                  Price
                </label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <div
                    class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                  >
                    <span class="text-gray-500 sm:text-sm">₦</span>
                  </div>
                  <input
                    type="number"
                    id="price"
                    v-model="form.price"
                    class="focus:ring-green-500 focus:border-green-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <!-- Description -->
              <div class="mb-6">
                <label
                  for="description"
                  class="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  v-model="form.description"
                  rows="4"
                  class="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  required
                ></textarea>
              </div>

              <!-- Category -->
              <div class="mb-6">
                <label
                  for="category"
                  class="block text-sm font-medium text-gray-700"
                >
                  Category
                </label>
                <select
                  id="category"
                  v-model="form.category"
                  class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  required
                >
                  <option value="" disabled>Select a category</option>
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="home">Home & Garden</option>
                  <option value="vehicles">Vehicles</option>
                  <option value="property">Property</option>
                  <option value="services">Services</option>
                  <option value="jobs">Jobs</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <!-- Condition -->
              <div class="mb-6">
                <label
                  for="condition"
                  class="block text-sm font-medium text-gray-700"
                >
                  Condition
                </label>
                <select
                  id="condition"
                  v-model="form.condition"
                  class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  required
                >
                  <option value="" disabled>Select condition</option>
                  <option value="new">New</option>
                  <option value="like-new">Like New</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="salvage">For Parts or Not Working</option>
                </select>
              </div>

              <!-- Location -->
              <div class="mb-6">
                <label
                  for="location"
                  class="block text-sm font-medium text-gray-700"
                >
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  v-model="form.location"
                  class="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>

              <!-- Status -->
              <div class="mb-6">
                <label
                  for="status"
                  class="block text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <select
                  id="status"
                  v-model="form.status"
                  class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  required
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                </select>
              </div>

              <!-- Images -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700"
                  >Images</label
                >
                <div
                  class="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                >
                  <div
                    v-for="(image, index) in form.images"
                    :key="index"
                    class="relative opacity-50"
                  >
                    <img
                      :src="image"
                      class="h-32 w-full object-cover rounded-md"
                      :alt="`Listing image ${index + 1}`"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div
              class="px-4 py-3 bg-gray-50 text-right sm:px-6 flex justify-between"
            >
              <button
                type="button"
                @click="router.push('/seller/dashboard')"
                class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancel
              </button>
              <div class="flex space-x-3">
                <button
                  type="submit"
                  :disabled="submitting"
                  class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  <span v-if="submitting" class="mr-2">
                    <svg
                      class="animate-spin h-4 w-4 text-white"
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
                  </span>
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Cloudinary Widget Script - Include in your Vue app's index.html -->
    <!-- <script src="https://upload-widget.cloudinary.com/global/all.js" type="text/javascript"></script> -->
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import {
  ArrowLeftIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/vue/24/solid";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import Navbar from "@/components/common/Navbar.vue";
import cloudinaryConfig from "@/cloudinary/cloudinaryConfig";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const listingId = route.params.id;

const loading = ref(true);
const submitting = ref(false);
const error = ref(null);
const successMessage = ref(null);
const newImageUrl = ref("");
const cloudinaryWidget = ref(null);

const form = ref({
  title: "",
  price: "",
  description: "",
  category: "",
  condition: "",
  location: "",
  status: "active",
  images: [],
});

// Fetch the listing data
const fetchListing = async () => {
  loading.value = true;
  error.value = null;

  try {
    if (!authStore.user?.uid) {
      throw new Error("User not authenticated");
    }

    const listingRef = doc(db, "listings", listingId);
    const listingSnap = await getDoc(listingRef);

    if (!listingSnap.exists()) {
      throw new Error("Listing not found");
    }

    const listingData = listingSnap.data();

    // Check if the listing belongs to the current user
    if (listingData.userId !== authStore.user.uid) {
      throw new Error("You don't have permission to edit this listing");
    }

    // Populate form data
    form.value = {
      title: listingData.title || "",
      price: listingData.price || "",
      description: listingData.description || "",
      category: listingData.category || "",
      condition: listingData.condition || "",
      location: listingData.location || "",
      status: listingData.status || "active",
      images: listingData.images || [],
    };
  } catch (err) {
    console.error("Error fetching listing:", err);
    error.value = err.message || "Failed to load listing";
  } finally {
    loading.value = false;
  }
};

// Open Cloudinary upload widget
const openCloudinaryUpload = () => {
  if (form.value.images.length >= 10) {
    alert("You can only upload up to 10 images.");
    return;
  }

  if (cloudinaryWidget.value) {
    cloudinaryWidget.value.open();
  } else {
    // If Cloudinary widget isn't available, show a message
    alert(
      "Image upload widget is not available. Please use the URL input instead."
    );
  }
};

// Add image URL manually
const addImageUrl = () => {
  if (!newImageUrl.value) {
    alert("Please enter a valid image URL");
    return;
  }

  if (form.value.images.length >= 10) {
    alert("You can only upload up to 10 images.");
    return;
  }

  // Add the URL to the images array
  form.value.images.push(newImageUrl.value);

  // Clear the input
  newImageUrl.value = "";
};

// Remove image
const removeImage = (index) => {
  form.value.images.splice(index, 1);
};

// Submit form
const handleSubmit = async () => {
  try {
    submitting.value = true;

    // Validate form
    if (!form.value.title || !form.value.price) {
      throw new Error("Please fill in all required fields");
    }

    // Update listing in Firestore
    const listingRef = doc(db, "listings", listingId);
    await updateDoc(listingRef, {
      title: form.value.title,
      price: Number(form.value.price),
      description: form.value.description,
      category: form.value.category,
      condition: form.value.condition,
      location: form.value.location,
      status: form.value.status,
      images: form.value.images,
      updatedAt: serverTimestamp(),
    });

    // Show success message
    successMessage.value = "Listing updated successfully!";
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (err) {
    console.error("Update error:", err);
    error.value = err.message || "Failed to update listing";
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchListing();
});
</script>
