<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import Navbar from "@/components/common/Navbar.vue";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase";

const router = useRouter();
const isLoading = ref(false);
const errorMessage = ref("");

const form = ref({
  title: "",
  description: "",
  price: "",
  category: "",
  condition: "used",
  location: "",
  images: [],
});

const previewImages = ref([]);

const handleImageUpload = (e) => {
  const files = e.target.files;
  for (let i = 0; i < files.length; i++) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImages.value.push(e.target.result);
      form.value.images.push(files[i]);
    };
    reader.readAsDataURL(files[i]);
  }
};

const removeImage = (index) => {
  previewImages.value.splice(index, 1);
  form.value.images.splice(index, 1);
};

const uploadImagesToStorage = async (productId) => {
  const imageUrls = [];
  
  for (let i = 0; i < form.value.images.length; i++) {
    const file = form.value.images[i];
    const fileRef = storageRef(storage, `products/${productId}/${Date.now()}-${file.name}`);
    
    try {
      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      imageUrls.push(downloadURL);
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }
  
  return imageUrls;
};

const submitForm = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = "";
    
    // Basic validation
    if (!form.value.title || !form.value.price || !form.value.category || !form.value.location) {
      errorMessage.value = "Please fill in all required fields";
      isLoading.value = false;
      return;
    }
    
    // First create the product document without images
    const productData = {
      title: form.value.title,
      description: form.value.description,
      price: parseFloat(form.value.price),
      category: form.value.category,
      condition: form.value.condition,
      location: form.value.location,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      sellerId: "user123", // Replace with actual user ID from auth
      status: "active"
    };
    
    // Add the product to Firestore
    const docRef = await addDoc(collection(db, "products"), productData);
    const productId = docRef.id;
    
    // Upload images if any and update the product with image URLs
    if (form.value.images.length > 0) {
      const imageUrls = await uploadImagesToStorage(productId);
      
      // Update the product document with image URLs
      await addDoc(collection(db, "products", productId), {
        imageUrls: imageUrls,
        updatedAt: serverTimestamp()
      });
    }
    
    console.log("Product added successfully with ID:", productId);
    router.push("/seller/dashboard");
  } catch (error) {
    console.error("Error adding product:", error);
    errorMessage.value = "Failed to add product. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

const cancel = () => {
  router.push("/seller/dashboard");
};

const dragover = (e) => {
  e.preventDefault();
  e.currentTarget.classList.add('border-jiji-primary', 'bg-orange-50');
};

const dragleave = (e) => {
  e.preventDefault();
  e.currentTarget.classList.remove('border-jiji-primary', 'bg-orange-50');
};

const dropFiles = (e) => {
  e.preventDefault();
  e.currentTarget.classList.remove('border-jiji-primary', 'bg-orange-50');
  const files = e.dataTransfer.files;
  handleImageUpload({ target: { files } });
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 class="text-2xl font-bold mb-6">Add New Product</h1>
        
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {{ errorMessage }}
        </div>
        
        <form @submit.prevent="submitForm">
          <!-- Title -->
          <div class="mb-4">
            <label for="title" class="block text-gray-700 font-medium mb-2">Title*</label>
            <input
              type="text"
              id="title"
              v-model="form.title"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jiji-primary"
              placeholder="Product title"
              required
            />
          </div>
          
          <!-- Description -->
          <div class="mb-4">
            <label for="description" class="block text-gray-700 font-medium mb-2">Description</label>
            <textarea
              id="description"
              v-model="form.description"
              rows="4"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jiji-primary"
              placeholder="Describe your product"
            ></textarea>
          </div>
          
          <!-- Price -->
          <div class="mb-4">
            <label for="price" class="block text-gray-700 font-medium mb-2">Price*</label>
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
          </div>
          
          <!-- Category -->
          <div class="mb-4">
            <label for="category" class="block text-gray-700 font-medium mb-2">Category*</label>
            <select
              id="category"
              v-model="form.category"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jiji-primary"
              required
            >
              <option value="" disabled selected>Select category</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="furniture">Furniture</option>
              <option value="vehicles">Vehicles</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <!-- Condition -->
          <div class="mb-4">
            <label class="block text-gray-700 font-medium mb-2">Condition</label>
            <div class="flex space-x-4">
              <label class="inline-flex items-center">
                <input type="radio" v-model="form.condition" value="new" class="form-radio text-jiji-primary" />
                <span class="ml-2">New</span>
              </label>
              <label class="inline-flex items-center">
                <input type="radio" v-model="form.condition" value="used" class="form-radio text-jiji-primary" />
                <span class="ml-2">Used</span>
              </label>
            </div>
          </div>
          
          <!-- Location -->
          <div class="mb-4">
            <label for="location" class="block text-gray-700 font-medium mb-2">Location*</label>
            <input
              type="text"
              id="location"
              v-model="form.location"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jiji-primary"
              placeholder="City, State"
              required
            />
          </div>
          
          <!-- Images -->
          <div class="mb-6">
            <label class="block text-gray-700 font-medium mb-2">Images</label>
            <div
              @dragover.prevent="dragover"
              @dragleave.prevent="dragleave"
              @drop.prevent="dropFiles"
              class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-jiji-primary transition-colors"
            >
              <div class="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p class="text-gray-700 mb-2">Drag and drop images here</p>
                <p class="text-gray-500 text-sm mb-4">or</p>
                <label class="px-4 py-2 bg-jiji-primary text-white rounded-lg cursor-pointer hover:bg-jiji-primary-dark transition-colors">
                  <span>Select Files</span>
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
                <div v-for="(image, index) in previewImages" :key="index" class="relative">
                  <img :src="image" class="w-full h-32 object-cover rounded-lg" />
                  <button
                    type="button"
                    @click="removeImage(index)"
                    class="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Submit and Cancel Buttons -->
          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="cancel"
              class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-6 py-2 bg-green-900 text-white rounded-lg hover:bg-jiji-primary-dark transition-colors disabled:opacity-50"
              :disabled="isLoading"
            >
              <span v-if="isLoading">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
              <span v-else>Submit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>