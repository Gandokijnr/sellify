import { defineStore } from "pinia";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db, storage } from "@/firebase";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

export const useListingsStore = defineStore("listings", {
  state: () => ({
    listings: [],
    loading: false,
  }),
  actions: {
    async createListing(listingData) {
      try {
        // Upload images first
        const imageUrls = await Promise.all(
          listingData.images.map(async (file) => {
            const storageReference = storageRef(
              storage,
              `listings/${Date.now()}-${file.name}`
            );
            await uploadBytes(storageReference, file);
            return getDownloadURL(storageReference);
          })
        );

        // Add listing to Firestore
        const docRef = await addDoc(collection(db, "listings"), {
          ...listingData,
          images: imageUrls,
          createdAt: new Date(),
          userId: this.authStore.user.uid,
        });

        return docRef.id;
      } catch (error) {
        throw error;
      }
    },

    async fetchUserListings(userId) {
      const q = query(
        collection(db, "listings"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
  },
});
