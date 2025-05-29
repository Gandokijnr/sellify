const functions = require('firebase-functions');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const admin = require('firebase-admin');
const axios = require('axios');
const cors = require('cors')({ origin: true });

// Initialize Firebase Admin
admin.initializeApp();

// Initialize the Google Generative AI with your API key (stored in Firebase environment config)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// The Gemini Pro Vision model for multimodal (text + image) input
const MODEL_NAME = 'gemini-pro-vision';

/**
 * Helper function to analyze product images using Google's Gemini model
 */
async function analyzeProductImageImpl(imageBase64) {
  try {
    console.log('Analyzing product image with Gemini API...');
    
    // Initialize the Gemini Pro Vision model
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    // Format the image for Gemini
    const imageData = {
      inlineData: {
        data: imageBase64,
        mimeType: 'image/jpeg'
      }
    };

    // Prepare the prompt for Gemini
    const prompt = `Analyze this product image and extract the following details in JSON format. 
    Include these fields only if you can identify them with reasonable confidence: 
    title, brand, model, condition (new/used), mainCategory, subCategory, 
    approxPrice (in Nigerian Naira), color, and any other relevant specifications 
    like storage capacity for electronics, size for clothing, etc. 
    Provide a very brief description of the item as well.
    IMPORTANT: Only respond with valid JSON. Do not include any explanatory text.`;

    // Send the request to Gemini API
    const result = await model.generateContent([
      prompt,
      imageData
    ]);

    // Process the response
    const response = await result.response;
    const responseText = response.text();
    
    // Extract and parse JSON from the response
    try {
      // Try to find JSON in the response text
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                         responseText.match(/```([\s\S]*?)```/) || 
                         [null, responseText];
      const jsonString = jsonMatch[1] || responseText;
      
      // Parse the extracted JSON
      const productData = JSON.parse(jsonString.trim());
      console.log('Product data extracted:', productData);
      return productData;
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('Raw AI response:', responseText);
      return { error: 'Could not parse product details from the image' };
    }
  } catch (error) {
    console.error('Error analyzing product image:', error);
    return { error: error.message || 'Failed to analyze image' };
  }
}

/**
 * Firebase Cloud Function to analyze product images using Google's Gemini model (Callable version)
 */
exports.analyzeProductImage = functions.https.onCall(async (data, context) => {
  try {
    // Check if the user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be signed in to use this feature.'
      );
    }

    // Extract the image data
    const { imageBase64 } = data;
    
    if (!imageBase64) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'The function must be called with an image in base64 format.'
      );
    }

    // Call the implementation function
    return await analyzeProductImageImpl(imageBase64);
    
  } catch (error) {
    console.error('Error in callable function:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Failed to analyze image'
    );
  }
});

/**
 * HTTP endpoint version of the same function (better for CORS in development)
 */
exports.analyzeProductImageHttp = functions.https.onRequest((req, res) => {
  // Enable CORS using the middleware
  cors(req, res, async () => {
    try {
      // Only allow POST requests
      if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
      }
      
      // Get the image data from the request body
      const { imageBase64 } = req.body;
      
      if (!imageBase64) {
        res.status(400).send({ error: 'No image data provided. Please include imageBase64 in the request body.' });
        return;
      }
      
      // Call the implementation function
      const result = await analyzeProductImageImpl(imageBase64);
      
      // Send the response
      res.status(200).send(result);
    } catch (error) {
      console.error('Error in HTTP function:', error);
      res.status(500).send({ error: error.message || 'Failed to analyze image' });
    }
  });
});
