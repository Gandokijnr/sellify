/**
 * Vue directive to ensure all images have width and height attributes
 * This helps prevent layout shifts during page load (improves CLS)
 */
export default {
  mounted(el) {
    // Skip if element is not an image or already has width/height
    if (el.tagName !== 'IMG' || (el.hasAttribute('width') && el.hasAttribute('height'))) {
      return;
    }

    // Set default dimensions to prevent layout shift while loading
    if (!el.hasAttribute('width')) {
      // Use natural width if available, otherwise placeholder
      el.setAttribute('width', el.naturalWidth || '100%');
    }
    
    if (!el.hasAttribute('height')) {
      // Use natural height if available, otherwise placeholder
      el.setAttribute('height', el.naturalHeight || 'auto');
    }
    
    // When image loads, update dimensions if needed
    el.addEventListener('load', () => {
      if (el.naturalWidth && !el.hasAttribute('width')) {
        el.setAttribute('width', el.naturalWidth);
      }
      
      if (el.naturalHeight && !el.hasAttribute('height')) {
        el.setAttribute('height', el.naturalHeight);
      }
    });
  }
};
