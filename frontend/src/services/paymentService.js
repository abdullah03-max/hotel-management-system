import api from './api.js';

export const paymentService = {
  // Create payment
  createPayment: async (paymentData) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  // Get payments
  getPayments: async (params = {}) => {
    const response = await api.get('/payments', { params });
    return response.data;
  },

  // Generate invoice
  generateInvoice: async (bookingId) => {
    const response = await api.get(`/payments/invoice/${bookingId}`);
    return response.data;
  },
};