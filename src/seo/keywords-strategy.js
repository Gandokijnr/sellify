/**
 * Selify SEO Keywords Strategy
 * 
 * This file contains keyword mappings for different pages and categories
 * to ensure consistent use of target keywords across the application.
 */

// Main site-wide keywords
export const siteWideKeywords = [
  'online marketplace Nigeria',
  'buy and sell Nigeria',
  'Selify marketplace',
  'Jiji alternative',
  'classified ads Nigeria',
  'online shopping Nigeria',
  'sell products online Nigeria',
  'buy products online Nigeria',
  'e-commerce platform Nigeria',
  'marketplace app Nigeria',
  'selify app',
  'selify Nigeria',
  'selify marketplace',
  'selify Nigeria app',
];

// Page-specific keywords
export const pageKeywords = {
  home: [
    'best online marketplace Nigeria',
    'buy and sell anything',
    'sell products fast',
    'find deals Nigeria',
    'online classifieds Nigeria'
  ],
  listings: [
    'marketplace listings Nigeria',
    'classified listings',
    'product listings Nigeria',
    'buy products Nigeria',
    'sell items Nigeria'
  ],
  register: [
    'sign up Selify',
    'create marketplace account',
    'sell online Nigeria account',
    'register to sell Nigeria',
    'marketplace registration'
  ],
  login: [
    'login Selify',
    'marketplace login',
    'seller login Nigeria',
    'buyer account Nigeria',
    'sign in marketplace'
  ],
  profile: [
    'seller profile Nigeria',
    'marketplace user profile',
    'Selify user account',
    'seller reputation Nigeria',
    'trusted seller Nigeria'
  ],
  chat: [
    'message sellers Nigeria',
    'chat with buyers',
    'safe marketplace messaging',
    'negotiate prices Nigeria',
    'contact sellers Nigeria'
  ],
  subscription: [
    'premium seller Nigeria',
    'marketplace subscription',
    'featured listings Nigeria',
    'promote items Nigeria',
    'boost sales Nigeria'
  ]
};

// Category-specific keywords
export const categoryKeywords = {
  electronics: [
    'buy electronics Nigeria',
    'used phones Nigeria',
    'cheap laptops Nigeria',
    'electronics marketplace',
    'gadgets for sale Nigeria'
  ],
  vehicles: [
    'cars for sale Nigeria',
    'used vehicles Nigeria',
    'buy cars online Nigeria',
    'sell your car Nigeria',
    'automobile marketplace Nigeria'
  ],
  fashion: [
    'clothes for sale Nigeria',
    'fashion marketplace Nigeria',
    'used clothing Nigeria',
    'buy shoes Nigeria',
    'fashion accessories Nigeria'
  ],
  property: [
    'real estate Nigeria',
    'houses for sale Nigeria',
    'rent apartment Nigeria',
    'property marketplace Nigeria',
    'land for sale Nigeria'
  ],
  services: [
    'services marketplace Nigeria',
    'hire freelancers Nigeria',
    'professional services Nigeria',
    'service providers Nigeria',
    'find local services'
  ],
  jobs: [
    'job listings Nigeria',
    'find employment Nigeria',
    'job marketplace Nigeria',
    'hiring Nigeria',
    'job search Nigeria'
  ]
};

// Long-tail keywords
export const longTailKeywords = [
  'how to sell products online in Nigeria',
  'best place to buy used phones in Nigeria',
  'cheap second-hand cars Lagos Nigeria',
  'where to sell electronics in Nigeria',
  'how to find apartments in Lagos Nigeria',
  'trusted online marketplace in Nigeria',
  'safest way to buy and sell online Nigeria',
  'how to promote items for sale in Nigeria',
  'best deals on used laptops in Nigeria',
  'where to find cheap furniture in Nigeria'
];

/**
 * Helper function to get combined keywords for a specific page
 * @param {string} pageName - The name of the page
 * @param {string} category - Optional category name
 * @returns {string} Comma-separated keywords
 */
export function getKeywordsForPage(pageName, category = null) {
  let keywords = [...siteWideKeywords];
  
  if (pageKeywords[pageName]) {
    keywords = keywords.concat(pageKeywords[pageName]);
  }
  
  if (category && categoryKeywords[category]) {
    keywords = keywords.concat(categoryKeywords[category]);
  }
  
  // Add some long-tail keywords for important pages
  if (['home', 'listings'].includes(pageName)) {
    keywords = keywords.concat(longTailKeywords.slice(0, 3));
  }
  
  return keywords.join(', ');
}

/**
 * Helper function to get titles for different pages
 * @param {string} pageName - The name of the page
 * @param {string} category - Optional category name
 * @param {string} itemName - Optional item name for listing details
 * @returns {string} SEO-optimized title
 */
export function getTitleForPage(pageName, category = null, itemName = null) {
  const baseTitle = 'Selify - Buy & Sell Anything in Nigeria';
  
  if (pageName === 'home') {
    return baseTitle + ' | Online Marketplace';
  }
  
  if (pageName === 'listings' && category) {
    return `Buy & Sell ${category.charAt(0).toUpperCase() + category.slice(1)} in Nigeria | Selify Marketplace`;
  }
  
  if (pageName === 'listingDetail' && itemName) {
    return `${itemName} for Sale in Nigeria | Selify Marketplace`;
  }
  
  const pageTitles = {
    login: 'Login to Your Account | Selify Marketplace Nigeria',
    register: 'Create an Account | Selify Marketplace Nigeria',
    profile: 'Your Seller Profile | Selify Marketplace Nigeria',
    chat: 'Messages & Chat | Selify Marketplace Nigeria',
    subscription: 'Premium Seller Plans | Selify Marketplace Nigeria'
  };
  
  return pageTitles[pageName] || baseTitle;
}

/**
 * Helper function to get descriptions for different pages
 * @param {string} pageName - The name of the page
 * @param {string} category - Optional category name
 * @param {string} itemDetails - Optional item details for listing pages
 * @returns {string} SEO-optimized description
 */
export function getDescriptionForPage(pageName, category = null, itemDetails = null) {
  const baseDescription = 'Nigeria\'s fastest growing online marketplace. Buy and sell phones, cars, electronics, fashion, properties and more. Safe, easy and free to use.';
  
  if (pageName === 'home') {
    return baseDescription;
  }
  
  if (pageName === 'listings' && category) {
    return `Find the best deals on ${category} in Nigeria. Buy and sell new or used ${category} safely on Selify, Nigeria's trusted online marketplace. Better than Jiji with verified sellers.`;
  }
  
  if (pageName === 'listingDetail' && itemDetails) {
    return `${itemDetails} - Available now on Selify, Nigeria's trusted online marketplace. Contact the seller directly and make a deal today.`;
  }
  
  const pageDescriptions = {
    login: 'Sign in to your Selify account to manage your listings, contact buyers, and keep track of your sales on Nigeria\'s fastest growing marketplace.',
    register: 'Create a free account on Selify to start buying and selling in Nigeria. Post listings, chat with sellers, and discover great deals today.',
    profile: 'Manage your Selify profile, view your listings, track your sales, and build your reputation as a trusted seller in Nigeria\'s best marketplace.',
    chat: 'Communicate safely with buyers and sellers through Selify\'s secure messaging system. Negotiate prices and arrange pickup or delivery.',
    subscription: 'Boost your sales with Selify premium plans. Get featured listings, priority placement, and more visibility for your products in Nigeria\'s marketplace.'
  };
  
  return pageDescriptions[pageName] || baseDescription;
}
