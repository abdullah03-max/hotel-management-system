import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { bookingService } from '../../services/bookingService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ReceptionistBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const fetchBookings = async () => {
    try {
      const response = await bookingService.getBookings(filters);
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (bookingId) => {
    try {
      await bookingService.checkIn(bookingId);
      fetchBookings();
    } catch (error) {
      console.error('Error during check-in:', error);
      alert('Failed to check in guest');
    }
  };

  const handleCheckOut = async (bookingId) => {
    try {
      await bookingService.checkOut(bookingId);
      fetchBookings();
    } catch (error) {
      console.error('Error during check-out:', error);
      alert('Failed to check out guest');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'confirmed': 'bg-blue-100 text-blue-800',
      'checked-in': 'bg-green-100 text-green-800',
      'checked-out': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const canCheckIn = (booking) => {
    return booking.bookingStatus === 'confirmed';
  };

  const canCheckOut = (booking) => {
    return booking.bookingStatus === 'checked-in' && booking.paymentStatus === 'paid';
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
          <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-600 mt-2">Manage all hotel bookings</p>
        </div>
        <Button as="a" href="/receptionist/bookings/new">
          Create Booking
        </Button>
      </motion.div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked-in">Checked In</option>
              <option value="checked-out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <Input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search by guest name or booking ID..."
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => setFilters({ status: '', search: '' })}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600">
              {filters.status || filters.search ? 'Try adjusting your filters' : 'Create your first booking'}
            </p>
          </Card>
        ) : (
          bookings.map((booking, index) => (
            <motion.div
              key={booking._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Booking #{booking.bookingId}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.bookingStatus)}`}>
                        {booking.bookingStatus.replace('-', ' ').toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        Payment: {booking.paymentStatus.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-600">Guest:</span>
                        <p className="font-medium">{booking.guest.name}</p>
                        <p className="text-gray-500">{booking.guest.phone}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Room:</span>
                        <p className="font-medium">
                          {booking.room.roomNumber} - {booking.room.roomType}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Dates:</span>
                        <p className="font-medium">
                          {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Amount:</span>
                        <p className="font-medium">${booking.totalAmount}</p>
                        <p className="text-gray-500">
                          Paid: ${booking.amountPaid}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <span>
                        Guests: {booking.numberOfGuests.adults} adults, {booking.numberOfGuests.children} children
                      </span>
                      {booking.specialRequests && (
                        <p className="mt-1">
                          <span className="font-medium">Special requests:</span> {booking.specialRequests}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 mt-4 lg:mt-0 lg:ml-6">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      as="a" 
                      href={`/receptionist/bookings/${booking._id}`}
                    >
                      View Details
                    </Button>
                    
                    {canCheckIn(booking) && (
                      <Button 
                        size="sm" 
                        onClick={() => handleCheckIn(booking._id)}
                      >
                        Check In
                      </Button>
                    )}

                    {canCheckOut(booking) && (
                      <Button 
                        variant="outline"
                        size="sm" 
                        onClick={() => handleCheckOut(booking._id)}
                      >
                        Check Out
                      </Button>
                    )}

                    {booking.bookingStatus === 'checked-in' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        as="a" 
                        href={`/receptionist/services/new?booking=${booking._id}`}
                      >
                        Add Service
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReceptionistBookings;