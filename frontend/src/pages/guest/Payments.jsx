import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { paymentService } from '../../services/paymentService';
import { bookingService } from '../../services/bookingService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch payment history
      const paymentsResponse = await paymentService.getPayments();
      setPayments(paymentsResponse.data);

      // Fetch bookings with pending payments
      const bookingsResponse = await bookingService.getBookings({
        paymentStatus: ['pending', 'partial']
      });
      setPendingBookings(bookingsResponse.data);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (booking) => {
    setSelectedBooking(booking);
    setPaymentForm({
      amount: booking.remainingAmount || booking.totalAmount,
      paymentMethod: 'card',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      upiId: '',
      notes: ''
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const paymentData = {
        booking: selectedBooking._id,
        amount: parseFloat(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        notes: paymentForm.notes
      };

      // Add payment method specific data
      if (paymentForm.paymentMethod === 'card') {
        paymentData.cardLastFour = paymentForm.cardNumber.slice(-4);
      } else if (paymentForm.paymentMethod === 'upi') {
        paymentData.upiId = paymentForm.upiId;
      }

      await paymentService.createPayment(paymentData);
      
      setShowPaymentModal(false);
      setSelectedBooking(null);
      fetchData(); // Refresh data
      
      alert('Payment processed successfully!');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment. Please try again.');
    }
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'refunded': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      'cash': '💵',
      'card': '💳',
      'upi': '📱',
      'bank-transfer': '🏦',
      'wallet': '👛'
    };
    return icons[method] || '💰';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-2">Manage your payments and invoices</p>
        </div>
      </motion.div>

      {/* Pending Payments */}
      {pendingBookings.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Payments</h2>
          <div className="space-y-4">
            {pendingBookings.map((booking) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      Booking #{booking.bookingId}
                    </h3>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {booking.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Room {booking.room.roomNumber} • {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total: {formatCurrency(booking.totalAmount)} • Paid: {formatCurrency(booking.amountPaid)} • Due: {formatCurrency(booking.remainingAmount)}
                  </div>
                </div>
                <Button
                  onClick={() => handlePayment(booking)}
                  className="mt-3 lg:mt-0 lg:ml-4"
                >
                  Pay Now
                </Button>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Payment History */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment History</h2>
        
        {payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-6xl mb-4">💳</div>
            <p>No payment history</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment, index) => (
              <motion.div
                key={payment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <span className="text-2xl">
                    {getPaymentMethodIcon(payment.paymentMethod)}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        Payment #{payment.paymentId}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                        {payment.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Booking #{payment.booking.bookingId} • {formatDate(payment.createdAt)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Method: {payment.paymentMethod} • {payment.cardLastFour ? `Card: ****${payment.cardLastFour}` : ''}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mt-3 lg:mt-0">
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(payment.amount)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => paymentService.generateInvoice(payment.booking._id)}
                  >
                    Invoice
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedBooking(null);
        }}
        title="Process Payment"
        size="lg"
      >
        <form onSubmit={handlePaymentSubmit}>
          <div className="p-6 space-y-6">
            {/* Payment Summary */}
            {selectedBooking && (
              <Card className="p-4 bg-gray-50">
                <h4 className="font-semibold text-gray-900 mb-2">Payment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Booking:</span>
                    <span>#{selectedBooking.bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Room:</span>
                    <span>Room {selectedBooking.room.roomNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(selectedBooking.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount Paid:</span>
                    <span>{formatCurrency(selectedBooking.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Amount Due:</span>
                    <span className="text-primary-600">
                      {formatCurrency(selectedBooking.remainingAmount)}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-4">
                {['card', 'upi', 'cash', 'bank-transfer'].map((method) => (
                  <label
                    key={method}
                    className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                      paymentForm.paymentMethod === method
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentForm.paymentMethod === method}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="sr-only"
                    />
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 capitalize">
                            {method.replace('-', ' ')}
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl">
                        {getPaymentMethodIcon(method)}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Card Details */}
            {paymentForm.paymentMethod === 'card' && (
              <div className="space-y-4">
                <Input
                  label="Card Number"
                  type="text"
                  value={paymentForm.cardNumber}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                  placeholder="1234 5678 9012 3456"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Expiry Date"
                    type="text"
                    value={paymentForm.expiryDate}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                    placeholder="MM/YY"
                    required
                  />
                  <Input
                    label="CVV"
                    type="text"
                    value={paymentForm.cvv}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, cvv: e.target.value }))}
                    placeholder="123"
                    required
                  />
                </div>
              </div>
            )}

            {/* UPI Details */}
            {paymentForm.paymentMethod === 'upi' && (
              <Input
                label="UPI ID"
                type="text"
                value={paymentForm.upiId}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, upiId: e.target.value }))}
                placeholder="yourname@upi"
                required
              />
            )}

            {/* Amount */}
            <Input
              label="Amount to Pay"
              type="number"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
              min="1"
              max={selectedBooking?.remainingAmount}
              required
            />

            <Input
              label="Notes (Optional)"
              type="textarea"
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes..."
              rows="2"
            />
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowPaymentModal(false);
                setSelectedBooking(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!paymentForm.amount || parseFloat(paymentForm.amount) <= 0}
            >
              Process Payment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Payments;