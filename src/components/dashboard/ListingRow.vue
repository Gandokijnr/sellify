<script setup>
import { defineProps, defineEmits } from 'vue'
import { PencilIcon, TrashIcon, PhotoIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  listing: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['edit', 'delete']);

const handleEdit = () => {
  emit('edit', props.listing.id);
};

const handleDelete = () => {
  emit('delete', props.listing.id);
};
</script>

<template>
  <li class="py-4 flex items-center">
    <div class="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
      <img 
        v-if="listing.image" 
        :src="listing.image" 
        :alt="listing.title" 
        class="w-full h-full object-cover"
      >
      <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
        <PhotoIcon class="h-8 w-8" />
      </div>
    </div>
    
    <div class="ml-4 flex-1 min-w-0">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium text-gray-900 truncate">
          {{ listing.title }}
        </p>
        <div>
          <span 
            :class="`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${listing.statusBadgeColor}`"
          >
            {{ listing.status }}
          </span>
        </div>
      </div>
      <div class="flex items-center justify-between mt-1">
        <p class="text-sm text-gray-500 truncate">
          {{ listing.price }}
        </p>
        <p class="text-xs text-gray-400">
          {{ listing.date }}
        </p>
      </div>
      <div class="flex mt-2 space-x-2">
        <button 
          @click="handleEdit" 
          class="text-xs text-teal-600 hover:text-teal-800 flex items-center"
        >
          <PencilIcon class="h-3 w-3 mr-1" /> Edit
        </button>
        <button 
          @click="handleDelete" 
          class="text-xs text-red-600 hover:text-red-800 flex items-center"
        >
          <TrashIcon class="h-3 w-3 mr-1" /> Delete
        </button>
      </div>
    </div>
  </li>
</template>
