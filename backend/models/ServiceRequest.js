import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    unique: true,
    required: true
  },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  serviceType: {
    type: String,
    required: [true, 'Please add service type'],
    enum: [
      'laundry', 'cleaning', 'food', 'taxi', 
      'extra-towels', 'emergency', 'wake-up-call',
      'room-service', 'maintenance', 'other'
    ]
  },
  description: {
    type: String,
    required: [true, 'Please add service description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Receptionist or staff member
  },
  estimatedCompletion: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  guestFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String
  },
  cost: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate request ID before saving
serviceRequestSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('ServiceRequest').countDocuments();
    this.requestId = `SR${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Indexes for efficient queries
serviceRequestSchema.index({ guest: 1 });
serviceRequestSchema.index({ serviceType: 1 });
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ createdAt: -1 });

export default mongoose.model('ServiceRequest', serviceRequestSchema);