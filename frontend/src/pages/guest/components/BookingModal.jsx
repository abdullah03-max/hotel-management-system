import React from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/ui/Button';

const BookingModal = ({
  showBookingForm,
  setShowBookingForm,
  bookingData,
  handleBookingChange,
  handleMakeBooking,
  availableRooms
}) => {
  if (!showBookingForm) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Book a Room</h2>
            <button 
              onClick={() => setShowBookingForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleMakeBooking} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Type
              </label>
              <select
                name="roomType"
                value={bookingData.roomType}
                onChange={handleBookingChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Room Type</option>
                {availableRooms.map(room => (
                  <option key={room.id} value={room.type}>
                    {room.type} - ${room.price}/night
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Guests
              </label>
              <select
                name="guests"
                value={bookingData.guests}
                onChange={handleBookingChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {[1, 2, 3, 4].map(num => (
                  <option key={num} value={num}>
                    {num} Guest{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-in Date
              </label>
              <input
                type="date"
                name="checkIn"
                value={bookingData.checkIn}
                onChange={handleBookingChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-out Date
              </label>
              <input
                type="date"
                name="checkOut"
                value={bookingData.checkOut}
                onChange={handleBookingChange}
                required
                min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Requests
            </label>
            <textarea
              name="specialRequests"
              value={bookingData.specialRequests}
              onChange={handleBookingChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any special requests or requirements..."
            />
          </div>

          {bookingData.roomType && bookingData.checkIn && bookingData.checkOut && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Booking Summary</h4>
              <div className="text-sm text-blue-700">
                <p><strong>Room:</strong> {bookingData.roomType}</p>
                <p><strong>Duration:</strong> {Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24))} nights</p>
                <p><strong>Total:</strong> ${availableRooms.find(r => r.type === bookingData.roomType)?.price * Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24))}</p>
              </div>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Booking Request
            </Button>
            <Button
              type="button"
              onClick={() => setShowBookingForm(false)}
              className="bg-gray-600 hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default BookingModal;
