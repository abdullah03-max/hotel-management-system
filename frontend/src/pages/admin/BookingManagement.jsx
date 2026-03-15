import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    loadAllBookings();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(loadAllBookings, 5000);
    return () => clearInterval(interval);
  }, []);

  // Load all bookings from all guests
  const loadAllBookings = () => {
    try {
      setLoading(true);
      
      // Get all guests from hotelGuests
      const hotelGuests = JSON.parse(localStorage.getItem('hotelGuests') || '[]');
      let allBookings = [];

      // Loop through all guests and get their bookings
      hotelGuests.forEach(guest => {
        try {
          const guestBookings = JSON.parse(localStorage.getItem(`bookings_${guest.id}`) || '[]');
          // Add guest information to each booking
          const bookingsWithGuestInfo = guestBookings.map(booking => ({
            ...booking,
            guestId: guest.id,
            guestName: guest.name,
            guestEmail: guest.email,
            guestPhone: guest.phone
          }));
          allBookings = [...allBookings, ...bookingsWithGuestInfo];
        } catch (error) {
          console.error(`Error loading bookings for guest ${guest.id}:`, error);
        }
      });

      // Sort by booking date (newest first)
      allBookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
      
      setBookings(allBookings);
      setLoading(false);
      
    } catch (error) {
      console.error('Error loading all bookings:', error);
      setLoading(false);
    }
  };

  // View Booking Details
  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowViewModal(true);
  };

  // Open Status Update Modal
  const handleUpdateStatus = (booking) => {
    setSelectedBooking(booking);
    setShowStatusModal(true);
  };

  // Update Booking Status
  const handleStatusUpdate = (newStatus) => {
    if (!selectedBooking) return;

    // Update in guest's bookings
    const guestBookings = JSON.parse(localStorage.getItem(`bookings_${selectedBooking.guestId}`) || '[]');
    const updatedBookings = guestBookings.map(b => 
      b.id === selectedBooking.id ? { ...b, status: newStatus } : b
    );

    localStorage.setItem(`bookings_${selectedBooking.guestId}`, JSON.stringify(updatedBookings));
    
    // Save notification for guest
    saveGuestNotification(selectedBooking, newStatus);
    
    // Refresh bookings
    loadAllBookings();
    
    setShowStatusModal(false);
    setSelectedBooking(null);
    
    const statusMessages = {
      'pending': '⏳ Booking status set to Pending',
      'confirmed': '✅ Booking confirmed successfully!',
      'cancelled': '❌ Booking cancelled!'
    };
    
    alert(statusMessages[newStatus] || 'Status updated successfully!');
  };

  // Save notification for guest
  const saveGuestNotification = (booking, newStatus) => {
    const notification = {
      id: Date.now(),
      type: 'booking_status',
      message: newStatus === 'confirmed' 
        ? `🎉 Your booking for ${booking.roomType} has been confirmed! Check-in: ${new Date(booking.checkIn).toLocaleDateString()}`
        : newStatus === 'cancelled'
        ? `😔 Sorry, your booking for ${booking.roomType} has been cancelled.`
        : `⏳ Your booking for ${booking.roomType} is pending approval.`,
      status: newStatus,
      bookingId: booking.id,
      timestamp: new Date().toISOString(),
      read: false
    };

    // Save to guest's notifications
    const guestNotifications = JSON.parse(localStorage.getItem(`notifications_${booking.guestId}`) || '[]');
    guestNotifications.unshift(notification);
    localStorage.setItem(`notifications_${booking.guestId}`, JSON.stringify(guestNotifications));
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status badge text
  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  // Calculate stats
  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    totalRevenue: bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + (b.totalAmount || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking data...</p>
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
          <h2 className="text-xl font-semibold text-gray-900">Booking Management</h2>
          <p className="text-gray-600 mt-1">Manage guest bookings and status</p>
          <p className="text-sm text-green-600 mt-1">
            📊 Total: {stats.total} | ✅ Confirmed: {stats.confirmed} | ⏳ Pending: {stats.pending} | ❌ Cancelled: {stats.cancelled}
          </p>
        </div>
        <Button 
          onClick={loadAllBookings}
          className="bg-green-600 hover:bg-green-700"
        >
          ↻ Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-l-4 border-l-blue-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Total Bookings</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </Card>
        <Card className="bg-white border-l-4 border-l-green-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Confirmed</p>
            <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
          </div>
        </Card>
        <Card className="bg-white border-l-4 border-l-yellow-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          </div>
        </Card>
        <Card className="bg-white border-l-4 border-l-red-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Cancelled</p>
            <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
          </div>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{booking.guestId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.guestName}</div>
                    <div className="text-sm text-gray-500">{booking.roomType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleViewBooking(booking)}
                      className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                    >
                      👁️ View
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(booking)}
                      className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-lg transition-colors"
                    >
                      📝 Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {bookings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-600">There are no bookings in the system yet.</p>
          </div>
        )}
      </Card>

      {/* View Booking Modal */}
      {showViewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Guest Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Guest ID</p>
                      <p className="font-medium">#{selectedBooking.guestId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Guest Name</p>
                      <p className="font-medium">{selectedBooking.guestName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedBooking.guestEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{selectedBooking.guestPhone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Booking Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Booking ID</p>
                      <p className="font-medium">#{selectedBooking.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedBooking.status)}`}>
                        {getStatusText(selectedBooking.status)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Booking Date</p>
                      <p className="font-medium">{new Date(selectedBooking.bookingDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Number of Guests</p>
                      <p className="font-medium">{selectedBooking.guests} {selectedBooking.guests === 1 ? 'Guest' : 'Guests'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Room Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Room Type</p>
                      <p className="font-medium text-lg">{selectedBooking.roomType}</p>
                      {selectedBooking.roomDetails?.description && (
                        <p className="text-sm text-gray-600 mt-1">{selectedBooking.roomDetails.description}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="font-medium text-lg">
                        ${selectedBooking.roomDetails?.price || selectedBooking.totalAmount / selectedBooking.nights}/night
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedBooking.nights} nights × ${selectedBooking.roomDetails?.price || selectedBooking.totalAmount / selectedBooking.nights} = ${selectedBooking.totalAmount}
                      </p>
                    </div>
                  </div>

                  {/* Facilities/Amenities */}
                  {selectedBooking.roomDetails?.amenities && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Room Facilities:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedBooking.roomDetails.amenities.map((amenity, index) => (
                          <span key={index} className="bg-white px-3 py-1 text-xs rounded-full border border-gray-200">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Stay Duration</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Check-in Date</p>
                      <p className="font-medium">{new Date(selectedBooking.checkIn).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Check-out Date</p>
                      <p className="font-medium">{new Date(selectedBooking.checkOut).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Nights</p>
                      <p className="font-medium">{selectedBooking.nights} nights</p>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-medium text-2xl text-green-600">${selectedBooking.totalAmount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Status</p>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Paid
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.specialRequests && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Requests</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedBooking.specialRequests}</p>
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <Button
                  onClick={() => {
                    setShowViewModal(false);
                    handleUpdateStatus(selectedBooking);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  📝 Update Status
                </Button>
                <Button
                  onClick={() => setShowViewModal(false)}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full"
          >
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Update Booking Status</h2>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Update status for <strong>{selectedBooking.guestName}</strong>'s booking:
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm font-medium text-gray-900">Booking Details:</p>
                <p className="text-sm text-gray-600">
                  {selectedBooking.roomType}<br/>
                  {new Date(selectedBooking.checkIn).toLocaleDateString()} to {new Date(selectedBooking.checkOut).toLocaleDateString()}<br/>
                  Current Status: <span className={`${getStatusColor(selectedBooking.status)} px-2 py-1 rounded-full text-xs`}>
                    {getStatusText(selectedBooking.status)}
                  </span>
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handleStatusUpdate('pending')}
                  className="w-full text-left p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">⏳</span>
                    <div>
                      <p className="font-medium text-yellow-800">Set as Pending</p>
                      <p className="text-sm text-yellow-600">Booking is under review</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleStatusUpdate('confirmed')}
                  className="w-full text-left p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">✅</span>
                    <div>
                      <p className="font-medium text-green-800">Confirm Booking</p>
                      <p className="text-sm text-green-600">Accept and confirm this booking</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleStatusUpdate('cancelled')}
                  className="w-full text-left p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">❌</span>
                    <div>
                      <p className="font-medium text-red-800">Cancel Booking</p>
                      <p className="text-sm text-red-600">Reject and cancel this booking</p>
                    </div>
                  </div>
                </button>
              </div>

              <Button
                onClick={() => setShowStatusModal(false)}
                className="w-full bg-gray-600 hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default BookingManagement;
