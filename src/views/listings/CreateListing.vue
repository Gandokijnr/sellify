<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="py-8">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Form Header -->
        <div class="mb-8">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Create New Listing</h1>
              <p class="mt-2 text-sm text-gray-500">All fields marked with * are required</p>
            </div>
            <div class="flex gap-3">
              <button
                @click="cancel"
                class="inline-flex items-center px-5 py-2 border border-gray-300 
         text-sm font-medium rounded-md text-gray-700 bg-white 
         hover:bg-gray-50 focus:outline-none focus:ring-2 
         focus:ring-offset-2 focus:ring-jiji-primary transition-colors"
              >
                Discard
              </button>
              <button
                @click="submitForm"
                class="inline-flex items-center px-5 py-2 border border-transparent 
         text-sm font-medium rounded-md text-white bg-jiji-primary 
         hover:bg-orange-700 focus:outline-none focus:ring-2 
         focus:ring-offset-2 focus:ring-jiji-primary transition-colors"
              >
                Publish Listing
              </button>
            </div>
          </div>
          <hr class="mt-4 border-gray-200">
        </div>

        <!-- Form Body -->
        <div class="space-y-8">
          <!-- Product Information Section -->
          <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Product Information</h2>
            
            <!-- Title -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Product Title *
                <span class="float-right text-sm font-normal text-gray-500">{{ form.title.length }}/60</span>
              </label>
              <input
                v-model="form.title"
                maxlength="60"
                type="text"
                class="mt-1 block p-4 w-full rounded-md border-gray-300 shadow-sm 
         focus:border-jiji-primary focus:ring-jiji-primary sm:text-sm
         transition duration-200 ease-in-out"
                placeholder="e.g. iPhone 13 Pro Max 256GB - Unlocked"
              />
            </div>

            <!-- Description -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Description *
                <span class="float-right text-sm font-normal text-gray-500">{{ form.description.length }}/1200</span>
              </label>
              <textarea
                v-model="form.description"
                rows="5"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
         focus:border-jiji-primary focus:ring-jiji-primary sm:text-sm
         transition duration-200 ease-in-out"
                placeholder="Include key details like brand, model, specifications, condition, reason for selling..."
              ></textarea>
            </div>

            <!-- Category & Condition -->
            <div class="grid md:grid-cols-2 gap-6">
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  v-model="form.category"
                  class="mt-1 p-4 block w-full rounded-md border-gray-300 shadow-sm 
         focus:border-jiji-primary focus:ring-jiji-primary sm:text-sm
         transition duration-200 ease-in-out"
                >
                  <option value="" disabled>Select product category</option>
                  <option value="electronics">Electronics</option>
                  <option value="phones">Phones & Tablets</option>
                  <option value="computers">Computers</option>
                  <option value="fashion">Fashion</option>
                  <option value="home">Home & Garden</option>
                  <option value="vehicles">Vehicles</option>
                  <option value="property">Property</option>
                </select>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Condition *</label>
                <div class="grid grid-cols-2 gap-3">
                  <label
                    :class="form.condition === 'new' 
                      ? 'border-jiji-primary bg-orange-50' 
                      : 'border-gray-200 hover:border-gray-300'"
                    class="border rounded-md p-3 cursor-pointer transition-colors
         flex items-center justify-center text-sm font-medium"
                  >
                    <input
                      v-model="form.condition"
                      type="radio"
                      value="new"
                      class="sr-only"
                    />
                    <span class="block text-center">New</span>
                  </label>
                  <label
                    :class="form.condition === 'used' 
                      ? 'border-jiji-primary bg-orange-50' 
                      : 'border-gray-200 hover:border-gray-300'"
                    class="border rounded-md p-3 cursor-pointer transition-colors
         flex items-center justify-center text-sm font-medium"
                  >
                    <input
                      v-model="form.condition"
                      type="radio"
                      value="used"
                      class="sr-only"
                    />
                    <span class="block text-center">Used</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          <!-- Pricing Section -->
          <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
            
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Price (₦) *</label>
              <div class="relative">
                <input
                  v-model="form.price"
                  type="number"
                  min="0"
                  class="mt-1 p-4 block w-full rounded-md border-gray-300 shadow-sm 
         focus:border-jiji-primary focus:ring-jiji-primary sm:text-sm
         transition duration-200 ease-in-out pl-7"
                  placeholder="Enter amount"
                />
                <span class="absolute left-3 top-3 text-gray-500">₦</span>
              </div>
              <p class="mt-2 text-sm text-gray-500">Consider researching similar items for competitive pricing</p>
            </div>
          </section>

          <!-- Media Section -->
          <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Media</h2>
            
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Upload Photos *
                <span class="text-sm font-normal text-gray-500">(Up to 10 photos)</span>
              </label>
              
              <div class="mt-2">
                <div 
                  class=" flex justify-center px-6 pt-8 pb-8 border-2 border-dashed 
         border-gray-300 rounded-md hover:border-gray-400 transition-colors"
                  @dragover.prevent="dragover"
                  @drop.prevent="dropFiles"
                >
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    class="sr-only"
                    @change="handleImageUpload"
                  />
                  <label for="file-upload" class="cursor-pointer">
                    <div class="text-center">
                      <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <div class="mt-2 flex text-sm text-gray-600">
                        <span class="relative font-medium text-jiji-primary hover:text-orange-700">
                          Click to upload
                        </span>
                        <p class="pl-1">or drag and drop</p>
                      </div>
                      <p class="text-xs text-gray-500">PNG, JPG up to 5MB each</p>
                    </div>
                  </label>
                </div>

                <!-- Image Previews -->
                <div v-if="previewImages.length" class="mt-4 grid grid-cols-3 md:grid-cols-5 gap-3">
                  <div
                    v-for="(img, index) in previewImages"
                    :key="index"
                    class="group relative aspect-square"
                  >
                    <img :src="img" class="w-full h-full object-cover rounded-lg border border-gray-200">
                    <button
                      @click="removeImage(index)"
                      class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Location Section -->
          <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Location</h2>
            
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">City *</label>
              <select
                v-model="form.location"
                class="mt-1 p-4 block w-full rounded-md border-gray-300 shadow-sm 
         focus:border-jiji-primary focus:ring-jiji-primary sm:text-sm
         transition duration-200 ease-in-out"
              >
                <option value="" disabled>Select your city</option>
                <option value="lagos">Lagos</option>
                <option value="abuja">Abuja</option>
                <option value="port-harcourt">Port Harcourt</option>
                <option value="kano">Kano</option>
                <option value="ibadan">Ibadan</option>
              </select>
              <p class="mt-2 text-sm text-gray-500">Buyers will see this location in your listing</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import Navbar from "@/components/common/Navbar.vue";

const router = useRouter();

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

const submitForm = () => {
  console.log("Form submitted:", form.value);
  router.push("/seller/dashboard");
};

const cancel = () => {
  router.push("/seller/dashboard");
};

const dragover = (e) => {
  e.currentTarget.classList.add('border-jiji-primary', 'bg-orange-50');
};

const dropFiles = (e) => {
  e.currentTarget.classList.remove('border-jiji-primary', 'bg-orange-50');
  const files = e.dataTransfer.files;
  handleImageUpload({ target: { files } });
};
</script>

<style scoped>

</style>