import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getLoggedInUser, 
  logoutUser, 
  updateProfile 
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getLoggedInUser);
router.post('/logout', protect, logoutUser);
router.put('/profile', protect, updateProfile);

export default router;