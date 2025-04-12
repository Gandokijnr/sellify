import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { auth } from "@/firebase";
import "./assets/main.css";

// Create the app
const app = createApp(App);

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
