import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { serviceRequestService } from '../../services/serviceRequestService';
import { bookingService } from '../../services/bookingService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Services = () => {
  const [services, setServices] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    booking: '',
    serviceType: '',
    description: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch service requests
      const servicesResponse = await serviceRequestService.getServiceRequests();
      setServices(servicesResponse.data);

      // Fetch active bookings for service requests
      const bookingsResponse = await bookingService.getBookings({
        status: 'checked-in'
      });
      setActiveBookings(bookingsResponse.data);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await serviceRequestService.createServiceRequest(serviceForm);
      setShowServiceModal(false);
      setServiceForm({
        booking: '',
        serviceType: '',
        description: '',
        priority: 'medium'
      });
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Error creating service request:', error);
      alert('Failed to create service request. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-800',
      'medium': 'bg-blue-100 text-blue-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getServiceTypeIcon = (type) => {
    const icons = {
      'laundry': '🧺',
      'cleaning': '🧹',
      'food': '🍽️',
      'taxi': '🚕',
      'extra-towels': '🛀',
      'emergency': '🚨',
      'wake-up-call': '⏰',
      'room-service': '🏨',
      'maintenance': '🔧',
      'other': '❓'
    };
    return icons[type] || '✅';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const serviceTypes = [
    { value: 'laundry', label: 'Laundry Service' },
    { value: 'cleaning', label: 'Room Cleaning' },
    { value: 'food', label: 'Food & Beverage' },
    { value: 'taxi', label: 'Taxi Service' },
    { value: 'extra-towels', label: 'Extra Towels' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'wake-up-call', label: 'Wake-up Call' },
    { value: 'room-service', label: 'Room Service' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'other', label: 'Other' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">Service Requests</h1>
          <p className="text-gray-600 mt-2">Request and track hotel services</p>
        </div>
        <Button 
          onClick={() => setShowServiceModal(true)}
          disabled={activeBookings.length === 0}
        >
          New Service Request
        </Button>
      </motion.div>

      {/* Service Requests List */}
      <div className="space-y-4">
        {services.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">🛎️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No service requests
            </h3>
            <p className="text-gray-600 mb-6">
              {activeBookings.length === 0 
                ? 'You need to have an active booking to request services'
                : 'Create your first service request'
              }
            </p>
            {activeBookings.length > 0 && (
              <Button onClick={() => setShowServiceModal(true)}>
                Request Service
              </Button>
            )}
          </Card>
        ) : (
          services.map((service, index) => (
            <motion.div
              key={service._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  {/* Service Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">
                        {getServiceTypeIcon(service.serviceType)}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 capitalize">
                          {service.serviceType.replace('-', ' ')}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Request #{service.requestId} • {formatDate(service.createdAt)}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3">{service.description}</p>

                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                        Status: {service.status.replace('-', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(service.priority)}`}>
                        Priority: {service.priority}
                      </span>
                      {service.assignedTo && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Assigned to: {service.assignedTo.name}
                        </span>
                      )}
                      {service.estimatedCompletion && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          ETA: {formatDate(service.estimatedCompletion)}
                        </span>
                      )}
                    </div>

                    {service.guestFeedback && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">Your Feedback:</p>
                        <div className="flex items-center space-x-1 mt-1">
                          {'★'.repeat(service.guestFeedback.rating)}
                          {'☆'.repeat(5 - service.guestFeedback.rating)}
                        </div>
                        {service.guestFeedback.comment && (
                          <p className="text-sm text-gray-600 mt-1">{service.guestFeedback.comment}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 mt-4 lg:mt-0 lg:ml-6">
                    {service.status === 'completed' && !service.guestFeedback && (
                      <Button variant="outline" size="sm">
                        Add Feedback
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* New Service Modal */}
      <Modal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        title="New Service Request"
        size="lg"
      >
        <form onSubmit={handleServiceSubmit}>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Booking
                </label>
                <select
                  name="booking"
                  value={serviceForm.booking}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, booking: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Choose a booking</option>
                  {activeBookings.map(booking => (
                    <option key={booking._id} value={booking._id}>
                      Room {booking.room.roomNumber} - {formatDate(booking.checkIn)} to {formatDate(booking.checkOut)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type
                </label>
                <select
                  name="serviceType"
                  value={serviceForm.serviceType}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, serviceType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select service type</option>
                  {serviceTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={serviceForm.priority}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Description"
                type="textarea"
                name="description"
                value={serviceForm.description}
                onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Please describe your service request in detail..."
                rows="4"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowServiceModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!serviceForm.booking || !serviceForm.serviceType || !serviceForm.description}
            >
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Services;
