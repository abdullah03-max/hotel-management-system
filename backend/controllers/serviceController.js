import ServiceRequest from '../models/ServiceRequest.js';
import Booking from '../models/Booking.js';
import { asyncHandler } from '../middleware/authMiddleware.js';

// @desc    Create service request
// @route   POST /api/services
// @access  Private
export const createServiceRequest = asyncHandler(async (req, res) => {
  const { booking, serviceType, description, priority } = req.body;

  // Verify booking exists and guest has access
  const bookingData = await Booking.findById(booking);
  if (!bookingData) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Check if user has access to this booking
  if (req.user.role === 'guest' && bookingData.guest.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to create service request for this booking'
    });
  }

  const serviceRequest = await ServiceRequest.create({
    guest: bookingData.guest,
    booking,
    serviceType,
    description,
    priority: priority || 'medium',
    assignedTo: req.user.role !== 'guest' ? req.user.id : undefined
  });

  // Emit service request created
  const io = req.app.get('io');
  io.emit('service-request-created', serviceRequest);

  res.status(201).json({
    success: true,
    data: serviceRequest,
    message: 'Service request created successfully'
  });
});

// @desc    Get service requests
// @route   GET /api/services
// @access  Private
export const getServiceRequests = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    serviceType,
    priority,
    guest,
    sortBy = 'createdAt',
    order = 'desc'
  } = req.query;

  let filter = {};

  // Role-based filtering
  if (req.user.role === 'guest') {
    filter.guest = req.user.id;
  } else {
    if (status) filter.status = status;
    if (serviceType) filter.serviceType = serviceType;
    if (priority) filter.priority = priority;
    if (guest) filter.guest = guest;
  }

  const sort = {};
  sort[sortBy] = order === 'desc' ? -1 : 1;

  const services = await ServiceRequest.find(filter)
    .populate('guest', 'name email phone')
    .populate('booking', 'bookingId')
    .populate('assignedTo', 'name')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await ServiceRequest.countDocuments(filter);

  res.json({
    success: true,
    data: services,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Update service request status
// @route   PUT /api/services/:id/status
// @access  Private/Receptionist
export const updateServiceStatus = asyncHandler(async (req, res) => {
  const { status, assignedTo, estimatedCompletion, cost } = req.body;

  const serviceRequest = await ServiceRequest.findById(req.params.id);

  if (!serviceRequest) {
    return res.status(404).json({
      success: false,
      message: 'Service request not found'
    });
  }

  // Update fields
  if (status) serviceRequest.status = status;
  if (assignedTo) serviceRequest.assignedTo = assignedTo;
  if (estimatedCompletion) serviceRequest.estimatedCompletion = estimatedCompletion;
  if (cost !== undefined) serviceRequest.cost = cost;

  // Set completedAt if status is completed
  if (status === 'completed' && !serviceRequest.completedAt) {
    serviceRequest.completedAt = new Date();
  }

  await serviceRequest.save();

  // Emit service request updated
  const io = req.app.get('io');
  io.emit('service-request-updated', serviceRequest);

  res.json({
    success: true,
    data: serviceRequest,
    message: 'Service request updated successfully'
  });
});

// @desc    Add guest feedback to service request
// @route   PUT /api/services/:id/feedback
// @access  Private
export const addServiceFeedback = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const serviceRequest = await ServiceRequest.findById(req.params.id);

  if (!serviceRequest) {
    return res.status(404).json({
      success: false,
      message: 'Service request not found'
    });
  }

  // Check if guest has access to this service request
  if (req.user.role === 'guest' && serviceRequest.guest.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to provide feedback for this service request'
    });
  }

  serviceRequest.guestFeedback = {
    rating,
    comment
  };

  await serviceRequest.save();

  res.json({
    success: true,
    data: serviceRequest,
    message: 'Feedback submitted successfully'
  });
});