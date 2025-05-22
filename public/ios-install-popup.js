// iOS-specific installation popup for Selify
// This script detects iOS devices and shows a custom popup guiding users to add the app to home screen

(() => {
  // Check if the device is running iOS
  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  };

  // Check if the app is already installed (in standalone mode)
  const isStandalone = () => {
    return window.navigator.standalone === true;
  };

  // Check if we should show the installation popup
  const shouldShowInstallPopup = () => {
    // Only show on iOS devices that aren't in standalone mode
    if (!isIOS() || isStandalone()) return false;
    
    // Check if user has dismissed the popup recently (within 7 days)
    const lastDismissed = localStorage.getItem('selify_ios_install_dismissed');
    if (lastDismissed) {
      const dismissedTime = parseInt(lastDismissed, 10);
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < sevenDaysInMs) {
        return false;
      }
    }
    
    return true;
  };

  // Create and show the installation popup
  const showIOSInstallPopup = () => {
    // Create popup container
    const popup = document.createElement('div');
    popup.id = 'ios-install-popup';
    popup.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: white;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
      padding: 16px;
      z-index: 9999;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
      transform: translateY(100%);
      transition: transform 0.3s ease-in-out;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    `;

    // Create popup content
    popup.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <img src="/pwa-192x192.png" alt="Selify" style="width: 42px; height: 42px; margin-right: 12px; border-radius: 8px;">
        <div>
          <h3 style="margin: 0; font-size: 18px; color: #0D9488;">Install Selify App</h3>
          <p style="margin: 4px 0 0; font-size: 14px; color: #666;">Add to your Home Screen for the best experience</p>
        </div>
        <button id="close-install-popup" style="margin-left: auto; background: none; border: none; font-size: 20px; color: #666; cursor: pointer;">×</button>
      </div>
      <div style="background-color: #f5f5f5; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
        <p style="margin: 0; font-size: 14px; line-height: 1.4;">
          1. Tap the <strong>Share</strong> button <span style="display: inline-block; width: 20px; height: 20px; background-color: #0D9488; color: white; text-align: center; line-height: 20px; border-radius: 4px; font-size: 14px;">↑</span> at the bottom of your screen<br>
          2. Scroll and tap <strong>"Add to Home Screen"</strong><br>
          3. Tap <strong>"Add"</strong> in the top right corner
        </p>
      </div>
      <button id="install-later" style="width: 100%; padding: 12px; background-color: #0D9488; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 500; cursor: pointer;">Got it</button>
    `;

    // Add popup to the document
    document.body.appendChild(popup);

    // Show the popup with animation
    setTimeout(() => {
      popup.style.transform = 'translateY(0)';
    }, 100);

    // Handle close button click
    document.getElementById('close-install-popup').addEventListener('click', dismissPopup);
    
    // Handle "Got it" button click
    document.getElementById('install-later').addEventListener('click', dismissPopup);

    // Function to dismiss the popup
    function dismissPopup() {
      popup.style.transform = 'translateY(100%)';
      
      // Store dismissal time
      localStorage.setItem('selify_ios_install_dismissed', Date.now().toString());
      
      // Remove popup after animation completes
      setTimeout(() => {
        if (popup.parentNode) {
          popup.parentNode.removeChild(popup);
        }
      }, 300);
    }
  };

  // Initialize the popup after page load
  document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to ensure the page is fully loaded and user has had a chance to see the content
    setTimeout(() => {
      if (shouldShowInstallPopup()) {
        showIOSInstallPopup();
      }
    }, 3000); // Show after 3 seconds
  });
})();
