<script setup>
const props = defineProps({
  categories: {
    type: Array,
    required: true,
  },
  listings: {
    type: Array,
    required: true,
  },
  selectedCategory: {
    type: String,
    default: "All",
  },
  mobile: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:selectedCategory"]);

const formatNumber = (num) => num?.toLocaleString() || "0";
</script>

<template>
  <div v-if="mobile" class="mb-4 animate-on-scroll">
    <div class="relative">
      <select
        :value="selectedCategory"
        @change="emit('update:selectedCategory', $event.target.value)"
        class="block p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
      >
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.name"
        >
          {{ category.icon }} {{ category.name }} ({{
            category.name === "All"
              ? formatNumber(listings.length)
              : formatNumber(
                  listings.filter((l) => l.category === category.name).length
                )
          }})
        </option>
      </select>
    </div>
  </div>

  <div v-else class="w-full md:w-64 shrink-0 animate-on-scroll">
    <div class="bg-white rounded-lg shadow-sm p-4 sticky top-4">
      <h3 class="font-bold text-lg mb-4">Categories</h3>
      <ul class="space-y-2">
        <li
          v-for="category in categories"
          :key="category.id"
          @click="emit('update:selectedCategory', category.name)"
          class="flex items-center p-2 rounded-lg cursor-pointer transition-colors"
          :class="{
            'bg-teal-100 text-teal-700': selectedCategory === category.name,
            'hover:bg-gray-100': selectedCategory !== category.name,
          }"
        >
          <span class="mr-2">{{ category.icon }}</span>
          <span>{{ category.name }}</span>
          <span class="ml-auto text-sm text-gray-500">
            {{
              category.name === "All"
                ? formatNumber(listings.length)
                : formatNumber(
                    listings.filter((l) => l.category === category.name).length
                  )
            }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>
