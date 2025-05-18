<script setup>
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  searchQuery: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:searchQuery", "search"]);
</script>

<template>
  <div class="bg-teal-700 text-white">
    <div class="container mx-auto px-4 py-12 md:py-16">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl md:text-4xl font-bold mb-4">
          {{ title }}
        </h1>
        <p class="text-lg text-teal-100 mb-6">
          {{ description }}
        </p>

        <div class="relative max-w-xl">
          <input
            type="text"
            placeholder="Search all listings..."
            class="w-full p-4 pr-12 pl-12 rounded-lg border-0 shadow-md focus:ring-2 focus:ring-teal-400 text-gray-800 bg-white"
            :value="searchQuery"
            @input="emit('update:searchQuery', $event.target.value)"
            @keyup.enter="emit('search')"
          />
          <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-search"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          
          <!-- Search Button -->
          <!-- <button
            @click="emit('search')"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-teal-600 focus:outline-none transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button> -->
        </div>
      </div>
    </div>
  </div>
</template>
