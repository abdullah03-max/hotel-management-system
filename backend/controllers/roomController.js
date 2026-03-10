import { Room } from '../models/Room.js';
import { asyncHandler } from '../middleware/authMiddleware.js';

// @desc    Create a room
// @route   POST /api/rooms
// @access  Private/Admin
export const createRoom = asyncHandler(async (req, res) => {
  const room = await Room.create(req.body);

  // Emit room update via Socket.IO
  const io = req.app.get('io');
  io.emit('room-updated', room);

  res.status(201).json({
    success: true,
    data: room,
    message: 'Room created successfully'
  });
});

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
export const getAllRooms = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    roomType,
    status,
    minPrice,
    maxPrice,
    amenities,
    sortBy = 'roomNumber',
    order = 'asc'
  } = req.query;

  // Build filter object
  let filter = { isActive: true };
  
  if (roomType) filter.roomType = roomType;
  if (status) filter.status = status;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (amenities) {
    filter.amenities = { $in: amenities.split(',') };
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = order === 'desc' ? -1 : 1;

  const rooms = await Room.find(filter)
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Room.countDocuments(filter);

  res.json({
    success: true,
    data: rooms,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get available rooms
// @route   GET /api/rooms/available
// @access  Public
export const getAvailableRooms = asyncHandler(async (req, res) => {
  const { checkIn, checkOut, roomType, guests } = req.query;

  // Basic filter for available rooms
  let filter = { 
    status: 'available',
    isActive: true 
  };

  if (roomType) filter.roomType = roomType;
  if (guests) filter.capacity = { $gte: Number(guests) };

  // In a real implementation, you would also check booking conflicts
  const rooms = await Room.find(filter);

  res.json({
    success: true,
    data: rooms,
    count: rooms.length
  });
});

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public
export const getRoomById = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    return res.status(404).json({
      success: false,
      message: 'Room not found'
    });
  }

  res.json({
    success: true,
    data: room
  });
});

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private/Admin
export const updateRoom = asyncHandler(async (req, res) => {
  let room = await Room.findById(req.params.id);

  if (!room) {
    return res.status(404).json({
      success: false,
      message: 'Room not found'
    });
  }

  room = await Room.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Emit room update via Socket.IO
  const io = req.app.get('io');
  io.emit('room-updated', room);

  res.json({
    success: true,
    data: room,
    message: 'Room updated successfully'
  });
});

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
export const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    return res.status(404).json({
      success: false,
      message: 'Room not found'
    });
  }

  // Soft delete by setting isActive to false
  room.isActive = false;
  await room.save();

  // Emit room update via Socket.IO
  const io = req.app.get('io');
  io.emit('room-deleted', room._id);

  res.json({
    success: true,
    message: 'Room deleted successfully'
  });
});

// @desc    Get room statistics
// @route   GET /api/rooms/stats/status
// @access  Private
export const getRoomStatusStats = asyncHandler(async (req, res) => {
  const stats = await Room.aggregate([
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

  const totalRooms = await Room.countDocuments({ isActive: true });

  res.json({
    success: true,
    data: {
      stats,
      totalRooms
    }
  });
});