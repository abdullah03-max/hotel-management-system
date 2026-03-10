import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load env vars
dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel_management');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

const app = express();

// ✅ MIDDLEWARE MUST COME BEFORE ROUTES
// CORS middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ✅ Body parser middleware - MUST BE BEFORE ROUTES
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Staff Schema - UPDATED WITH SPECIALIZATION FIELD
const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
  phone: { type: String, required: true },
  salary: { type: Number, required: true },
  joinDate: { type: Date, default: Date.now },
  status: { type: String, default: 'active' },
  lastLogin: { type: Date },
  specialization: { type: String, default: 'general' }, // ✅ ADD SPECIALIZATION FIELD
  permissions: [String]
}, { timestamps: true });

const Staff = mongoose.model('Staff', staffSchema);

// Guest Schema - UPDATED WITH PROFILE PICTURE AND LOYALTY STATUS
const guestSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // Local storage ID
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  city: { type: String },
  country: { type: String },
  dateOfBirth: { type: Date },
  totalBookings: { type: Number, default: 0 },
  lastVisit: { type: Date },
  status: { type: String, default: 'active' },
  loyaltyStatus: { type: String, default: 'member' }, // ✅ ADD LOYALTY STATUS
  profilePicture: { type: String }, // ✅ ADD PROFILE PICTURE (base64)
  preferences: {
    roomType: String,
    specialRequests: String
  },
  registrationDate: { type: Date, default: Date.now }
}, { timestamps: true });

const Guest = mongoose.model('Guest', guestSchema);

// Health check route
app.get('/api/health', async (req, res) => {
  const staffCount = await Staff.countDocuments();
  const guestCount = await Guest.countDocuments();
  res.status(200).json({ 
    success: true,
    message: 'Server is running',
    totalStaff: staffCount,
    totalGuests: guestCount
  });
});

// Get all staff
app.get('/api/staff', async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: { staff }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching staff'
    });
  }
});

// Create staff
app.post('/api/staff', async (req, res) => {
  try {
    const staff = await Staff.create(req.body);
    res.status(201).json({
      success: true,
      data: { staff }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ✅ UPDATED PUT ROUTE TO HANDLE SPECIALIZATION
app.put('/api/staff/:id', async (req, res) => {
  try {
    console.log('📝 Update request received - Body:', req.body);
    console.log('📝 Update request received - Params:', req.params);
    
    // Check if req.body exists
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'Request body is missing'
      });
    }

    const { name, email, role, status, phone, salary, department, permissions, lastLogin, specialization } = req.body;

    // Validate required fields
    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, email, role'
      });
    }

    // Check if staff exists
    const existingStaff = await Staff.findById(req.params.id);
    if (!existingStaff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Check if email is being used by another staff member
    if (email !== existingStaff.email) {
      const emailExists = await Staff.findOne({ email: email.toLowerCase(), _id: { $ne: req.params.id } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Another staff member with this email already exists'
        });
      }
    }

    // Update staff in database
    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: role,
        status: status,
        phone: phone || existingStaff.phone,
        salary: salary || existingStaff.salary,
        department: department || existingStaff.department,
        permissions: permissions || existingStaff.permissions,
        lastLogin: lastLogin || existingStaff.lastLogin,
        specialization: specialization || existingStaff.specialization, // ✅ UPDATE SPECIALIZATION
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    console.log('✅ Staff updated successfully:', updatedStaff._id);

    res.status(200).json({
      success: true,
      data: { staff: updatedStaff },
      message: 'Staff member updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating staff:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Another staff member with this email already exists'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating staff member'
    });
  }
});

// Delete staff
app.delete('/api/staff/:id', async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting staff member'
    });
  }
});

// API routes for guests
app.get('/api/guests', async (req, res) => {
  try {
    const guests = await Guest.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: { guests }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching guests'
    });
  }
});

app.post('/api/guests', async (req, res) => {
  try {
    const guest = await Guest.create(req.body);
    res.status(201).json({
      success: true,
      data: { guest }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get single guest by ID
app.get('/api/guests/:id', async (req, res) => {
  try {
    const guest = await Guest.findOne({ id: req.params.id });
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }
    res.status(200).json({
      success: true,
      data: { guest }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching guest'
    });
  }
});

// Update guest
app.put('/api/guests/:id', async (req, res) => {
  try {
    const guest = await Guest.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { guest },
      message: 'Guest updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete guest
app.delete('/api/guests/:id', async (req, res) => {
  try {
    const guest = await Guest.findOneAndDelete({ id: req.params.id });
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Guest deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting guest'
    });
  }
});

// ✅ NEW ROUTES FOR PROFILE PICTURE MANAGEMENT

// Get profile picture
app.get('/api/guests/:id/profile-picture', async (req, res) => {
  try {
    const guest = await Guest.findOne({ id: req.params.id });
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    res.status(200).json({
      success: true,
      profilePicture: guest.profilePicture || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile picture'
    });
  }
});

// Update profile picture
app.put('/api/guests/:id/profile-picture', async (req, res) => {
  try {
    const { profilePicture } = req.body;
    
    const guest = await Guest.findOneAndUpdate(
      { id: req.params.id },
      { profilePicture },
      { new: true, runValidators: true }
    );
    
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete profile picture
app.delete('/api/guests/:id/profile-picture', async (req, res) => {
  try {
    const guest = await Guest.findOneAndUpdate(
      { id: req.params.id },
      { profilePicture: null },
      { new: true }
    );
    
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile picture deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting profile picture'
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 MongoDB: Connected`);
  console.log(`🏨 Available Collections: Staff, Guests`);
  console.log(`🖼️  Profile Picture Support: Enabled`);
  console.log(`🏆 Loyalty Status Support: Enabled`);
});