<template>
  <div class="px-4 py-4 sm:px-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <div class="flex-shrink-0 h-16 w-16">
          <img
            class="h-16 w-16 rounded"
            :src="listing.image"
            :alt="listing.title"
          />
        </div>
        <div class="min-w-0 flex-1">
          <router-link
            :to="`/seller/listings/${listing.id}`"
            class="text-sm font-medium text-jiji-primary hover:text-orange-700 truncate"
          >
            {{ listing.title }}
          </router-link>
          <p class="text-sm text-gray-900 mt-1">{{ listing.price }}</p>
          <div class="mt-1 flex">
            <p class="flex items-center text-sm text-gray-500">
              <span class="truncate">{{ listing.views }} views</span>
            </p>
          </div>
        </div>
      </div>
      <div class="ml-2 flex flex-shrink-0 space-x-4">
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
          :class="statusClasses"
        >
          {{ listing.status }}
        </span>
        <button
          @click="$emit('edit', listing.id)"
          class="text-jiji-primary hover:text-orange-700"
        >
          <PencilIcon class="h-5 w-5" />
        </button>
        <button
          @click="$emit('delete', listing.id)"
          class="text-red-600 hover:text-red-900"
        >
          <TrashIcon class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PencilIcon, TrashIcon } from "@heroicons/vue/24/solid";
import { computed } from "vue";

const props = defineProps({
  listing: {
    type: Object,
    required: true,
    default: () => ({
      id: null,
      title: "",
      price: "",
      views: 0,
      status: "active",
      image: "",
    }),
  },
});

const statusClasses = computed(() => {
  return {
    active: "bg-green-100 text-green-800",
    sold: "bg-purple-100 text-purple-800",
    pending: "bg-yellow-100 text-yellow-800",
    draft: "bg-gray-100 text-gray-800",
  }[props.listing.status];
});

defineEmits(["edit", "delete"]);
</script>
