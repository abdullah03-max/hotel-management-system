import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import Payment from '../models/Payment.js';
import { asyncHandler } from '../middleware/authMiddleware.js';

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const newBooking = asyncHandler(async (req, res) => {
  const {
    room,
    checkIn,
    checkOut,
    numberOfGuests,
    specialRequests
  } = req.body;

  // Check if room exists and is available
  const roomData = await Room.findById(room);
  if (!roomData || roomData.status !== 'available') {
    return res.status(400).json({
      success: false,
      message: 'Room is not available'
    });
  }

  // Check for booking conflicts
  const conflictingBooking = await Booking.findOne({
    room,
    bookingStatus: { $in: ['confirmed', 'checked-in'] },
    $or: [
      {
        checkIn: { $lte: new Date(checkOut) },
        checkOut: { $gte: new Date(checkIn) }
      }
    ]
  });

  if (conflictingBooking) {
    return res.status(400).json({
      success: false,
      message: 'Room is already booked for the selected dates'
    });
  }

  // Calculate total amount
  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  const totalAmount = roomData.price * nights;

  const booking = await Booking.create({
    guest: req.user.role === 'guest' ? req.user.id : req.body.guest,
    room,
    checkIn,
    checkOut,
    numberOfGuests,
    totalAmount,
    specialRequests,
    createdBy: req.user.id
  });

  // Update room status
  roomData.status = 'occupied';
  await roomData.save();

  // Emit booking update via Socket.IO
  const io = req.app.get('io');
  io.emit('booking-created', booking);
  io.emit('room-updated', roomData);

  res.status(201).json({
    success: true,
    data: booking,
    message: 'Booking created successfully'
  });
});

// @desc    Get all bookings with filters
// @route   GET /api/bookings
// @access  Private
export const getAllBookings = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    guest,
    startDate,
    endDate,
    sortBy = 'createdAt',
    order = 'desc'
  } = req.query;

  let filter = {};

  // Role-based filtering
  if (req.user.role === 'guest') {
    filter.guest = req.user.id;
  } else if (req.user.role === 'receptionist') {
    // Receptionists can see all bookings but only modify recent ones
    if (status) filter.bookingStatus = status;
    if (guest) filter.guest = guest;
  } else if (req.user.role === 'admin') {
    // Admins can see everything
    if (status) filter.bookingStatus = status;
    if (guest) filter.guest = guest;
  }

  // Date filtering
  if (startDate || endDate) {
    filter.checkIn = {};
    if (startDate) filter.checkIn.$gte = new Date(startDate);
    if (endDate) filter.checkIn.$lte = new Date(endDate);
  }

  const sort = {};
  sort[sortBy] = order === 'desc' ? -1 : 1;

  const bookings = await Booking.find(filter)
    .populate('guest', 'name email phone')
    .populate('room', 'roomNumber roomType price')
    .populate('createdBy', 'name')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Booking.countDocuments(filter);

  res.json({
    success: true,
    data: bookings,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('guest', 'name email phone address idProof idNumber')
    .populate('room', 'roomNumber roomType price amenities')
    .populate('createdBy', 'name');

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Check if user has access to this booking
  if (req.user.role === 'guest' && booking.guest._id.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this booking'
    });
  }

  res.json({
    success: true,
    data: booking
  });
});

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
export const updateBooking = asyncHandler(async (req, res) => {
  let booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Authorization check
  if (req.user.role === 'guest' && booking.guest.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this booking'
    });
  }

  // Prevent certain updates based on booking status
  if (booking.bookingStatus === 'checked-out') {
    return res.status(400).json({
      success: false,
      message: 'Cannot modify checked-out booking'
    });
  }

  booking = await Booking.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('guest room');

  // Emit booking update
  const io = req.app.get('io');
  io.emit('booking-updated', booking);

  res.json({
    success: true,
    data: booking,
    message: 'Booking updated successfully'
  });
});

// @desc    Check-in guest
// @route   PUT /api/bookings/:id/checkin
// @access  Private/Receptionist
export const checkIn = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  if (booking.bookingStatus !== 'confirmed') {
    return res.status(400).json({
      success: false,
      message: 'Only confirmed bookings can be checked in'
    });
  }

  booking.bookingStatus = 'checked-in';
  booking.checkedInAt = new Date();
  await booking.save();

  // Update room status
  await Room.findByIdAndUpdate(booking.room, { status: 'occupied' });

  // Emit updates
  const io = req.app.get('io');
  io.emit('booking-updated', booking);
  io.emit('room-status-changed', { roomId: booking.room, status: 'occupied' });

  res.json({
    success: true,
    data: booking,
    message: 'Guest checked in successfully'
  });
});

// @desc    Check-out guest
// @route   PUT /api/bookings/:id/checkout
// @access  Private/Receptionist
export const checkOut = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  if (booking.bookingStatus !== 'checked-in') {
    return res.status(400).json({
      success: false,
      message: 'Only checked-in bookings can be checked out'
    });
  }

  // Check if all payments are completed
  const totalPaid = await Payment.aggregate([
    { $match: { booking: booking._id, status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const paidAmount = totalPaid.length > 0 ? totalPaid[0].total : 0;

  if (paidAmount < booking.totalAmount) {
    return res.status(400).json({
      success: false,
      message: 'Cannot check out with pending payments'
    });
  }

  booking.bookingStatus = 'checked-out';
  booking.checkedOutAt = new Date();
  await booking.save();

  // Update room status to available
  await Room.findByIdAndUpdate(booking.room, { status: 'available' });

  // Emit updates
  const io = req.app.get('io');
  io.emit('booking-updated', booking);
  io.emit('room-status-changed', { roomId: booking.room, status: 'available' });

  res.json({
    success: true,
    data: booking,
    message: 'Guest checked out successfully'
  });
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = asyncHandler(async (req, res) => {
  const { cancellationReason } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  if (!['confirmed', 'checked-in'].includes(booking.bookingStatus)) {
    return res.status(400).json({
      success: false,
      message: 'Cannot cancel booking in current status'
    });
  }

  booking.bookingStatus = 'cancelled';
  booking.cancellationReason = cancellationReason;
  await booking.save();

  // Update room status if checked in
  if (booking.bookingStatus === 'checked-in') {
    await Room.findByIdAndUpdate(booking.room, { status: 'available' });
  }

  // Emit updates
  const io = req.app.get('io');
  io.emit('booking-updated', booking);

  res.json({
    success: true,
    data: booking,
    message: 'Booking cancelled successfully'
  });
});