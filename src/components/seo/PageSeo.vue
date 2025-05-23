<template>
  <!-- This is an invisible component that manages SEO for its parent page -->
</template>

<script>
import { onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { updateMetaTags, injectStructuredData } from '@/seo/meta-tags';

export default {
  name: 'PageSeo',
  props: {
    // Page name identifier (matches the keys in keywords-strategy.js)
    pageName: {
      type: String,
      required: true
    },
    // Category for category-specific pages
    category: {
      type: String,
      default: null
    },
    // Title override (optional)
    title: {
      type: String,
      default: null
    },
    // Description override (optional)
    description: {
      type: String,
      default: null
    },
    // Image URL for social sharing
    image: {
      type: String,
      default: null
    },
    // Item name for product pages
    itemName: {
      type: String,
      default: null
    },
    // Item details for product pages
    itemDetails: {
      type: String,
      default: null
    },
    // Structured data type (product, category, etc.)
    structuredDataType: {
      type: String,
      default: null
    },
    // Structured data object
    structuredData: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const route = useRoute();
    
    // Update SEO tags when component mounts
    const updateSeo = () => {
      const options = {
        category: props.category,
        itemName: props.itemName || props.title,
        itemDetails: props.itemDetails || props.description,
        imageUrl: props.image
      };
      
      // Use custom title/description if provided
      if (props.title) options.customTitle = props.title;
      if (props.description) options.customDescription = props.description;
      
      // Update meta tags
      updateMetaTags(props.pageName, options);
      
      // Inject structured data if provided
      if (props.structuredDataType) {
        const data = { ...props.structuredData };
        
        // Add basic data if not provided in structuredData
        if (!data.name && props.itemName) data.name = props.itemName;
        if (!data.description && props.itemDetails) data.description = props.itemDetails;
        if (!data.imageUrl && props.image) data.imageUrl = props.image;
        if (props.category) data.category = props.category;
        
        injectStructuredData(props.structuredDataType, data);
      }
    };
    
    // Setup watchers to update SEO when props change
    watch(() => props.pageName, updateSeo, { immediate: false });
    watch(() => props.category, updateSeo, { immediate: false });
    watch(() => props.title, updateSeo, { immediate: false });
    watch(() => props.description, updateSeo, { immediate: false });
    watch(() => props.image, updateSeo, { immediate: false });
    watch(() => props.itemName, updateSeo, { immediate: false });
    watch(() => props.itemDetails, updateSeo, { immediate: false });
    watch(() => props.structuredData, updateSeo, { immediate: false, deep: true });
    
    // Update SEO on route changes
    watch(() => route.path, updateSeo, { immediate: false });
    
    onMounted(() => {
      updateSeo();
    });
    
    onUnmounted(() => {
      // Clean up any side effects if needed
    });
    
    return {};
  }
};
</script>
