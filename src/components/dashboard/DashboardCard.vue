<template>
  <div class="bg-white overflow-hidden shadow rounded-lg">
    <div class="p-5">
      <div class="flex items-center">
        <div class="flex-shrink-0" :class="color">
          <component :is="icon" class="h-6 w-6 text-white" />
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">
              {{ title }}
            </dt>
            <dd>
              <div class="text-lg font-medium text-gray-900">
                {{ value }}
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
    <div class="bg-gray-50 px-5 py-3">
      <div class="text-sm">
        <router-link
          :to="link || '#'"
          class="font-medium text-jiji-primary hover:text-orange-700"
        >
          View all
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  icon: {
    type: [String, Object],
    required: true,
  },
  color: {
    type: String,
    default: "bg-indigo-500",
  },
  link: {
    type: String,
    default: "",
  },
});
</script>
