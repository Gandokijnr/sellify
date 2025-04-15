import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { auth } from "@/firebase";
import "./assets/main.css";
import 'animate.css';

import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

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

// Mount the app
app.mount("#app");
