import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // your schema definition
});

export const Payment = mongoose.model('Payment', paymentSchema);