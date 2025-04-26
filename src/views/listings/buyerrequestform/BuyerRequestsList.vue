<script setup>
import { ref, onMounted, computed } from "vue";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";
import Navbar from "@/components/common/Navbar.vue";
import Footer from "@/components/common/Footer.vue";

const requests = ref([]);
const searchQuery = ref("");
const selectedCategory = ref("All");
const sortOption = ref("newest");
const isLoading = ref(true);
const authStore = useAuthStore();
const toast = useToast();

// Contact modal state
const showContactModal = ref(false);
const selectedRequest = ref(null);
const contactDetails = ref(null);
const loadingContact = ref(false);

// Categories for filtering
const categories = ref([
  "All",
  "electronics",
  "vehicles",
  "real estate",
  "furniture",
]);

onMounted(async () => {
  try {
    const q = query(
      collection(db, "buyerRequests"),
      where("status", "==", "active")
    );
    const snapshot = await getDocs(q);

    // Filter expired requests (client-side)
    requests.value = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          expiresAt: data.expiresAt?.toDate(), // Convert Firestore Timestamp to JS Date
          timeLeft: calculateTimeLeft(data.expiresAt?.toDate()),
          category: data.category || "Other", // Ensure category exists
        };
      })
      .filter((request) => {
        return request.expiresAt > new Date(); // Only show unexpired
      });

    isLoading.value = false;
  } catch (error) {
    console.error("Error fetching requests:", error);
    isLoading.value = false;
    toast.error("Failed to load buyer requests");
  }
});

// Calculate time left in a more user-friendly format
function calculateTimeLeft(expiryDate) {
  if (!expiryDate) return "Unknown";

  const now = new Date();
  const diffTime = expiryDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 1) return `${diffDays} days`;
  if (diffDays === 1) return "1 day";

  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  if (diffHours > 1) return `${diffHours} hours`;
  if (diffHours === 1) return "1 hour";

  return "Less than an hour";
}

// Contact buyer functionality
async function contactBuyer(request) {
  if (!authStore.user) {
    toast.warning("Please log in to contact the buyer");
    return;
  }

  loadingContact.value = true;
  selectedRequest.value = request;
  showContactModal.value = true;

  try {
    // Get buyer's contact details
    const contactInfo = {
      name: "Unknown",
      email: request.userEmail || "Not provided",
      phone: request.userPhone || "Not provided",
      contactMethod: request.contactMethod || "email",
    };

    // If userId exists, try to get additional user details
    if (request.userId) {
      try {
        const userDoc = await getDoc(doc(db, "users", request.userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          contactInfo.name =
            userData.displayName || userData.fullName || "Unknown";
          if (!contactInfo.phone && userData.phoneNumber) {
            contactInfo.phone = userData.phoneNumber;
          }
        }
      } catch (userError) {
        console.error("Error fetching user details:", userError);
      }
    }

    contactDetails.value = contactInfo;
  } catch (error) {
    console.error("Error fetching contact details:", error);
    toast.error("Failed to load buyer's contact information");
    showContactModal.value = false;
  } finally {
    loadingContact.value = false;
  }
}

// Format phone number for display
function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return "Not provided";

  // Basic formatting for phone numbers
  if (phoneNumber.length === 10) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
      3,
      6
    )}-${phoneNumber.slice(6)}`;
  } else if (phoneNumber.length === 11 && phoneNumber.startsWith("1")) {
    return `+1 (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(
      4,
      7
    )}-${phoneNumber.slice(7)}`;
  }

  return phoneNumber;
}

// Dial the phone number directly
function dialPhoneNumber(phoneNumber) {
  if (!phoneNumber) return;

  // Log contact attempt
  logContactAttempt();

  // Open the phone dialer
  window.location.href = `tel:${phoneNumber}`;
}

// Send email to the buyer
function sendEmail(email) {
  if (!email) return;

  // Log contact attempt
  logContactAttempt();

  // Open mail client
  window.location.href = `mailto:${email}?subject=Regarding your request: ${selectedRequest.value.title}`;
}

// Log the contact attempt to Firebase
async function logContactAttempt() {
  if (!authStore.user || !selectedRequest.value) return;

  try {
    // Add contact attempt record to Firebase
    const contactAttempt = {
      requestId: selectedRequest.value.id,
      buyerId: selectedRequest.value.userId,
      sellerId: authStore.user.uid,
      timestamp: new Date(),
      requestTitle: selectedRequest.value.title,
    };

    await addDoc(collection(db, "contactAttempts"), contactAttempt);
  } catch (error) {
    console.error("Error logging contact attempt:", error);
  }
}

// Close the contact modal
function closeContactModal() {
  showContactModal.value = false;
  selectedRequest.value = null;
  contactDetails.value = null;
}

// Computed property for filtered and sorted requests
const filteredRequests = computed(() => {
  let result = [...requests.value];

  // Apply category filter
  if (selectedCategory.value !== "All") {
    result = result.filter(
      (request) => request.category === selectedCategory.value
    );
  }

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (request) =>
        request.title.toLowerCase().includes(query) ||
        request.description.toLowerCase().includes(query)
    );
  }

  // Apply sorting
  switch (sortOption.value) {
    case "newest":
      result.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
      break;
    case "expiringSoon":
      result.sort((a, b) => a.expiresAt - b.expiresAt);
      break;
    case "budgetHigh":
      result.sort((a, b) => b.maxBudget - a.maxBudget);
      break;
    case "budgetLow":
      result.sort((a, b) => a.minBudget - b.minBudget);
      break;
  }

  return result;
});

// Function to determine budget display class based on budget amount
function getBudgetClass(maxBudget) {
  if (maxBudget >= 1000) return "text-green-600";
  if (maxBudget >= 500) return "text-green-600";
  return "text-gray-600";
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <main class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Buyer Requests</h1>
        <p class="text-gray-600 mt-2">
          Find potential clients looking for services like yours
        </p>
      </div>

      <!-- Search and Filters Bar -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Search Input -->
          <div class="relative flex-grow">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search requests..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <div class="absolute left-3 top-2.5 text-gray-400">
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <!-- Category Filter -->
          <div class="w-full md:w-48">
            <select
              v-model="selectedCategory"
              class="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option
                v-for="category in categories"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
          </div>

          <!-- Sort Options -->
          <div class="w-full md:w-48">
            <select
              v-model="sortOption"
              class="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="newest">Newest First</option>
              <option value="expiringSoon">Expiring Soon</option>
              <option value="budgetHigh">Highest Budget</option>
              <option value="budgetLow">Lowest Budget</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center my-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"
        ></div>
      </div>

      <!-- No Results State -->
      <div
        v-else-if="filteredRequests.length === 0"
        class="bg-white rounded-lg shadow-sm p-8 text-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-16 w-16 mx-auto text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 class="text-xl font-medium text-gray-700 mt-4">
          No requests found
        </h3>
        <p class="text-gray-500 mt-2">
          Try adjusting your search or filter criteria
        </p>
      </div>

      <!-- Request Cards Grid -->
      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="request in filteredRequests"
          :key="request.id"
          class="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition duration-200 overflow-hidden"
        >
          <!-- Card Header with Category Tag -->
          <div
            class="px-5 py-4 border-b border-gray-100 flex justify-between items-center"
          >
            <span
              class="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800"
            >
              {{ request.category }}
            </span>
            <span class="text-xs text-gray-500 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {{ request.timeLeft }}
            </span>
          </div>

          <!-- Card Body -->
          <div class="p-5">
            <h3 class="font-bold text-lg text-gray-900 line-clamp-1">
              {{ request.title }}
            </h3>
            <p class="text-gray-600 mt-2 text-sm line-clamp-3">
              {{ request.description }}
            </p>

            <!-- Request Details -->
            <div class="mt-4 space-y-2 text-sm">
              <div class="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span class="font-medium">Budget:</span>
                <span
                  :class="getBudgetClass(request.maxBudget)"
                  class="ml-1 font-bold"
                >
                  ${{ request.minBudget }} - ${{ request.maxBudget }}
                </span>
              </div>

              <div class="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span class="font-medium">Location:</span>
                <span class="ml-1">{{ request.location || "Remote" }}</span>
              </div>
            </div>
          </div>

          <!-- Card Footer -->
          <div class="px-5 py-4 bg-gray-50 border-t border-gray-100">
            <button
              @click="contactBuyer(request)"
              class="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-200 flex items-center justify-center font-medium"
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
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Contact Buyer
            </button>
          </div>
        </div>
      </div>

      <!-- Results Summary -->
      <div
        v-if="!isLoading && filteredRequests.length > 0"
        class="mt-6 text-sm text-gray-500 text-center"
      >
        Showing {{ filteredRequests.length }}
        {{ filteredRequests.length === 1 ? "request" : "requests" }}
      </div>
    </main>

    <Footer />

    <!-- Contact Modal -->
    <div
      v-if="showContactModal"
      class="fixed inset-0 bg-opacity-20 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
    >
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden"
      >
        <!-- Modal Header -->
        <div
          class="px-6 py-4 border-b border-gray-200 flex justify-between items-center"
        >
          <h3 class="text-lg font-semibold text-gray-900">Contact Buyer</h3>
          <button
            @click="closeContactModal"
            class="text-gray-400 hover:text-gray-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
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

        <!-- Modal Body -->
        <div class="px-6 py-4">
          <!-- Loading State -->
          <div v-if="loadingContact" class="flex justify-center py-6">
            <div
              class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"
            ></div>
          </div>

          <!-- Login Required -->
          <div v-else-if="!authStore.user" class="py-6 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-12 w-12 mx-auto text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <h4 class="mt-4 text-lg font-medium">Login Required</h4>
            <p class="mt-2 text-gray-600">Please log in to contact the buyer</p>
            <button
              @click="router.push('/login')"
              class="mt-4 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Login Now
            </button>
          </div>

          <!-- Contact Details -->
          <div v-else-if="contactDetails" class="py-2">
            <!-- Request Info -->
            <div class="mb-4">
              <h4 class="font-medium text-gray-900">Request Details</h4>
              <p class="text-gray-600">{{ selectedRequest.title }}</p>
            </div>

            <!-- Buyer Info -->
            <div class="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 class="font-medium text-gray-900 mb-3">
                Buyer Contact Information
              </h4>

              <div class="space-y-3">
                <!-- Name -->
                <div class="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 mr-3 text-gray-400 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <div>
                    <div class="text-sm text-gray-500">Name</div>
                    <div class="font-medium">{{ contactDetails.name }}</div>
                  </div>
                </div>

                <!-- Phone -->
                <div class="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 mr-3 text-gray-400 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <div>
                    <div class="text-sm text-gray-500">Phone</div>
                    <div class="font-medium">
                      {{ formatPhoneNumber(contactDetails.phone) }}
                    </div>
                  </div>
                </div>

                <!-- Email -->
                <div class="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 mr-3 text-gray-400 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <div class="text-sm text-gray-500">Email</div>
                    <div class="font-medium">{{ contactDetails.email }}</div>
                  </div>
                </div>

                <!-- Preferred Contact Method -->
                <div class="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 mr-3 text-gray-400 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <div class="text-sm text-gray-500">
                      Preferred Contact Method
                    </div>
                    <div class="font-medium">
                      {{
                        contactDetails.contactMethod === "phone"
                          ? "Phone"
                          : "Email"
                      }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contact Actions -->
            <div class="grid grid-cols-2 gap-3">
              <button
                @click="dialPhoneNumber(contactDetails.phone)"
                class="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
                :disabled="
                  !contactDetails.phone ||
                  contactDetails.phone === 'Not provided'
                "
                :class="{
                  'opacity-50 cursor-not-allowed':
                    !contactDetails.phone ||
                    contactDetails.phone === 'Not provided',
                }"
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Call Now
              </button>

              <button
                @click="sendEmail(contactDetails.email)"
                class="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
                :disabled="
                  !contactDetails.email ||
                  contactDetails.email === 'Not provided'
                "
                :class="{
                  'opacity-50 cursor-not-allowed':
                    !contactDetails.email ||
                    contactDetails.email === 'Not provided',
                }"
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Send Email
              </button>
            </div>

            <!-- Tips -->
            <div
              class="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-800 border border-green-100"
            >
              <div class="flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 mr-2 text-green-500 flex-shrink-0"
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
                <p>
                  When contacting the buyer, mention you found their request on
                  <strong>Selify</strong> for a better response rate.
                </p>
              </div>
            </div>
          </div>

          <!-- Error State -->
          <div v-else class="py-6 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-12 w-12 mx-auto text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h4 class="mt-4 text-lg font-medium">
              Unable to Load Contact Information
            </h4>
            <p class="mt-2 text-gray-600">Please try again later</p>
            <button
              @click="closeContactModal"
              class="mt-4 w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
