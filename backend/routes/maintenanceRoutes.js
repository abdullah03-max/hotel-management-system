import express from 'express';
import {
  createMaintenanceTask,
  getMaintenanceTasks,
  updateMaintenanceStatus,
  getMaintenanceStats
} from '../controllers/maintenanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getMaintenanceTasks)
  .post(protect, authorize('admin', 'receptionist'), createMaintenanceTask);

router.put('/:id/status', protect, authorize('admin', 'receptionist'), updateMaintenanceStatus);
router.get('/stats', protect, getMaintenanceStats);

export default router;