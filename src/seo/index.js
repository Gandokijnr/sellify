/**
 * Selify SEO Module
 * 
 * Main export file for all SEO-related functionality
 */

// Export all components from individual files
export * from './keywords-strategy';
export * from './meta-tags';
export * from './route-seo';

// Create a default export with the main functions for easier import
export default {
  // From keywords-strategy.js
  getKeywordsForPage: (pageName, category) => require('./keywords-strategy').getKeywordsForPage(pageName, category),
  getTitleForPage: (pageName, category, itemName) => require('./keywords-strategy').getTitleForPage(pageName, category, itemName),
  getDescriptionForPage: (pageName, category, itemDetails) => require('./keywords-strategy').getDescriptionForPage(pageName, category, itemDetails),
  
  // From meta-tags.js
  updateMetaTags: (pageName, options) => require('./meta-tags').updateMetaTags(pageName, options),
  generateStructuredData: (pageType, data) => require('./meta-tags').generateStructuredData(pageType, data),
  injectStructuredData: (pageType, data) => require('./meta-tags').injectStructuredData(pageType, data),
  
  // From route-seo.js
  setupSeoRouterGuard: (router) => require('./route-seo').setupSeoRouterGuard(router),
  injectOrganizationSchema: () => require('./route-seo').injectOrganizationSchema()
};
