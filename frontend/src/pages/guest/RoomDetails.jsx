import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { roomService } from '../../services/roomService';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const RoomDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
    specialRequests: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    fetchRoomDetails();
    
    // Check if book parameter is present
    if (searchParams.get('book') === 'true') {
      setShowBookingModal(true);
    }
  }, [id, searchParams]);

  const fetchRoomDetails = async () => {
    try {
      const response = await roomService.getRoomById(id);
      setRoom(response.data);
    } catch (error) {
      console.error('Error fetching room details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const diffTime = Math.abs(checkOut - checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    return room ? room.price * nights : 0;
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = `/auth/login?redirect=/rooms/${id}?book=true`;
      return;
    }
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!room) return;

    setBookingLoading(true);
    try {
      // Here you would integrate with the booking service
      console.log('Booking data:', {
        room: room._id,
        ...bookingData,
        totalAmount: calculateTotal()
      });
      
      // For now, just show success message
      alert('Booking functionality will be implemented with the booking service');
      setShowBookingModal(false);
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const getAmenityIcon = (amenity) => {
    const iconMap = {
      wifi: { icon: '📶', label: 'Free WiFi' },
      tv: { icon: '📺', label: 'Smart TV' },
      ac: { icon: '❄️', label: 'Air Conditioning' },
      heating: { icon: '🔥', label: 'Heating' },
      minibar: { icon: '🍷', label: 'Mini Bar' },
      safe: { icon: '🔒', label: 'Safe' },
      balcony: { icon: '🌅', label: 'Balcony' },
      'ocean-view': { icon: '🌊', label: 'Ocean View' },
      'mountain-view': { icon: '🏔️', label: 'Mountain View' },
      bathtub: { icon: '🛁', label: 'Bathtub' },
      shower: { icon: '🚿', label: 'Rain Shower' },
      'coffee-maker': { icon: '☕', label: 'Coffee Maker' },
      iron: { icon: '🧺', label: 'Iron' },
      hairdryer: { icon: '💇', label: 'Hair Dryer' }
    };

    return iconMap[amenity] || { icon: '✅', label: amenity };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Room not found</h1>
          <Link to="/rooms">
            <Button>Back to Rooms</Button>
          </Link>
        </div>
      </div>
    );
  }

  const nights = calculateNights();
  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link to="/rooms" className="text-primary-600 hover:text-primary-500">
            ← Back to Rooms
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <Card className="overflow-hidden mb-8">
              {room.images?.[0] ? (
                <img
                  src={room.images[0].url}
                  alt={room.images[0].alt}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center text-white text-4xl">
                  {room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1)} Room
                </div>
              )}
            </Card>

            {/* Room Details */}
            <Card className="p-6 mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1)} Room
                  </h1>
                  <p className="text-xl text-primary-600 font-semibold">
                    ${room.price} <span className="text-gray-600 text-lg font-normal">per night</span>
                  </p>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    room.status === 'available' 
                      ? 'bg-green-100 text-green-800'
                      : room.status === 'occupied'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Room {room.roomNumber}</p>
                </div>
              </div>

              <p className="text-gray-700 text-lg mb-6">{room.description}</p>

              {/* Room Specifications */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">👤</div>
                  <div className="font-semibold">{room.capacity} Guests</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">🛏️</div>
                  <div className="font-semibold">{room.beds} {room.bedType} Beds</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">📏</div>
                  <div className="font-semibold">{room.size}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">🏢</div>
                  <div className="font-semibold">Floor {room.floor}</div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {room.amenities.map((amenity) => {
                    const { icon, label } = getAmenityIcon(amenity);
                    return (
                      <div key={amenity} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-xl">{icon}</span>
                        <span className="text-gray-700">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Book This Room</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per night:</span>
                  <span className="font-semibold">${room.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-semibold ${
                    room.status === 'available' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                  </span>
                </div>
              </div>

              {room.status === 'available' ? (
                <Button 
                  onClick={handleBookNow}
                  className="w-full"
                  size="lg"
                >
                  Book Now
                </Button>
              ) : (
                <Button 
                  disabled
                  className="w-full"
                  size="lg"
                >
                  Not Available
                </Button>
              )}

              {/* Quick Info */}
              <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                <h4 className="font-semibold text-primary-900 mb-2">Need Help?</h4>
                <p className="text-sm text-primary-700">
                  Our team is available 24/7 to assist with your booking.
                </p>
                <div className="mt-2 text-sm text-primary-600">
                  📞 +1 (555) 123-4567
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Book This Room"
        size="lg"
      >
        <form onSubmit={handleBookingSubmit}>
          <div className="p-6 space-y-6">
            {/* Room Summary */}
            <Card className="p-4 bg-gray-50">
              <div className="flex items-center space-x-4">
                {room.images?.[0] && (
                  <img
                    src={room.images[0].url}
                    alt={room.images[0].alt}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1)} Room
                  </h4>
                  <p className="text-primary-600 font-semibold">${room.price}/night</p>
                </div>
              </div>
            </Card>

            {/* Booking Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Check-in Date"
                type="date"
                name="checkIn"
                value={bookingData.checkIn}
                onChange={handleBookingChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
              <Input
                label="Check-out Date"
                type="date"
                name="checkOut"
                value={bookingData.checkOut}
                onChange={handleBookingChange}
                required
                min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Adults"
                type="number"
                name="adults"
                value={bookingData.adults}
                onChange={handleBookingChange}
                min="1"
                max={room.capacity}
                required
              />
              <Input
                label="Children"
                type="number"
                name="children"
                value={bookingData.children}
                onChange={handleBookingChange}
                min="0"
                max={room.capacity - bookingData.adults}
                required
              />
            </div>

            <Input
              label="Special Requests"
              type="textarea"
              name="specialRequests"
              value={bookingData.specialRequests}
              onChange={handleBookingChange}
              placeholder="Any special requirements or requests..."
              rows="3"
            />

            {/* Price Summary */}
            {nights > 0 && (
              <Card className="p-4 bg-gray-50">
                <h4 className="font-semibold text-gray-900 mb-3">Price Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>${room.price} × {nights} nights</span>
                    <span>${room.price * nights}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary-600">${total}</span>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowBookingModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={bookingLoading}
              disabled={!bookingData.checkIn || !bookingData.checkOut || nights === 0}
            >
              Confirm Booking
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RoomDetails;
