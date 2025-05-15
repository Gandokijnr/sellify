<!-- FilterTabs.vue -->
<script setup>
import { Clock } from "lucide-vue-next";

defineProps({
  activeFilter: {
    type: String,
    default: 'all'
  }
});

const emit = defineEmits(['set-filter']);

const handleFilterChange = (filter) => {
  emit('set-filter', filter);
};
</script>

<template>
  <div class="mt-4 flex items-center space-x-2 overflow-x-auto pb-2">
    <button
      @click="handleFilterChange('all')"
      :class="[
        'px-4 py-2 rounded-full text-sm font-medium transition-colors',
        activeFilter === 'all'
          ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100'
          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
      ]"
    >
      All Conversations
    </button>
    <button
      @click="handleFilterChange('unread')"
      :class="[
        'px-4 py-2 rounded-full text-sm font-medium transition-colors',
        activeFilter === 'unread'
          ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100'
          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
      ]"
    >
      Unread
    </button>
    <button
      @click="handleFilterChange('recent')"
      :class="[
        'px-4 py-2 rounded-full text-sm font-medium transition-colors',
        activeFilter === 'recent'
          ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100'
          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
      ]"
    >
      <Clock class="h-4 w-4 mr-1 inline" />
      Recent
    </button>
  </div>
</template>