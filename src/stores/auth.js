// src/stores/auth.js
import { defineStore } from "pinia";
import { ref, computed, onScopeDispose } from "vue";
import {
  getAuth,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const token = ref(null);
  const isLoading = ref(true);
  const error = ref(null);
  let authUnsubscribe = null;

  // Clean up listener when store is destroyed
  const cleanup = () => {
    if (authUnsubscribe) {
      authUnsubscribe();
      authUnsubscribe = null;
    }
  };

  onScopeDispose(cleanup);

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

    cleanup(); // Clean up previous listener
    isLoading.value = true;
    error.value = null;

    return new Promise((resolve) => {
      authUnsubscribe = onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          try {
            if (firebaseUser) {
              const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

              if (!userDoc.exists()) {
                throw new Error("User document not found in Firestore");
              }

              user.value = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName:
                  firebaseUser.displayName ||
                  userDoc.data().displayName ||
                  "User",
                photoURL:
                  firebaseUser.photoURL || userDoc.data().photoURL || null,
                ...userDoc.data(),
              };

              token.value = await firebaseUser.getIdToken();
            } else {
              user.value = null;
              token.value = null;
            }
          } catch (err) {
            console.error("Auth error:", err);
            error.value = err.message;
            if (err.message === "User document not found in Firestore") {
              // Special handling for missing user document
              await firebaseSignOut(auth);
            }
            user.value = null;
            token.value = null;
          } finally {
            isLoading.value = false;
            resolve();
          }
        },
        (err) => {
          console.error("Auth listener error:", err);
          error.value = err.message;
          isLoading.value = false;
          resolve();
        }
      );
    });
  };

  // Register new user
  const register = async ({ email, password, firstName, lastName }) => {
    const auth = getAuth();
    const db = getFirestore();
    let firebaseUser = null;

    isLoading.value = true;
    error.value = null;

    try {
      // 1. Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      firebaseUser = userCredential.user;

      // 2. Update profile with display name
      const displayName = `${firstName} ${lastName}`;
      await updateProfile(firebaseUser, { displayName });

      // 3. Create user document in Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), {
        uid: firebaseUser.uid,
        email,
        firstName,
        lastName,
        displayName,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        photoURL: null,
        role: "user",
      });

      // 4. Update local state
      user.value = {
        uid: firebaseUser.uid,
        email,
        displayName,
        firstName,
        lastName,
      };

      // 5. Get new token
      token.value = await firebaseUser.getIdToken();

      return true;
    } catch (err) {
      console.error("Registration error:", err);
      error.value = err.message;

      // Clean up if auth user was created but Firestore failed
      if (firebaseUser) {
        try {
          await deleteUser(firebaseUser);
        } catch (deleteError) {
          console.error("Cleanup error:", deleteError);
        }
      }

      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Sign out user
  const logout = async () => {
    const auth = getAuth();
    try {
      isLoading.value = true;
      await firebaseSignOut(auth);
      user.value = null;
      token.value = null;
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
    register,
    logout,
    cleanup,
  };
});
