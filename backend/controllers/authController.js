import { User } from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';
import { generateToken, generateRefreshToken, asyncHandler } from '../middleware/authMiddleware.js';

const buildAuthResponse = (user) => {
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    address: user.address,
    profilePicture: user.profilePicture,
    authProvider: user.authProvider,
    token,
    refreshToken
  };
};

const getGoogleClient = () => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID is not configured');
  }

  return new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role, address, idProof, idNumber } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: role || 'guest',
    address,
    idProof,
    idNumber
  });

  if (user) {
    res.status(201).json({
      success: true,
      data: buildAuthResponse(user),
      message: 'User registered successfully'
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid user data'
    });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Update last login
    await user.updateLastLogin();

    res.json({
      success: true,
      data: buildAuthResponse(user),
      message: 'Login successful'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// @desc    Authenticate guest with Google
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({
      success: false,
      message: 'Google ID token is required'
    });
  }

  const client = getGoogleClient();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();

  if (!payload?.email || !payload.sub) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Google account payload'
    });
  }

  let user = await User.findOne({ email: payload.email.toLowerCase() });

  if (user && user.role !== 'guest' && !user.googleId) {
    return res.status(403).json({
      success: false,
      message: 'Google sign-in is only available for guest accounts'
    });
  }

  if (!user) {
    user = await User.create({
      name: payload.name || payload.email.split('@')[0],
      email: payload.email.toLowerCase(),
      googleId: payload.sub,
      authProvider: 'google',
      role: 'guest',
      profilePicture: payload.picture,
      isActive: true,
      status: 'active'
    });
  } else {
    user.googleId = payload.sub;
    user.authProvider = 'google';
    user.profilePicture = payload.picture || user.profilePicture;
    user.isActive = true;
    user.status = 'active';
    await user.save();
  }

  await user.updateLastLogin();

  res.json({
    success: true,
    data: buildAuthResponse(user),
    message: 'Google sign-in successful'
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getLoggedInUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
      data: user
  });
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role
      },
      message: 'Profile updated successfully'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
});