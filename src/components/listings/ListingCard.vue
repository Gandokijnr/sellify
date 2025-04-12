<template>
  <div
    class="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-200"
  >
    <router-link :to="`/listings/${listing.id}`" class="block">
      <div class="relative pb-[75%] bg-gray-100">
        <img
          :src="listing.image"
          :alt="listing.title"
          class="absolute h-full w-full object-cover"
        />
        <div
          v-if="listing.isVerified"
          class="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded"
        >
          Verified
        </div>
      </div>
      <div class="p-4">
        <h3 class="text-lg font-medium text-gray-900 mb-1 truncate">
          {{ listing.title }}
        </h3>
        <p class="text-jiji-primary font-bold">{{ listing.price }}</p>
        <div
          class="mt-2 flex justify-between items-center text-sm text-gray-500"
        >
          <span>{{ listing.location }}</span>
          <span>{{ listing.date }}</span>
        </div>
      </div>
    </router-link>
    <div v-if="showAction" class="px-4 pb-4">
      <button
        @click.stop="$emit('unsave', listing.id)"
        class="w-full py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        {{ actionText }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  listing: {
    type: Object,
    required: true,
    default: () => ({
      id: null,
      title: "",
      price: "",
      location: "",
      date: "",
      image: "",
    }),
  },
  showAction: {
    type: Boolean,
    default: false,
  },
  actionText: {
    type: String,
  },
});

defineEmits(["callOwner"]);
</script>
