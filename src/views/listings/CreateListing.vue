<template>
  <div class="min-h-screen bg-gray-100">
    <SellerNavbar />

    <div class="py-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="md:flex md:items-center md:justify-between mb-8">
          <div class="flex-1 min-w-0">
            <h2
              class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate"
            >
              Create New Listing
            </h2>
          </div>
          <div class="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              @click="cancel"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jiji-primary"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="submitForm"
              class="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-jiji-primary hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jiji-primary"
            >
              Publish Listing
            </button>
          </div>
        </div>

        <div class="bg-white shadow overflow-hidden rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div class="md:col-span-2 space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Title</label
                  >
                  <input
                    v-model="form.title"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-jiji-primary focus:ring-jiji-primary sm:text-sm"
                    placeholder="e.g. iPhone 13 Pro Max 256GB"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Description</label
                  >
                  <textarea
                    v-model="form.description"
                    rows="6"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-jiji-primary focus:ring-jiji-primary sm:text-sm"
                    placeholder="Provide detailed description of your item..."
                  ></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Price (₦)</label
                  >
                  <div class="mt-1 relative rounded-md shadow-sm">
                    <input
                      v-model="form.price"
                      type="number"
                      class="block w-full pr-12 rounded-md border-gray-300 shadow-sm focus:border-jiji-primary focus:ring-jiji-primary sm:text-sm"
                      placeholder="0.00"
                    />
                    <div class="absolute inset-y-0 right-0 flex items-center">
                      <label for="currency" class="sr-only">Currency</label>
                      <span
                        class="h-full py-2 pr-3 border-l border-gray-300 bg-gray-50 flex items-center text-gray-500 sm:text-sm"
                      >
                        NGN
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Category</label
                  >
                  <select
                    v-model="form.category"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-jiji-primary focus:ring-jiji-primary sm:text-sm"
                  >
                    <option value="">Select a category</option>
                    <option value="electronics">Electronics</option>
                    <option value="phones">Phones & Tablets</option>
                    <option value="computers">Computers</option>
                    <option value="fashion">Fashion</option>
                    <option value="home">Home & Garden</option>
                    <option value="vehicles">Vehicles</option>
                    <option value="property">Property</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Condition</label
                  >
                  <div class="mt-2 space-y-2">
                    <div class="flex items-center">
                      <input
                        v-model="form.condition"
                        id="condition-new"
                        name="condition"
                        type="radio"
                        value="new"
                        class="h-4 w-4 text-jiji-primary focus:ring-jiji-primary"
                      />
                      <label
                        for="condition-new"
                        class="ml-3 block text-sm font-medium text-gray-700"
                        >New</label
                      >
                    </div>
                    <div class="flex items-center">
                      <input
                        v-model="form.condition"
                        id="condition-used"
                        name="condition"
                        type="radio"
                        value="used"
                        class="h-4 w-4 text-jiji-primary focus:ring-jiji-primary"
                      />
                      <label
                        for="condition-used"
                        class="ml-3 block text-sm font-medium text-gray-700"
                        >Used</label
                      >
                    </div>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Location</label
                  >
                  <select
                    v-model="form.location"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-jiji-primary focus:ring-jiji-primary sm:text-sm"
                  >
                    <option value="">Select location</option>
                    <option value="lagos">Lagos</option>
                    <option value="abuja">Abuja</option>
                    <option value="port-harcourt">Port Harcourt</option>
                    <option value="kano">Kano</option>
                    <option value="ibadan">Ibadan</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Images</label
                  >
                  <div
                    class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
                  >
                    <div class="space-y-1 text-center">
                      <div class="flex text-sm text-gray-600">
                        <label
                          for="file-upload"
                          class="relative cursor-pointer bg-white rounded-md font-medium text-jiji-primary hover:text-orange-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-jiji-primary"
                        >
                          <span>Upload files</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            class="sr-only"
                            multiple
                            @change="handleImageUpload"
                          />
                        </label>
                        <p class="pl-1">or drag and drop</p>
                      </div>
                      <p class="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                  </div>
                  <div
                    v-if="previewImages.length"
                    class="mt-2 flex flex-wrap gap-2"
                  >
                    <div
                      v-for="(img, index) in previewImages"
                      :key="index"
                      class="relative"
                    >
                      <img :src="img" class="h-20 w-20 object-cover rounded" />
                      <button
                        @click="removeImage(index)"
                        class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center hover:bg-red-600"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

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
  // In a real app, you would submit to API here
  router.push("/seller/dashboard");
};

const cancel = () => {
  router.push("/seller/dashboard");
};
</script>
