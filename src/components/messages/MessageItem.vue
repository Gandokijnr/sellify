<template>
  <div
    class="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer transition-colors"
    @click="$emit('click', message)"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="flex-shrink-0">
          <span
            class="h-8 w-8 rounded-full bg-jiji-primary flex items-center justify-center text-white"
          >
            {{ senderInitials }}
          </span>
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center space-x-2">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ message.from }}
            </p>
            <span
              v-if="!message.read"
              class="flex-shrink-0 inline-block h-2 w-2 rounded-full bg-blue-500"
            ></span>
          </div>
          <p class="text-sm text-gray-900 mt-1">
            {{ message.subject }}
          </p>
          <p class="text-sm text-gray-500 truncate mt-1">
            {{ message.preview }}
          </p>
        </div>
      </div>
      <div class="ml-2 flex flex-shrink-0 items-center">
        <p class="text-sm text-gray-500 whitespace-nowrap">
          {{ formattedDate }}
        </p>
        <ChevronRightIcon class="h-5 w-5 text-gray-400 ml-2" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { ChevronRightIcon } from "@heroicons/vue/24/solid";

const props = defineProps({
  message: {
    type: Object,
    required: true,
    default: () => ({
      id: null,
      from: "",
      subject: "",
      preview: "",
      date: "",
      read: false,
    }),
  },
});

const senderInitials = computed(() => {
  const names = props.message.from.split(" ");
  return names
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

const formattedDate = computed(() => {
  const date = new Date(props.message.date);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

defineEmits(["click"]);
</script>
