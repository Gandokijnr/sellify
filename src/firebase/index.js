// src/firebase/auth.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBUxIQ1h0-qdqkjSouFqUbBAMD6yfswQDc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sellify-da8ad.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sellify-da8ad",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sellify-da8ad.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "706676855832",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:706676855832:web:6756bffd6a3beefb641f6d",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .then(() => {
    console.log("Firestore persistence enabled");
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.warn("Multiple tabs open, persistence only enabled in one tab at a time");
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the features required to enable persistence
      console.warn("The current browser doesn't support offline persistence");
    } else {
      console.error("Firestore persistence error:", err);
    }
  });

export { auth, db, storage };