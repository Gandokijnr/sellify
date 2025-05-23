/**
 * Selify SEO Meta Tags Manager
 * 
 * This file contains utilities for managing meta tags across the application
 * to ensure proper SEO implementation for each route.
 */

import { getKeywordsForPage, getTitleForPage, getDescriptionForPage } from './keywords-strategy';

/**
 * Updates all meta tags for the current page
 * @param {string} pageName - The name of the current page
 * @param {Object} options - Additional options like category, itemName, etc.
 */
export function updateMetaTags(pageName, options = {}) {
  const { category, itemName, itemDetails, imageUrl } = options;
  
  // Set document title
  document.title = getTitleForPage(pageName, category, itemName);
  
  // Update meta description
  updateMetaTag('description', getDescriptionForPage(pageName, category, itemDetails));
  
  // Update meta keywords
  updateMetaTag('keywords', getKeywordsForPage(pageName, category));
  
  // Update Open Graph tags
  updateMetaTag('og:title', getTitleForPage(pageName, category, itemName), 'property');
  updateMetaTag('og:description', getDescriptionForPage(pageName, category, itemDetails), 'property');
  updateMetaTag('og:type', 'website', 'property');
  updateMetaTag('og:url', window.location.href, 'property');
  
  if (imageUrl) {
    updateMetaTag('og:image', imageUrl, 'property');
  } else {
    // Default image
    updateMetaTag('og:image', 'https://res.cloudinary.com/dqqycsgmn/image/upload/v1747912623/selify_fav_icon_kejjeh.jpg', 'property');
  }
  
  // Update Twitter Card tags
  updateMetaTag('twitter:card', 'summary_large_image', 'property');
  updateMetaTag('twitter:title', getTitleForPage(pageName, category, itemName), 'property');
  updateMetaTag('twitter:description', getDescriptionForPage(pageName, category, itemDetails), 'property');
  
  if (imageUrl) {
    updateMetaTag('twitter:image', imageUrl, 'property');
  } else {
    // Default image
    updateMetaTag('twitter:image', 'https://res.cloudinary.com/dqqycsgmn/image/upload/v1747912623/selify_fav_icon_kejjeh.jpg', 'property');
  }
  
  // Update canonical URL
  updateCanonicalUrl();
}

/**
 * Updates a specific meta tag or creates it if it doesn't exist
 * @param {string} name - The name or property attribute value
 * @param {string} content - The content value
 * @param {string} attributeName - Either 'name' or 'property'
 */
function updateMetaTag(name, content, attributeName = 'name') {
  let metaTag = document.querySelector(`meta[${attributeName}="${name}"]`);
  
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute(attributeName, name);
    document.head.appendChild(metaTag);
  }
  
  metaTag.setAttribute('content', content);
}

/**
 * Updates the canonical URL meta tag
 */
function updateCanonicalUrl() {
  const currentUrl = window.location.href.split('#')[0].split('?')[0];
  let canonicalTag = document.querySelector('link[rel="canonical"]');
  
  if (!canonicalTag) {
    canonicalTag = document.createElement('link');
    canonicalTag.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalTag);
  }
  
  canonicalTag.setAttribute('href', currentUrl);
}

/**
 * Generates JSON-LD structured data for different page types
 * @param {string} pageType - The type of page (product, category, home, etc.)
 * @param {Object} data - The data to use for the structured data
 * @returns {string} JSON-LD script tag content
 */
export function generateStructuredData(pageType, data = {}) {
  let structuredData = null;
  
  switch (pageType) {
    case 'home':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'Selify',
        'alternateName': ['Selify Nigeria', 'Selify Online Marketplace', 'Selify Buy and Sell'],
        'url': 'https://selify.netlify.app/',
        'description': 'Nigeria\'s fastest growing online marketplace. Buy and sell phones, cars, electronics, fashion, properties and more.',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://selify.netlify.app/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      };
      break;
      
    case 'product':
      if (!data.name) return null;
      
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': data.name,
        'description': data.description || '',
        'image': data.imageUrl || '',
        'offers': {
          '@type': 'Offer',
          'price': data.price || '',
          'priceCurrency': 'NGN',
          'availability': 'https://schema.org/InStock',
          'seller': {
            '@type': 'Person',
            'name': data.sellerName || 'Selify Seller'
          }
        }
      };
      break;
      
    case 'category':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': `${data.category || 'Products'} - Selify Marketplace`,
        'description': `Browse ${data.category || 'products'} for sale in Nigeria on Selify, the best online marketplace.`,
        'url': window.location.href
      };
      break;
      
    case 'organization':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'Selify',
        'url': 'https://selify.netlify.app/',
        'logo': 'https://res.cloudinary.com/dqqycsgmn/image/upload/v1747912623/selify_fav_icon_kejjeh.jpg',
        'description': 'Nigeria\'s leading online marketplace for buying and selling anything.',
        'sameAs': [
          'https://web.facebook.com/profile.php?id=61576224207433',
          'https://x.com/selify16553',
          'https://www.instagram.com/selify_nigeria/'
        ]
      };
      break;
  }
  
  if (structuredData) {
    return `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`;
  }
  
  return null;
}

/**
 * Injects structured data into the document head
 * @param {string} pageType - The type of page
 * @param {Object} data - The data to use for the structured data
 */
export function injectStructuredData(pageType, data = {}) {
  // Remove any existing structured data with the same ID
  const existingScript = document.getElementById(`structured-data-${pageType}`);
  if (existingScript) {
    existingScript.remove();
  }
  
  const structuredDataHtml = generateStructuredData(pageType, data);
  if (structuredDataHtml) {
    const scriptElement = document.createElement('div');
    scriptElement.innerHTML = structuredDataHtml;
    scriptElement.firstChild.id = `structured-data-${pageType}`;
    document.head.appendChild(scriptElement.firstChild);
  }
}
