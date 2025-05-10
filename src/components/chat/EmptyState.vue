<!-- EmptyState.vue -->
<script setup>
import { Inbox } from "lucide-vue-next";

defineProps({
  hasSearch: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <div class="p-12 flex flex-col items-center justify-center text-center">
    <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-full">
      <Inbox class="h-12 w-12 text-gray-400" />
    </div>
    <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
      {{ hasSearch ? "No matching conversations" : "No conversations yet" }}
    </h3>
    <p class="mt-2 text-gray-500 dark:text-gray-400 max-w-md">
      {{
        hasSearch
          ? "Try adjusting your search terms or clearing the filters."
          : "Your message history will appear here. Start a chat from a product listing!"
      }}
    </p>
  </div>
</template>