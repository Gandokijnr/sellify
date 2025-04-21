<template>
  <div
    v-if="show"
    class="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
    :class="containerClass"
  >
    <!-- Background -->
    <div class="absolute inset-0"></div>

    <!-- Main loader container -->
    <div class="relative flex flex-col items-center">
      <!-- Animated elements -->
      <div class="relative w-32 h-32 mb-8 sm:w-36 sm:h-36 md:w-40 md:h-40">
        <!-- Outer spinning ring -->
        <div
          class="absolute w-full h-full rounded-full border-4 border-green-100 opacity-30"
        ></div>

        <!-- Spinning gradient circles -->
        <div
          class="absolute w-full h-full rounded-full border-4 border-transparent border-t-green-600 border-r-green-500 animate-spin"
          style="animation-duration: 2s"
        ></div>
        <div
          class="absolute w-full h-full rounded-full border-4 border-transparent border-t-green-500 border-r-green-400 animate-spin"
          style="animation-duration: 1.7s; animation-delay: 0.2s"
        ></div>

        <!-- Pulsing center -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div
            class="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 animate-pulse flex items-center justify-center"
          >
            <div class="text-2xl font-bold text-white">
              <slot name="logo-text">Selify</slot>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-50"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>

      <!-- Optional loading text -->
      <div class="mt-3 text-green-800 font-medium text-sm">
        <slot name="loading-text">Loading your experience...</slot>
      </div>
    </div>

    <!-- Decorative elements -->
    <div class="absolute inset-0 pointer-events-none">
      <!-- Floating leaves/dots -->
      <div
        v-for="i in 12"
        :key="i"
        class="absolute rounded-full opacity-60"
        :class="[i % 2 === 0 ? 'bg-green-300' : 'bg-green-200']"
        :style="particleStyle(i)"
      ></div>
    </div>
  </div>

  <slot v-if="!show"></slot>
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits, onBeforeUnmount } from "vue";

const props = defineProps({
  duration: {
    type: Number,
    default: 2000,
  },
  minDuration: {
    type: Number,
    default: 2000,
  },
  autoStart: {
    type: Boolean,
    default: true,
  },
  containerClass: {
    type: String,
    default: "",
  },
  initialShow: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["complete"]);

const show = ref(props.initialShow);
const progress = ref(0);
let progressInterval = null;
let minDurationTimeout = null;

// Generate random styles for particles
const particleStyle = (i) => {
  const size = Math.random() * 8 + 4;
  const isLeaf = i % 3 === 0;

  return {
    width: `${size}px`,
    height: isLeaf ? `${size * 1.5}px` : `${size}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${i * 0.3}s`,
    animation: "floatGreen 20s infinite ease-in-out",
    borderRadius: isLeaf ? "50% 50% 50% 0" : "50%",
    transform: isLeaf ? `rotate(${i * 30}deg)` : "",
  };
};

// Add necessary keyframe animations
const addStylesheet = () => {
  const style = document.createElement("style");
  style.id = "selify-loader-styles";
  style.textContent = `
    @keyframes floatGreen {
      0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
      25% { transform: translateY(-30px) translateX(15px) rotate(5deg); }
      50% { transform: translateY(10px) translateX(-20px) rotate(-5deg); }
      75% { transform: translateY(-15px) translateX(25px) rotate(3deg); }
    }
  `;
  document.head.appendChild(style);
};

const startLoader = () => {
  show.value = true;
  progress.value = 0;

  const increment = 100 / (props.duration / 50); // 50ms update interval
  progressInterval = setInterval(() => {
    progress.value = Math.min(100, progress.value + increment);
    if (progress.value >= 100) {
      completeLoader();
    }
  }, 50);

  // Set minimum duration
  minDurationTimeout = setTimeout(() => {
    if (progress.value < 100) {
      progress.value = 100;
      completeLoader();
    }
  }, props.minDuration);
};

const completeLoader = () => {
  clearInterval(progressInterval);
  clearTimeout(minDurationTimeout);

  setTimeout(() => {
    show.value = false;
    emit("complete");
  }, 200);
};

// Public methods through template ref
defineExpose({
  start: startLoader,
  complete: () => {
    progress.value = 100;
    completeLoader();
  },
  setProgress: (value) => {
    progress.value = Math.min(100, Math.max(0, value));
  },
});

onMounted(() => {
  addStylesheet();
  if (props.autoStart) {
    startLoader();
  }
});

onBeforeUnmount(() => {
  clearInterval(progressInterval);
  clearTimeout(minDurationTimeout);
  const styleElement = document.getElementById("selify-loader-styles");
  if (styleElement) {
    styleElement.remove();
  }
});
</script>
