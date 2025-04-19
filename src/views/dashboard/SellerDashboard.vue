<template>
  <div class="min-h-screen bg-gray-100">
    <Navbar />

    <div class="py-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
          <router-link
            to="/seller/listings/create"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-jiji-primary hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jiji-primary"
          >
            <PlusIcon class="-ml-1 mr-2 h-5 w-5" />
            New Listing
          </router-link>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <DashboardCard
            title="Total Listings"
            :value="stats.totalListings"
            icon="ChartBarIcon"
            color="bg-blue-500"
          />
          <DashboardCard
            title="Active Listings"
            :value="stats.activeListings"
            icon="CheckCircleIcon"
            color="bg-green-500"
          />
          <DashboardCard
            title="Messages"
            :value="stats.messages"
            icon="ChatAltIcon"
            color="bg-indigo-500"
          />
          <DashboardCard
            title="Total Views"
            :value="stats.totalViews"
            icon="EyeIcon"
            color="bg-purple-500"
          />
        </div>

        <!-- Recent Listings -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Your Recent Listings
            </h3>
          </div>
          <div class="divide-y divide-gray-200">
            <ListingItem
              v-for="listing in listings"
              :key="listing.id"
              :listing="listing"
              @edit="handleEditListing"
              @delete="handleDeleteListing"
            />
          </div>
          <div class="px-4 py-4 sm:px-6 bg-gray-50 text-right">
            <router-link
              to="/seller/listings"
              class="text-sm font-medium text-jiji-primary hover:text-orange-700"
            >
              View all listings →
            </router-link>
          </div>
        </div>

        <!-- Recent Messages -->
        <div class="mt-8 bg-white shadow rounded-lg overflow-hidden">
          <div class="mt-8 bg-white shadow rounded-lg overflow-hidden">
            <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Recent Messages
              </h3>
            </div>
            <div class="divide-y divide-gray-200">
              <MessageItem
                v-for="message in messages"
                :key="message.id"
                :message="message"
                @click="handleMessageClick"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PlusIcon } from "@heroicons/vue/24/solid";
import Navbar from "@/components/common/Navbar.vue";

import DashboardCard from "@/components/dashboard/DashboardCard.vue";
import ListingItem from "@/components/listings/ListingItem.vue";
import MessageItem from "@/components/messages/MessageItem.vue";

const handleMessageClick = (message) => {
  // Handle message click (e.g., navigate to message detail)
  console.log("Message clicked:", message);
};
const stats = {
  totalListings: 15,
  activeListings: 12,
  messages: 8,
  totalViews: 1245,
};

const listings = [
  {
    id: 1,
    title: "iPhone 13 Pro Max 256GB",
    price: "₦450,000",
    status: "active",
    views: 124,
    date: "2023-05-15",
    image:
      "https://images.unsplash.com/photo-1633891120686-106a4d3a51d0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80",
  },
  {
    id: 2,
    title: 'MacBook Pro 14" M1 Pro',
    price: "₦850,000",
    status: "active",
    views: 89,
    date: "2023-05-10",
    image:
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80",
  },
  {
    id: 3,
    title: "Sony PlayStation 5",
    price: "₦380,000",
    status: "sold",
    views: 210,
    date: "2023-04-28",
    image:
      "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80",
  },
];

const messages = [
  {
    id: 1,
    from: "John Doe",
    subject: "iPhone 13 Pro Max",
    preview: "Is this still available? I can pay ₦400,000 cash...",
    date: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    from: "Sarah Johnson",
    subject: "MacBook Pro",
    preview: "Can you send me more pictures of the laptop?",
    date: "1 day ago",
    read: true,
  },
];

const handleEditListing = (id) => {
  console.log("Edit listing:", id);
  // In a real app, you would navigate to edit page
};

const handleDeleteListing = (id) => {
  console.log("Delete listing:", id);
  // In a real app, you would call API to delete
};
</script>
