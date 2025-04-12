<script setup>
import { ref } from "vue";
import { useListingsStore } from "@/stores/listings.store";

const listingsStore = useListingsStore();
const loading = ref(false);

const submitListing = async () => {
  try {
    loading.value = true;
    await listingsStore.createListing(formData.value);
    // Redirect to success page
  } catch (error) {
    console.error("Error creating listing:", error);
  } finally {
    loading.value = false;
  }
};
</script>
<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-2xl font-bold mb-4">Upload Media</h1>
    <form @submit.prevent="submitListing" class="w-full max-w-md">
      <div class="mb-4">
        <label for="image" class="block text-sm font-medium text-gray-700"
          >Image</label
        >
        <input
          type="file"
          id="image"
          accept="image/*"
          @change="handleFileChange"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-jiji-primary focus:border-jiji-primary"
        />
      </div>
      <div class="mb-4">
        <label for="video" class="block text-sm font-medium text-gray-700"
          >Video</label
        >
        <input
          type="file"
          id="video"
          accept="video/*"
          @change="handleFileChange"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-jiji-primary focus:border-jiji-primary"
        />
      </div>
      <button
        type="submit"
        :disabled="loading"
        class="w-full py-2 px-4 bg-jiji-primary text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring focus:ring-jiji-primary disabled:opacity-50"
      >
        {{ loading ? "Uploading..." : "Upload" }}
      </button>
    </form>
  </div>
</template>
