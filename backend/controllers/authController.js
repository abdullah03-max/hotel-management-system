import { User } from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
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

const generateVerificationCode = () => {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
};

const getMailTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
};

const sendVerificationEmail = async ({ email, name, code }) => {
  const transporter = getMailTransporter();
  if (!transporter) {
    return false;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Verify your Luxury Stay account',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Verify your email</h2>
        <p>Hello ${name || 'Guest'},</p>
        <p>Use this verification code to complete your registration:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `
  });

  return true;
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role, address, idProof, idNumber } = req.body;
  const normalizedEmail = email?.toLowerCase()?.trim();

  // Check if user exists
  const userExists = await User.findOne({ email: normalizedEmail }).select('+emailVerificationCode +emailVerificationExpires');
  if (userExists) {
    if (!userExists.isEmailVerified && userExists.authProvider === 'local') {
      const newCode = generateVerificationCode();
      userExists.emailVerificationCode = newCode;
      userExists.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
      userExists.name = name || userExists.name;
      userExists.phone = phone || userExists.phone;
      userExists.address = address || userExists.address;
      if (password) {
        userExists.password = password;
      }
      await userExists.save();

      const emailSent = await sendVerificationEmail({
        email: normalizedEmail,
        name: userExists.name,
        code: newCode
      });

      return res.status(200).json({
        success: true,
        requiresEmailVerification: true,
        message: emailSent
          ? 'Verification code sent to your email.'
          : 'Verification email is not configured. Use the code below for development.',
        data: {
          email: normalizedEmail,
          ...(emailSent || process.env.NODE_ENV === 'production' ? {} : { verificationCode: newCode })
        }
      });
    }

    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  const verificationCode = generateVerificationCode();

  // Create user
  const user = await User.create({
    name,
    email: normalizedEmail,
    phone,
    password,
    role: role || 'guest',
    address,
    idProof,
    idNumber,
    isEmailVerified: false,
    emailVerificationCode: verificationCode,
    emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000)
  });

  if (user) {
    const emailSent = await sendVerificationEmail({
      email: normalizedEmail,
      name,
      code: verificationCode
    });

    res.status(201).json({
      success: true,
      requiresEmailVerification: true,
      message: emailSent
        ? 'Registration successful. Please verify your email with the code we sent.'
        : 'Registration successful. Email delivery is not configured; use the code below for development.',
      data: {
        email: normalizedEmail,
        ...(emailSent || process.env.NODE_ENV === 'production' ? {} : { verificationCode })
      }
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

    if (user.authProvider === 'local' && !user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.'
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
      isEmailVerified: true,
      role: 'guest',
      profilePicture: payload.picture,
      isActive: true,
      status: 'active'
    });
  } else {
    user.googleId = payload.sub;
    user.authProvider = 'google';
    user.isEmailVerified = true;
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

// @desc    Verify email with code
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      success: false,
      message: 'Email and verification code are required.'
    });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+emailVerificationCode +emailVerificationExpires');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found.'
    });
  }

  if (user.isEmailVerified) {
    return res.json({
      success: true,
      data: buildAuthResponse(user),
      message: 'Email is already verified.'
    });
  }

  if (
    !user.emailVerificationCode ||
    user.emailVerificationCode !== String(code).trim() ||
    !user.emailVerificationExpires ||
    user.emailVerificationExpires.getTime() < Date.now()
  ) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification code.'
    });
  }

  user.isEmailVerified = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();
  await user.updateLastLogin();

  return res.json({
    success: true,
    data: buildAuthResponse(user),
    message: 'Email verified successfully.'
  });
});

// @desc    Resend email verification code
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerificationCode = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required.'
    });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+emailVerificationCode +emailVerificationExpires');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found.'
    });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      message: 'Email is already verified.'
    });
  }

  const code = generateVerificationCode();
  user.emailVerificationCode = code;
  user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  const emailSent = await sendVerificationEmail({
    email: user.email,
    name: user.name,
    code
  });

  return res.json({
    success: true,
    message: emailSent
      ? 'Verification code sent successfully.'
      : 'Email delivery is not configured. Use the code below for development.',
    data: {
      email: user.email,
      ...(emailSent || process.env.NODE_ENV === 'production' ? {} : { verificationCode: code })
    }
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