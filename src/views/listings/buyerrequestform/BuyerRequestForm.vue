<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";
import Navbar from "@/components/common/Navbar.vue";
import Footer from "@/components/common/Footer.vue";
import nigeriaLocations from "@/stores/location";

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

// Form state
const form = ref({
  title: "",
  description: "",
  category: "",
  minBudget: "",
  maxBudget: "",
  location: "",
  contactMethod: "phone",
});

const selectedState = ref("");
const selectedLGA = ref("");
const selectedArea = ref("");
const availableStates = ref(Object.keys(nigeriaLocations));
const availableLGAs = computed(() => {
  if (!selectedState.value) return [];
  return Object.keys(nigeriaLocations[selectedState.value] || {});
});
const availableAreas = computed(() => {
  if (!selectedState.value || !selectedLGA.value) return [];
  return nigeriaLocations[selectedState.value][selectedLGA.value] || [];
});

// Watch for location changes and update form.location
watch([selectedState, selectedLGA, selectedArea], () => {
  const locationParts = [];
  if (selectedState.value) locationParts.push(selectedState.value);
  if (selectedLGA.value) locationParts.push(selectedLGA.value);
  if (selectedArea.value) locationParts.push(selectedArea.value);
  form.value.location = locationParts.join(", ");
});

// UI states
const isLoading = ref(false);
const currentStep = ref(1);
const totalSteps = 3;

// Form validation
const validationErrors = ref({});

// Categories with icons
const categories = [
  { value: "electronics", label: "Electronics", icon: "device-mobile" },
  { value: "fashion", label: "Fashion", icon: "shirt" },
  { value: "furniture", label: "Furniture", icon: "home" },
  { value: "vehicles", label: "Vehicles", icon: "car" },
  { value: "services", label: "Services", icon: "tool" },
  { value: "other", label: "Other", icon: "package" },
];

// Progress calculation
const progress = computed(() => (currentStep.value / totalSteps) * 100);

// Validate first step
const validateStep1 = () => {
  const errors = {};

  if (!form.value.title.trim()) {
    errors.title = "Title is required";
  } else if (form.value.title.length < 5) {
    errors.title = "Title must be at least 5 characters";
  }

  if (!form.value.description.trim()) {
    errors.description = "Description is required";
  } else if (form.value.description.length < 20) {
    errors.description =
      "Please provide a more detailed description (at least 20 characters)";
  }

  if (!form.value.category) {
    errors.category = "Please select a category";
  }

  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
};

// Validate second step
const validateStep2 = () => {
  const errors = {};

  if (!form.value.minBudget) {
    errors.minBudget = "Minimum budget is required";
  }

  if (!form.value.maxBudget) {
    errors.maxBudget = "Maximum budget is required";
  } else if (
    parseFloat(form.value.minBudget) > parseFloat(form.value.maxBudget)
  ) {
    errors.maxBudget = "Maximum budget must be greater than minimum budget";
  }

  if (!form.value.location.trim()) {
    errors.location = "Location is required";
  }

  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
};

// Move to next step
const nextStep = () => {
  if (currentStep.value === 1 && validateStep1()) {
    currentStep.value = 2;
  } else if (currentStep.value === 2 && validateStep2()) {
    currentStep.value = 3;
  }
};

// Go back to previous step
const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

// Submit the request
const submitRequest = async () => {
  if (!authStore.user) {
    toast.error("Please log in to submit a request");
    router.push("/login");
    return;
  }

  try {
    isLoading.value = true;

    // Calculate expiration date (7 days from now)
    const createdAt = serverTimestamp();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const requestData = {
      ...form.value,
      minBudget: parseFloat(form.value.minBudget),
      maxBudget: parseFloat(form.value.maxBudget),
      userId: authStore.user.uid,
      userEmail: authStore.user.email,
      userPhone: authStore.user.phoneNumber,
      createdAt,
      expiresAt,
      status: "active",
    };

    await addDoc(collection(db, "buyerRequests"), requestData);

    toast.success("Your request has been published successfully!");
    router.push("/buyer/requests/list");
  } catch (error) {
    toast.error("Failed to submit request. Please try again.");
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

// Cancel and go back
const cancel = () => {
  if (
    window.confirm(
      "Are you sure you want to cancel? All progress will be lost."
    )
  ) {
    router.push("/");
  }
};

// Helper function to get icon for form steps
const getStepIcon = (step) => {
  switch (step) {
    case 1:
      return "clipboard-list";
    case 2:
      return "currency-naira";
    case 3:
      return "check-circle";
    default:
      return "question";
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
    <Navbar />

    <div class="container mx-auto px-4 py-12">
      <!-- Form Card with Shadow -->
      <div
        class="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <!-- Progress Bar -->
        <div class="bg-gray-50 px-6 pt-6">
          <div class="flex justify-between mb-2">
            <h2 class="text-2xl font-bold text-gray-800">
              Create a Buyer Request
            </h2>
            <span class="text-sm font-medium text-gray-500"
              >Step {{ currentStep }} of {{ totalSteps }}</span
            >
          </div>

          <!-- Progress Indicator -->
          <div class="relative pt-1 pb-6">
            <div class="flex mb-2 items-center justify-between">
              <div class="flex-1">
                <div class="h-2 bg-gray-200 rounded-full">
                  <div
                    class="h-2 bg-green-600 rounded-full transition-all duration-300"
                    :style="{ width: `${progress}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Step Indicators -->
            <div class="flex justify-between text-xs text-gray-500 -mt-1">
              <div v-for="step in totalSteps" :key="step" class="w-10">
                <div
                  :class="[
                    'rounded-full h-6 w-6 flex items-center justify-center border-2 mx-auto mb-1',
                    currentStep >= step
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'border-gray-300 text-gray-400',
                  ]"
                >
                  {{ step }}
                </div>
                <div
                  class="text-center mt-1 text-xs"
                  :class="{
                    'font-medium text-green-600': currentStep === step,
                  }"
                >
                  {{ ["Details", "Budget", "Review"][step - 1] }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Content -->
        <div class="px-6 py-6">
          <form
            @submit.prevent="
              currentStep === totalSteps ? submitRequest() : nextStep()
            "
          >
            <!-- Step 1: Basic Details -->
            <div v-if="currentStep === 1">
              <!-- Title -->
              <div class="mb-5">
                <label for="title" class="block text-gray-700 font-medium mb-2">
                  What are you looking for? <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  v-model="form.title"
                  :class="[
                    'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors',
                    validationErrors.title
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300',
                  ]"
                  placeholder="e.g., iPhone 13 Pro Max in good condition"
                />
                <p
                  v-if="validationErrors.title"
                  class="mt-1 text-sm text-red-600"
                >
                  {{ validationErrors.title }}
                </p>
                <p v-else class="mt-1 text-xs text-gray-500">
                  Be specific about what you're looking for
                </p>
              </div>

              <!-- Category Selection -->
              <div class="mb-5">
                <label class="block text-gray-700 font-medium mb-2">
                  Category <span class="text-red-500">*</span>
                </label>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div
                    v-for="category in categories"
                    :key="category.value"
                    @click="form.category = category.value"
                    :class="[
                      'cursor-pointer p-3 rounded-lg border-2 flex items-center transition-all',
                      form.category === category.value
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300',
                    ]"
                  >
                    <div class="mr-3">
                      <!-- Icon placeholder (you would replace with actual icons) -->
                      <div
                        class="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                    <span>{{ category.label }}</span>
                  </div>
                </div>
                <p
                  v-if="validationErrors.category"
                  class="mt-1 text-sm text-red-600"
                >
                  {{ validationErrors.category }}
                </p>
              </div>

              <!-- Description -->
              <div class="mb-5">
                <label
                  for="description"
                  class="block text-gray-700 font-medium mb-2"
                >
                  Detailed Description <span class="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  v-model="form.description"
                  rows="5"
                  :class="[
                    'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors',
                    validationErrors.description
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300',
                  ]"
                  placeholder="Provide details about condition, color, model, specifications, etc."
                ></textarea>
                <p
                  v-if="validationErrors.description"
                  class="mt-1 text-sm text-red-600"
                >
                  {{ validationErrors.description }}
                </p>
                <p v-else class="mt-1 text-xs text-gray-500">
                  The more details you provide, the better responses you'll get
                </p>
              </div>
            </div>

            <!-- Step 2: Budget & Location -->
            <div v-if="currentStep === 2">
              <!-- Budget Tips -->
              <div
                class="mb-5 bg-green-50 rounded-lg p-4 border border-green-100"
              >
                <div class="flex">
                  <div class="mr-3 text-green-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-green-800">
                      Setting a realistic budget range helps sellers know if
                      they can meet your needs.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Budget Range -->
              <div class="mb-5">
                <label class="block text-gray-700 font-medium mb-2">
                  Budget Range (₦) <span class="text-red-500">*</span>
                </label>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <div class="relative">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <span class="text-gray-500">₦</span>
                      </div>
                      <input
                        type="number"
                        id="minBudget"
                        v-model="form.minBudget"
                        :class="[
                          'w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500',
                          validationErrors.minBudget
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300',
                        ]"
                        placeholder="Min"
                        min="0"
                        step="100"
                      />
                    </div>
                    <p
                      v-if="validationErrors.minBudget"
                      class="mt-1 text-sm text-red-600"
                    >
                      {{ validationErrors.minBudget }}
                    </p>
                  </div>
                  <div>
                    <div class="relative">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <span class="text-gray-500">₦</span>
                      </div>
                      <input
                        type="number"
                        id="maxBudget"
                        v-model="form.maxBudget"
                        :class="[
                          'w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500',
                          validationErrors.maxBudget
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300',
                        ]"
                        placeholder="Max"
                        min="0"
                        step="100"
                      />
                    </div>
                    <p
                      v-if="validationErrors.maxBudget"
                      class="mt-1 text-sm text-red-600"
                    >
                      {{ validationErrors.maxBudget }}
                    </p>
                  </div>
                </div>
                <p
                  v-if="
                    !validationErrors.minBudget && !validationErrors.maxBudget
                  "
                  class="mt-1 text-xs text-gray-500"
                >
                  Your request will be active for 7 days
                </p>
              </div>

              <!-- Location -->
              <div class="mb-5">
                <label class="block text-gray-700 font-medium mb-2">
                  Location <span class="text-red-500">*</span>
                </label>

                <!-- State Dropdown -->
                <div class="mb-3">
                  <label for="state" class="block text-gray-600 text-sm mb-1"
                    >State*</label
                  >
                  <select
                    id="state"
                    v-model="selectedState"
                    :class="[
                      'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500',
                      validationErrors.location
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300',
                    ]"
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

                <!-- LGA Dropdown -->
                <div class="mb-3" v-if="selectedState">
                  <label for="lga" class="block text-gray-600 text-sm mb-1"
                    >Local Government Area</label
                  >
                  <select
                    id="lga"
                    v-model="selectedLGA"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="" disabled selected>Select LGA</option>
                    <option
                      v-for="lga in availableLGAs"
                      :key="lga"
                      :value="lga"
                    >
                      {{ lga }}
                    </option>
                  </select>
                </div>

                <!-- Area Dropdown -->
                <div
                  class="mb-3"
                  v-if="selectedLGA && availableAreas.length > 0"
                >
                  <label for="area" class="block text-gray-600 text-sm mb-1"
                    >Area/Neighborhood</label
                  >
                  <select
                    id="area"
                    v-model="selectedArea"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="" disabled selected>Select Area</option>
                    <option
                      v-for="area in availableAreas"
                      :key="area"
                      :value="area"
                    >
                      {{ area }}
                    </option>
                  </select>
                </div>

                <!-- Display selected location -->
                <div v-if="form.location" class="mt-2 text-sm text-gray-600">
                  Selected location:
                  <span class="font-medium">{{ form.location }}</span>
                </div>

                <p
                  v-if="validationErrors.location"
                  class="mt-1 text-sm text-red-600"
                >
                  {{ validationErrors.location }}
                </p>
              </div>

              <!-- Contact Method -->
              <div class="mb-5">
                <label class="block text-gray-700 font-medium mb-2">
                  Preferred Contact Method <span class="text-red-500">*</span>
                </label>
                <div class="flex space-x-4">
                  <label
                    class="relative flex items-center bg-white p-3 rounded-lg border border-gray-300 cursor-pointer transition-all hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      v-model="form.contactMethod"
                      value="phone"
                      class="form-radio text-green-500 h-5 w-5"
                    />
                    <span class="ml-2 text-gray-700">Phone</span>
                  </label>
                  <label
                    class="relative flex items-center bg-white p-3 rounded-lg border border-gray-300 cursor-pointer transition-all hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      v-model="form.contactMethod"
                      value="email"
                      class="form-radio text-green-500 h-5 w-5"
                    />
                    <span class="ml-2 text-gray-700">Email</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Step 3: Review & Submit -->
            <div v-if="currentStep === 3">
              <div
                class="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-6"
              >
                <h3 class="font-semibold text-lg mb-4">Review Your Request</h3>

                <!-- Review Details -->
                <div class="space-y-4">
                  <div class="grid grid-cols-3 gap-2">
                    <div class="text-gray-500 text-sm">Title:</div>
                    <div class="text-gray-900 font-medium col-span-2">
                      {{ form.title }}
                    </div>
                  </div>

                  <div class="grid grid-cols-3 gap-2">
                    <div class="text-gray-500 text-sm">Category:</div>
                    <div class="text-gray-900 font-medium col-span-2">
                      {{
                        categories.find((c) => c.value === form.category)
                          ?.label || form.category
                      }}
                    </div>
                  </div>

                  <div class="grid grid-cols-3 gap-2">
                    <div class="text-gray-500 text-sm">Budget:</div>
                    <div class="text-gray-900 font-medium col-span-2">
                      ₦{{ form.minBudget }} - ₦{{ form.maxBudget }}
                    </div>
                  </div>

                  <div class="grid grid-cols-3 gap-2">
                    <div class="text-gray-500 text-sm">Location:</div>
                    <div class="text-gray-900 font-medium col-span-2">
                      {{ form.location }}
                    </div>
                  </div>

                  <div class="grid grid-cols-3 gap-2">
                    <div class="text-gray-500 text-sm">Contact via:</div>
                    <div class="text-gray-900 font-medium col-span-2">
                      {{ form.contactMethod === "phone" ? "Phone" : "Email" }}
                    </div>
                  </div>

                  <div class="border-t border-gray-200 pt-4">
                    <div class="text-gray-500 text-sm mb-2">Description:</div>
                    <div class="text-gray-900">{{ form.description }}</div>
                  </div>
                </div>
              </div>

              <!-- Terms & Conditions -->
              <div class="mb-6">
                <div
                  class="bg-yellow-50 rounded-lg p-4 border border-yellow-100 text-sm text-yellow-800"
                >
                  <p class="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 mr-2 flex-shrink-0 text-yellow-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      By submitting this request, you agree to our Terms of
                      Service. This request will be visible for 7 days, after
                      which it will expire.
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex justify-between mt-8">
              <!-- Back/Cancel Button -->
              <button
                type="button"
                v-if="currentStep > 1"
                @click="prevStep"
                class="px-6 py-3 border border-gray-300 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </button>
              <button
                v-else
                type="button"
                @click="cancel"
                class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <!-- Next/Submit Button -->
              <button
                type="submit"
                class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:pointer-events-none"
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="mr-2">
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
                {{
                  currentStep < totalSteps
                    ? "Continue"
                    : isLoading
                    ? "Submitting..."
                    : "Submit Request"
                }}
                <svg
                  v-if="currentStep < totalSteps"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>
