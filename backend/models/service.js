const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Wellness', 'Transport', 'Dining', 'Housekeeping', 'Entertainment', 'Business']
  },
  status: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available'
  },
  duration: {
    type: Number // in minutes
  },
  image: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);