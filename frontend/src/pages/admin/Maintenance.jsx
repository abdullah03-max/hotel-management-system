import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const Maintenance = () => {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [staffMembers, setStaffMembers] = useState([]);

  // Status options for filtering
  const statusOptions = [
    { value: 'all', label: 'All Requests' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Map issue types to recommended specializations
  const issueTypeToSpecialization = {
    'AC Not Working': ['ac_technician', 'technician'],
    'Heating Issue': ['ac_technician', 'technician'],
    'Electrical Problem': ['electrician'],
    'Plumbing Issue': ['plumber'],
    'TV/Entertainment': ['technician'],
    'WiFi Problem': ['technician'],
    'Furniture Damage': ['carpenter'],
    'Cleanliness Issue': ['general'],
    'Noise Complaint': ['general'],
    'Other': ['general']
  };

  useEffect(() => {
    loadMaintenanceRequests();
    loadStaffMembers();
  }, []);

  const loadStaffMembers = async () => {
    try {
      // Load staff members from backend API
      const response = await fetch('http://localhost:5000/api/staff');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Filter only maintenance staff with specializations
          const maintenanceStaff = data.data.staff.filter(staff => 
            staff.role === 'maintenance' && staff.status === 'active'
          );
          
          console.log('✅ Loaded maintenance staff from API:', maintenanceStaff);
          
          // Also save to localStorage for backup
          localStorage.setItem('hotelStaff', JSON.stringify(data.data.staff));
          
          setStaffMembers(maintenanceStaff);
          return;
        }
      }
      throw new Error('Failed to fetch staff from API');
    } catch (error) {
      console.error('❌ Error loading staff members from API:', error);
      
      // Fallback to localStorage with better error handling
      try {
        const savedStaff = JSON.parse(localStorage.getItem('hotelStaff') || '[]');
        const maintenanceStaff = savedStaff.filter(staff => 
          staff.role === 'maintenance' && staff.status === 'active'
        );
        
        console.log('🔄 Loaded maintenance staff from localStorage:', maintenanceStaff);
        setStaffMembers(maintenanceStaff);
      } catch (localError) {
        console.error('❌ Error loading from localStorage:', localError);
        setStaffMembers([]);
      }
    }
  };

  const loadMaintenanceRequests = () => {
    try {
      const savedRequests = JSON.parse(localStorage.getItem('maintenanceRequests') || '[]');
      
      // Sort by creation date (newest first)
      const sortedRequests = savedRequests.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setMaintenanceRequests(sortedRequests);
    } catch (error) {
      console.error('Error loading maintenance requests:', error);
      setMaintenanceRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Get recommended staff for an issue type
  const getRecommendedStaff = (issueType) => {
    const recommendedSpecs = issueTypeToSpecialization[issueType] || ['general'];
    return staffMembers.filter(staff => 
      recommendedSpecs.includes(staff.specialization)
    );
  };

  const createStaffNotification = (request, assignedStaffId) => {
    const staffMember = staffMembers.find(staff => staff._id === assignedStaffId);
    if (!staffMember) {
      console.error('Staff member not found for ID:', assignedStaffId);
      return;
    }

    const staffNotification = {
      id: `notif_${Date.now()}`,
      type: 'new_assignment',
      title: 'New Maintenance Assignment',
      message: `You have been assigned to fix: ${request.issue} in Room ${request.room}. Priority: ${request.priority}`,
      priority: request.priority,
      relatedId: request.id,
      timestamp: new Date().toISOString(),
      read: false,
      assignedBy: 'Admin',
      room: request.room,
      issue: request.issue
    };
    
    // Save to specific staff member's notifications using their ID
    const staffNotifications = JSON.parse(localStorage.getItem(`notifications_${staffMember._id}`) || '[]');
    const updatedStaffNotifications = [staffNotification, ...staffNotifications];
    localStorage.setItem(`notifications_${staffMember._id}`, JSON.stringify(updatedStaffNotifications));
    
    console.log('Notification created for staff:', staffMember.name, staffNotification); // Debug log
  };

  const updateRequestStatus = (requestId, newStatus, assignedTo = null) => {
  const updatedRequests = maintenanceRequests.map(request => {
    if (request.id === requestId) {
      const updatedRequest = { 
        ...request, 
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
      
      // Only update assignedTo if a new staff is selected
      if (assignedTo && assignedTo !== request.assignedTo) {
        const assignedStaff = staffMembers.find(staff => staff._id === assignedTo);
        updatedRequest.assignedTo = assignedTo;
        updatedRequest.assignedStaffId = assignedTo;
        updatedRequest.assignedStaffName = assignedStaff?.name;
        updatedRequest.assignedStaffSpecialization = assignedStaff?.specialization;
        
        console.log('🔧 Assigning task to:', {
          staffId: assignedTo,
          staffName: assignedStaff?.name,
          specialization: assignedStaff?.specialization,
          requestId: requestId
        });
        
        // Send notification to the new staff member ONLY
        setTimeout(() => {
          createStaffNotification(updatedRequest, assignedTo);
        }, 100);
      }
      
      return updatedRequest;
    }
    return request;
  });
  
  localStorage.setItem('maintenanceRequests', JSON.stringify(updatedRequests));
  setMaintenanceRequests(updatedRequests);
  
  alert(`Request status updated to: ${newStatus}`);
};

  const deleteRequest = (requestId) => {
    if (window.confirm('Are you sure you want to delete this maintenance request?')) {
      const updatedRequests = maintenanceRequests.filter(request => request.id !== requestId);
      localStorage.setItem('maintenanceRequests', JSON.stringify(updatedRequests));
      setMaintenanceRequests(updatedRequests);
      alert('Maintenance request deleted successfully!');
    }
  };

  const viewRequestDetails = (request) => {
    setSelectedRequest(request);
    setShowRequestDetails(true);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'high': return 'bg-red-100 text-red-800 border border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border border-green-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border border-green-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Get staff member name by ID
  const getStaffName = (staffId) => {
    if (!staffId) return 'Unassigned';
    
    const staff = staffMembers.find(s => s._id === staffId);
    if (staff) {
      return `${staff.name} (${getSpecializationLabel(staff.specialization)})`;
    }
    
    // Fallback: check if it's a string name (for backward compatibility)
    const oldStyleStaff = staffMembers.find(s => s.name === staffId);
    if (oldStyleStaff) {
      return `${oldStyleStaff.name} (${getSpecializationLabel(oldStyleStaff.specialization)})`;
    }
    
    return staffId || 'Unassigned';
  };

  // Get specialization label
  const getSpecializationLabel = (specialization) => {
    const specializations = {
      'plumber': 'Plumber',
      'electrician': 'Electrician',
      'technician': 'Technician',
      'carpenter': 'Carpenter',
      'painter': 'Painter',
      'ac_technician': 'AC Technician',
      'general': 'General Maintenance'
    };
    return specializations[specialization] || specialization || 'General Maintenance';
  };

  // Filter requests based on status
  const filteredRequests = statusFilter === 'all' 
    ? maintenanceRequests 
    : maintenanceRequests.filter(request => request.status === statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading maintenance data...</p>
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
          <h2 className="text-xl font-semibold text-gray-900">Maintenance Management</h2>
          <p className="text-gray-600 mt-1">Manage maintenance requests and assign to specific staff</p>
        </div>
        <div className="text-sm text-gray-500">
          {staffMembers.length} maintenance staff available
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-l-4 border-l-blue-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Total Requests</p>
            <p className="text-2xl font-bold text-gray-900">{maintenanceRequests.length}</p>
          </div>
        </Card>
        <Card className="bg-white border-l-4 border-l-red-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">High Priority</p>
            <p className="text-2xl font-bold text-gray-900">
              {maintenanceRequests.filter(req => req.priority === 'high' || req.priority === 'urgent').length}
            </p>
          </div>
        </Card>
        <Card className="bg-white border-l-4 border-l-yellow-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="text-2xl font-bold text-gray-900">
              {maintenanceRequests.filter(req => req.status === 'in-progress').length}
            </p>
          </div>
        </Card>
        <Card className="bg-white border-l-4 border-l-green-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-gray-900">
              {maintenanceRequests.filter(req => req.status === 'completed').length}
            </p>
          </div>
        </Card>
      </div>

      {/* Staff Summary */}
      {staffMembers.length > 0 && (
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Staff Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffMembers.map(staff => (
                <div key={staff._id} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{staff.name}</p>
                      <p className="text-sm text-blue-600 font-semibold">
                        {getSpecializationLabel(staff.specialization)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{staff.phone}</p>
                      <p className="text-xs text-gray-400">{staff.email}</p>
                    </div>
                    <div className="text-2xl">
                      {staff.specialization === 'plumber' && '🔧'}
                      {staff.specialization === 'electrician' && '⚡'}
                      {staff.specialization === 'technician' && '🔌'}
                      {staff.specialization === 'ac_technician' && '❄️'}
                      {staff.specialization === 'carpenter' && '🪚'}
                      {staff.specialization === 'painter' && '🎨'}
                      {!['plumber', 'electrician', 'technician', 'ac_technician', 'carpenter', 'painter'].includes(staff.specialization) && '👨‍🔧'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Maintenance Requests</h3>
              <p className="text-gray-600 text-sm">
                {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Maintenance Requests Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest & Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.guestName}</div>
                      <div className="text-sm text-gray-500">Room {request.room}</div>
                      <div className="text-xs text-gray-400">{request.guestEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium">{request.issue}</div>
                    <div className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                      {request.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                      {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getStaffName(request.assignedTo)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.reportedAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => viewRequestDetails(request)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => deleteRequest(request.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛠️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Maintenance Requests</h3>
            <p className="text-gray-600">
              {statusFilter === 'all' 
                ? 'No maintenance requests have been submitted yet.' 
                : `No ${statusFilter} maintenance requests found.`
              }
            </p>
          </div>
        )}
      </Card>

      {/* Request Details Modal */}
      {showRequestDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Maintenance Request Details</h2>
                <button 
                  onClick={() => setShowRequestDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guest Name:</span>
                      <span className="font-medium">{selectedRequest.guestName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guest Email:</span>
                      <span className="font-medium">{selectedRequest.guestEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room Number:</span>
                      <span className="font-medium">Room {selectedRequest.room}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact Number:</span>
                      <span className="font-medium">{selectedRequest.contactNumber}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Issue Type:</span>
                      <span className="font-medium">{selectedRequest.issue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedRequest.priority)}`}>
                        {selectedRequest.priority}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Assigned To:</span>
                      <span className="font-medium">{getStaffName(selectedRequest.assignedTo)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reported:</span>
                      <span className="font-medium">{selectedRequest.reportedAt}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Issue Description</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedRequest.description}</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Request</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => updateRequestStatus(selectedRequest.id, 'pending')}
                        className="bg-gray-600 text-white py-2 px-4 rounded text-sm hover:bg-gray-700 transition-colors"
                      >
                        Pending
                      </button>
                      <button 
                        onClick={() => updateRequestStatus(selectedRequest.id, 'in-progress')}
                        className="bg-yellow-600 text-white py-2 px-4 rounded text-sm hover:bg-yellow-700 transition-colors"
                      >
                        In Progress
                      </button>
                      <button 
                        onClick={() => updateRequestStatus(selectedRequest.id, 'completed')}
                        className="bg-green-600 text-white py-2 px-4 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Completed
                      </button>
                      <button 
                        onClick={() => updateRequestStatus(selectedRequest.id, 'cancelled')}
                        className="bg-red-600 text-white py-2 px-4 rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        Cancelled
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign to Staff Member
                    </label>
                    <select
                      onChange={(e) => updateRequestStatus(selectedRequest.id, selectedRequest.status, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={selectedRequest.assignedTo}
                    >
                      <option value="">Select Staff Member</option>
                      
                      {/* Recommended staff based on issue type */}
                      {getRecommendedStaff(selectedRequest.issue).length > 0 && (
                        <optgroup label="Recommended for this issue">
                          {getRecommendedStaff(selectedRequest.issue).map(staff => (
                            <option key={staff._id} value={staff._id}>
                              {staff.name} - {getSpecializationLabel(staff.specialization)} ✅
                            </option>
                          ))}
                        </optgroup>
                      )}
                      
                      {/* All other maintenance staff */}
                      <optgroup label="All Maintenance Staff">
                        {staffMembers.map(staff => (
                          <option key={staff._id} value={staff._id}>
                            {staff.name} - {getSpecializationLabel(staff.specialization)}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      ✅ Recommended staff are highlighted based on issue type
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t mt-6">
                <Button
                  onClick={() => deleteRequest(selectedRequest.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete Request
                </Button>
                <Button
                  onClick={() => setShowRequestDetails(false)}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Maintenance;