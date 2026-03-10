import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add notification title']
  },
  message: {
    type: String,
    required: [true, 'Please add notification message']
  },
  type: {
    type: String,
    enum: ['booking', 'payment', 'service', 'maintenance', 'system', 'alert'],
    default: 'system'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  relatedEntity: {
    type: String, // e.g., 'booking', 'service'
    required: false
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  actionUrl: {
    type: String // URL to navigate when notification is clicked
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);