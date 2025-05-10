<!-- SearchBar.vue -->
<script setup>
import { Search } from "lucide-vue-next";

defineProps({
  searchQuery: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(['update-search']);

const handleInput = (event) => {
  emit('update-search', event.target.value);
};
</script>

<template>
  <div class="relative w-full md:w-64">
    <div
      class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
    >
      <Search class="h-5 w-5 text-gray-400" />
    </div>
    <input
      :value="searchQuery"
      @input="handleInput"
      type="text"
      placeholder="Search conversations..."
      class="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-400 dark:focus:border-green-400 transition-colors"
    />
  </div>
</template>