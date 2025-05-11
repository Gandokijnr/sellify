import { defineStore } from 'pinia';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { paymentService } from '@/services/payment.service';
import { useAuthStore } from '@/stores/auth';

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    subscription: null,
    loading: false,
    error: null,
    billingPeriod: 'monthly', // 'monthly' or 'yearly'
    plans: [
      {
        id: 'basic',
        name: 'Basic Plan',
        price: 2500, // Monthly price in NGN
        yearlyPrice: 24000, // Yearly price (20% discount)
        features: [
          'Unlimited listings',
          '30-day subscription',
          'Basic analytics',
          '24/7 support'
        ]
      },
      {
        id: 'premium',
        name: 'Premium Plan',
        price: 4500, // Monthly price in NGN
        yearlyPrice: 43200, // Yearly price (20% discount)
        features: [
          'Unlimited listings',
          '30-day subscription',
          'Advanced analytics',
          'Priority support',
          'Featured listings'
        ]
      }
    ]
  }),
  getters: {
    currentPlans: (state) => {
      return state.plans.map(plan => ({
        ...plan,
        price: state.billingPeriod === 'yearly' ? plan.yearlyPrice : plan.price,
        duration: state.billingPeriod === 'yearly' ? 'year' : 'month'
      }));
    }
  },
  actions: {
    async fetchSubscription(userId) {
      try {
        this.loading = true;
        const docRef = doc(db, 'subscriptions', userId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          this.subscription = {
            ...docSnap.data(),
            id: docSnap.id
          };
        } else {
          this.subscription = null;
        }
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async createSubscription(userId, plan) {
      try {
        this.loading = true;
        const authStore = useAuthStore();
        
        if (!authStore.user) {
          throw new Error('User not authenticated');
        }

        // Initialize payment
        const paymentUrl = await paymentService.initializePayment(
          plan.price,
          authStore.user.email,
          {
            userId,
            planId: plan.id,
            planName: plan.name
          }
        );

        // Store plan info temporarily
        localStorage.setItem('pending_subscription', JSON.stringify({
          userId,
          plan,
          createdAt: new Date()
        }));

        // Redirect to payment
        window.location.href = paymentUrl;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async fetchSubscription(userId) {
      try {
        this.loading = true;
        const docRef = doc(db, 'subscriptions', userId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          this.subscription = {
            ...docSnap.data(),
            id: docSnap.id
          };
        } else {
          this.subscription = null;
        }
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async createSubscription(userId, plan) {
      try {
        this.loading = true;
        const authStore = useAuthStore();
        
        if (!authStore.user) {
          throw new Error('User not authenticated');
        }

        // Initialize payment
        const paymentUrl = await paymentService.initializePayment(
          plan.price,
          authStore.user.email,
          {
            userId,
            planId: plan.id,
            planName: plan.name
          }
        );

        // Store plan info temporarily
        localStorage.setItem('pending_subscription', JSON.stringify({
          userId,
          plan,
          createdAt: new Date()
        }));

        // Redirect to payment
        window.location.href = paymentUrl;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async verifyAndActivateSubscription(reference) {
      try {
        this.loading = true;
        const { success, metadata } = await paymentService.verifyPayment(reference);

        if (!success) {
          throw new Error('Payment verification failed');
        }

        const { userId, planId } = metadata;
        const plan = this.plans.find(p => p.id === planId);

        if (!plan) {
          throw new Error('Invalid subscription plan');
        }

        // Create or update subscription
        const subscriptionRef = doc(db, 'subscriptions', userId);
        await setDoc(subscriptionRef, {
          userId,
          planId,
          planName: plan.name,
          status: 'active',
          startDate: new Date(),
          nextRenewalDate: new Date(Date.now() + (plan.id === 'premium' ? 60 : 30) * 24 * 60 * 60 * 1000),
          paymentReference: reference,
          createdAt: new Date()
        });

        // Update user's subscription status
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          hasSubscription: true,
          subscriptionPlan: plan.id
        });

        await this.fetchSubscription(userId);
        return true;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async cancelSubscription(userId) {
      try {
        this.loading = true;
        const subscriptionRef = doc(db, 'subscriptions', userId);
        await updateDoc(subscriptionRef, {
          status: 'cancelled',
          cancelledAt: new Date()
        });

        // Update user's subscription status
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          hasSubscription: false,
          subscriptionPlan: null
        });

        await this.fetchSubscription(userId);
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
