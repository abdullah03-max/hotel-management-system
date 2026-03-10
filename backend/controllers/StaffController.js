import Staff from '../models/Staff.js';

// @desc    Create new staff member
// @route   POST /api/staff
// @access  Private/Admin
export const createStaff = async (req, res) => {
  try {
    const {
      name,
      email,
      role,
      department,
      phone,
      salary,
      joinDate,
      permissions,
      status
    } = req.body;

    // Check if staff with email already exists
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: 'Staff member with this email already exists'
      });
    }

    // Create new staff member
    const staff = await Staff.create({
      name,
      email,
      role,
      department,
      phone,
      salary,
      joinDate: joinDate || Date.now(),
      permissions: permissions || [],
      status: status || 'active',
      createdBy: req.user?._id // If you have authentication
    });

    res.status(201).json({
      success: true,
      data: {
        staff,
        loginCredentials: {
          email: email,
          temporaryPassword: '123456', // You might want to generate this
          role: role
        }
      },
      message: 'Staff member created successfully'
    });

  } catch (error) {
    console.error('Error creating staff:', error);
    
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
      message: 'Server error while creating staff member',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all staff members
// @route   GET /api/staff
// @access  Private/Admin
export const getAllStaff = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status } = req.query;
    
    let query = {};
    
    if (role) query.role = role;
    if (status) query.status = status;

    const staff = await Staff.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await Staff.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        staff,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          totalRecords: total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching staff members'
    });
  }
};

// @desc    Get single staff member
// @route   GET /api/staff/:id
// @access  Private/Admin
export const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { staff }
    });

  } catch (error) {
    console.error('Error fetching staff:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching staff member'
    });
  }
};

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Private/Admin
export const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { staff },
      message: 'Staff member updated successfully'
    });

  } catch (error) {
    console.error('Error updating staff:', error);
    
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
};

// @desc    Delete staff member
// @route   DELETE /api/staff/:id
// @access  Private/Admin
export const deleteStaff = async (req, res) => {
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
    console.error('Error deleting staff:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting staff member'
    });
  }
};