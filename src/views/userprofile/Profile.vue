<template>
  <PageSeo
    pageName="profile"
    :title="profileData && profileData.displayName ? `${profileData.displayName}'s Profile | Selify Nigeria` : 'Your Seller Profile | Selify Marketplace'"
  />
  <Navbar />
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <!-- Profile Header -->
        <div class="bg-teal-600 px-6 py-4">
          <h1 class="text-white text-xl font-semibold">My Profile</h1>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="p-8 flex justify-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"
          ></div>
        </div>

        <div v-else>
          <!-- Profile Photo and Basic Info -->
          <div class="px-6 py-6 flex flex-col md:flex-row gap-6">
            <div class="flex flex-col items-center space-y-4 w-full md:w-1/3">
              <div class="relative group">
                <div
                  class="h-40 w-40 bg-gray-200 rounded-full overflow-hidden border-4 border-white shadow"
                >
                  <img
                    v-if="previewImage || profileData.photoURL"
                    :src="previewImage || profileData.photoURL"
                    alt="Profile"
                    class="h-full w-full object-cover"
                  />
                  <div
                    v-else
                    class="h-full w-full flex items-center justify-center text-gray-400"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="h-16 w-16"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  </div>
                </div>
                <input
                  type="file"
                  id="profile-upload"
                  accept="image/*"
                  @change="handleImageUpload"
                  class="hidden"
                />
                <label
                  for="profile-upload"
                  class="absolute bottom-0 right-0 bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 transition-colors cursor-pointer"
                  title="Update profile photo"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-5 h-5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                    />
                  </svg>
                </label>
              </div>

              <div class="text-center">
                <h2 class="text-xl font-semibold text-gray-900">
                  {{
                    profileData.displayName ||
                    authStore.user?.email.split("@")[0]
                  }}
                </h2>
                <p class="text-gray-500">{{ authStore.user?.email }}</p>
              </div>
            </div>

            <div class="w-full md:w-2/3">
              <div
                class="bg-teal-50 border-l-4 border-teal-400 p-4 mb-6"
                v-if="!profileData.isProfileComplete"
              >
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <svg
                      class="h-5 w-5 text-teal-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm text-teal-700">
                      Your profile is incomplete. Please fill in all the
                      required fields.
                    </p>
                  </div>
                </div>
              </div>

              <div
                class="bg-teal-50 border-l-4 border-teal-400 p-4 mb-6"
                v-if="profileData.isProfileComplete"
              >
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <svg
                      class="h-5 w-5 text-teal-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm text-teal-700">
                      Your profile is complete! You can now start listing items.
                    </p>
                  </div>
                </div>
              </div>

              <div class="text-sm font-medium text-gray-500 mb-4">
                Account created on
                {{ formatDate(authStore.user?.createdAt) }}
              </div>

              <div class="flex gap-4">
                <button
                  @click="editMode = true"
                  v-if="!editMode"
                  class="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Edit Profile
                </button>

                <div v-if="editMode" class="flex gap-2">
                  <button
                    @click="saveProfile"
                    class="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Save Changes
                  </button>
                  <button
                    @click="cancelEdit"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Profile Information -->
          <div class="border-t border-gray-200 px-6 py-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Personal Information
            </h3>

            <form @submit.prevent="saveProfile">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Display Name -->
                <div>
                  <label
                    for="displayName"
                    class="block text-sm font-medium text-gray-700 mb-1"
                    >Display Name</label
                  >
                  <input
                    v-if="editMode"
                    id="displayName"
                    v-model="profileData.displayName"
                    type="text"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                  <div v-else class="text-gray-900">
                    {{ profileData.displayName || "Not set" }}
                  </div>
                </div>

                <!-- Phone Number -->
                <div>
                  <label
                    for="phoneNumber"
                    class="block text-sm font-medium text-gray-700 mb-1"
                    >Phone Number</label
                  >
                  <input
                    v-if="editMode"
                    id="phoneNumber"
                    v-model="profileData.phoneNumber"
                    type="tel"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                  <div v-else class="text-gray-900">
                    {{ profileData.phoneNumber || "Not set" }}
                  </div>
                </div>

                <!-- Address -->
                <div class="md:col-span-2">
                  <label
                    for="address"
                    class="block text-sm font-medium text-gray-700 mb-1"
                    >Address</label
                  >
                  <textarea
                    v-if="editMode"
                    id="address"
                    v-model="profileData.address"
                    rows="3"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  ></textarea>
                  <div v-else class="text-gray-900">
                    {{ profileData.address || "Not set" }}
                  </div>
                </div>

                <!-- Zip Code -->
                <div>
                  <label
                    for="zip"
                    class="block text-sm font-medium text-gray-700 mb-1"
                    >Zip Code</label
                  >
                  <input
                    v-if="editMode"
                    id="zip"
                    v-model="profileData.zip"
                    type="text"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                  <div v-else class="text-gray-900">
                    {{ profileData.zip || "Not set" }}
                  </div>
                </div>

                <!-- Location (Nigeria) -->
                <div class="mb-4">
                  <label class="block text-gray-700 font-medium mb-2"
                    >Location (Nigeria)*</label
                  >

                  <!-- Display mode (when not editing) -->
                  <div v-if="!editMode" class="text-gray-900">
                    {{ profileData.location || "Not set" }}
                  </div>

                  <!-- Edit mode (dropdown selectors) -->
                  <div v-else>
                    <!-- State Dropdown -->
                    <div class="mb-3">
                      <label
                        for="state"
                        class="block text-gray-600 text-sm mb-1"
                        >State*</label
                      >
                      <select
                        id="state"
                        v-model="selectedState"
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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

                    <!-- LGA Dropdown -->
                    <div class="mb-3" v-if="selectedState">
                      <label for="lga" class="block text-gray-600 text-sm mb-1"
                        >Local Government Area*</label
                      >
                      <select
                        id="lga"
                        v-model="selectedLGA"
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
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

                    <!-- Location Dropdown -->
                    <div class="mb-3" v-if="selectedLGA">
                      <label
                        for="specific-location"
                        class="block text-gray-600 text-sm mb-1"
                        >Area/Location</label
                      >
                      <select
                        id="specific-location"
                        v-model="selectedLocation"
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="" disabled selected>
                          Select Location
                        </option>
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
                    <div
                      v-if="profileData.location"
                      class="mt-2 text-sm text-gray-600"
                    >
                      Selected location:
                      <span class="font-medium">{{
                        profileData.location
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <!-- Subscription Plan -->
          <div class="border-t border-gray-200 px-6 py-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Subscription Plan</h3>
            <div class="bg-white rounded-lg shadow p-4">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-gray-700">Current Plan</h4>
                <span class="px-3 py-1 text-sm font-medium rounded-full" :class="{
                  'bg-teal-100 text-teal-800': profileData.subscription.isActive,
                  'bg-gray-100 text-gray-800': !profileData.subscription.isActive
                }">
                  {{ profileData.subscription.plan }}
                </span>
              </div>
              <div v-if="profileData.subscription.isActive" class="text-sm text-gray-600">
                <p>Plan Period: {{ formatDate(profileData.subscription.startDate) }} - {{ formatDate(profileData.subscription.endDate) }}</p>
              </div>
            </div>
          </div>

          <!-- Additional Settings -->
          <div class="border-t border-gray-200 px-6 py-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Account Settings
            </h3>

            <div class="space-y-4">
              <!-- Email Notifications -->
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">
                    Email Notifications
                  </h4>
                  <p class="text-sm text-gray-500">
                    Receive notifications about your account activity and
                    listings
                  </p>
                </div>
                <div class="flex items-center">
                  <button
                    @click="
                      profileData.emailNotifications =
                        !profileData.emailNotifications
                    "
                    :class="[
                      'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500',
                      profileData.emailNotifications
                        ? 'bg-teal-600'
                        : 'bg-gray-200',
                    ]"
                  >
                    <span
                      :class="[
                        'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
                        profileData.emailNotifications
                          ? 'translate-x-5'
                          : 'translate-x-0',
                      ]"
                    ></span>
                  </button>
                </div>
              </div>

              <!-- Make Profile Visible -->
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">
                    Public Profile
                  </h4>
                  <p class="text-sm text-gray-500">
                    Allow other users to see your profile details
                  </p>
                </div>
                <div class="flex items-center">
                  <button
                    @click="
                      profileData.publicProfile = !profileData.publicProfile
                    "
                    :class="[
                      'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500',
                      profileData.publicProfile
                        ? 'bg-teal-600'
                        : 'bg-gray-200',
                    ]"
                  >
                    <span
                      :class="[
                        'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
                        profileData.publicProfile
                          ? 'translate-x-5'
                          : 'translate-x-0',
                      ]"
                    ></span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Change Password (for email users) -->
          <div
            class="border-t border-gray-200 px-6 py-6"
            v-if="authStore.user && !isGoogleUser"
          >
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Security Settings
            </h3>

            <div class="space-y-4">
              <button
                @click="showChangePasswordModal = true"
                class="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div
      v-if="showChangePasswordModal"
      class="fixed z-10 inset-0 overflow-y-auto"
    >
      <div
        class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
      >
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div
          class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        >
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Change Password
                </h3>
                <div class="mt-2 space-y-4">
                  <div>
                    <label
                      for="currentPassword"
                      class="block text-sm font-medium text-gray-700"
                      >Current Password</label
                    >
                    <input
                      id="currentPassword"
                      v-model="passwordData.currentPassword"
                      type="password"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label
                      for="newPassword"
                      class="block text-sm font-medium text-gray-700"
                      >New Password</label
                    >
                    <input
                      id="newPassword"
                      v-model="passwordData.newPassword"
                      type="password"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label
                      for="confirmPassword"
                      class="block text-sm font-medium text-gray-700"
                      >Confirm New Password</label
                    >
                    <input
                      id="confirmPassword"
                      v-model="passwordData.confirmPassword"
                      type="password"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="changePassword"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Update Password
            </button>
            <button
              @click="showChangePasswordModal = false"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification Toast -->
    <div
      v-if="notification.show"
      :class="[
        'fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg max-w-sm transition-all duration-300 transform',
        notification.type === 'success'
          ? 'bg-teal-600 text-white'
          : 'bg-red-600 text-white',
        notification.show
          ? 'translate-y-0 opacity-100'
          : 'translate-y-8 opacity-0',
      ]"
    >
      {{ notification.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onBeforeMount, computed, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import PageSeo from "@/components/seo/PageSeo.vue";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/firebase";
import cloudinaryConfig from "@/cloudinary/cloudinaryConfig";
import Navbar from "@/components/common/Navbar.vue";
import axios from "axios";
import nigeriaLocations from "@/stores/location";

import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import router from "@/router";

const authStore = useAuthStore();
const loading = ref(true);
const editMode = ref(false);
const showChangePasswordModal = ref(false);
const previewImage = ref(null);

// Location-related refs
const selectedState = ref("");
const selectedLGA = ref("");
const selectedLocation = ref("");

const profileData = reactive({
  displayName: "",
  phoneNumber: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  location: "",
  photoURL: "",
  emailNotifications: false,
  publicProfile: false,
  isProfileComplete: false,
  subscription: {
    plan: "free",
    startDate: null,
    endDate: null,
    isActive: false
  }
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

// Initialize location from profile data when loading
watch(
  () => profileData.location,
  (newLocation) => {
    if (newLocation) {
      const parts = newLocation.split(", ");
      if (parts.length >= 1) selectedState.value = parts[0];
      if (parts.length >= 2) selectedLGA.value = parts[1];
      if (parts.length >= 3) selectedLocation.value = parts[2];
    }
  },
  { immediate: true }
);

// Update profile location when selections change
watch([selectedState, selectedLGA, selectedLocation], () => {
  profileData.location = fullLocation.value;
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

const isGoogleUser = computed(() => {
  if (!authStore.user?.providerData) return false;
  return authStore.user.providerData.some((provider) =>
    provider.providerId.includes("google")
  );
});

const passwordData = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const notification = reactive({
  show: false,
  message: "",
  type: "success",
});

const showNotification = (message, type = "success") => {
  notification.message = message;
  notification.type = type;
  notification.show = true;

  setTimeout(() => {
    notification.show = false;
  }, 3000);
};

onBeforeMount(async () => {
  if (authStore.isAuthenticated && authStore.user) {
    await fetchUserProfile();
  }
  loading.value = false;
});

const fetchUserProfile = async () => {
  try {
    const userId = authStore.user.uid;
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();

      // Populate profile data from Firestore
      Object.keys(profileData).forEach((key) => {
        if (userData[key] !== undefined) {
          profileData[key] = userData[key];
        }
      });
      profileData.isProfileComplete = checkProfileComplete();
    } else {
      profileData.email = authStore.user.email;
      profileData.displayName = authStore.user.displayName;
      profileData.photoURL = authStore.user.photoURL;
      profileData.subscription = {
        plan: "free",
        startDate: null,
        endDate: null,
        isActive: false
      };
      profileData.isProfileComplete = false;
    }
    loading.value = false;
  } catch (error) {
    console.error("Error fetching profile:", error);
    loading.value = false;
  }
};

const checkProfileComplete = () => {
  const requiredFields = [
    "displayName",
    "phoneNumber",
  ];
  
  // Check if all required fields are filled
  const fieldsComplete = requiredFields.every(
    (field) => profileData[field] && profileData[field].trim() !== ""
  );

  return fieldsComplete
};

const saveProfile = async () => {
  try {
    loading.value = true;
    const userId = authStore.user.uid;
    const userRef = doc(db, "users", userId);

    // Calculate if profile is complete
    profileData.isProfileComplete = checkProfileComplete();

    // Update firestore
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: new Date(),
    });

    // Update auth profile for display name and photo
    await updateProfile(auth.currentUser, {
      displayName: profileData.displayName,
      photoURL: profileData.photoURL,
    });

    editMode.value = false;
    showNotification("Profile updated successfully");
    router.push("/");
  } catch (error) {
    console.error("Error updating profile:", error);
    showNotification("Failed to update profile", "error");
  } finally {
    loading.value = false;
  }
};

const cancelEdit = () => {
  // Reset to original values by fetching again
  fetchUserProfile();
  editMode.value = false;
};

const changePassword = async () => {
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    showNotification("Passwords do not match", "error");
    return;
  }

  if (passwordData.newPassword.length < 6) {
    showNotification("Password must be at least 6 characters", "error");
    return;
  }

  try {
    loading.value = true;

    // Re-authenticate user before changing password
    const credential = EmailAuthProvider.credential(
      authStore.user.email,
      passwordData.currentPassword
    );

    await reauthenticateWithCredential(auth.currentUser, credential);

    // Update password
    await updatePassword(auth.currentUser, passwordData.newPassword);

    // Reset fields
    passwordData.currentPassword = "";
    passwordData.newPassword = "";
    passwordData.confirmPassword = "";

    showChangePasswordModal.value = false;
    showNotification("Password changed successfully");
  } catch (error) {
    console.error("Error changing password:", error);

    if (error.code === "auth/wrong-password") {
      showNotification("Current password is incorrect", "error");
    } else {
      showNotification("Failed to change password", "error");
    }
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  
  // Handle Firebase timestamp format
  if (typeof dateString === 'object' && dateString.seconds) {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateString.seconds * 1000));
  }
  
  // Handle regular date string
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
};

const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImage.value = e.target.result;
  };
  reader.readAsDataURL(file);

  try {
    loading.value = true;
    const imageUrl = await uploadToCloudinary(file);
    profileData.photoURL = imageUrl;
    await saveProfile(); // Auto-save after upload
  } catch (error) {
    console.error("Error uploading image:", error);
    showNotification("Failed to upload profile image", "error");
  } finally {
    loading.value = false;
  }
};

const uploadToCloudinary = async (imageFile) => {
  const formData = new FormData();
  formData.append("file", imageFile);
  formData.append("upload_preset", cloudinaryConfig.uploadPreset);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error.response?.data || error);
    throw error;
  }
};
</script>
