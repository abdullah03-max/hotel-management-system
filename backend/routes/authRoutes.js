import express from 'express';
import { 
  registerUser, 
  loginUser, 
  googleAuth,
  verifyEmail,
  resendVerificationCode,
  getLoggedInUser, 
  logoutUser, 
  updateProfile 
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationCode);
router.get('/me', protect, getLoggedInUser);
router.post('/logout', protect, logoutUser);
router.put('/profile', protect, updateProfile);

export default router;