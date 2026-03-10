import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import ServiceRequest from '../models/ServiceRequest.js';
import { asyncHandler } from '../middleware/authMiddleware.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Total counts
  const totalRooms = await Room.countDocuments({ isActive: true });
  const totalGuests = await User.countDocuments({ role: 'guest', isActive: true });
  const totalStaff = await User.countDocuments({ 
    role: { $in: ['admin', 'receptionist'] }, 
    isActive: true 
  });

  // Today's revenue
  const revenueToday = await Payment.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: today, $lt: tomorrow }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  // Monthly revenue
  const revenueMonth = await Payment.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  // Pending check-ins/check-outs
  const pendingCheckins = await Booking.countDocuments({
    bookingStatus: 'confirmed',
    checkIn: { $lte: tomorrow }
  });

  const pendingCheckouts = await Booking.countDocuments({
    bookingStatus: 'checked-in',
    checkOut: { $lte: tomorrow }
  });

  // Room status breakdown
  const roomStatus = await Room.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Recent bookings
  const recentBookings = await Booking.find()
    .populate('guest', 'name email')
    .populate('room', 'roomNumber roomType')
    .sort({ createdAt: -1 })
    .limit(5);

  // Pending service requests
  const pendingServices = await ServiceRequest.countDocuments({
    status: { $in: ['pending', 'in-progress'] }
  });

  const stats = {
    totalRooms,
    totalGuests,
    totalStaff,
    revenueToday: revenueToday.length > 0 ? revenueToday[0].total : 0,
    revenueMonth: revenueMonth.length > 0 ? revenueMonth[0].total : 0,
    pendingCheckins,
    pendingCheckouts,
    roomStatus,
    pendingServices,
    recentBookings
  };

  res.json({
    success: true,
    data: stats
  });
});

// @desc    Get revenue chart data
// @route   GET /api/dashboard/revenue-chart
// @access  Private/Admin
export const getRevenueChartData = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query; // month, week, year
  
  let groupFormat, startDate;
  const endDate = new Date();

  if (period === 'week') {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    groupFormat = { 
      year: { $year: '$createdAt' },
      month: { $month: '$createdAt' },
      day: { $dayOfMonth: '$createdAt' }
    };
  } else if (period === 'year') {
    startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    groupFormat = { 
      year: { $year: '$createdAt' },
      month: { $month: '$createdAt' }
    };
  } else {
    // month
    startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    groupFormat = { 
      year: { $year: '$createdAt' },
      month: { $month: '$createdAt' },
      day: { $dayOfMonth: '$createdAt' }
    };
  }

  const revenueData = await Payment.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: groupFormat,
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);

  res.json({
    success: true,
    data: revenueData,
    period
  });
});

// @desc    Get room occupancy stats
// @route   GET /api/dashboard/occupancy
// @access  Private
export const getOccupancyStats = asyncHandler(async (req, res) => {
  const totalRooms = await Room.countDocuments({ isActive: true });
  const occupiedRooms = await Room.countDocuments({ 
    isActive: true, 
    status: 'occupied' 
  });

  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

  // Room type occupancy
  const roomTypeOccupancy = await Room.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: '$roomType',
        total: { $sum: 1 },
        occupied: {
          $sum: {
            $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        roomType: '$_id',
        total: 1,
        occupied: 1,
        occupancyRate: {
          $multiply: [{ $divide: ['$occupied', '$total'] }, 100]
        }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      totalRooms,
      occupiedRooms,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      roomTypeOccupancy
    }
  });
});