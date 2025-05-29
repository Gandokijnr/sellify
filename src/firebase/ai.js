// src/firebase/ai.js
// AI services for product descriptions and image recognition
// This implementation uses TensorFlow for image recognition

import axios from 'axios';
// Only import Firebase functions when explicitly using them
// import { getFunctions, httpsCallable } from 'firebase/functions';
// import { db } from '@/firebase';

/**
 * This service provides AI-powered description generation and image recognition
 * for product listings
 */

/**
 * Generate a description for a listing based on its details
 * @param {Object} listingDetails - The listing details to generate a description from
 * @returns {Promise<string>} - The generated description
 */
export async function generateListingDescription(listingDetails) {
  try {
    // Extract details from the listing
    const { title, brand, model, condition, specifications = '', features = [], tone = '' } = listingDetails;
    
    // Combine the features into a single string if they exist
    const featuresText = features.length > 0 
      ? `Key features include: ${features.join(', ')}.` 
      : '';
    
    // Available tones for variety
    const tones = [
      'professional', // Default formal business tone
      'enthusiastic', // Excited and energetic
      'casual',       // Friendly and conversational
      'technical',    // Detailed and specification-focused
      'luxurious',    // Premium, high-end feel
      'minimalist'    // Simple and straightforward
    ];
    
    // Select a tone - either use the one provided or pick a random one
    const selectedTone = tone && tones.includes(tone) ? tone : tones[Math.floor(Math.random() * tones.length)];
    
    console.log(`Generating ${selectedTone} description for: ${title}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Start with a different opener based on the selected tone
    let description = '';
    
    // Create the description intro based on tone
    switch (selectedTone) {
      case 'professional':
        if (brand && model) {
          description = `Presenting the ${condition} ${brand} ${model}, a reliable choice for discerning customers. `;
        } else {
          description = `We are pleased to offer this quality ${condition} ${title}. `;
        }
        break;
        
      case 'enthusiastic':
        if (brand && model) {
          description = `WOW! Check out this AMAZING ${condition} ${brand} ${model}! You'll absolutely LOVE what this product can do for you! `;
        } else {
          description = `INCREDIBLE DEAL! This ${condition} ${title} is exactly what you've been searching for! `;
        }
        break;
        
      case 'casual':
        if (brand && model) {
          description = `Hey there! Looking for a great ${brand} ${model}? This ${condition} one is pretty awesome. `;
        } else {
          description = `So, here's the deal - this ${condition} ${title} is really cool and might be just what you need. `;
        }
        break;
        
      case 'technical':
        if (brand && model) {
          description = `${brand} ${model} (${condition}): Technical specification analysis reveals optimal performance metrics. `;
        } else {
          description = `Technical evaluation of this ${condition} ${title} indicates superior design parameters. `;
        }
        break;
        
      case 'luxurious':
        if (brand && model) {
          description = `Indulge in the refined elegance of this exquisite ${condition} ${brand} ${model}. `;
        } else {
          description = `Experience unparalleled sophistication with this distinguished ${condition} ${title}. `;
        }
        break;
        
      case 'minimalist':
        if (brand && model) {
          description = `${brand} ${model}. ${condition.charAt(0).toUpperCase() + condition.slice(1)}. Essential functionality. `;
        } else {
          description = `${title}. ${condition.charAt(0).toUpperCase() + condition.slice(1)}. Simple efficiency. `;
        }
        break;
    }
    
    // Add features to the description based on tone
    if (features.length > 0) {
      switch (selectedTone) {
        case 'professional':
          description += `This product features ${features.join(', ')}, ensuring a comprehensive solution for your needs. `;
          break;
        case 'enthusiastic':
          description += `It comes with INCREDIBLE features like ${features.join(', ')}! How AWESOME is that?! `;
          break;
        case 'casual':
          description += `It's got some nice stuff going for it - ${features.join(', ')} - pretty neat, right? `;
          break;
        case 'technical':
          description += `Technical specifications include: ${features.join('; ')}. Compatibility with industry standards confirmed. `;
          break;
        case 'luxurious':
          description += `Meticulously crafted with premium attributes including ${features.join(', ')}, exemplifying uncompromising quality. `;
          break;
        case 'minimalist':
          description += `Features: ${features.join('. ')}. `;
          break;
      }
    }
    
    // Add condition-specific content based on tone
    if (condition === 'used') {
      switch (selectedTone) {
        case 'professional':
          description += `This pre-owned item has been maintained to high standards and shows only minimal signs of previous use. `;
          break;
        case 'enthusiastic':
          description += `You'd barely know it's used! It's in FANTASTIC condition and works PERFECTLY! `;
          break;
        case 'casual':
          description += `It's been used a bit, but honestly, it's still in really good shape and works just fine. `;
          break;
        case 'technical':
          description += `Analysis of wear patterns indicates minimal usage degradation. Functionality tests demonstrate 98.7% performance retention. `;
          break;
        case 'luxurious':
          description += `Previously cherished yet impeccably preserved, this item retains its distinguished character and flawless functionality. `;
          break;
        case 'minimalist':
          description += `Minimal wear. Fully functional. `;
          break;
      }
    } else if (condition === 'new') {
      switch (selectedTone) {
        case 'professional':
          description += `This brand new item comes with full manufacturer warranty and all original packaging and accessories. `;
          break;
        case 'enthusiastic':
          description += `BRAND NEW and NEVER USED! Still has that amazing new product smell! Complete with EVERYTHING in the box! `;
          break;
        case 'casual':
          description += `It's completely new - never been used. Everything that's supposed to be in the box is there. `;
          break;
        case 'technical':
          description += `Factory sealed unit. Zero usage hours. Complete accessory inventory confirmed. Warranty status: active. `;
          break;
        case 'luxurious':
          description += `Immaculate and pristine, this untouched masterpiece arrives complete with its original accoutrements, ready to provide an unparalleled first experience. `;
          break;
        case 'minimalist':
          description += `New. Unopened. Complete package. `;
          break;
      }
    } else if (condition === 'refurbished') {
      switch (selectedTone) {
        case 'professional':
          description += `This professionally refurbished item has been restored to like-new condition and tested to ensure optimal performance. `;
          break;
        case 'enthusiastic':
          description += `EXPERTLY REFURBISHED to be just like new! You'll be AMAZED at the quality and it works PERFECTLY! `;
          break;
        case 'casual':
          description += `It's been professionally fixed up and works like new. Really good deal if you ask me. `;
          break;
        case 'technical':
          description += `Comprehensive refurbishment protocol completed. All systems recalibrated to manufacturer specifications. Quality assurance verification passed. `;
          break;
        case 'luxurious':
          description += `Meticulously restored by master technicians, this refurbished piece has been artfully returned to its original splendor and performance standards. `;
          break;
        case 'minimalist':
          description += `Expertly restored. Thoroughly tested. Reliable performance. `;
          break;
      }
    }
    
    // Closing statement based on tone
    switch (selectedTone) {
      case 'professional':
        description += `We recommend this product for its excellent quality-to-value ratio and reliable performance.`;
        break;
      case 'enthusiastic':
        description += `Don't miss out on this INCREDIBLE opportunity - it'll be gone before you know it! ACT FAST!`;
        break;
      case 'casual':
        description += `So yeah, if you're looking for something like this, you should definitely check it out. It's a pretty good deal.`;
        break;
      case 'technical':
        description += `Conclusion: acquisition of this unit represents optimal resource allocation for consumers requiring this functionality profile.`;
        break;
      case 'luxurious':
        description += `Discerning connoisseurs will appreciate the refined craftsmanship and enduring value this exceptional item brings to their collection.`;
        break;
      case 'minimalist':
        description += `Quality choice. Fair price. Recommended.`;
        break;
    }
    
    return description;
  } catch (error) {
    console.error("Error generating description:", error);
    return "An error occurred while generating the description. Please try writing your own.";
  }
}

/**
 * Legacy method to analyze a product image using Google's Gemini API via Firebase Functions
 * This requires a paid API key and is kept for reference
 * IMPORTANT: This method requires Firebase initialization to work properly
 * @param {string} imageBase64 - The base64 encoded image data
 * @returns {Promise<Object>} - Product details extracted from the image
 */
export async function analyzeProductImageWithGemini(imageBase64) {
  try {
    // This function is commented out as it requires Firebase initialization
    // Uncomment and use when Firebase is properly initialized
    
    console.log('Gemini API analysis is disabled in this version.');
    throw new Error('Gemini API is not available in the free version');
    
    /*
    console.log('Analyzing product image with Gemini API...');
    
    // Need to import these first
    const { getFunctions, httpsCallable } = await import('firebase/functions');
    
    // Remove the data:image/jpeg;base64, prefix if present
    const base64Data = imageBase64.includes('base64,') 
      ? imageBase64.split('base64,')[1] 
      : imageBase64;
    
    // Create a callable function reference
    const functions = getFunctions();
    const analyzeImage = httpsCallable(functions, 'analyzeProductImage');
    
    // Call the Cloud Function with the image data
    const result = await analyzeImage({ imageBase64: base64Data });
    
    // The result comes back as data property from callable functions
    const productData = result.data;
    
    console.log('Product data extracted:', productData);
    return productData;
    */
  } catch (error) {
    console.error('Error analyzing product image:', error);
    return { error: error.message || 'Failed to analyze image' };
  }
}

/**
 * Analyze a product image using TensorFlow.js (client-side, free)
 * @param {string} imageBase64 - The base64 encoded image data
 * @returns {Promise<Object>} - Product details extracted from the image
 */
export async function analyzeProductImageWithTensorflow(imageBase64) {
  try {
    console.log('Analyzing product image with TensorFlow.js...');
    
    // Dynamically import TensorFlow.js and the MobileNet model to reduce initial load time
    const tf = await import('@tensorflow/tfjs');
    const mobilenet = await import('@tensorflow-models/mobilenet');
    
    // Create an image element to feed into the model
    const img = new Image();
    img.src = imageBase64;
    
    // Wait for the image to load
    await new Promise(resolve => {
      img.onload = resolve;
    });
    
    console.log('Image loaded, running MobileNet classification...');
    
    // Load the MobileNet model
    const model = await mobilenet.load();
    
    // Classify the image
    const predictions = await model.classify(img);
    
    console.log('TensorFlow classification results:', predictions);
    
    // Process predictions to extract product information
    const topPrediction = predictions[0];
    const allClasses = predictions.map(p => p.className.toLowerCase());
    
    // Extract potential categories based on predictions
    const categories = extractCategories(allClasses);
    
    // Extract potential colors
    const colors = extractColors(allClasses, img);
    
    // Generate a basic product description
    const description = generateDescription(topPrediction, categories, colors);
    
    // Prepare the product data object
    const productData = {
      title: formatTitle(topPrediction.className),
      category: categories.mainCategory || 'Other',
      subCategory: categories.subCategory || '',
      color: colors.dominant || '',
      confidence: topPrediction.probability.toFixed(2),
      description: description,
      allPredictions: predictions.map(p => ({
        className: p.className,
        probability: p.probability.toFixed(4)
      }))
    };
    
    console.log('Product data extracted with TensorFlow:', productData);
    return productData;
  } catch (error) {
    console.error('Error analyzing product image with TensorFlow:', error);
    return { 
      error: error.message || 'Failed to analyze image',
      fallbackTitle: 'Unidentified Product',
      fallbackCategory: 'Other',
      description: 'This appears to be a product that our system could not automatically identify. Please provide details manually.'
    };
  }
}

/**
 * The main function to analyze product images
 * This is now set to use the TensorFlow implementation by default
 * @param {string} imageBase64 - The base64 encoded image data
 * @returns {Promise<Object>} - Product details extracted from the image
 */
export async function analyzeProductImage(imageBase64) {
  // Don't use Firebase functions, only use the client-side TensorFlow implementation
  try {
    return await analyzeProductImageWithTensorflow(imageBase64);
  } catch (error) {
    console.error('Error in analyzeProductImage:', error);
    return { 
      error: error.message || 'Failed to analyze image',
      fallbackTitle: 'Unidentified Product',
      fallbackCategory: 'Other',
      description: 'This appears to be a product that our system could not automatically identify. Please provide details manually.'
    };
  }
}

/**
 * Format the raw class name into a proper title
 * @param {string} className - The raw class name from MobileNet
 * @returns {string} - Properly formatted title
 */
function formatTitle(className) {
  // Clean up the class name for use as a title
  // Remove any text in parentheses
  let title = className.replace(/\(.*?\)/g, '').trim();
  
  // Capitalize first letter of each word
  title = title.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
    
  return title;
}

/**
 * Extract category information from prediction classes
 * @param {Array<string>} classes - Array of class names from predictions
 * @returns {Object} - Object containing category information
 */
function extractCategories(classes) {
  // Define category mappings (this is a simplified version)
  const categoryMappings = {
    // Electronics
    electronics: ['phone', 'smartphone', 'laptop', 'computer', 'monitor', 'television', 'tv', 'headphone', 'speaker'],
    phones: ['phone', 'smartphone', 'iphone', 'mobile'],
    computers: ['laptop', 'computer', 'notebook', 'desktop', 'monitor'],
    
    // Clothing
    clothing: ['shirt', 'jacket', 'coat', 'sweater', 'dress', 'pants', 'jeans', 'shoe', 'sneaker', 'boot', 'hat', 'cap'],
    tops: ['shirt', 'jacket', 'coat', 'sweater', 'blouse', 't-shirt'],
    bottoms: ['pants', 'jeans', 'shorts', 'skirt'],
    footwear: ['shoe', 'sneaker', 'boot', 'sandal'],
    
    // Home goods
    homeGoods: ['furniture', 'chair', 'table', 'desk', 'sofa', 'couch', 'bed', 'lamp', 'cabinet'],
    furniture: ['chair', 'table', 'desk', 'sofa', 'couch', 'bed', 'bookcase', 'shelf'],
    
    // Sports & Outdoors
    sports: ['ball', 'racket', 'bicycle', 'bike', 'tent', 'backpack'],
    
    // Beauty & Personal Care
    beauty: ['perfume', 'cosmetic', 'lipstick', 'makeup'],
    
    // Toys & Games
    toys: ['toy', 'game', 'puzzle', 'doll', 'action figure']
  };
  
  // Find main category and subcategory
  let mainCategory = 'Other';
  let subCategory = '';
  
  // Check each class against our category mappings
  for (const className of classes) {
    // Check for main categories
    for (const [category, keywords] of Object.entries(categoryMappings)) {
      if (keywords.some(keyword => className.includes(keyword))) {
        // Skip if this is a subcategory key
        if (['phones', 'computers', 'tops', 'bottoms', 'footwear', 'furniture'].includes(category)) {
          continue;
        }
        
        mainCategory = category.charAt(0).toUpperCase() + category.slice(1);
        break;
      }
    }
    
    // Check for subcategories
    if (mainCategory === 'Electronics') {
      if (categoryMappings.phones.some(keyword => className.includes(keyword))) {
        subCategory = 'Phones';
      } else if (categoryMappings.computers.some(keyword => className.includes(keyword))) {
        subCategory = 'Computers';
      }
    } else if (mainCategory === 'Clothing') {
      if (categoryMappings.tops.some(keyword => className.includes(keyword))) {
        subCategory = 'Tops';
      } else if (categoryMappings.bottoms.some(keyword => className.includes(keyword))) {
        subCategory = 'Bottoms';
      } else if (categoryMappings.footwear.some(keyword => className.includes(keyword))) {
        subCategory = 'Footwear';
      }
    } else if (mainCategory === 'HomeGoods') {
      if (categoryMappings.furniture.some(keyword => className.includes(keyword))) {
        subCategory = 'Furniture';
      }
    }
  }
  
  return { mainCategory, subCategory };
}

/**
 * Extract color information from the image and predictions
 * This is a simplified version that looks for color names in the predictions
 * and does a very basic dominant color extraction
 * @param {Array<string>} classes - Array of class names from predictions
 * @param {HTMLImageElement} img - The image element
 * @returns {Object} - Object containing color information
 */
function extractColors(classes, img) {
  // List of common colors to check for in the predictions
  const commonColors = [
    'black', 'white', 'red', 'green', 'blue', 'yellow', 'purple', 
    'orange', 'pink', 'brown', 'gray', 'silver', 'gold'
  ];
  
  // Check predictions for color mentions
  let mentionedColors = [];
  for (const className of classes) {
    for (const color of commonColors) {
      if (className.includes(color)) {
        mentionedColors.push(color);
      }
    }
  }
  
  // Get the dominant color using a simplified approach
  // For a production app, consider using a library like color-thief
  let dominantColor = '';
  
  // If a color was mentioned in the predictions, use the first one
  if (mentionedColors.length > 0) {
    dominantColor = mentionedColors[0].charAt(0).toUpperCase() + mentionedColors[0].slice(1);
  } else {
    // Default fallback - simplified version 
    // In a real app, you'd want to use a proper color analysis library
    dominantColor = 'Multi-colored';
  }
  
  return {
    dominant: dominantColor,
    mentioned: mentionedColors
  };
}

/**
 * Generate a simple product description based on the analysis
 * @param {Object} topPrediction - The top prediction from the model
 * @param {Object} categories - The extracted categories
 * @param {Object} colors - The extracted colors
 * @returns {string} - A generated description
 */
function generateDescription(topPrediction, categories, colors) {
  const confidence = (topPrediction.probability * 100).toFixed(0);
  const title = formatTitle(topPrediction.className);
  const category = categories.mainCategory;
  const subCategory = categories.subCategory;
  const color = colors.dominant || 'various colors';
  
  // Generate a simple description based on available information
  let description = `This appears to be a ${color.toLowerCase()} ${title.toLowerCase()}`;
  
  if (category && category !== 'Other') {
    description += ` in the ${category.toLowerCase()} category`;
    
    if (subCategory) {
      description += `, specifically ${subCategory.toLowerCase()}`;
    }
  }
  
  description += `. The item is in good condition and would be a great addition to your collection.`;
  
  // Add confidence level context if it's low
  if (confidence < 50) {
    description += ` Note: The system is less certain about this identification, so please review and correct the details as needed.`;
  }
  
  return description;
}
