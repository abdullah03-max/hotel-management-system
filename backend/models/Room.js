import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Please add a room number'],
    unique: true,
    trim: true
  },
  roomType: {
    type: String,
    required: [true, 'Please add room type'],
    enum: ['Single', 'Double', 'Deluxe', 'Suite', 'Executive', 'Presidential']
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'cleaning'],
    default: 'available'
  },
  price: {
    type: Number,
    required: [true, 'Please add room price']
  },
  amenities: [{
    type: String
  }],
  description: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    default: 2
  },
  floor: {
    type: Number,
    required: true
  },
  size: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const Room = mongoose.model('Room', roomSchema);