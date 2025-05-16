<script setup>
import { defineProps, defineEmits } from 'vue'
import { PencilIcon, TrashIcon, PhotoIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['click']);

const handleClick = () => {
  emit('click', props.message);
};

// Get initials for avatar fallback
const getInitials = (name) => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};
</script>

<template>
  <div 
    @click="handleClick"
    class="p-4 hover:bg-gray-50 cursor-pointer transition"
    :class="{'bg-teal-50': !message.read}"
  >
    <div class="flex">
      <div class="flex-shrink-0">
        <div v-if="message.avatar" class="h-10 w-10 rounded-full overflow-hidden">
          <img :src="message.avatar" :alt="message.from" class="h-full w-full object-cover">
        </div>
        <div 
          v-else 
          class="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 font-medium text-sm"
        >
          {{ getInitials(message.from) }}
        </div>
      </div>
      <div class="ml-3 flex-1 min-w-0">
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-gray-900 truncate">
            {{ message.from }}
          </p>
          <p class="text-xs text-gray-500">
            {{ message.date }}
          </p>
        </div>
        <p class="text-sm font-medium text-gray-700 truncate">
          {{ message.subject }}
        </p>
        <p class="text-xs text-gray-500 truncate">
          {{ message.preview }}
        </p>
      </div>
      <div v-if="!message.read" class="ml-2 flex-shrink-0">
        <div class="h-2 w-2 rounded-full bg-teal-500"></div>
      </div>
    </div>
  </div>
</template>
