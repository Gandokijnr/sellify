// src/stores/auth.js
import { defineStore } from "pinia";
import { ref, computed, onScopeDispose } from "vue";
import {
  getAuth,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
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

// Helper functions for localStorage
const persistAuthState = (userData, token) => {
  localStorage.setItem(
    "auth",
    JSON.stringify({
      user: userData,
      token,
      timestamp: Date.now(),
    })
  );
};

const clearAuthState = () => {
  localStorage.removeItem("auth");
};

const getPersistedAuthState = () => {
  const authData = localStorage.getItem("auth");
  return authData ? JSON.parse(authData) : null;
};

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const token = ref(null);
  const isLoading = ref(true);
  const error = ref(null);
  let authUnsubscribe = null;

  // Initialize with persisted data if available
  const initFromLocalStorage = () => {
    const persistedAuth = getPersistedAuthState();
    if (persistedAuth) {
      user.value = persistedAuth.user;
      token.value = persistedAuth.token;
    }
  };

  // Run initial check for persisted data
  initFromLocalStorage();

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
              persistAuthState(user.value, token.value); // Persist to localStorage
            } else {
              user.value = null;
              token.value = null;
              clearAuthState(); // Clear localStorage on logout
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
            clearAuthState();
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

      // 5. Get new token and persist
      token.value = await firebaseUser.getIdToken();
      persistAuthState(user.value, token.value);

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

  // Google Sign-In handler
  const handleGoogleSignIn = async (useRedirect = false) => {
    const auth = getAuth();
    const db = getFirestore();
    const provider = new GoogleAuthProvider();

    // Add any additional scopes you might need
    // provider.addScope('profile');
    // provider.addScope('email');

    isLoading.value = true;
    error.value = null;
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    try {
      let result;

      if (isMobile || useRedirect) {
        // Handle redirect flow (better for mobile)
        await signInWithPopup(auth, provider);
        return; // Early return - the rest will be handled by initAuth
      } else {
        // Handle popup flow (better for desktop)
        result = await signInWithPopup(auth, provider);
      }

      // Check if user is new or existing
      const isNewUser = result._tokenResponse?.isNewUser || false;
      const firebaseUser = result.user;

      if (isNewUser) {
        // Create user document in Firestore for new users
        const displayName = firebaseUser.displayName || "Google User";
        const firstName = displayName.split(" ")[0] || "";
        const lastName = displayName.split(" ")[1] || "";

        await setDoc(doc(db, "users", firebaseUser.uid), {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          firstName,
          lastName,
          displayName,
          photoURL: firebaseUser.photoURL,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          role: "user",
          provider: "google",
        });
      } else {
        // Update last login for existing users
        await setDoc(
          doc(db, "users", firebaseUser.uid),
          { lastLogin: serverTimestamp() },
          { merge: true }
        );
      }

      // Get the user document
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
        throw new Error("User document not found in Firestore");
      }

      // Update local state
      user.value = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        ...userDoc.data(),
      };

      // Get and store token
      token.value = await firebaseUser.getIdToken();
      persistAuthState(user.value, token.value);

      return true;
    } catch (err) {
      console.error("Google Sign-In error:", err);
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const handleGoogleRedirectResult = async () => {
    const auth = getAuth();
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        return true;
      }
      return false;
    } catch (err) {
      console.error("Google Redirect error:", err);
      error.value = err.message;
      throw err;
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
      clearAuthState();
      // redirect to home login page
      window.location.href = "/login";
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
    handleGoogleSignIn,
    handleGoogleRedirectResult,
    logout,
    cleanup,
  };
});
