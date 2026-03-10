import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const ServicesTab = ({ activeTab, user, onLogout }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [showServiceDetails, setShowServiceDetails] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestData, setRequestData] = useState({
    serviceId: '',
    serviceName: '',
    servicePrice: 0,
    quantity: 1,
    preferredTime: '',
    specialInstructions: '',
    roomNumber: ''
  });
  const [userBookings, setUserBookings] = useState([]);

  // Complete service icons mapping
  const serviceIcons = {
    // Front Desk / Reception Services
    '24/7 Reception': '🏨',
    'Express Check-in / Check-out': '⚡',
    'Concierge Service': '🎩',
    'VIP Guest Handling': '⭐',
    'Luggage Handling / Porter Service': '🧳',
    'Travel Assistance (Taxi, tours, car rental)': '🚕',

    // Room Services
    '24/7 Room Service': '🍽️',
    'Daily Housekeeping': '🧹',
    'Laundry & Ironing': '👕',
    'In-Room Dining': '🍴',
    'Mini-Bar': '🍷',
    'Butler Service (VIP)': '👔',

    // Food & Beverage Services
    'Multi-Cuisine Restaurant': '🍜',
    'Fine Dining Restaurant': '🥂',
    'Café / Coffee Shop': '☕',
    'Rooftop Dining': '🏙️',
    'Poolside Bar': '🍹',
    'Breakfast Buffet': '🍳',
    'In-Room Breakfast': '🥞',

    // Wellness & Fitness Services
    'Gym / Fitness Center': '💪',
    'Spa & Massage': '💆',
    'Sauna / Steam Room': '🧖',
    'Beauty Salon': '💇',
    'Yoga / Meditation Sessions': '🧘',

    // Leisure & Recreation
    'Swimming Pool': '🏊',
    'Kids Pool': '👶',
    'Game Zone': '🎮',
    'Indoor Sports': '🏸',
    'Cinema Room (VIP hotels)': '🎬',

    // Business & Event Services
    'Conference Hall': '🏛️',
    'Meeting Rooms': '💼',
    'Projector / Audio Facility': '📽️',
    'Business Center': '💻',
    'Wedding & Event Management': '💒',

    // Security & Safety
    '24/7 Security': '👮',
    'CCTV Monitoring': '📹',
    'Smart Card Room Access': '🔑',
    'Fire Alarm System': '🔥',
    'Medical Assistance on Call': '🚑',

    // Transport Services
    'Airport Pick & Drop': '✈️',
    'Luxury Car Rental': '🚗',
    'Shuttle Service': '🚐',
    'Valet Parking': '🅿️',

    // Additional VIP Services
    'Personalized Guest Assistant': '👤',
    'Private Chef (on request)': '👨‍🍳',
    'Private Pool (Suites)': '🏊‍♂️',
    'Private Jacuzzi': '🛁',
    'Rooftop Lounge Access': '🌃',

    // Additional Amenities
    'Fast WiFi with Business Bandwidth': '📶',
    'Gift Shop / Souvenir Shop': '🎁'
  };

  // Load services with useCallback to prevent unnecessary re-renders
  const loadServices = useCallback(() => {
    try {
      const savedServices = JSON.parse(localStorage.getItem('hotelServices') || '[]');
      setServices(savedServices);
    } catch (error) {
      console.error('Error loading services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
    
    const handleStorageChange = () => {
      loadServices();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadServices]);

  // Load user's current bookings
  useEffect(() => {
    const loadUserBookings = () => {
      if (!user?.id) return [];
      try {
        const bookings = JSON.parse(localStorage.getItem(`bookings_${user.id}`) || '[]');
        const confirmedBookings = bookings.filter(booking => booking.status === 'confirmed');
        setUserBookings(confirmedBookings);
        
        if (confirmedBookings.length > 0) {
          setRequestData(prev => ({
            ...prev,
            roomNumber: confirmedBookings[0].roomNumber || ''
          }));
        }
      } catch (error) {
        console.error('Error loading bookings:', error);
        setUserBookings([]);
      }
    };

    loadUserBookings();
  }, [user?.id]);

  const handleServiceClick = useCallback((service) => {
    setSelectedService(service);
    setShowServiceDetails(true);
  }, []);

  const handleRequestService = useCallback((service) => {
    setRequestData({
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      quantity: 1,
      preferredTime: '',
      specialInstructions: '',
      roomNumber: userBookings.length > 0 ? userBookings[0].roomNumber : ''
    });
    setShowRequestForm(true);
  }, [userBookings]);

  const handleRequestChange = useCallback((e) => {
    setRequestData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }, []);

  const submitServiceRequest = useCallback((e) => {
    e.preventDefault();
    
    if (!user?.id) {
      alert('Please log in to request services');
      return;
    }

    if (!requestData.roomNumber) {
      alert('Please select your room number');
      return;
    }

    const serviceRequest = {
      id: Date.now().toString(),
      serviceId: requestData.serviceId,
      serviceName: requestData.serviceName,
      guestId: user.id,
      guestName: user.name || user.email,
      guestEmail: user.email,
      roomNumber: requestData.roomNumber,
      quantity: parseInt(requestData.quantity),
      preferredTime: requestData.preferredTime,
      specialInstructions: requestData.specialInstructions,
      totalPrice: requestData.servicePrice * parseInt(requestData.quantity),
      status: 'pending',
      requestDate: new Date().toISOString(),
      requestedAt: new Date().toLocaleString()
    };

    try {
      const existingRequests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
      const updatedRequests = [...existingRequests, serviceRequest];
      localStorage.setItem('serviceRequests', JSON.stringify(updatedRequests));

      const userServiceRequests = JSON.parse(localStorage.getItem(`serviceRequests_${user.id}`) || '[]');
      const updatedUserRequests = [...userServiceRequests, serviceRequest];
      localStorage.setItem(`serviceRequests_${user.id}`, JSON.stringify(updatedUserRequests));

      alert('Service request submitted successfully! We will process your request soon.');

      setShowRequestForm(false);
      setShowServiceDetails(false);
      setRequestData({
        serviceId: '',
        serviceName: '',
        servicePrice: 0,
        quantity: 1,
        preferredTime: '',
        specialInstructions: '',
        roomNumber: userBookings.length > 0 ? userBookings[0].roomNumber : ''
      });

    } catch (error) {
      console.error('Error saving service request:', error);
      alert('Error submitting service request. Please try again.');
    }
  }, [user, requestData, userBookings]);

  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {});

  if (activeTab !== 'services') return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading available services...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Hotel Services & Amenities</h3>
          <p className="text-gray-600 mt-1">
            {services.length} premium service{services.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700"
          >
            🚪 Logout
          </Button>
        </div>
      </div>

      {services.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛎️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Services Available</h3>
            <p className="text-gray-600">All services are currently unavailable.</p>
            <p className="text-gray-500 text-sm mt-2">Please check back later or contact front desk.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
            <div key={category}>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                {category}
              </h4>
              
              {/* Horizontal Grid Layout */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {categoryServices.map(service => (
                  <div
                    key={service.id}
                    className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col min-h-[120px]"
                    onClick={() => handleServiceClick(service)}
                  >
                    <div className="p-3 text-center flex-1 flex flex-col items-center justify-center">
                      {/* Service Icon */}
                      <div className="text-2xl mb-1">
                        {service.icon || serviceIcons[service.name] || '🛎️'}
                      </div>
                      
                      {/* Service Name */}
                      <h5 className="font-medium text-gray-900 text-xs leading-tight mb-1 line-clamp-2">
                        {service.name}
                      </h5>
                      
                      {/* Price */}
                      <p className="text-sm font-bold text-blue-600 mb-1">
                        {service.price === 0 ? 'Free' : `$${service.price}`}
                      </p>
                      
                      {/* Status Badge */}
                      <div className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded ${
                        service.status === 'available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {service.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service Details Modal */}
      {showServiceDetails && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">
                    {selectedService.icon || serviceIcons[selectedService.name] || '🛎️'}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedService.name}
                  </h2>
                </div>
                <button 
                  onClick={() => setShowServiceDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Price:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {selectedService.price === 0 ? 'Free' : `$${selectedService.price}`}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium capitalize">{selectedService.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedService.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedService.status}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">
                  {selectedService.description}
                </p>
              </div>

              {userBookings.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-yellow-800 text-sm">
                      You need a confirmed booking to request this service
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="flex space-x-4 pt-4 border-t">
                <Button
                  onClick={() => setShowServiceDetails(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700"
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleRequestService(selectedService)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={userBookings.length === 0}
                >
                  {userBookings.length === 0 ? 'Book Room First' : 'Request Service'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {serviceIcons[requestData.serviceName] || '🛎️'}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Request {requestData.serviceName}
                  </h2>
                </div>
                <button 
                  onClick={() => setShowRequestForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={submitServiceRequest} className="p-6 space-y-6">
              {/* Service Information Summary */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">
                    {serviceIcons[requestData.serviceName] || '🛎️'}
                  </span>
                  <div>
                    <h4 className="font-semibold text-blue-900">{requestData.serviceName}</h4>
                    <p className="text-sm text-blue-700">
                      Price: {requestData.servicePrice === 0 ? 'Free' : `$${requestData.servicePrice} per unit`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Number *
                  </label>
                  <select
                    name="roomNumber"
                    value={requestData.roomNumber}
                    onChange={handleRequestChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Your Room</option>
                    {userBookings.map(booking => (
                      <option key={booking.roomNumber} value={booking.roomNumber}>
                        Room {booking.roomNumber} - {booking.roomType}
                      </option>
                    ))}
                  </select>
                  {userBookings.length === 0 && (
                    <p className="text-red-500 text-xs mt-1">
                      No confirmed bookings found. Please book a room first.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <select
                    name="quantity"
                    value={requestData.quantity}
                    onChange={handleRequestChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>
                        {num} {num > 1 ? 'units' : 'unit'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Date & Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="preferredTime"
                    value={requestData.preferredTime}
                    onChange={handleRequestChange}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  name="specialInstructions"
                  value={requestData.specialInstructions}
                  onChange={handleRequestChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any special instructions, dietary requirements, or specific preferences..."
                />
              </div>

              {requestData.quantity > 0 && requestData.roomNumber && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Request Summary</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Service:</strong> {requestData.serviceName}</p>
                    <p><strong>Room:</strong> {requestData.roomNumber}</p>
                    <p><strong>Quantity:</strong> {requestData.quantity}</p>
                    <p><strong>Total Price:</strong> ${requestData.servicePrice * requestData.quantity}</p>
                    {requestData.preferredTime && (
                      <p><strong>Preferred Time:</strong> {new Date(requestData.preferredTime).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                  disabled={!requestData.roomNumber}
                >
                  <span>📨</span>
                  <span>Submit Request</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesTab;