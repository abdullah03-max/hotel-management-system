import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StaffLayout from '../../components/layout/StaffLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const MaintenanceDashboard = () => {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [assignedRequests, setAssignedRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStaff, setCurrentStaff] = useState(null);

  // Get current logged-in staff member with specialization
  useEffect(() => {
    const loadCurrentStaff = () => {
      try {
        // Get from authentication context or localStorage
        const staffId = localStorage.getItem('currentStaffId');
        const staffName = localStorage.getItem('currentStaffName');
        const staffRole = localStorage.getItem('currentStaffRole');
        const staffSpecialization = localStorage.getItem('currentStaffSpecialization');
        
        if (staffId && staffName) {
          setCurrentStaff({
            id: staffId,
            name: staffName,
            role: staffRole,
            specialization: staffSpecialization || 'general'
          });
          console.log('👤 Current staff loaded:', {
            id: staffId,
            name: staffName,
            specialization: staffSpecialization
          });
        } else {
          // Try to get from currentUser as fallback
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          if (currentUser && currentUser.role === 'maintenance') {
            setCurrentStaff({
              id: currentUser.id,
              name: currentUser.name,
              role: currentUser.role,
              specialization: currentUser.specialization || 'general'
            });
            console.log('👤 Current staff from user data:', currentUser);
          } else {
            console.error('❌ No maintenance staff login found');
          }
        }
      } catch (error) {
        console.error('Error loading current staff:', error);
      }
    };

    loadCurrentStaff();
  }, []);

  useEffect(() => {
    if (currentStaff) {
      loadMaintenanceData();
      
      // Set up real-time updates
      const interval = setInterval(loadMaintenanceData, 3000);
      
      return () => clearInterval(interval);
    }
  }, [currentStaff]);

  const loadMaintenanceData = () => {
    if (!currentStaff) return;

    try {
      // Load maintenance requests from localStorage
      const savedRequests = JSON.parse(localStorage.getItem('maintenanceRequests') || '[]');
      
      console.log('🔧 All maintenance requests:', savedRequests.length);
      console.log('👤 Current staff:', {
        id: currentStaff.id,
        name: currentStaff.name,
        specialization: currentStaff.specialization
      });
      
      // ✅ FIXED: Filter requests assigned specifically to this staff member ONLY
      const myAssignedRequests = savedRequests.filter(request => {
        // Check if this request is assigned to CURRENT staff member
        const isAssignedToMe = 
          request.assignedTo === currentStaff.id || 
          request.assignedStaffId === currentStaff.id;
        
        if (isAssignedToMe) {
          console.log('✅ Task assigned to me:', {
            requestId: request.id,
            issue: request.issue,
            assignedTo: request.assignedTo,
            myId: currentStaff.id
          });
        }
        
        return isAssignedToMe;
      });
      
      console.log('📋 My assigned requests:', myAssignedRequests.length);
      console.log('📋 Details:', myAssignedRequests.map(req => ({
        id: req.id,
        issue: req.issue,
        assignedTo: req.assignedTo
      })));

      // Load notifications for this specific staff member using their ID
      const staffNotifications = JSON.parse(localStorage.getItem(`notifications_${currentStaff.id}`) || '[]');
      console.log('🔔 My notifications:', staffNotifications.length);
      
      setMaintenanceRequests(savedRequests);
      setAssignedRequests(myAssignedRequests);
      setNotifications(staffNotifications.filter(notif => !notif.read));
      
    } catch (error) {
      console.error('❌ Error loading maintenance data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get specialization label with icon
  const getSpecializationDisplay = (specialization) => {
    const specializations = {
      'plumber': { label: 'Plumber', icon: '🔧', color: 'from-blue-500 to-blue-600', description: 'Expert in plumbing and water systems' },
      'electrician': { label: 'Electrician', icon: '⚡', color: 'from-yellow-500 to-yellow-600', description: 'Expert in electrical systems and wiring' },
      'technician': { label: 'Technician', icon: '🔌', color: 'from-purple-500 to-purple-600', description: 'Expert in technical equipment and electronics' },
      'ac_technician': { label: 'AC Technician', icon: '❄️', color: 'from-cyan-500 to-cyan-600', description: 'Expert in air conditioning systems' },
      'carpenter': { label: 'Carpenter', icon: '🪚', color: 'from-orange-500 to-orange-600', description: 'Expert in woodwork and furniture' },
      'painter': { label: 'Painter', icon: '🎨', color: 'from-pink-500 to-pink-600', description: 'Expert in painting and surface finishing' },
      'general': { label: 'General Maintenance', icon: '👨‍🔧', color: 'from-gray-500 to-gray-600', description: 'General maintenance and repairs' }
    };
    
    return specializations[specialization] || { 
      label: 'General Maintenance', 
      icon: '👨‍🔧', 
      color: 'from-gray-500 to-gray-600',
      description: 'General maintenance and repairs'
    };
  };

  const markNotificationsAsRead = () => {
    if (!currentStaff) return;
    
    try {
      const staffNotifications = JSON.parse(localStorage.getItem(`notifications_${currentStaff.id}`) || '[]');
      const updatedNotifications = staffNotifications.map(notif => ({ ...notif, read: true }));
      localStorage.setItem(`notifications_${currentStaff.id}`, JSON.stringify(updatedNotifications));
      setNotifications([]);
      console.log('✅ Marked all notifications as read');
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleStatusUpdate = (requestId, status) => {
    const updatedRequests = maintenanceRequests.map(request => {
      if (request.id === requestId) {
        const updatedRequest = { 
          ...request, 
          status: status,
          updatedAt: new Date().toISOString(),
          completedAt: status === 'completed' ? new Date().toISOString() : request.completedAt
        };
        
        return updatedRequest;
      }
      return request;
    });
    
    // Save to localStorage
    localStorage.setItem('maintenanceRequests', JSON.stringify(updatedRequests));
    
    // Update state
    setMaintenanceRequests(updatedRequests);
    setAssignedRequests(updatedRequests.filter(request => 
      request.assignedTo === currentStaff.id || 
      request.assignedStaffId === currentStaff.id
    ));
    
    // Create notification for admin
    const request = maintenanceRequests.find(req => req.id === requestId);
    if (request) {
      createAdminNotification(request, status);
    }
    
    alert(`✅ Request status updated to: ${status}`);
  };

  const createAdminNotification = (request, newStatus) => {
    const adminNotification = {
      id: `notif_${Date.now()}`,
      type: 'maintenance_update',
      title: `Maintenance Request ${newStatus}`,
      message: `Room ${request.room}: ${request.issue} has been marked as ${newStatus} by ${currentStaff.name} (${getSpecializationDisplay(currentStaff.specialization).label})`,
      priority: request.priority,
      relatedId: request.id,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Save to admin notifications
    const adminNotifications = JSON.parse(localStorage.getItem('notifications_admin') || '[]');
    const updatedAdminNotifications = [adminNotification, ...adminNotifications];
    localStorage.setItem('notifications_admin', JSON.stringify(updatedAdminNotifications));
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

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const past = new Date(timestamp);
    const diffInMinutes = Math.floor((now - past) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <StaffLayout title="Maintenance Dashboard" role="maintenance">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading maintenance dashboard...</p>
          </div>
        </div>
      </StaffLayout>
    );
  }

  if (!currentStaff) {
    return (
      <StaffLayout title="Maintenance Dashboard" role="maintenance">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600">Please login to access the maintenance dashboard.</p>
          </div>
        </div>
      </StaffLayout>
    );
  }

  const specializationInfo = getSpecializationDisplay(currentStaff.specialization);

  return (
    <StaffLayout title="Maintenance Dashboard" role="maintenance">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section with Specialization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className={`bg-gradient-to-r ${specializationInfo.color} text-white`}>
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="text-5xl bg-white bg-opacity-20 p-4 rounded-2xl">
                      {specializationInfo.icon}
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold mb-2">
                        {currentStaff.name}'s Dashboard
                      </h1>
                      <div className="flex items-center space-x-3">
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-lg font-semibold">
                          {specializationInfo.label}
                        </span>
                        <span className="text-white text-opacity-90 text-lg">
                          {specializationInfo.description}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 mt-4">
                    <div className="flex items-center space-x-2">
                      <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                        {assignedRequests.length} Assigned Tasks
                      </span>
                    </div>
                    {notifications.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="bg-red-400 px-3 py-1 rounded-full text-sm animate-pulse">
                          {notifications.length} New Notifications
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                        Staff ID: {currentStaff.id.substring(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-6xl opacity-80">
                  {specializationInfo.icon}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Notifications Section */}
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <Card className="border-l-4 border-l-blue-500">
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="text-blue-500 mr-2">🔔</span>
                    New Notifications
                  </h3>
                  <Button 
                    size="sm" 
                    onClick={markNotificationsAsRead}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Mark All as Read
                  </Button>
                </div>
                <div className="space-y-2">
                  {notifications.map(notification => (
                    <div key={notification.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-600">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{getTimeAgo(notification.timestamp)}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        notification.priority === 'urgent' ? 'bg-purple-100 text-purple-800' :
                        notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                        notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {notification.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-red-100">High Priority</p>
                  <h3 className="text-2xl font-bold mt-2">
                    {assignedRequests.filter(r => r.priority === 'high' || r.priority === 'urgent').length}
                  </h3>
                </div>
                <div className="text-2xl">🚨</div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-yellow-100">In Progress</p>
                  <h3 className="text-2xl font-bold mt-2">
                    {assignedRequests.filter(r => r.status === 'in-progress').length}
                  </h3>
                </div>
                <div className="text-2xl">🛠️</div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-green-100">Completed</p>
                  <h3 className="text-2xl font-bold mt-2">
                    {assignedRequests.filter(r => r.status === 'completed').length}
                  </h3>
                </div>
                <div className="text-2xl">✅</div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100">Pending</p>
                  <h3 className="text-2xl font-bold mt-2">
                    {assignedRequests.filter(r => r.status === 'pending').length}
                  </h3>
                </div>
                <div className="text-2xl">⏳</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Assigned Maintenance Requests */}
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">My Assigned Requests</h3>
                <p className="text-sm text-gray-600">
                  Tasks specifically assigned to you as {specializationInfo.label}
                </p>
              </div>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {assignedRequests.length} tasks
              </span>
            </div>
            
            {assignedRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">{specializationInfo.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assigned Tasks</h3>
                <p className="text-gray-600">
                  You don't have any maintenance requests assigned to you.
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  The admin will assign {specializationInfo.label.toLowerCase()} tasks to you when available.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignedRequests.map(request => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                          {request.priority.toUpperCase()}
                        </span>
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status.replace('-', ' ').toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          Assigned: {getTimeAgo(request.updatedAt || request.createdAt)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium text-gray-900">Room {request.room}</p>
                          <p className="text-sm text-gray-600">{request.guestName}</p>
                          <p className="text-xs text-gray-400">Contact: {request.contactNumber || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{request.issue}</p>
                          <p className="text-sm text-gray-500">{request.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      {request.status === 'pending' && (
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                          onClick={() => handleStatusUpdate(request.id, 'in-progress')}
                        >
                          Start Work
                        </Button>
                      )}
                      {request.status === 'in-progress' && (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                          onClick={() => handleStatusUpdate(request.id, 'completed')}
                        >
                          Mark Complete
                        </Button>
                      )}
                      {request.status === 'completed' && (
                        <Button 
                          size="sm" 
                          className="bg-gray-600 hover:bg-gray-700 whitespace-nowrap"
                          onClick={() => handleStatusUpdate(request.id, 'in-progress')}
                        >
                          Reopen
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Quick Actions */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start bg-green-600 hover:bg-green-700">
                  📝 Create Work Report
                </Button>
                <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                  📋 Request Supplies
                </Button>
                <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700">
                  🕒 Log Working Hours
                </Button>
              </div>
            </div>
          </Card>

          {/* Today's Summary */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tasks Completed:</span>
                  <span className="font-semibold text-green-600">
                    {assignedRequests.filter(r => r.status === 'completed' && 
                      new Date(r.completedAt).toDateString() === new Date().toDateString()).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tasks In Progress:</span>
                  <span className="font-semibold text-yellow-600">
                    {assignedRequests.filter(r => r.status === 'in-progress').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">New Assignments:</span>
                  <span className="font-semibold text-blue-600">
                    {assignedRequests.filter(r => 
                      new Date(r.createdAt).toDateString() === new Date().toDateString()).length}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </StaffLayout>
  );
};

export default MaintenanceDashboard;