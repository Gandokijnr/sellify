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

// Support up to 3 levels of categories
const selectedLevels = ref([null, null, null]);
const finalSelection = ref("");

function getStructuredCategory() {
  const structure = {};
  const levels = selectedLevels.value.filter(Boolean);
  if (levels[0]) structure.mainCategory = levels[0];
  if (levels[1]) structure.subCategory = levels[1];
  if (levels[2]) structure.subSubCategory = levels[2];
  if (finalSelection.value) structure.leafCategory = finalSelection.value;
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

// Compute leaf options (array of items at the end of the selection)
const leafOptions = computed(() => {
  let currentLevel = props.categories;

  // Navigate to the current branch based on selections
  for (const level of selectedLevels.value) {
    if (!level || !currentLevel[level]) return [];
    currentLevel = currentLevel[level];
  }

  // If we have an array at the end, those are our leaf options
  return Array.isArray(currentLevel) ? currentLevel : [];
});

// Track if we have a complete selection path (for validation)
const isSelectionComplete = computed(() => {
  if (selectedLevels.value[0] === null) return false;

  let currentLevel = props.categories;
  let depth = 0;

  // Navigate to the deepest selected level
  for (const level of selectedLevels.value) {
    if (!level) break;

    if (currentLevel[level]) {
      currentLevel = currentLevel[level];
      depth++;
    } else {
      break;
    }
  }

  // If we've reached an array of leaf options, we need a final selection
  if (Array.isArray(currentLevel)) {
    return finalSelection.value !== "";
  }

  // If we've reached a terminal object (no more levels), we're complete
  return (
    typeof currentLevel === "object" &&
    !Array.isArray(currentLevel) &&
    Object.keys(currentLevel).length === 0
  );
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

// When final selection changes, update output
watch(finalSelection, updateCategoryString);

// Emit validation state changes to parent
watch(isSelectionComplete, (newVal) => {
  emit("validation-change", newVal);
});

function updateCategoryString() {
  const parts = [
    ...selectedLevels.value.filter(Boolean),
    ...(finalSelection.value ? [finalSelection.value] : []),
  ];

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

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    // Check if we've reached the end
    if (i === parts.length - 1) {
      // Last part could be a leaf option
      if (Array.isArray(currentLevel) && currentLevel.includes(part)) {
        finalSelection.value = part;
        break;
      }
      // Or it could be the last level of our hierarchy
      else if (i < selectedLevels.value.length && currentLevel[part]) {
        selectedLevels.value[i] = part;
      }
      break;
    }

    // Otherwise it should be a key in our object
    if (currentLevel[part]) {
      if (i < selectedLevels.value.length) {
        selectedLevels.value[i] = part;
        currentLevel = currentLevel[part];
      }
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

    <!-- Additional Subcategory Levels -->
    <div
      v-for="(levelData, index) in levelOptions.slice(1)"
      :key="`level-${index + 1}`"
      class="mb-3"
    >
      <label class="block text-sm font-medium text-gray-700 mb-1">
        {{
          index === 0
            ? "Subcategory"
            : index === 1
            ? "Sub-subcategory"
            : `Level ${index + 2}`
        }}
        <span class="text-red-500" v-if="required">*</span>
      </label>
      <select
        v-model="selectedLevels[index + 1]"
        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jiji-primary"
        :class="{
          'border-red-500': required && selectedLevels[index + 1] === null,
        }"
        :required="required"
      >
        <option :value="null" disabled>
          {{
            index === 0
              ? "Select Subcategory"
              : index === 1
              ? "Select Sub-subcategory"
              : `Select Level ${index + 2}`
          }}
        </option>
        <option v-for="(_, key) in levelData" :key="key" :value="key">
          {{ key }}
        </option>
      </select>
    </div>

    <!-- Leaf Options (Final Selection) -->
    <div class="mb-3" v-if="leafOptions.length > 0">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Specific Type
        <span class="text-red-500" v-if="required">*</span>
      </label>
      <select
        v-model="finalSelection"
        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jiji-primary"
        :class="{
          'border-red-500':
            required && leafOptions.length > 0 && finalSelection === '',
        }"
        :required="required && leafOptions.length > 0"
      >
        <option value="" disabled>Select Specific Type</option>
        <option v-for="option in leafOptions" :key="option" :value="option">
          {{ option }}
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
            v-if="
              index < selectedLevels.filter(Boolean).length - 1 ||
              finalSelection
            "
            >›</span
          >
        </template>
        <span v-if="finalSelection" class="bg-gray-100 px-2 py-1 rounded-lg">{{
          finalSelection
        }}</span>
        <span v-if="!isSelectionComplete" class="ml-2 text-orange-500 italic">
          (selection incomplete)
        </span>
        <span v-else class="ml-2 text-green-500 flex items-center">
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
