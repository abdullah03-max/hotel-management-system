import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice.js';
import roomSlice from './slices/roomSlice.js';
import bookingSlice from './slices/bookingSlice.js';
import serviceSlice from './slices/serviceSlice.js';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    rooms: roomSlice,
    bookings: bookingSlice,
    services: serviceSlice,
  }
});

export default store;