import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import { asyncHandler } from '../middleware/authMiddleware.js';

// @desc    Create payment
// @route   POST /api/payments
// @access  Private
export const createPayment = asyncHandler(async (req, res) => {
  const {
    booking,
    amount,
    paymentMethod,
    paymentType,
    transactionId,
    cardLastFour,
    upiId,
    bankReference,
    notes
  } = req.body;

  // Verify booking exists
  const bookingData = await Booking.findById(booking);
  if (!bookingData) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Check authorization
  if (req.user.role === 'guest' && bookingData.guest.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to create payment for this booking'
    });
  }

  const payment = await Payment.create({
    booking,
    guest: bookingData.guest,
    amount,
    paymentMethod,
    paymentType: paymentType || 'booking',
    transactionId,
    cardLastFour,
    upiId,
    bankReference,
    notes,
    processedBy: req.user.id,
    status: 'completed' // Auto-complete for now, in real app you'd verify payment
  });

  // Update booking amount paid
  const totalPaid = await Payment.aggregate([
    { $match: { booking: bookingData._id, status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const paidAmount = totalPaid.length > 0 ? totalPaid[0].total : 0;
  bookingData.amountPaid = paidAmount;

  // Update payment status
  if (paidAmount >= bookingData.totalAmount) {
    bookingData.paymentStatus = 'paid';
  } else if (paidAmount > 0) {
    bookingData.paymentStatus = 'partial';
  }

  await bookingData.save();

  // Emit payment created and booking updated
  const io = req.app.get('io');
  io.emit('payment-created', payment);
  io.emit('booking-updated', bookingData);

  res.status(201).json({
    success: true,
    data: payment,
    message: 'Payment processed successfully'
  });
});

// @desc    Get payments
// @route   GET /api/payments
// @access  Private
export const getPayments = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    guest,
    booking,
    paymentMethod,
    status,
    startDate,
    endDate,
    sortBy = 'createdAt',
    order = 'desc'
  } = req.query;

  let filter = {};

  // Role-based filtering
  if (req.user.role === 'guest') {
    filter.guest = req.user.id;
  } else {
    if (guest) filter.guest = guest;
    if (booking) filter.booking = booking;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (status) filter.status = status;
  }

  // Date filtering
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const sort = {};
  sort[sortBy] = order === 'desc' ? -1 : 1;

  const payments = await Payment.find(filter)
    .populate('guest', 'name email phone')
    .populate('booking', 'bookingId checkIn checkOut')
    .populate('processedBy', 'name')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Payment.countDocuments(filter);

  // Calculate totals
  const totals = await Payment.aggregate([
    { $match: filter },
    { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
  ]);

  res.json({
    success: true,
    data: payments,
    totals: totals.length > 0 ? totals[0] : { totalAmount: 0 },
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Generate invoice PDF
// @route   GET /api/payments/invoice/:bookingId
// @access  Private
export const generateInvoicePDF = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId)
    .populate('guest', 'name email phone address')
    .populate('room', 'roomNumber roomType price');

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Check authorization
  if (req.user.role === 'guest' && booking.guest._id.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this invoice'
    });
  }

  // Get payments for this booking
  const payments = await Payment.find({ 
    booking: bookingId, 
    status: 'completed' 
  }).sort({ createdAt: -1 });

  // In a real implementation, you would use a PDF library like pdfkit
  // For now, we'll return the data that would be used to generate PDF
  const invoiceData = {
    invoiceNumber: `INV-${booking.bookingId}`,
    issueDate: new Date().toISOString().split('T')[0],
    booking,
    payments,
    totalPaid: payments.reduce((sum, payment) => sum + payment.amount, 0),
    remainingAmount: booking.totalAmount - payments.reduce((sum, payment) => sum + payment.amount, 0)
  };

  res.json({
    success: true,
    data: invoiceData,
    message: 'Invoice data generated successfully'
  });
});