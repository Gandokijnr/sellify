import axios from 'axios';

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
const PAYSTACK_SECRET_KEY = import.meta.env.VITE_PAYSTACK_SECRET_KEY;

export const paymentService = {
  async initializePayment(amount, email, metadata) {
    try {
      const response = await axios.post('https://api.paystack.co/transaction/initialize', {
        amount: amount * 100, // Convert to kobo (100 kobo = 1 NGN)
        email: email,
        callback_url: `${window.location.origin}/payment-success?redirect=/seller/listings/create`,
        metadata: {
          ...metadata
        },
        reference: `sub_${Date.now()}`
      }, {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.data.authorization_url;
    } catch (error) {
      console.error('Payment initialization failed:', error);
      throw error;
    }
  },

  async verifyPayment(reference) {
    try {
      const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: response.data.data.status === 'success',
        metadata: response.data.data.metadata
      };
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw error;
    }
  }
};
