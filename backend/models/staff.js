import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Staff name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['receptionist', 'housekeeping', 'manager', 'maintenance', 'kitchen', 'security', 'admin'],
    default: 'receptionist'
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: 0
  },
  joinDate: {
    type: Date,
    required: [true, 'Join date is required'],
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  permissions: [{
    type: String
  }]
  // REMOVED employeeId field to fix the duplicate key error
}, {
  timestamps: true
});

const Staff = mongoose.model('Staff', staffSchema);

export default Staff;