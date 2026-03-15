import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const RoomsTab = ({ activeTab, setShowBookingForm, setBookingData, onLogout }) => {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);

  // Load rooms from localStorage
  useEffect(() => {
    const loadRooms = () => {
      try {
        const savedRooms = JSON.parse(localStorage.getItem('hotelRooms') || '[]');
        // Filter only available rooms for guests
        const available = savedRooms.filter(room => room.status === 'available');
        setAvailableRooms(available);
      } catch (error) {
        console.error('Error loading rooms:', error);
        setAvailableRooms([]);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
    
    // Listen for storage changes to update rooms in real-time
    const handleStorageChange = () => {
      loadRooms();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleViewDetails = (room) => {
    setSelectedRoom(room);
    setShowRoomDetails(true);
  };

  // Updated booking handler
  const handleBookRoom = (room) => {
    setBookingData(prev => ({ 
      ...prev, 
      roomType: room.type,
      roomNumber: room.number,
      roomPrice: room.price,
      roomId: room.id,
      paymentMethod: '' // Reset payment method when booking new room
    }));
    setShowBookingForm(true);
  };

  if (activeTab !== 'rooms') return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading available rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Available Rooms</h3>
          <p className="text-gray-600 mt-1">
            {availableRooms.length} room{availableRooms.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={() => {
              // Show booking form with room selection
              setBookingData(prev => ({ 
                ...prev, 
                paymentMethod: '' 
              }));
              setShowBookingForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            + Book Room
          </Button>
          <Button 
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700"
          >
            🚪 Logout
          </Button>
        </div>
      </div>

      {availableRooms.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏨</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rooms Available</h3>
            <p className="text-gray-600">All rooms are currently occupied or under maintenance.</p>
            <p className="text-gray-500 text-sm mt-2">Please check back later.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableRooms.map(room => (
            <Card key={room.id} className="hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <img 
                  src={room.image} 
                  alt={room.type}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xl font-semibold text-gray-900 capitalize">
                    {room.type.replace('_', ' ')} Room
                  </h4>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Room {room.number}
                  </span>
                </div>
                <p className="text-gray-600 mb-3 text-sm">
                  {room.description || `Comfortable ${room.type} room with modern amenities`}
                </p>
                
                <div className="mb-4">
                  <p className="text-2xl font-bold text-blue-600">${room.price}/night</p>
                  <p className="text-sm text-gray-500">
                    {room.capacity} {room.capacity > 1 ? 'guests' : 'guest'} • {room.size} sq ft
                  </p>
                </div>

                <div className="mb-4">
                  <h5 className="font-medium text-gray-900 mb-2 text-sm">Amenities:</h5>
                  <div className="flex flex-wrap gap-1">
                    {room.amenities.slice(0, 4).map((amenity, index) => (
                      <span key={index} className="bg-gray-100 px-2 py-1 text-xs rounded">
                        {amenity}
                      </span>
                    ))}
                    {room.amenities.length > 4 && (
                      <span className="bg-gray-100 px-2 py-1 text-xs rounded">
                        +{room.amenities.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={() => handleViewDetails(room)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700"
                  >
                    View Details
                  </Button>
                  <Button 
                    onClick={() => handleBookRoom(room)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Room Details Modal */}
      {showRoomDetails && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Room {selectedRoom.number} - {selectedRoom.type.replace('_', ' ')} Room
                </h2>
                <button 
                  onClick={() => setShowRoomDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <img 
                src={selectedRoom.image} 
                alt={selectedRoom.type}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room Number:</span>
                      <span className="font-medium">{selectedRoom.number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room Type:</span>
                      <span className="font-medium capitalize">{selectedRoom.type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price per Night:</span>
                      <span className="font-medium text-green-600">${selectedRoom.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium">{selectedRoom.capacity} {selectedRoom.capacity > 1 ? 'guests' : 'guest'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room Size:</span>
                      <span className="font-medium">{selectedRoom.size} sq ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Floor:</span>
                      <span className="font-medium">{selectedRoom.floor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">View:</span>
                      <span className="font-medium capitalize">{selectedRoom.view} View</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Description & Amenities</h3>
                  <p className="text-gray-600 mb-4">
                    {selectedRoom.description || `Comfortable ${selectedRoom.type} room with modern amenities`}
                  </p>
                  
                  <h4 className="font-medium text-gray-900 mb-2">All Amenities:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoom.amenities.map((amenity, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 text-sm rounded-full">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-4 border-t">
                <Button
                  onClick={() => setShowRoomDetails(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    handleBookRoom(selectedRoom);
                    setShowRoomDetails(false);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Book This Room
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsTab;
