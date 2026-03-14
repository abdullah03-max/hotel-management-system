import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Payment methods with icons
  const paymentMethods = {
    credit_card: { label: 'Credit Card', icon: '💳' },
    debit_card: { label: 'Debit Card', icon: '💳' },
    paypal: { label: 'PayPal', icon: '📱' },
    cash: { label: 'Cash', icon: '💰' },
    bank_transfer: { label: 'Bank Transfer', icon: '🏦' },
    upi: { label: 'UPI Payment', icon: '📲' }
  };

  // Status options for filtering
  const statusOptions = [
    { value: 'all', label: 'All Payments' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' }
  ];

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = () => {
    try {
      const savedPayments = JSON.parse(localStorage.getItem('hotelPayments') || '[]');
      
      // Sort payments by creation date (newest first)
      const sortedPayments = savedPayments.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setPayments(sortedPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = (paymentId, newStatus) => {
    const updatedPayments = payments.map(payment =>
      payment.id === paymentId ? { ...payment, status: newStatus } : payment
    );
    
    // Save to localStorage
    localStorage.setItem('hotelPayments', JSON.stringify(updatedPayments));
    
    // Update state
    setPayments(updatedPayments);
    
    // Also update the booking payment status if it exists
    updateBookingPaymentStatus(paymentId, newStatus);
    
    // Show success message
    alert(`Payment status updated to: ${newStatus}`);
  };

  const updateBookingPaymentStatus = (paymentId, newStatus) => {
    try {
      // Get all users' bookings and update the matching payment status
      const keys = Object.keys(localStorage);
      const bookingKeys = keys.filter(key => key.startsWith('bookings_'));
      
      bookingKeys.forEach(key => {
        const userBookings = JSON.parse(localStorage.getItem(key) || '[]');
        const updatedBookings = userBookings.map(booking => {
          if (booking.paymentId === paymentId) {
            return {
              ...booking,
              paymentStatus: newStatus,
              // If payment is completed, also confirm the booking
              status: newStatus === 'completed' ? 'confirmed' : booking.status
            };
          }
          return booking;
        });
        localStorage.setItem(key, JSON.stringify(updatedBookings));
      });
    } catch (error) {
      console.error('Error updating booking payment status:', error);
    }
  };

  const processRefund = (paymentId) => {
    if (window.confirm('Are you sure you want to process a refund for this payment?')) {
      updatePaymentStatus(paymentId, 'refunded');
    }
  };

  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border border-red-200';
      case 'refunded': return 'bg-purple-100 text-purple-800 border border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusActions = (payment) => {
    switch (payment.status) {
      case 'pending':
        return (
          <>
            <button 
              onClick={() => updatePaymentStatus(payment.id, 'completed')}
              className="bg-green-600 text-white py-2 px-4 rounded text-sm hover:bg-green-700 transition-colors"
            >
              Mark as Paid
            </button>
            <button 
              onClick={() => updatePaymentStatus(payment.id, 'failed')}
              className="bg-red-600 text-white py-2 px-4 rounded text-sm hover:bg-red-700 transition-colors"
            >
              Mark as Failed
            </button>
          </>
        );
      case 'completed':
        return (
          <button 
            onClick={() => processRefund(payment.id)}
            className="bg-purple-600 text-white py-2 px-4 rounded text-sm hover:bg-purple-700 transition-colors"
          >
            Process Refund
          </button>
        );
      case 'failed':
        return (
          <button 
            onClick={() => updatePaymentStatus(payment.id, 'pending')}
            className="bg-yellow-600 text-white py-2 px-4 rounded text-sm hover:bg-yellow-700 transition-colors"
          >
            Mark as Pending
          </button>
        );
      default:
        return null;
    }
  };

  // Filter payments based on status
  const filteredPayments = statusFilter === 'all' 
    ? payments 
    : payments.filter(payment => payment.status === statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment data...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Payment & Billing Management</h2>
          <p className="text-gray-600 mt-1">Manage guest payments, update payment status, and process refunds</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-l-4 border-l-blue-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">
              ${payments.reduce((total, payment) => total + (payment.status === 'completed' ? payment.amount : 0), 0)}
            </p>
          </div>
        </Card>
        <Card className="bg-white border-l-4 border-l-green-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-gray-900">
              {payments.filter(payment => payment.status === 'completed').length}
            </p>
          </div>
        </Card>
        <Card className="bg-white border-l-4 border-l-yellow-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-gray-900">
              {payments.filter(payment => payment.status === 'pending').length}
            </p>
          </div>
        </Card>
        <Card className="bg-white border-l-4 border-l-red-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Failed/Refunded</p>
            <p className="text-2xl font-bold text-gray-900">
              {payments.filter(payment => payment.status === 'failed' || payment.status === 'refunded').length}
            </p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Payment Records</h3>
              <p className="text-gray-600 text-sm">
                {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Payments Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest & Booking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{payment.guestName}</div>
                      <div className="text-sm text-gray-500">{payment.guestEmail}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Room {payment.roomNumber} • {payment.nights} night{payment.nights !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">${payment.amount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{paymentMethods[payment.method]?.icon}</span>
                      <span className="text-sm text-gray-600">{paymentMethods[payment.method]?.label}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => viewPaymentDetails(payment)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        View
                      </button>
                      {getStatusActions(payment)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payments Found</h3>
            <p className="text-gray-600">
              {statusFilter === 'all' 
                ? 'No payment records available yet.' 
                : `No ${statusFilter} payments found.`
              }
            </p>
          </div>
        )}
      </Card>

      {/* Payment Details Modal */}
      {showPaymentDetails && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
                <button 
                  onClick={() => setShowPaymentDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guest Name:</span>
                      <span className="font-medium">{selectedPayment.guestName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guest Email:</span>
                      <span className="font-medium">{selectedPayment.guestEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking ID:</span>
                      <span className="font-medium">{selectedPayment.bookingId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room:</span>
                      <span className="font-medium">{selectedPayment.roomType} (Room {selectedPayment.roomNumber})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stay Duration:</span>
                      <span className="font-medium">{selectedPayment.nights} night{selectedPayment.nights !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium text-green-600">${selectedPayment.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium">
                        {paymentMethods[selectedPayment.method]?.icon} {paymentMethods[selectedPayment.method]?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Date:</span>
                      <span className="font-medium">{new Date(selectedPayment.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPayment.status)}`}>
                        {selectedPayment.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Payment Status</h3>
                <div className="flex flex-wrap gap-2">
                  {getStatusActions(selectedPayment)}
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t mt-6">
                <Button
                  onClick={() => setShowPaymentDetails(false)}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PaymentManagement;