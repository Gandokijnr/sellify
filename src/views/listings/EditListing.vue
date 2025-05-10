<template>
  <div class="min-h-screen bg-gray-100">
    <Navbar />
    <div class="bg-gray-50 min-h-screen py-8">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <!-- Loading State -->
          <div v-if="loading" class="p-8 flex justify-center">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          </div>

          <div v-else>
            <!-- Error State -->
            <div v-if="error" class="p-6">
              <div class="bg-red-50 border-l-4 border-red-400 p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">Error</h3>
                    <div class="mt-2 text-sm text-red-700">
                      <p>{{ error }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Listing Details -->
            <div class="px-6 py-6">
              <h1 class="text-2xl font-bold mb-6">Edit Listing</h1>
              <form @submit.prevent="updateListing">
                <!-- Basic Information -->
                <div class="mb-8">
                  <h2 class="text-lg font-medium text-gray-900 mb-4">Edit Listing Details</h2>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Price -->
                    <div>
                      <label for="price" class="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                      <div class="mt-1 relative rounded-md shadow-sm">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span class="text-gray-500 sm:text-sm">₦</span>
                        </div>
                        <input
                          id="price"
                          v-model.number="form.price"
                          type="number"
                          step="0.01"
                          min="0"
                          class="block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>
                    </div>

                    <!-- status update -->
                    <div>
                      <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        id="status"
                        v-model="form.status"
                        class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        required
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <!-- Description -->
                    <div class="col-span-2">
                      <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        id="description"
                        v-model="form.description"
                        rows="4"
                        class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        required
                      ></textarea>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-end space-x-4">
                  <button
                    type="button"
                    @click="cancel"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Update Listing
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, reactive } from "vue";
import { onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import Navbar from "@/components/common/Navbar.vue";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import cloudinaryConfig from "@/cloudinary/cloudinaryConfig";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";
import nigeriaLocations from "@/stores/location";
import CategorySelector from "@/components/categories/CategorySelector.vue";

const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuthStore();
const loading = ref(true);
const error = ref("");
const submitting = ref(false);

const listingId = route.params.id;

const form = reactive({
  price: "",
  status: "active",
  description: ""
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

    // Populate form data with only price and description
    Object.assign(form, {
      price: listingData.price || "",
      description: listingData.description || "",
      status: listingData.status || "active"
    });

  } catch (err) {
    console.error("Error fetching listing:", err);
    error.value = err.message || "Failed to load listing";
  } finally {
    loading.value = false;
  }
};

// Cancel edit and go back
const cancel = () => {
  router.back();
};

// Update listing
const updateListing = async () => {
  submitting.value = true;
  error.value = null;

  try {
    // Validate form
    if (!form.price) {
      throw new Error("Please enter a price");
    }

    // Prepare update data
    const updateData = {
      price: Number(form.price),
      status: form.status,
      description: form.description,
      updatedAt: serverTimestamp()
    };


    // Update listing in Firestore
    const listingRef = doc(db, "listings", listingId);
    await updateDoc(listingRef, updateData);

    toast.success("Listing updated successfully!");
    router.push(`/listing/${listingId}`);
  } catch (err) {
    console.error("Update error:", err);
    error.value = err.message || "Failed to update listing";
    toast.error(error.value);
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchListing();
});
</script>