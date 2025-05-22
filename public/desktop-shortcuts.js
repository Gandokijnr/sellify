// Desktop-specific shortcuts and features for the Selify PWA
// This file is loaded only when the app is installed on desktop

// Check if the app is running as an installed PWA
const isInstalledPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone || 
         document.referrer.includes('android-app://');
};

// Register keyboard shortcuts for desktop users
const registerKeyboardShortcuts = () => {
  if (!isInstalledPWA()) return;
  
  document.addEventListener('keydown', (event) => {
    // Ctrl+F or Command+F for search
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      event.preventDefault();
      const searchInput = document.querySelector('input[type="search"]') || 
                          document.querySelector('input[placeholder*="search" i]') ||
                          document.querySelector('input[placeholder*="find" i]');
      if (searchInput) {
        searchInput.focus();
      }
    }
    
    // Ctrl+H or Command+H for home
    if ((event.ctrlKey || event.metaKey) && event.key === 'h') {
      event.preventDefault();
      window.location.href = '/';
    }
    
    // Ctrl+M or Command+M for messages
    if ((event.ctrlKey || event.metaKey) && event.key === 'm') {
      event.preventDefault();
      window.location.href = '/chat';
    }
    
    // Ctrl+P or Command+P for profile
    if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
      event.preventDefault();
      window.location.href = '/profile';
    }
  });
};

// Create desktop notification functionality
const setupDesktopNotifications = () => {
  if (!isInstalledPWA() || !('Notification' in window)) return;
  
  // Request notification permission if not already granted
  if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
  
  // Function to show a notification
  window.showDesktopNotification = (title, options) => {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: 'https://res.cloudinary.com/dqqycsgmn/image/upload/b_rgb:FFFFFF/e_improve,e_sharpen/v1747912623/selify_fav_icon_kejjeh.png',
        ...options
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
        if (options.url) {
          window.location.href = options.url;
        }
      };
      
      return notification;
    }
  };
};

// Add desktop-specific UI enhancements
const enhanceDesktopUI = () => {
  if (!isInstalledPWA()) return;
  
  // Add a class to the body for desktop-specific CSS
  document.body.classList.add('desktop-pwa');
  
  // Add hover effects for desktop users
  const style = document.createElement('style');
  style.textContent = `
    .desktop-pwa .hover-effect {
      transition: transform 0.2s ease-in-out;
    }
    .desktop-pwa .hover-effect:hover {
      transform: translateY(-3px);
      box-shadow: 0 5px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
  `;
  document.head.appendChild(style);
  
  // Add tooltips for desktop users
  document.querySelectorAll('[title]').forEach(element => {
    element.classList.add('hover-effect');
  });
};

// Initialize desktop-specific features
document.addEventListener('DOMContentLoaded', () => {
  if (window.matchMedia('(min-width: 768px)').matches) {
    registerKeyboardShortcuts();
    setupDesktopNotifications();
    enhanceDesktopUI();
    
    console.log('Selify: Desktop-specific features initialized');
  }
});

// Listen for installation on desktop
window.addEventListener('appinstalled', (event) => {
  console.log('Selify: Installed on desktop');
  
  // Show welcome message with keyboard shortcuts
  if (window.showDesktopNotification) {
    window.showDesktopNotification('Welcome to Selify!', {
      body: 'Tip: Use Ctrl+F to search, Ctrl+H for home, Ctrl+M for messages',
      url: '/'
    });
  }
});
