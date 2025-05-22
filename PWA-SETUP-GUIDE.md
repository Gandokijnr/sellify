# Progressive Web App (PWA) Setup Guide for Selify

## Overview
This guide explains how to complete the PWA setup for Selify, allowing users to install it as an app on their devices.

## Required Icon Files
For the PWA to work properly, you'll need to create the following icon files in the `public` directory:

1. `pwa-192x192.png` (192x192 pixels)
2. `pwa-512x512.png` (512x512 pixels)
3. `apple-touch-icon.png` (180x180 pixels)
4. `masked-icon.svg` (SVG icon for Safari)

You can create these icons from your existing favicon using tools like:
- Adobe Photoshop
- Sketch
- Figma
- Online tools like [RealFaviconGenerator](https://realfavicongenerator.net/)

Use your brand's teal color (#0D9488) for consistency.

## Installation Process
- On Android/Chrome: Users will see an install button at the bottom of the screen when the app meets installation criteria
- On iOS/Safari: Users will need to use the "Add to Home Screen" option from the share menu

## Testing Your PWA
After adding the icon files:

1. Build the app:
```
npm run build
```

2. Preview the production build:
```
npm run preview
```

3. Check for PWA functionality:
   - Visit the preview URL in Chrome or Edge
   - Look for the install button in the address bar or the custom install button at the bottom of the screen
   - Test offline functionality by turning off network access in dev tools

## PWA Features Enabled
- Installable on mobile and desktop devices
- Works offline with cached assets
- Automatic updates when new versions are deployed
- Native-like experience with full-screen mode
- Fast loading with pre-cached resources

## Additional PWA Enhancements (Future)
- Background sync for offline message sending
- Push notifications for new messages
- Advanced caching strategies for listing images
- Share target API for easy sharing to the app
