import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { auth } from "@/firebase";
import "./assets/main.css";
import "animate.css";
import SelifyLoader from "@/components/common/SelifyLoader.vue"; // Adjust path as needed

// Import custom directives
import vImgDimensions from "./directives/v-img-dimensions.js";

import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

// Import SEO module
import SEO from "@/seo";
import { setupSeoRouterGuard, injectOrganizationSchema } from "@/seo";

// Manual service worker registration with update handling
let refreshing = false;
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Register the service worker
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered successfully:', registration.scope);
        
        // Check for updates immediately on page load
        registration.update();
        
        // Set up periodic checks for updates (every hour)
        setInterval(() => {
          registration.update();
          console.log('Checking for service worker updates...');
        }, 60 * 60 * 1000);
        
        // Listen for updates waiting to be installed
        registration.addEventListener('updatefound', () => {
          // Get the installing worker
          const newWorker = registration.installing;
          
          // Listen for state changes
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version is ready to take over
              console.log('New version available!');
              // Trigger a custom event that the app can listen for
              window.dispatchEvent(new CustomEvent('appUpdateAvailable'));
            }
          });
        });
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
      
    // Listen for controller change to refresh the page
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        console.log('New service worker activated, reloading for fresh content...');
        window.location.reload();
      }
    });
    
    // Listen for messages from the service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
        console.log(`Update available! New version: ${event.data.version}`);
        window.dispatchEvent(new CustomEvent('appUpdateAvailable', { 
          detail: { version: event.data.version } 
        }));
      }
    });
  });
}

// Create the app
const app = createApp(App);

// Initialize Toast
app.use(Toast, {
  timeout: 10000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: true,
  closeButton: "button",
  icon: true,
  rtl: false,
});

// Initialize Pinia FIRST
const pinia = createPinia();
app.use(pinia);

// THEN access the store
import { useAuthStore } from "@/stores/auth";
const authStore = useAuthStore();
authStore.initAuth();

// Register router
app.use(router);
app.component("SelifyLoader", SelifyLoader);

// Setup SEO
setupSeoRouterGuard(router);

// Inject organization schema after app is mounted
injectOrganizationSchema();

// Register global directives
app.directive('img-dimensions', vImgDimensions);

// Mount the app
app.mount("#app");
