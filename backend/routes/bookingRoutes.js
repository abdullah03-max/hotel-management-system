import express from 'express';
import {
  newBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  checkIn,
  checkOut,
  cancelBooking
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getAllBookings)
  .post(protect, newBooking);

router.route('/:id')
  .get(protect, getBookingById)
  .put(protect, updateBooking);

router.put('/:id/checkin', protect, authorize('receptionist', 'admin'), checkIn);
router.put('/:id/checkout', protect, authorize('receptionist', 'admin'), checkOut);
router.put('/:id/cancel', protect, cancelBooking);

export default router;