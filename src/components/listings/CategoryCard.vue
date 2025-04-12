<template>
  <router-link
    :to="`/listings?category=${category.name.toLowerCase()}`"
    class="bg-white p-4 rounded-lg shadow-sm text-center hover:shadow-md transition-all duration-200 hover:translate-y-[-2px]"
  >
    <div class="text-4xl mb-3">{{ category.icon }}</div>
    <h3 class="font-medium text-gray-800">{{ category.name }}</h3>
    <p class="text-sm text-gray-500 mt-1">
      {{ category.count.toLocaleString() }} items
    </p>
  </router-link>
</template>

<script setup>
defineProps({
  category: {
    type: Object,
    required: true,
    validator: (value) => {
      return ["id", "name", "icon", "count"].every((key) => key in value);
    },
  },
});
</script>
