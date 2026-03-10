import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Booking = () => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    specialRequests: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Available rooms data (same as in Rooms.jsx)
  const availableRooms = [
    { 
      id: 1, 
      type: 'Single Room', 
      roomType: 'single',
      price: 120, 
      description: 'Cozy room perfect for solo travelers',
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      amenities: ['wifi', 'tv', 'ac', 'shower', 'coffee-maker'],
      capacity: 1,
      beds: 1,
      bedType: 'Twin',
      size: '200 sq ft',
      floor: 1,
      status: 'available'
    },
    { 
      id: 2, 
      type: 'Double Room', 
      roomType: 'double',
      price: 180, 
      description: 'Comfortable room for two guests with modern amenities',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      amenities: ['wifi', 'tv', 'ac', 'coffee-maker', 'safe', 'balcony'],
      capacity: 2,
      beds: 1,
      bedType: 'Queen',
      size: '350 sq ft',
      floor: 2,
      status: 'available'
    },
    { 
      id: 3, 
      type: 'Standard Room', 
      roomType: 'standard',
      price: 150, 
      description: 'Comfortable room with basic amenities and great value',
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      amenities: ['wifi', 'tv', 'ac', 'coffee-maker', 'safe'],
      capacity: 2,
      beds: 1,
      bedType: 'Queen',
      size: '300 sq ft',
      floor: 2,
      status: 'available'
    },
    { 
      id: 4, 
      type: 'Deluxe Room', 
      roomType: 'deluxe',
      price: 250, 
      description: 'Spacious room with premium amenities and stunning views',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      amenities: ['wifi', 'tv', 'ac', 'minibar', 'safe', 'balcony', 'ocean-view', 'bathtub'],
      capacity: 3,
      beds: 2,
      bedType: 'King',
      size: '450 sq ft',
      floor: 3,
      status: 'available'
    },
    { 
      id: 5, 
      type: 'Executive Suite', 
      roomType: 'suite',
      price: 400, 
      description: 'Luxury suite with separate living area and premium services',
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      amenities: ['wifi', 'tv', 'ac', 'minibar', 'safe', 'balcony', 'bathtub', 'ocean-view', 'coffee-maker', 'iron'],
      capacity: 4,
      beds: 2,
      bedType: 'King',
      size: '650 sq ft',
      floor: 5,
      status: 'available'
    },
    { 
      id: 6, 
      type: 'Presidential Suite', 
      roomType: 'presidential',
      price: 800, 
      description: 'Ultimate luxury experience with premium services and panoramic views',
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      amenities: ['wifi', 'tv', 'ac', 'minibar', 'safe', 'balcony', 'bathtub', 'ocean-view', 'coffee-maker', 'iron', 'hairdryer', 'mountain-view'],
      capacity: 4,
      beds: 2,
      bedType: 'King',
      size: '1200 sq ft',
      floor: 8,
      status: 'available'
    }
  ];

  const selectedRoom = availableRooms.find(room => room.id === parseInt(roomId));

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          redirectTo: `/booking?roomId=${roomId}`,
          room: selectedRoom 
        } 
      });
    }
  }, [isAuthenticated, navigate, roomId, selectedRoom]);

  useEffect(() => {
    // Set maximum guests based on room capacity
    if (selectedRoom) {
      setBookingData(prev => ({
        ...prev,
        guests: Math.min(prev.guests, selectedRoom.capacity)
      }));
    }
  }, [selectedRoom]);

  const handleChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    });
  };

  const calculateTotal = () => {
    if (!bookingData.checkIn || !bookingData.checkOut || !selectedRoom) return 0;
    
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    return nights > 0 ? nights * selectedRoom.price : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!bookingData.checkIn || !bookingData.checkOut) {
      setError('Please select check-in and check-out dates');
      setLoading(false);
      return;
    }

    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      setError('Check-in date cannot be in the past');
      setLoading(false);
      return;
    }

    if (checkOut <= checkIn) {
      setError('Check-out date must be after check-in date');
      setLoading(false);
      return;
    }

    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    if (nights < 1) {
      setError('Minimum stay is 1 night');
      setLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create booking object
      const newBooking = {
        id: Date.now().toString(),
        roomId: selectedRoom.id,
        roomType: selectedRoom.type,
        roomDetails: selectedRoom,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: parseInt(bookingData.guests),
        specialRequests: bookingData.specialRequests,
        totalAmount: calculateTotal(),
        status: 'confirmed',
        bookingDate: new Date().toISOString(),
        nights: nights
      };

      // Save booking to localStorage
      const userBookings = JSON.parse(localStorage.getItem(`bookings_${user.id}`) || '[]');
      userBookings.push(newBooking);
      localStorage.setItem(`bookings_${user.id}`, JSON.stringify(userBookings));

      // Show success message and redirect
      alert(`🎉 Booking confirmed!\n\n${selectedRoom.type}\n${nights} night(s)\nTotal: $${calculateTotal()}`);
      
      // Redirect to guest panel
      navigate('/guest/panel');

    } catch (err) {
      setError('Booking failed. Please try again.');
    }

    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!selectedRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Room Not Found</h2>
          <p className="text-gray-600 mb-6">The room you're looking for doesn't exist or is no longer available.</p>
          <Button 
            onClick={() => navigate('/rooms')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Browse Available Rooms
          </Button>
        </Card>
      </div>
    );
  }

  const totalAmount = calculateTotal();
  const nights = Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Complete Your Booking</h1>
          <p className="text-lg text-gray-600">Finalize your reservation for a wonderful stay</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Booking Details</h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-in Date *
                    </label>
                    <Input
                      type="date"
                      name="checkIn"
                      value={bookingData.checkIn}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-out Date *
                    </label>
                    <Input
                      type="date"
                      name="checkOut"
                      value={bookingData.checkOut}
                      onChange={handleChange}
                      required
                      min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Guests *
                  </label>
                  <select
                    name="guests"
                    value={bookingData.guests}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Array.from({ length: selectedRoom.capacity }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>
                        {num} Guest{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests
                  </label>
                  <textarea
                    name="specialRequests"
                    value={bookingData.specialRequests}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any special requests or requirements for your stay..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !bookingData.checkIn || !bookingData.checkOut}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Processing Booking...
                    </div>
                  ) : (
                    `Confirm Booking - $${totalAmount}`
                  )}
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* Room Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 sticky top-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Room Summary</h2>
              
              <div className="space-y-4">
                <img
                  src={selectedRoom.image}
                  alt={selectedRoom.type}
                  className="w-full h-48 object-cover rounded-lg"
                />
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedRoom.type}</h3>
                  <p className="text-gray-600 mt-1">{selectedRoom.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <span>👤</span>
                    <span>{selectedRoom.capacity} Guests</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>🛏️</span>
                    <span>{selectedRoom.beds} {selectedRoom.bedType}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>📏</span>
                    <span>{selectedRoom.size}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>🏢</span>
                    <span>Floor {selectedRoom.floor}</span>
                  </div>
                </div>

                {/* Price Breakdown */}
                {bookingData.checkIn && bookingData.checkOut && nights > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Price Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>${selectedRoom.price} × {nights} night{nights > 1 ? 's' : ''}</span>
                        <span>${selectedRoom.price * nights}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t pt-2">
                        <span>Total</span>
                        <span>${totalAmount}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Your booking will be confirmed instantly. 
                    You can manage your bookings in the guest panel.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Booking;