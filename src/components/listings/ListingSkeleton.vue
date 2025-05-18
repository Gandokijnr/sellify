<template>
  <div class="w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
    <!-- Image Skeleton -->
    <div class="aspect-w-4 aspect-h-3 bg-gray-200 animate-pulse relative">
      <div class="w-full h-full"></div>
    </div>

    <!-- Content Skeleton -->
    <div class="p-4">
      <!-- Title -->
      <div class="h-5 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
      
      <!-- Price -->
      <div class="h-6 bg-gray-200 rounded w-1/3 mb-3 animate-pulse"></div>
      
      <!-- Location -->
      <div class="flex items-center mt-3">
        <div class="w-4 h-4 bg-gray-200 rounded-full mr-2 animate-pulse"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      </div>
      
      <!-- Date -->
      <div class="mt-3 h-4 bg-gray-200 rounded w-2/5 animate-pulse"></div>
      
      <!-- Actions -->
      <div class="flex justify-between mt-4 pt-3 border-t border-gray-100">
        <div class="h-8 bg-gray-200 rounded w-2/5 animate-pulse"></div>
        <div class="h-8 bg-gray-200 rounded w-2/5 animate-pulse"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
// This is a skeleton loader component for listings
// No props or functionality needed as it's just a visual placeholder
</script>

<style scoped>
.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Support for aspect ratio if not natively supported */
.aspect-w-4 {
  position: relative;
  padding-bottom: calc(3 / 4 * 100%);
}

.aspect-h-3 > * {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
</style>
