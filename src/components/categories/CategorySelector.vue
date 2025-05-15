<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  categories: {
    type: Object,
    required: true,
  },
  required: {
    type: Boolean,
    default: true,
  },
  modelValue: {
    type: String,
    default: "",
  },
});

const emit = defineEmits([
  "update:modelValue",
  "validation-change",
  "selection-object",
]);

// Support up to 2 levels of categories (Main and Subcategory)
const selectedLevels = ref([null, null]);
const finalSelection = ref("");

function getStructuredCategory() {
  const structure = {};
  const levels = selectedLevels.value.filter(Boolean);
  if (levels[0]) structure.mainCategory = levels[0];
  if (levels[1]) structure.subCategory = levels[1];
  // No more sub-subcategory or leaf category
  return structure;
}

// Compute available options for each level based on selected parent values
const levelOptions = computed(() => {
  const options = [];
  let currentLevel = props.categories;

  // First level is always the categories object
  options.push(currentLevel);

  // For each selected level, navigate to that branch of the tree
  for (let i = 0; i < selectedLevels.value.length; i++) {
    const selectedKey = selectedLevels.value[i];
    if (!selectedKey || !currentLevel[selectedKey]) break;

    currentLevel = currentLevel[selectedKey];

    // Only add this level if it's an object (not an array or primitive)
    if (typeof currentLevel === "object" && !Array.isArray(currentLevel)) {
      options.push(currentLevel);
    } else {
      break; // We reached a leaf node or array
    }
  }

  return options;
});

// No more leaf options as we're only using main and subcategory

// Track if we have a complete selection path (for validation)
const isSelectionComplete = computed(() => {
  // Form is complete if both main category and subcategory are selected
  return selectedLevels.value[0] !== null && selectedLevels.value[1] !== null;
});

// When a level changes, reset all subsequent levels
watch(
  selectedLevels,
  (newVal, oldVal) => {
    for (let i = 0; i < newVal.length; i++) {
      if (newVal[i] !== oldVal[i]) {
        // Reset subsequent levels
        selectedLevels.value = newVal
          .slice(0, i + 1)
          .concat(Array(selectedLevels.value.length - i - 1).fill(null));
        // Also reset final selection if needed
        finalSelection.value = "";
        break;
      }
    }

    updateCategoryString();
  },
  { deep: true }
);

// No need to watch final selection as we're not using it anymore

// Emit validation state changes to parent
watch(isSelectionComplete, (newVal) => {
  emit("validation-change", newVal);
});

function updateCategoryString() {
  const parts = selectedLevels.value.filter(Boolean);

  const categoryString = parts.join(" > ");
  emit("update:modelValue", categoryString);
  emit("selection-object", getStructuredCategory());
}

// Initialize from provided modelValue if it exists
function initFromModelValue() {
  if (!props.modelValue) return;

  const parts = props.modelValue.split(" > ");
  if (parts.length === 0) return;

  // Try to match the parts with our category structure
  let currentLevel = props.categories;

  for (let i = 0; i < parts.length && i < selectedLevels.value.length; i++) {
    const part = parts[i];
    if (currentLevel[part]) {
      selectedLevels.value[i] = part;
      currentLevel = currentLevel[part];
    } else {
      break; // Invalid path
    }
  }
}

// Initialize component based on modelValue if provided
watch(() => props.modelValue, initFromModelValue, { immediate: true });
</script>

<template>
  <div class="category-selector">
    <!-- Main Category - First Level -->
    <div class="mb-3">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Main Category
        <span class="text-red-500" v-if="required">*</span>
      </label>
      <select
        v-model="selectedLevels[0]"
        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jiji-primary"
        :class="{ 'border-red-500': required && selectedLevels[0] === null }"
        :required="required"
      >
        <option :value="null" disabled>Select Main Category</option>
        <option v-for="(_, key) in levelOptions[0]" :key="key" :value="key">
          {{ key }}
        </option>
      </select>
    </div>

    <!-- Subcategory Level -->
    <div v-if="levelOptions.length > 1" class="mb-3">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Subcategory
        <span class="text-red-500" v-if="required">*</span>
      </label>
      <select
        v-model="selectedLevels[1]"
        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jiji-primary"
        :class="{
          'border-red-500': required && selectedLevels[1] === null,
        }"
        :required="required"
      >
        <option :value="null" disabled>Select Subcategory</option>
        <option v-for="(_, key) in levelOptions[1]" :key="key" :value="key">
          {{ key }}
        </option>
      </select>
    </div>

    <!-- Category Path Visualization -->
    <div class="mt-4 border-t pt-3">
      <h4 class="text-sm font-semibold text-gray-700 mb-2">Category Path:</h4>
      <div class="flex flex-wrap items-center text-sm">
        <template
          v-for="(level, index) in selectedLevels.filter(Boolean)"
          :key="`path-${index}`"
        >
          <span class="bg-gray-100 px-2 py-1 rounded-lg">{{ level }}</span>
          <span
            class="mx-1 text-gray-400"
            v-if="index < selectedLevels.filter(Boolean).length - 1"
            >›</span
          >
        </template>
        <span v-if="!isSelectionComplete" class="ml-2 text-teal-500 italic">
          (selection incomplete)
        </span>
        <span v-else class="ml-2 text-teal-500 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          Complete
        </span>
      </div>
    </div>

    <!-- Validation Message -->
    <div
      v-if="required && !isSelectionComplete"
      class="mt-2 text-sm text-red-500"
    >
      Please complete your category selection before proceeding.
    </div>
  </div>
</template>
