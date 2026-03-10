import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  // your schema definition
});

export const Booking = mongoose.model('Booking', bookingSchema);