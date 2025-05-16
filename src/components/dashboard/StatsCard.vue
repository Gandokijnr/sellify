<script setup>
import { defineProps } from 'vue'
import { DocumentTextIcon } from '@heroicons/vue/24/outline'

defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  icon: {
    type: String,
    default: 'DocumentTextIcon'
  },
  color: {
    type: String,
    default: 'bg-blue-600'
  },
  valueLabel: {
    type: String,
    default: ''
  }
});
</script>

<template>
  <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
    <div :class="`h-12 w-12 rounded-lg ${color} flex items-center justify-center text-white`">
      <component :is="icon" class="h-6 w-6" />
    </div>
    <div class="ml-4">
      <h3 class="text-sm font-medium text-gray-500">{{ title }}</h3>
      <div class="flex items-baseline">
        <span class="text-xl font-semibold text-gray-900">{{ value }}</span>
        <span v-if="valueLabel" class="ml-1 text-xs text-gray-500">{{ valueLabel }}</span>
      </div>
    </div>
  </div>
</template>
