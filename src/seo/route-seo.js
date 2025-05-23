/**
 * Selify Route SEO Configuration
 * 
 * This file contains route-specific SEO configurations and middleware
 * to automatically apply meta tags based on the current route.
 */

import { updateMetaTags, injectStructuredData } from './meta-tags';

// Route SEO Configuration Map
export const routeSeoConfig = {
  '/': {
    pageName: 'home',
    structuredData: 'home'
  },
  '/login': {
    pageName: 'login'
  },
  '/register': {
    pageName: 'register'
  },
  '/listings': {
    pageName: 'listings',
    structuredData: 'category',
    getData: (route) => ({
      category: route.query.category || 'All Items'
    })
  },
  '/browse': {
    pageName: 'listings',
    structuredData: 'category',
    getData: (route) => ({
      category: route.query.category || 'All Items'
    })
  },
  '/listings/:id': {
    pageName: 'listingDetail',
    structuredData: 'product',
    dynamicData: true,
    getData: (route, store) => {
      // Attempt to get listing data from store or component
      const listingId = route.params.id;
      // This is a placeholder - in a real implementation, you would get this from your data store
      // For example: const listing = store.getters['listings/getListingById'](listingId);
      return {
        name: `Item ${listingId}`, // Replace with actual item data
        description: 'Product description will be dynamically populated',
        price: '0',
        imageUrl: '', // Will be populated with actual data
        sellerName: 'Seller Name'
      };
    }
  },
  '/profile': {
    pageName: 'profile'
  },
  '/chat': {
    pageName: 'chat'
  },
  '/chat/:id': {
    pageName: 'chat'
  },
  '/subscription': {
    pageName: 'subscription'
  },
  '/payment-success': {
    pageName: 'paymentSuccess'
  },
  '/forgot-password': {
    pageName: 'forgotPassword'
  }
};

/**
 * Router beforeEach middleware that applies SEO meta tags for each route
 * @param {Object} to - Target route
 * @param {Object} from - Current route
 * @param {Function} next - Navigation callback
 */
export function seoRouterMiddleware(to, from, next) {
  // Find the matching route configuration
  let matchedConfig = routeSeoConfig[to.path];
  
  // If no exact match, try to match routes with params
  if (!matchedConfig) {
    const routeKeys = Object.keys(routeSeoConfig);
    for (const routePattern of routeKeys) {
      if (routePattern.includes(':') && routeMatchesPattern(to.path, routePattern)) {
        matchedConfig = routeSeoConfig[routePattern];
        break;
      }
    }
  }
  
  // Apply SEO tags if we have a configuration for this route
  if (matchedConfig) {
    // Get any dynamic data if needed
    let seoData = {};
    if (matchedConfig.getData) {
      try {
        // In a real app, you might pass your Vuex store here
        seoData = matchedConfig.getData(to, null);
      } catch (error) {
        console.error('Error getting SEO data:', error);
      }
    }
    
    // Update meta tags
    updateMetaTags(matchedConfig.pageName, seoData);
    
    // Inject structured data if specified
    if (matchedConfig.structuredData) {
      injectStructuredData(matchedConfig.structuredData, seoData);
    }
  }
  
  next();
}

/**
 * Checks if a path matches a route pattern with parameters
 * @param {string} path - The actual route path
 * @param {string} pattern - The route pattern with params
 * @returns {boolean} Whether the path matches the pattern
 */
function routeMatchesPattern(path, pattern) {
  const pathSegments = path.split('/').filter(segment => segment);
  const patternSegments = pattern.split('/').filter(segment => segment);
  
  if (pathSegments.length !== patternSegments.length) {
    return false;
  }
  
  for (let i = 0; i < pathSegments.length; i++) {
    if (patternSegments[i].startsWith(':')) {
      // This is a parameter, it matches any value
      continue;
    }
    
    if (pathSegments[i] !== patternSegments[i]) {
      return false;
    }
  }
  
  return true;
}

/**
 * Creates Vue Router beforeEach hook for SEO
 * @param {Object} router - Vue Router instance
 */
export function setupSeoRouterGuard(router) {
  router.beforeEach(seoRouterMiddleware);
}

// Additional export for organization schema
export function injectOrganizationSchema() {
  injectStructuredData('organization');
}
