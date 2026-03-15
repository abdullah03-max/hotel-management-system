import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const HousekeepingManagement = () => {
  const [housekeepingRequests, setHousekeepingRequests] = useState([]);
  const [housekeepingTasks, setHousekeepingTasks] = useState([]);
  const [housekeepingStaff, setHousekeepingStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [priority, setPriority] = useState('medium');

  const housekeepingServices = {
    'Room Cleaning': [
      'Daily Housekeeping',
      'Deep Cleaning',
      'Check-out Cleaning',
      'Stay-over Cleaning'
    ],
    'Linens & Towels': [
      'Bed Sheet Change',
      'Towel Replacement',
      'Pillow Replacement',
      'Blanket Replacement'
    ],
    'Amenities': [
      'Toiletries Restock',
      'Mini-bar Restock',
      'Coffee/Tea Refill',
      'Water Bottle Refill'
    ],
    'Special Requests': [
      'Extra Pillows',
      'Extra Blankets',
      'Baby Cot Setup',
      'Room Rearrangement'
    ]
  };

  useEffect(() => {
    loadHousekeepingData();
  }, []);

  const loadHousekeepingData = () => {
    try {
      // Load housekeeping service requests
      const allServiceRequests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
      const housekeepingReqs = allServiceRequests.filter(req => 
        Object.values(housekeepingServices).flat().includes(req.serviceName)
      );
      setHousekeepingRequests(housekeepingReqs);

      // Load housekeeping tasks
      const tasks = JSON.parse(localStorage.getItem('housekeepingTasks') || '[]');
      setHousekeepingTasks(tasks);

      // ✅ IMPROVED: Load housekeeping staff from multiple sources
      let housekeepingStaff = [];
      
      // First try localStorage
      const localStorageStaff = JSON.parse(localStorage.getItem('hotelStaff') || '[]');
      housekeepingStaff = localStorageStaff.filter(staff => 
        staff.role === 'housekeeping' && staff.status === 'active'
      );
      
      // If no staff in localStorage, try to fetch from backend
      if (housekeepingStaff.length === 0) {
        fetch('https://hotel-management-system-production-9e00.up.railway.app/api/staff')
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              const backendStaff = data.data.staff.filter(staff => 
                staff.role === 'housekeeping' && staff.status === 'active'
              );
              setHousekeepingStaff(backendStaff);
              
              // Sync to localStorage for future use
              if (backendStaff.length > 0) {
                const existingStaff = JSON.parse(localStorage.getItem('hotelStaff') || '[]');
                const filteredStaff = existingStaff.filter(staff => staff.role !== 'housekeeping');
                const updatedStaff = [
                  ...filteredStaff,
                  ...backendStaff.map(staff => ({
                    id: staff._id,
                    name: staff.name,
                    email: staff.email,
                    role: staff.role,
                    department: staff.department,
                    phone: staff.phone,
                    status: staff.status
                  }))
                ];
                localStorage.setItem('hotelStaff', JSON.stringify(updatedStaff));
              }
            }
          })
          .catch(error => {
            console.error('Error fetching staff from backend:', error);
          });
      } else {
        setHousekeepingStaff(housekeepingStaff);
      }

    } catch (error) {
      console.error('Error loading housekeeping data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = (request) => {
    setSelectedRequest(request);
    setShowAssignForm(true);
  };

  // ✅ FIXED: Improved task assignment function
  const submitTaskAssignment = () => {
    if (!selectedStaff || !selectedRequest) return;

    const selectedStaffMember = housekeepingStaff.find(staff => staff.name === selectedStaff);
    
    // ✅ FIXED: Create task with proper structure for housekeeping dashboard
    const newTask = {
      id: `task_${Date.now()}`,
      requestId: selectedRequest.id,
      roomNumber: selectedRequest.roomNumber,
      guestName: selectedRequest.guestName,
      serviceType: selectedRequest.serviceName,
      assignedTo: selectedStaffMember?.id || selectedStaff, // Store staff ID
      assignedToName: selectedStaff, // Store staff name for display
      priority: priority,
      status: 'assigned',
      assignedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      specialInstructions: selectedRequest.specialInstructions || '',
      notes: '',
      guestId: selectedRequest.guestId,
      // ✅ ADD THESE FIELDS FOR COMPATIBILITY
      room: selectedRequest.roomNumber, // For compatibility with existing dashboard
      type: 'Guest Request', // For compatibility
      cleaningType: selectedRequest.serviceName, // For compatibility
      lastCleaned: 'Now' // For compatibility
    };

    console.log('🔄 Creating new task:', newTask);
    console.log('👤 Assigned to staff:', selectedStaff);
    console.log('👤 Staff ID:', selectedStaffMember?.id);

    // Save to housekeeping tasks
    const existingTasks = JSON.parse(localStorage.getItem('housekeepingTasks') || '[]');
    const updatedTasks = [...existingTasks, newTask];
    localStorage.setItem('housekeepingTasks', JSON.stringify(updatedTasks));
    setHousekeepingTasks(updatedTasks);

    // Update request status
    const allServiceRequests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
    const updatedRequests = allServiceRequests.map(req =>
      req.id === selectedRequest.id ? { ...req, status: 'assigned' } : req
    );
    localStorage.setItem('serviceRequests', JSON.stringify(updatedRequests));

    // Update in user's personal requests
    const userRequests = JSON.parse(localStorage.getItem(`serviceRequests_${selectedRequest.guestId}`) || '[]');
    const updatedUserRequests = userRequests.map(req =>
      req.id === selectedRequest.id ? { ...req, status: 'assigned' } : req
    );
    localStorage.setItem(`serviceRequests_${selectedRequest.guestId}`, JSON.stringify(updatedUserRequests));

    // ✅ IMPROVED: Create notification for housekeeping staff
    createStaffNotification(newTask, selectedStaffMember);

    setShowAssignForm(false);
    setSelectedRequest(null);
    setSelectedStaff('');
    setPriority('medium');
    
    // Show success message
    alert(`✅ Task assigned to ${selectedStaff} successfully!`);
    
    loadHousekeepingData(); // Reload data
  };

  // ✅ FIXED: Improved notification function
  const createStaffNotification = (task, staffMember) => {
    const staffNotification = {
      id: `notif_${Date.now()}`,
      type: 'task_assigned',
      title: `New Housekeeping Task - Room ${task.roomNumber}`,
      message: `You have been assigned: ${task.serviceType} for Room ${task.roomNumber}. Priority: ${task.priority}`,
      priority: task.priority,
      timestamp: new Date().toISOString(),
      read: false,
      taskId: task.id,
      assignedBy: 'Admin'
    };

    // ✅ FIXED: Use staff ID for notification storage
    const staffId = staffMember?.id || task.assignedTo;
    const notificationKey = `notifications_${staffId}`;
    
    console.log('📢 Creating notification for staff ID:', staffId);
    console.log('📢 Notification key:', notificationKey);
    
    const staffNotifications = JSON.parse(localStorage.getItem(notificationKey) || '[]');
    const updatedNotifications = [staffNotification, ...staffNotifications];
    localStorage.setItem(notificationKey, JSON.stringify(updatedNotifications));
    
    console.log('✅ Notification created for staff:', task.assignedToName);
    console.log('📋 Total notifications:', updatedNotifications.length);
  };

  // ✅ ADDED: Test function for quick testing
  const testTaskAssignment = () => {
    const testStaff = housekeepingStaff[0];
    if (!testStaff) {
      alert('No housekeeping staff available for testing');
      return;
    }

    const testTask = {
      id: `test_task_${Date.now()}`,
      requestId: 'test_request',
      roomNumber: '101',
      guestName: 'Test Guest',
      serviceType: 'Daily Housekeeping',
      assignedTo: testStaff.id,
      assignedToName: testStaff.name,
      priority: 'medium',
      status: 'assigned',
      assignedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      specialInstructions: 'This is a test task',
      notes: '',
      guestId: 'test_guest',
      room: '101',
      type: 'Guest Request',
      cleaningType: 'Daily Housekeeping',
      lastCleaned: 'Now'
    };

    const existingTasks = JSON.parse(localStorage.getItem('housekeepingTasks') || '[]');
    const updatedTasks = [...existingTasks, testTask];
    localStorage.setItem('housekeepingTasks', JSON.stringify(updatedTasks));
    setHousekeepingTasks(updatedTasks);

    // Create notification
    const staffNotification = {
      id: `notif_test_${Date.now()}`,
      type: 'task_assigned',
      title: `Test Task - Room 101`,
      message: `TEST: You have been assigned: Daily Housekeeping for Room 101`,
      priority: 'medium',
      timestamp: new Date().toISOString(),
      read: false,
      taskId: testTask.id,
      assignedBy: 'Admin'
    };

    const notificationKey = `notifications_${testStaff.id}`;
    const staffNotifications = JSON.parse(localStorage.getItem(notificationKey) || '[]');
    const updatedNotifications = [staffNotification, ...staffNotifications];
    localStorage.setItem(notificationKey, JSON.stringify(updatedNotifications));

    alert(`✅ Test task assigned to ${testStaff.name}! Check their dashboard.`);
    loadHousekeepingData();
  };

  const updateTaskStatus = (taskId, newStatus) => {
    const updatedTasks = housekeepingTasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    
    localStorage.setItem('housekeepingTasks', JSON.stringify(updatedTasks));
    setHousekeepingTasks(updatedTasks);

    const task = updatedTasks.find(t => t.id === taskId);
    if (task) {
      const allServiceRequests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
      const updatedRequests = allServiceRequests.map(req =>
        req.id === task.requestId ? { ...req, status: newStatus } : req
      );
      localStorage.setItem('serviceRequests', JSON.stringify(updatedRequests));

      const userRequests = JSON.parse(localStorage.getItem(`serviceRequests_${task.guestId}`) || '[]');
      const updatedUserRequests = userRequests.map(req =>
        req.id === task.requestId ? { ...req, status: newStatus } : req
      );
      localStorage.setItem(`serviceRequests_${task.guestId}`, JSON.stringify(updatedUserRequests));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border border-green-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading housekeeping data...</p>
        </div>
      </div>
    );
  }

  const pendingRequests = housekeepingRequests.filter(req => req.status === 'pending');
  const assignedTasks = housekeepingTasks.filter(task => task.status === 'assigned');
  const inProgressTasks = housekeepingTasks.filter(task => task.status === 'in-progress');
  const completedTasks = housekeepingTasks.filter(task => task.status === 'completed');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Housekeeping Management</h2>
          <p className="text-gray-600 mt-1">Manage housekeeping services and assign tasks to staff</p>
          <p className="text-sm text-green-600 mt-1">
            ✅ {housekeepingStaff.length} housekeeping staff available for task assignment
          </p>
        </div>
        <div className="flex space-x-4">
          <Button onClick={testTaskAssignment} className="bg-orange-600 hover:bg-orange-700">
            🧪 Test Task Assignment
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-l-4 border-l-yellow-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Pending Requests</p>
            <p className="text-2xl font-bold text-gray-900">{pendingRequests.length}</p>
          </div>
        </Card>
        <Card className="bg-white border-l-4 border-l-blue-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Assigned Tasks</p>
            <p className="text-2xl font-bold text-gray-900">{assignedTasks.length}</p>
          </div>
        </Card>
        <Card className="bg-white border-l-4 border-l-orange-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="text-2xl font-bold text-gray-900">{inProgressTasks.length}</p>
          </div>
        </Card>
        <Card className="bg-white border-l-4 border-l-green-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Completed Today</p>
            <p className="text-2xl font-bold text-gray-900">{completedTasks.length}</p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Service Requests ({housekeepingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tasks'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Assigned Tasks ({housekeepingTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'staff'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Housekeeping Staff ({housekeepingStaff.length})
          </button>
        </nav>
      </div>

      {/* Service Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🧹</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Requests</h3>
                <p className="text-gray-600">No housekeeping service requests are pending assignment.</p>
              </div>
            </Card>
          ) : (
            pendingRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🧹</span>
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

                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => handleAssignTask(request)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Assign to Staff
                    </Button>
                    <Button 
                      onClick={() => updateTaskStatus(request.id, 'cancelled')}
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Cancel Request
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Assigned Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {housekeepingTasks.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assigned Tasks</h3>
                <p className="text-gray-600">No housekeeping tasks have been assigned yet.</p>
              </div>
            </Card>
          ) : (
            housekeepingTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🧹</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{task.serviceType}</h3>
                        <p className="text-gray-600 text-sm">
                          Room {task.roomNumber} • {task.guestName} • Assigned to: {task.assignedToName || task.assignedTo}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority} priority
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600"><strong>Assigned:</strong> {new Date(task.assignedAt).toLocaleString()}</p>
                      <p className="text-sm text-gray-600"><strong>Due:</strong> {new Date(task.dueDate).toLocaleString()}</p>
                    </div>
                    <div>
                      {task.specialInstructions && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Instructions:</p>
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {task.specialInstructions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {task.status === 'assigned' && (
                      <Button 
                        onClick={() => updateTaskStatus(task.id, 'in-progress')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Mark In Progress
                      </Button>
                    )}
                    {task.status === 'in-progress' && (
                      <Button 
                        onClick={() => updateTaskStatus(task.id, 'completed')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Mark Completed
                      </Button>
                    )}
                    <Button 
                      onClick={() => updateTaskStatus(task.id, 'cancelled')}
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Cancel Task
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Staff Tab */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          {housekeepingStaff.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Housekeeping Staff</h3>
                <p className="text-gray-600">No housekeeping staff members found.</p>
                <p className="text-sm text-blue-600 mt-2">
                  Add housekeeping staff through Staff Management to assign tasks.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {housekeepingStaff.map((staff) => {
                const staffTasks = housekeepingTasks.filter(task => 
                  task.assignedTo === staff.id || task.assignedToName === staff.name
                );
                const activeTasks = staffTasks.filter(task => ['assigned', 'in-progress'].includes(task.status));
                
                return (
                  <Card key={staff.id} className="hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-lg">👤</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{staff.name}</h3>
                          <p className="text-sm text-gray-600">{staff.email}</p>
                          <p className="text-xs text-blue-600">ID: {staff.id}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{staff.phone}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Department:</span>
                          <span className="font-medium">{staff.department}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Active Tasks:</span>
                          <span className="font-medium text-blue-600">{activeTasks.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Tasks:</span>
                          <span className="font-medium">{staffTasks.length}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            alert(`Staff Details:\nName: ${staff.name}\nEmail: ${staff.email}\nID: ${staff.id}\nPhone: ${staff.phone}\nActive Tasks: ${activeTasks.length}`);
                          }}
                        >
                          View Details
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            const staffTasksList = housekeepingTasks.filter(task => 
                              task.assignedTo === staff.id || task.assignedToName === staff.name
                            );
                            alert(`${staff.name} has ${staffTasksList.length} tasks assigned.\n\nTasks:\n${staffTasksList.map(task => `• ${task.serviceType} - Room ${task.roomNumber} (${task.status})`).join('\n')}`);
                          }}
                        >
                          View Tasks
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Assign Task Modal */}
      {showAssignForm && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full"
          >
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Assign Housekeeping Task</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Request</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedRequest.serviceName}</p>
                  <p className="text-sm text-gray-600">Room {selectedRequest.roomNumber} • {selectedRequest.guestName}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign To Staff *</label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Housekeeping Staff</option>
                  {housekeepingStaff.map(staff => (
                    <option key={staff.id} value={staff.name}>
                      {staff.name} {staff.id && `(ID: ${staff.id})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              {selectedRequest.specialInstructions && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{selectedRequest.specialInstructions}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-4 p-6 border-t">
              <Button
                onClick={submitTaskAssignment}
                className="bg-green-600 hover:bg-green-700"
                disabled={!selectedStaff}
              >
                Assign Task
              </Button>
              <Button
                onClick={() => {
                  setShowAssignForm(false);
                  setSelectedRequest(null);
                  setSelectedStaff('');
                  setPriority('medium');
                }}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default HousekeepingManagement;
