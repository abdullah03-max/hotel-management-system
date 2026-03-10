const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  item: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Linens', 'Toiletries', 'Minibar', 'Beverages', 'Cleaning Supplies', 'Office Supplies', 'Food']
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  threshold: {
    type: Number,
    required: true,
    default: 10
  },
  unit: {
    type: String,
    required: true,
    default: 'pieces'
  },
  price: {
    type: Number,
    default: 0
  },
  supplier: {
    type: String,
    trim: true
  },
  lastRestocked: {
    type: Date
  },
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock'],
    default: 'In Stock'
  },
  location: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Virtual for stock status
inventorySchema.virtual('stockStatus').get(function() {
  if (this.quantity === 0) return 'Out of Stock';
  if (this.quantity <= this.threshold) return 'Low Stock';
  return 'In Stock';
});

module.exports = mongoose.model('Inventory', inventorySchema);