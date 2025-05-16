<template>
  <div v-if="visible" @click.self="$emit('close')" class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close'])
</script>

<style scoped>
/* Add any modal-specific styles here */
</style>
