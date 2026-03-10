import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Rooms.css'; // Import the CSS file

const Rooms = () => {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const navigate = useNavigate();

  // Load rooms from localStorage
  useEffect(() => {
    const loadRooms = () => {
      try {
        const savedRooms = JSON.parse(localStorage.getItem('hotelRooms') || '[]');
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
    window.addEventListener('storage', loadRooms);
    return () => window.removeEventListener('storage', loadRooms);
  }, []);

  const handleViewDetails = (room) => {
    setSelectedRoom(room);
    setShowRoomDetails(true);
  };

  const handleBookRoom = (room) => {
    navigate('/register', { 
      state: { 
        room: room,
        redirectTo: '/guest/panel'
      } 
    });
  };

  if (loading) {
    return (
      <div className="rooms-loading">
        <div className="loading-spinner"></div>
        <p>Loading available rooms...</p>
      </div>
    );
  }

  return (
    <div className="rooms-page">
      {/* Header */}
      <header className="rooms-header">
        <div className="container">
          <div className="rooms-nav-container">
            <h1 className="rooms-logo" onClick={() => navigate('/')}>Luxury Stay</h1>
            <div className="rooms-nav-buttons">
              <button 
                className="rooms-nav-btn login"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button 
                className="rooms-nav-btn register"
                onClick={() => navigate('/register')}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="rooms-hero">
        <div className="container">
          <div className="rooms-hero-content">
            <h1>Our Luxury Rooms</h1>
            <p>Experience unparalleled comfort and elegance</p>
          </div>
        </div>
      </section>

      {/* Rooms Grid Section */}
      <section className="rooms-grid-section">
        <div className="container">
          <div className="rooms-stats">
            <h2>Available Rooms</h2>
            <p>
              {availableRooms.length} room{availableRooms.length !== 1 ? 's' : ''} available
            </p>
          </div>

          {availableRooms.length === 0 ? (
            <div className="no-rooms">
              <div className="no-rooms-icon">🏨</div>
              <h3>No Rooms Available</h3>
              <p>All rooms are currently occupied or under maintenance.</p>
              <p className="subtext">Please check back later.</p>
            </div>
          ) : (
            <div className="rooms-grid">
              {availableRooms.map(room => (
                <div key={room.id} className="room-card">
                  <img 
                    src={room.image} 
                    alt={room.type}
                    className="room-image"
                  />
                  <div className="room-content">
                    <div className="room-header">
                      <h3 className="room-title">{room.type.replace('_', ' ')} Room</h3>
                      <span className="room-number">Room {room.number}</span>
                    </div>
                    <p className="room-description">
                      {room.description || `Comfortable ${room.type} room with modern amenities`}
                    </p>
                    
                    <div className="room-price">${room.price}/night</div>
                    <p className="room-details">
                      {room.capacity} {room.capacity > 1 ? 'guests' : 'guest'} • {room.size} sq ft
                    </p>

                    <div className="room-amenities">
                      <h5 className="amenities-title">Amenities:</h5>
                      <div className="amenities-list">
                        {room.amenities.slice(0, 4).map((amenity, index) => (
                          <span key={index} className="amenity-tag">
                            {amenity}
                          </span>
                        ))}
                        {room.amenities.length > 4 && (
                          <span className="amenity-more">
                            +{room.amenities.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="room-actions">
                      <button 
                        className="room-btn details"
                        onClick={() => handleViewDetails(room)}
                      >
                        View Details
                      </button>
                      <button 
                        className="room-btn book"
                        onClick={() => handleBookRoom(room)}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Room Details Modal */}
      {showRoomDetails && selectedRoom && (
        <div className="room-modal-overlay">
          <div className="room-modal">
            <div className="modal-header">
              <h2 className="modal-title">
                Room {selectedRoom.number} - {selectedRoom.type.replace('_', ' ')} Room
              </h2>
              <button 
                className="modal-close"
                onClick={() => setShowRoomDetails(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <img 
                src={selectedRoom.image} 
                alt={selectedRoom.type}
                className="modal-image"
              />
              
              <div className="modal-grid">
                <div className="modal-section">
                  <h3>Room Information</h3>
                  <div className="info-grid">
                    <div className="info-row">
                      <span className="info-label">Room Number:</span>
                      <span className="info-value">{selectedRoom.number}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Room Type:</span>
                      <span className="info-value">{selectedRoom.type.replace('_', ' ')}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Price per Night:</span>
                      <span className="info-value price">${selectedRoom.price}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Capacity:</span>
                      <span className="info-value">
                        {selectedRoom.capacity} {selectedRoom.capacity > 1 ? 'guests' : 'guest'}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Room Size:</span>
                      <span className="info-value">{selectedRoom.size} sq ft</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Floor:</span>
                      <span className="info-value">{selectedRoom.floor}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">View:</span>
                      <span className="info-value">{selectedRoom.view} View</span>
                    </div>
                  </div>
                </div>

                <div className="modal-section">
                  <h3>Description & Amenities</h3>
                  <p className="room-description">
                    {selectedRoom.description || `Comfortable ${selectedRoom.type} room with modern amenities`}
                  </p>
                  
                  <h4 className="amenities-title">All Amenities:</h4>
                  <div className="amenities-grid">
                    {selectedRoom.amenities.map((amenity, index) => (
                      <span key={index} className="amenity-badge">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="modal-btn close"
                  onClick={() => setShowRoomDetails(false)}
                >
                  Close
                </button>
                <button
                  className="modal-btn book"
                  onClick={() => {
                    handleBookRoom(selectedRoom);
                    setShowRoomDetails(false);
                  }}
                >
                  Book This Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;