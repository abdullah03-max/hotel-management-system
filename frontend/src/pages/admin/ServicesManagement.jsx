import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const ServicesManagement = () => {
  const [services, setServices] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services');
  const [editingService, setEditingService] = useState(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    price: 0,
    category: 'Front Desk / Reception Services',
    description: '',
    status: 'available',
    icon: '🛎️'
  });

  // Service categories with predefined services
  const serviceCategories = {
    'Front Desk / Reception Services': [
      '24/7 Reception', 'Express Check-in / Check-out', 'Concierge Service', 
      'VIP Guest Handling', 'Luggage Handling / Porter Service', 'Travel Assistance (Taxi, tours, car rental)'
    ],
    'Room Services': [
      '24/7 Room Service', 'Daily Housekeeping', 'Laundry & Ironing', 
      'In-Room Dining', 'Mini-Bar', 'Butler Service (VIP)'
    ],
    'Food & Beverage Services': [
      'Multi-Cuisine Restaurant', 'Fine Dining Restaurant', 'Café / Coffee Shop',
      'Rooftop Dining', 'Poolside Bar', 'Breakfast Buffet', 'In-Room Breakfast'
    ],
    'Wellness & Fitness Services': [
      'Gym / Fitness Center', 'Spa & Massage', 'Sauna / Steam Room',
      'Beauty Salon', 'Yoga / Meditation Sessions'
    ],
    'Leisure & Recreation': [
      'Swimming Pool', 'Kids Pool', 'Game Zone',
      'Indoor Sports', 'Cinema Room (VIP hotels)'
    ],
    'Business & Event Services': [
      'Conference Hall', 'Meeting Rooms', 'Projector / Audio Facility',
      'Business Center', 'Wedding & Event Management'
    ],
    'Security & Safety': [
      '24/7 Security', 'CCTV Monitoring', 'Smart Card Room Access',
      'Fire Alarm System', 'Medical Assistance on Call'
    ],
    'Transport Services': [
      'Airport Pick & Drop', 'Luxury Car Rental', 'Shuttle Service',
      'Valet Parking'
    ],
    'Additional VIP Services': [
      'Personalized Guest Assistant', 'Private Chef (on request)', 'Private Pool (Suites)',
      'Private Jacuzzi', 'Rooftop Lounge Access'
    ],
    'Additional Amenities': [
      'Fast WiFi with Business Bandwidth', 'Gift Shop / Souvenir Shop'
    ]
  };

  // Icon mapping for all services
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

  // Default prices for services
  const defaultPrices = {
    '24/7 Reception': 0,
    'Express Check-in / Check-out': 0,
    'Concierge Service': 0,
    'VIP Guest Handling': 50,
    'Luggage Handling / Porter Service': 10,
    'Travel Assistance (Taxi, tours, car rental)': 25,
    '24/7 Room Service': 15,
    'Daily Housekeeping': 0,
    'Laundry & Ironing': 12,
    'In-Room Dining': 20,
    'Mini-Bar': 0,
    'Butler Service (VIP)': 100,
    'Multi-Cuisine Restaurant': 0,
    'Fine Dining Restaurant': 0,
    'Café / Coffee Shop': 0,
    'Rooftop Dining': 0,
    'Poolside Bar': 0,
    'Breakfast Buffet': 25,
    'In-Room Breakfast': 15,
    'Gym / Fitness Center': 0,
    'Spa & Massage': 80,
    'Sauna / Steam Room': 30,
    'Beauty Salon': 40,
    'Yoga / Meditation Sessions': 20,
    'Swimming Pool': 0,
    'Kids Pool': 0,
    'Game Zone': 15,
    'Indoor Sports': 20,
    'Cinema Room (VIP hotels)': 50,
    'Conference Hall': 200,
    'Meeting Rooms': 100,
    'Projector / Audio Facility': 50,
    'Business Center': 0,
    'Wedding & Event Management': 500,
    '24/7 Security': 0,
    'CCTV Monitoring': 0,
    'Smart Card Room Access': 0,
    'Fire Alarm System': 0,
    'Medical Assistance on Call': 0,
    'Airport Pick & Drop': 50,
    'Luxury Car Rental': 150,
    'Shuttle Service': 25,
    'Valet Parking': 20,
    'Personalized Guest Assistant': 75,
    'Private Chef (on request)': 200,
    'Private Pool (Suites)': 100,
    'Private Jacuzzi': 60,
    'Rooftop Lounge Access': 30,
    'Fast WiFi with Business Bandwidth': 0,
    'Gift Shop / Souvenir Shop': 0
  };

  // Default descriptions for services
  const defaultDescriptions = {
    '24/7 Reception': 'Round-the-clock reception service for all your needs',
    'Express Check-in / Check-out': 'Quick and efficient check-in and check-out process',
    'Concierge Service': 'Personalized assistance for reservations and recommendations',
    'VIP Guest Handling': 'Special treatment and priority services for VIP guests',
    'Luggage Handling / Porter Service': 'Professional luggage handling and delivery to your room',
    'Travel Assistance (Taxi, tours, car rental)': 'Comprehensive travel and transportation assistance',
    '24/7 Room Service': '24-hour room service with extensive menu options',
    'Daily Housekeeping': 'Professional daily cleaning and turndown service',
    'Laundry & Ironing': 'Professional laundry, dry cleaning and ironing services',
    'In-Room Dining': 'Premium dining experience in the comfort of your room',
    'Mini-Bar': 'Well-stocked mini-bar with refreshments and snacks',
    'Butler Service (VIP)': 'Personal butler service for ultimate luxury experience',
    'Multi-Cuisine Restaurant': 'Restaurant offering diverse international cuisines',
    'Fine Dining Restaurant': 'Elegant fine dining with gourmet cuisine',
    'Café / Coffee Shop': 'Relaxed atmosphere with premium coffee and snacks',
    'Rooftop Dining': 'Scenic rooftop dining with panoramic city views',
    'Poolside Bar': 'Refreshing drinks and snacks by the pool',
    'Breakfast Buffet': 'Extensive breakfast buffet with live cooking stations',
    'In-Room Breakfast': 'Breakfast served in the comfort of your room',
    'Gym / Fitness Center': 'State-of-the-art fitness equipment and facilities',
    'Spa & Massage': 'Professional spa treatments and therapeutic massages',
    'Sauna / Steam Room': 'Relaxing sauna and steam room facilities',
    'Beauty Salon': 'Professional beauty and grooming services',
    'Yoga / Meditation Sessions': 'Guided yoga and meditation sessions for wellness',
    'Swimming Pool': 'Luxurious swimming pool with comfortable lounging areas',
    'Kids Pool': 'Safe and fun swimming pool for children',
    'Game Zone': 'Entertainment area with games and activities',
    'Indoor Sports': 'Indoor sports facilities including badminton and table tennis',
    'Cinema Room (VIP hotels)': 'Private cinema experience with latest movies',
    'Conference Hall': 'Spacious conference hall for business events',
    'Meeting Rooms': 'Well-equipped meeting rooms for corporate gatherings',
    'Projector / Audio Facility': 'Professional audio-visual equipment for presentations',
    'Business Center': 'Business facilities with computers, printing and internet',
    'Wedding & Event Management': 'Complete wedding and event planning services',
    '24/7 Security': 'Round-the-clock security and surveillance',
    'CCTV Monitoring': 'Comprehensive CCTV coverage throughout the property',
    'Smart Card Room Access': 'Secure electronic key card access system',
    'Fire Alarm System': 'Advanced fire detection and alarm system',
    'Medical Assistance on Call': '24/7 medical assistance and first aid services',
    'Airport Pick & Drop': 'Comfortable airport transfer services',
    'Luxury Car Rental': 'Premium luxury car rental services',
    'Shuttle Service': 'Regular shuttle services to key locations',
    'Valet Parking': 'Professional valet parking service',
    'Personalized Guest Assistant': 'Dedicated personal assistant for VIP guests',
    'Private Chef (on request)': 'Private chef service for personalized dining',
    'Private Pool (Suites)': 'Exclusive private pool access for suite guests',
    'Private Jacuzzi': 'Private jacuzzi in select suites and rooms',
    'Rooftop Lounge Access': 'Exclusive access to premium rooftop lounge',
    'Fast WiFi with Business Bandwidth': 'High-speed internet with business-grade bandwidth',
    'Gift Shop / Souvenir Shop': 'Curated gift and souvenir shop with local specialties'
  };

  useEffect(() => {
    loadServices();
    loadServiceRequests();
  }, []);

  const loadServices = () => {
    try {
      const savedServices = JSON.parse(localStorage.getItem('hotelServices') || '[]');
      if (savedServices.length === 0) {
        // Initialize with all services
        const allServices = [];
        Object.entries(serviceCategories).forEach(([category, services]) => {
          services.forEach(serviceName => {
            allServices.push({
              id: `${category}-${serviceName}`.replace(/[^a-zA-Z0-9]/g, '-'),
              name: serviceName,
              price: defaultPrices[serviceName] || 0,
              category: category,
              status: 'available',
              icon: serviceIcons[serviceName] || '🛎️',
              description: defaultDescriptions[serviceName] || `Premium ${serviceName} service`
            });
          });
        });
        localStorage.setItem('hotelServices', JSON.stringify(allServices));
        setServices(allServices);
      } else {
        setServices(savedServices);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const loadServiceRequests = () => {
    try {
      const requests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
      setServiceRequests(requests);
    } catch (error) {
      console.error('Error loading service requests:', error);
      setServiceRequests([]);
    }
  };

  const saveServices = (updatedServices) => {
    localStorage.setItem('hotelServices', JSON.stringify(updatedServices));
    setServices(updatedServices);
  };

  const handleAddService = () => {
    const service = {
      id: Date.now().toString(),
      ...newService,
      price: parseFloat(newService.price),
      icon: serviceIcons[newService.name] || '🛎️'
    };
    
    const updatedServices = [...services, service];
    saveServices(updatedServices);
    setShowServiceForm(false);
    setNewService({
      name: '',
      price: 0,
      category: 'Front Desk / Reception Services',
      description: '',
      status: 'available',
      icon: '🛎️'
    });
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setNewService(service);
    setShowServiceForm(true);
  };

  const handleUpdateService = () => {
    const updatedServices = services.map(service => 
      service.id === editingService.id 
        ? { ...newService, id: service.id, price: parseFloat(newService.price) }
        : service
    );
    saveServices(updatedServices);
    setShowServiceForm(false);
    setEditingService(null);
    setNewService({
      name: '',
      price: 0,
      category: 'Front Desk / Reception Services',
      description: '',
      status: 'available',
      icon: '🛎️'
    });
  };

  const handleDeleteService = (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      const updatedServices = services.filter(service => service.id !== serviceId);
      saveServices(updatedServices);
    }
  };

  const updateServiceRequestStatus = (requestId, newStatus) => {
    const updatedRequests = serviceRequests.map(request =>
      request.id === requestId ? { ...request, status: newStatus } : request
    );
    localStorage.setItem('serviceRequests', JSON.stringify(updatedRequests));
    setServiceRequests(updatedRequests);

    // Also update in user's personal requests
    const userRequests = JSON.parse(localStorage.getItem(`serviceRequests_${updatedRequests.find(r => r.id === requestId)?.guestId}`) || '[]');
    const updatedUserRequests = userRequests.map(request =>
      request.id === requestId ? { ...request, status: newStatus } : request
    );
    localStorage.setItem(`serviceRequests_${updatedRequests.find(r => r.id === requestId)?.guestId}`, JSON.stringify(updatedUserRequests));
  };

  const deleteServiceRequest = (requestId) => {
    if (window.confirm('Are you sure you want to delete this service request?')) {
      const updatedRequests = serviceRequests.filter(req => req.id !== requestId);
      localStorage.setItem('serviceRequests', JSON.stringify(updatedRequests));
      setServiceRequests(updatedRequests);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Auto-fill service details when service name is selected
  const handleServiceNameChange = (serviceName) => {
    const category = Object.keys(serviceCategories).find(cat => 
      serviceCategories[cat].includes(serviceName)
    );
    
    setNewService(prev => ({
      ...prev,
      name: serviceName,
      category: category || prev.category,
      price: defaultPrices[serviceName] || 0,
      icon: serviceIcons[serviceName] || '🛎️',
      description: defaultDescriptions[serviceName] || `Premium ${serviceName} service`
    }));
  };

  // Group services by category for better organization
  const servicesByCategory = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading services data...</p>
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
          <h2 className="text-xl font-semibold text-gray-900">Hotel Services & Amenities Management</h2>
          <p className="text-gray-600 mt-1">Manage comprehensive hotel services and guest requests</p>
        </div>
        <Button onClick={() => { setShowServiceForm(true); setEditingService(null); }}>
          <span className="mr-2">+</span> Add New Service
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('services')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'services'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Services ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Service Requests ({serviceRequests.length})
          </button>
        </nav>
      </div>

      {/* Services Tab */}
      {activeTab === 'services' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white border-l-4 border-l-blue-500">
              <div className="p-4">
                <p className="text-sm text-gray-600">Total Services</p>
                <p className="text-2xl font-bold text-gray-900">{services.length}</p>
              </div>
            </Card>
            <Card className="bg-white border-l-4 border-l-green-500">
              <div className="p-4">
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {services.filter(service => service.status === 'available').length}
                </p>
              </div>
            </Card>
            <Card className="bg-white border-l-4 border-l-red-500">
              <div className="p-4">
                <p className="text-sm text-gray-600">Unavailable</p>
                <p className="text-2xl font-bold text-gray-900">
                  {services.filter(service => service.status === 'unavailable').length}
                </p>
              </div>
            </Card>
            <Card className="bg-white border-l-4 border-l-purple-500">
              <div className="p-4">
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.keys(servicesByCategory).length}
                </p>
              </div>
            </Card>
          </div>

          {/* Services by Category */}
          <div className="space-y-8">
            {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  {category} ({categoryServices.length} services)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryServices.map((service) => (
                    <Card key={service.id} className="hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{service.icon}</span>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                              <p className="text-sm text-gray-500">{service.category}</p>
                            </div>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            service.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {service.status}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Price:</span>
                            <span className="font-medium text-green-600">
                              {service.price === 0 ? 'Free' : `$${service.price}`}
                            </span>
                          </div>
                          {service.description && (
                            <div className="text-sm text-gray-600">
                              {service.description}
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2 mt-4">
                          <button 
                            onClick={() => handleEditService(service)}
                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded text-sm hover:bg-green-700"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteService(service.id)}
                            className="flex-1 bg-red-600 text-white py-2 px-4 rounded text-sm hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Service Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white border-l-4 border-l-yellow-500">
              <div className="p-4">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {serviceRequests.filter(req => req.status === 'pending').length}
                </p>
              </div>
            </Card>
            <Card className="bg-white border-l-4 border-l-blue-500">
              <div className="p-4">
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {serviceRequests.filter(req => req.status === 'in-progress').length}
                </p>
              </div>
            </Card>
            <Card className="bg-white border-l-4 border-l-green-500">
              <div className="p-4">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {serviceRequests.filter(req => req.status === 'completed').length}
                </p>
              </div>
            </Card>
            <Card className="bg-white border-l-4 border-l-red-500">
              <div className="p-4">
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {serviceRequests.filter(req => req.status === 'cancelled').length}
                </p>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            {serviceRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{serviceIcons[request.serviceName] || '🛎️'}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{request.serviceName}</h3>
                        <p className="text-gray-600 text-sm">
                          Room {request.roomNumber} • {request.guestName} • {request.requestedAt}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600"><strong>Quantity:</strong> {request.quantity}</p>
                      <p className="text-sm text-gray-600"><strong>Total Price:</strong> ${request.totalPrice}</p>
                      {request.preferredTime && (
                        <p className="text-sm text-gray-600">
                          <strong>Preferred Time:</strong> {new Date(request.preferredTime).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div>
                      {request.specialInstructions && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Special Instructions:</p>
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {request.specialInstructions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {request.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => updateServiceRequestStatus(request.id, 'confirmed')}
                          className="bg-green-600 text-white py-2 px-4 rounded text-sm hover:bg-green-700"
                        >
                          Confirm
                        </button>
                        <button 
                          onClick={() => updateServiceRequestStatus(request.id, 'cancelled')}
                          className="bg-red-600 text-white py-2 px-4 rounded text-sm hover:bg-red-700"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {request.status === 'confirmed' && (
                      <button 
                        onClick={() => updateServiceRequestStatus(request.id, 'in-progress')}
                        className="bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700"
                      >
                        Start Service
                      </button>
                    )}
                    {request.status === 'in-progress' && (
                      <button 
                        onClick={() => updateServiceRequestStatus(request.id, 'completed')}
                        className="bg-gray-600 text-white py-2 px-4 rounded text-sm hover:bg-gray-700"
                      >
                        Mark Complete
                      </button>
                    )}
                    {(request.status === 'completed' || request.status === 'cancelled') && (
                      <button 
                        onClick={() => deleteServiceRequest(request.id)}
                        className="bg-red-600 text-white py-2 px-4 rounded text-sm hover:bg-red-700"
                      >
                        Delete Request
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {serviceRequests.length === 0 && (
            <Card>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Service Requests</h3>
                <p className="text-gray-600">No service requests have been submitted by guests yet.</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Add/Edit Service Form Modal */}
      {showServiceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={newService.category}
                    onChange={(e) => setNewService({...newService, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {Object.keys(serviceCategories).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Name *</label>
                  <select
                    value={newService.name}
                    onChange={(e) => handleServiceNameChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Service</option>
                    {newService.category && serviceCategories[newService.category]?.map(service => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price ($) *</label>
                  <input
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService({...newService, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{newService.icon}</span>
                    <select
                      value={newService.icon}
                      onChange={(e) => setNewService({...newService, icon: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="🛎️">Default Bell (🛎️)</option>
                      {Object.values(serviceIcons).filter((v, i, a) => a.indexOf(v) === i).map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newService.description}
                    onChange={(e) => setNewService({...newService, description: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Service description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select
                    value={newService.status}
                    onChange={(e) => setNewService({...newService, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-4 pt-4 border-t">
                <Button
                  onClick={editingService ? handleUpdateService : handleAddService}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {editingService ? 'Update Service' : 'Add Service'}
                </Button>
                <Button
                  onClick={() => {
                    setShowServiceForm(false);
                    setEditingService(null);
                    setNewService({
                      name: '',
                      price: 0,
                      category: 'Front Desk / Reception Services',
                      description: '',
                      status: 'available',
                      icon: '🛎️'
                    });
                  }}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default ServicesManagement;