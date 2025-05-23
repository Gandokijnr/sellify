<!-- 
  OptimizedImage.vue
  A component that automatically:
  1. Serves images in next-gen formats (WebP/AVIF)
  2. Ensures proper width/height attributes
  3. Implements lazy loading
  4. Sets srcset for responsive images
-->
<template>
  <picture>
    <!-- AVIF format - most efficient next-gen format -->
    <source
      v-if="avifSrc"
      :srcset="avifSrcset"
      :sizes="sizes"
      type="image/avif"
    />
    <!-- WebP format - widely supported next-gen format -->
    <source
      v-if="webpSrc"
      :srcset="webpSrcset"
      :sizes="sizes"
      type="image/webp"
    />
    <!-- Fallback image -->
    <img
      :src="src"
      :srcset="srcset"
      :sizes="sizes"
      :alt="alt"
      :width="width"
      :height="height"
      :class="imgClass"
      loading="lazy"
      decoding="async"
      v-img-dimensions
    />
  </picture>
</template>

<script>
export default {
  name: 'OptimizedImage',
  props: {
    // Original image URL
    src: {
      type: String,
      required: true
    },
    // WebP version URL (optional)
    webpSrc: {
      type: String,
      default: ''
    },
    // AVIF version URL (optional)
    avifSrc: {
      type: String,
      default: ''
    },
    // Image alternative text
    alt: {
      type: String,
      required: true
    },
    // Image width
    width: {
      type: [Number, String],
      default: null
    },
    // Image height
    height: {
      type: [Number, String],
      default: null
    },
    // CSS classes
    imgClass: {
      type: String,
      default: ''
    },
    // Responsive image srcset
    srcset: {
      type: String,
      default: ''
    },
    // WebP srcset
    webpSrcset: {
      type: String,
      default: ''
    },
    // AVIF srcset
    avifSrcset: {
      type: String,
      default: ''
    },
    // Sizes attribute for responsive images
    sizes: {
      type: String,
      default: '100vw'
    }
  }
}
</script>

<style scoped>
/* Prevent layout shift by making image responsive */
img {
  max-width: 100%;
  display: block;
}
</style>
