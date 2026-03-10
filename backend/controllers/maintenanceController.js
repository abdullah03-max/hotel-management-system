import Maintenance from '../models/Maintenance.js';
import { asyncHandler } from '../middleware/authMiddleware.js';

// @desc    Create maintenance task
// @route   POST /api/maintenance
// @access  Private/Admin
export const createMaintenanceTask = asyncHandler(async (req, res) => {
  const maintenance = await Maintenance.create({
    ...req.body,
    reportedBy: req.user.id
  });

  res.status(201).json({
    success: true,
    data: maintenance,
    message: 'Maintenance task created successfully'
  });
});

// @desc    Get maintenance tasks
// @route   GET /api/maintenance
// @access  Private
export const getMaintenanceTasks = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    priority,
    room,
    sortBy = 'createdAt',
    order = 'desc'
  } = req.query;

  let filter = {};

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (room) filter.room = room;

  const sort = {};
  sort[sortBy] = order === 'desc' ? -1 : 1;

  const tasks = await Maintenance.find(filter)
    .populate('room', 'roomNumber roomType')
    .populate('reportedBy', 'name')
    .populate('assignedTo', 'name')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Maintenance.countDocuments(filter);

  res.json({
    success: true,
    data: tasks,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Update maintenance status
// @route   PUT /api/maintenance/:id/status
// @access  Private/Admin
export const updateMaintenanceStatus = asyncHandler(async (req, res) => {
  const { status, assignedTo, completedDate, actualHours, cost } = req.body;

  const maintenance = await Maintenance.findById(req.params.id);

  if (!maintenance) {
    return res.status(404).json({
      success: false,
      message: 'Maintenance task not found'
    });
  }

  // Update fields
  if (status) maintenance.status = status;
  if (assignedTo) maintenance.assignedTo = assignedTo;
  if (completedDate) maintenance.completedDate = completedDate;
  if (actualHours) maintenance.actualHours = actualHours;
  if (cost) maintenance.cost = cost;

  await maintenance.save();

  res.json({
    success: true,
    data: maintenance,
    message: 'Maintenance task updated successfully'
  });
});

// @desc    Get maintenance statistics
// @route   GET /api/maintenance/stats
// @access  Private
export const getMaintenanceStats = asyncHandler(async (req, res) => {
  const stats = await Maintenance.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalCost: { $sum: '$cost' }
      }
    }
  ]);

  const totalTasks = await Maintenance.countDocuments();
  const pendingTasks = await Maintenance.countDocuments({ 
    status: { $in: ['pending', 'in-progress'] } 
  });

  res.json({
    success: true,
    data: {
      stats,
      totalTasks,
      pendingTasks
    }
  });
});