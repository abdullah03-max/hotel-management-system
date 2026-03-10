import api from './api.js';

export const bookingService = {
  // Create new booking
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  // Get all bookings with filters
  getBookings: async (params = {}) => {
    const response = await api.get('/bookings', { params });
    return response.data;
  },

  // Get booking by ID
  getBookingById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  // Update booking
  updateBooking: async (id, bookingData) => {
    const response = await api.put(`/bookings/${id}`, bookingData);
    return response.data;
  },

  // Check-in guest
  checkIn: async (id) => {
    const response = await api.put(`/bookings/${id}/checkin`);
    return response.data;
  },

  // Check-out guest
  checkOut: async (id) => {
    const response = await api.put(`/bookings/${id}/checkout`);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (id, reason) => {
    const response = await api.put(`/bookings/${id}/cancel`, { cancellationReason: reason });
    return response.data;
  },
};