// src/stores/auth.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  getAuth,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const token = ref(null);
  const isLoading = ref(true);
  const error = ref(null);
  let authUnsubscribe = null;

  // Computed properties
  const isAuthenticated = computed(() => !!user.value);
  const userInitials = computed(() => {
    if (!user.value?.displayName) return "U";
    const names = user.value.displayName.split(" ");
    return names
      .map((name) => name[0])
      .join("")
      .toUpperCase();
  });

  // Initialize auth state from Firebase
  const initAuth = () => {
    const auth = getAuth();
    const db = getFirestore();

    isLoading.value = true;
    error.value = null;

    return new Promise((resolve) => {
      // Clean up previous listener if it exists
      if (authUnsubscribe) {
        authUnsubscribe();
      }

      authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
          if (firebaseUser) {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

            user.value = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName:
                firebaseUser.displayName ||
                firebaseUser.email?.split("@")[0] ||
                "User",
              photoURL: firebaseUser.photoURL || null,
              ...(userDoc.exists() ? userDoc.data() : {}),
            };

            token.value = await firebaseUser.getIdToken();
          } else {
            user.value = null;
            token.value = null;
          }
        } catch (err) {
          console.error("Auth error:", err);
          error.value = err.message;
          user.value = null;
          token.value = null;
        } finally {
          isLoading.value = false;
          resolve();
        }
      });
    });
  };

  // Sign out user
  const logout = async () => {
    const auth = getAuth();
    try {
      isLoading.value = true;
      await firebaseSignOut(auth);
      alert("Successfully logged out");
      user.value = null;
    } catch (err) {
      console.error("Logout error:", err);
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    // State
    user,
    token,
    isLoading,
    error,

    // Computed
    isAuthenticated,
    userInitials,

    // Actions
    initAuth,
    logout,
  };
});
