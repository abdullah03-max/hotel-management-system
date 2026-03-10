import express from 'express';
import {
  createPayment,
  getPayments,
  generateInvoicePDF
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getPayments)
  .post(protect, createPayment);

router.get('/invoice/:bookingId', protect, generateInvoicePDF);

export default router;