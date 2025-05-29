# Selify Firebase Functions

This directory contains Firebase Cloud Functions for the Selify marketplace app, including AI-powered image recognition using Google's Gemini API.

## Setup and Deployment

To deploy these functions to your Firebase project, follow these steps:

1. **Install Firebase CLI** (if not already installed):
   ```
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```
   firebase login
   ```

3. **Initialize Firebase Functions** (if not already initialized):
   ```
   firebase init functions
   ```
   Select your Firebase project when prompted.

4. **Install Dependencies**:
   ```
   cd functions
   npm install
   ```

5. **Set up Gemini API Key**:
   - Go to https://ai.google.dev/ and create a Gemini API key
   - Add it to your Firebase environment variables:
     ```
     firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY"
     ```

6. **Deploy Functions**:
   ```
   firebase deploy --only functions
   ```

## Available Functions

### analyzeProductImage

This function analyzes product images using Google's Gemini Pro Vision API and extracts product details like:
- Title
- Brand
- Model
- Condition
- Category information
- Price estimation
- Color
- Other specifications

### Usage

This function is called from the client-side when a user uploads a product image in the listing creation flow.

## Requirements

- Node.js 22 or higher
- Firebase project with Blaze (pay-as-you-go) plan
- Gemini API key (available with a free tier)
- Firebase CLI installed globally
