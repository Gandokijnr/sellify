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

const emit = defineEmits(["update:searchQuery"]);
</script>

<template>
  <div class="bg-teal-700 text-white">
    <div class="container mx-auto px-4 py-12 md:py-16">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl md:text-4xl font-bold mb-6 animate-on-scroll">
          {{ title }}
        </h1>
        <p class="text-lg mb-8 opacity-90 animate-on-scroll delay-1">
          {{ description }}
        </p>

        <div class="relative max-w-xl animate-on-scroll delay-2">
          <input
            type="text"
            placeholder="Search all listings..."
            class="w-full py-3 px-6 pl-12 rounded-xl text-gray-800 focus:outline-none bg-amber-50 shadow-lg"
            :value="searchQuery"
            @input="emit('update:searchQuery', $event.target.value)"
          />
          <span class="absolute left-4 top-3 text-gray-400">
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
        </div>
      </div>
    </div>
  </div>
</template>
