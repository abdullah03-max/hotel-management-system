import express from 'express';
import {
  createServiceRequest,
  getServiceRequests,
  updateServiceStatus,
  addServiceFeedback
} from '../controllers/serviceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getServiceRequests)
  .post(protect, createServiceRequest);

router.put('/:id/status', protect, authorize('receptionist', 'admin'), updateServiceStatus);
router.put('/:id/feedback', protect, addServiceFeedback);

export default router;