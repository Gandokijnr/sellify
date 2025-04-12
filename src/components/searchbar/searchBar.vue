<template>
  <div class="relative">
    <input
      type="text"
      placeholder="What are you looking for?"
      class="w-full border border-gray-300 rounded-md py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-jiji-primary focus:border-jiji-primary text-sm sm:text-base"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @keyup.enter="$emit('search')"
    />
    <button
      @click="$emit('search')"
      class="absolute right-0 top-0 h-full px-4 text-white bg-jiji-primary rounded-r-md hover:bg-orange-700 focus:outline-none transition-colors"
      aria-label="Search"
    >
      <svg
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </button>
  </div>
</template>

<script setup>
defineProps(["modelValue"]);
defineEmits(["update:modelValue", "search"]);
</script>
