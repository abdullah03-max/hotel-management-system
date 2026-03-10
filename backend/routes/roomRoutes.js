import express from 'express';
import {
  createRoom,
  getAllRooms,
  getAvailableRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getRoomStatusStats
} from '../controllers/roomController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getAllRooms)
  .post(protect, authorize('admin'), createRoom);

router.get('/available', getAvailableRooms);
router.get('/stats/status', protect, getRoomStatusStats);

router.route('/:id')
  .get(getRoomById)
  .put(protect, authorize('admin'), updateRoom)
  .delete(protect, authorize('admin'), deleteRoom);

export default router;