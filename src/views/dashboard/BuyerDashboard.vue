<template>
  <div class="min-h-screen bg-gray-100">
    <!-- <BuyerNavbar /> -->

    <div class="py-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-8">Buyer Dashboard</h1>

        <!-- Saved Listings -->
        <div class="bg-white shadow overflow-hidden rounded-lg mb-8">
          <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Saved Listings
            </h3>
          </div>
          <div
            v-if="savedListings.length > 0"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
          >
            <ListingCard
              v-for="listing in savedListings"
              :key="listing.id"
              :listing="listing"
              @unsave="handleUnsaveListing"
            />
          </div>
          <div v-else class="p-6 text-center text-gray-500">
            <p>You don't have any saved listings yet.</p>
            <router-link
              to="/"
              class="mt-2 inline-flex items-center text-jiji-primary hover:text-orange-700"
            >
              Browse listings
            </router-link>
          </div>
        </div>

        <!-- Recent Messages -->
        <div class="bg-white shadow overflow-hidden rounded-lg">
          <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Your Messages
            </h3>
          </div>
          <div v-if="messages.length > 0" class="divide-y divide-gray-200">
            <MessageItem
              v-for="message in messages"
              :key="message.id"
              :message="message"
            />
          </div>
          <div v-else class="p-6 text-center text-gray-500">
            <p>You don't have any messages yet.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// import BuyerNavbar from "@/components/dashboard/BuyerNavbar.vue";
// import ListingCard from "@/components/listings/ListingCard.vue";
// import MessageItem from "@/components/messages/MessageItem.vue";

const savedListings = [
  {
    id: 1,
    title: "iPhone 13 Pro Max 256GB",
    price: "₦450,000",
    location: "Lagos, Ikeja",
    image:
      "https://images.unsplash.com/photo-1633891120686-106a4d3a51d0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
    date: "2 hours ago",
    isVerified: true,
  },
  {
    id: 2,
    title: "2018 Toyota Camry XLE",
    price: "₦12,500,000",
    location: "Abuja, Wuse",
    image:
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
    date: "1 day ago",
    isVerified: false,
  },
];

const messages = [
  {
    id: 1,
    from: "Tech Gadgets Store",
    subject: "Your inquiry about iPhone 13",
    preview: "Yes, the phone is still available. When would you like to...",
    date: "3 hours ago",
    read: false,
  },
  {
    id: 2,
    from: "Auto Dealer Ltd",
    subject: "Toyota Camry test drive",
    preview: "We can schedule a test drive for tomorrow at our showroom...",
    date: "1 day ago",
    read: true,
  },
];

const handleUnsaveListing = (id) => {
  console.log("Unsave listing:", id);
  // In a real app, you would update the saved listings
};
</script>
