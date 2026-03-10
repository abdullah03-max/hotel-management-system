import express from 'express';
import {
  getDashboardStats,
  getRevenueChartData,
  getOccupancyStats
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
router.get('/revenue-chart', protect, authorize('admin'), getRevenueChartData);
router.get('/occupancy', protect, getOccupancyStats);

export default router;