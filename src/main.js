import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { auth } from "@/firebase";
import "./assets/main.css";
import "animate.css";
import SelifyLoader from "@/components/common/SelifyLoader.vue"; // Adjust path as needed

import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

// Manual service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered successfully:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
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

// Mount the app
app.mount("#app");
