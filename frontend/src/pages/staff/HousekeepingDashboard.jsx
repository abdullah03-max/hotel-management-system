import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StaffLayout from '../../components/layout/StaffLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const HousekeepingDashboard = () => {
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [cleaningSchedule, setCleaningSchedule] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [notifications, setNotifications] = useState([]);

  // ✅ ADDED: State for dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    urgentTasks: 0,
    assignedTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    totalRoomsToClean: 0
  });

  useEffect(() => {
    loadCurrentStaff();
  }, []);

  // ✅ FIXED: Load data when currentStaff is available
  useEffect(() => {
    if (currentStaff) {
      loadHousekeepingData();
      loadNotifications();
    }
  }, [currentStaff]);

  // ✅ FIXED: Set up interval only when component is ready
  useEffect(() => {
    if (currentStaff) {
      const interval = setInterval(() => {
        loadHousekeepingData();
        loadNotifications();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [currentStaff]);

  // ✅ FIXED: Improved staff loading
  const loadCurrentStaff = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
      console.log('👤 User data from localStorage:', userData);
      
      if (userData && userData.role === 'housekeeping') {
        setCurrentStaff({
          id: userData.id,
          name: userData.name,
          role: userData.role,
          email: userData.email
        });
        
        console.log('✅ Housekeeping staff loaded:', userData.name, userData.id);
      } else {
        console.log('❌ Not a housekeeping staff or no user data');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading current staff:', error);
      setLoading(false);
    }
  };

  const loadNotifications = () => {
    try {
      if (currentStaff?.id) {
        const staffNotifications = JSON.parse(localStorage.getItem(`notifications_${currentStaff.id}`) || '[]');
        const unreadNotifications = staffNotifications.filter(notif => !notif.read);
        setNotifications(unreadNotifications);
        console.log('📢 Notifications loaded:', unreadNotifications.length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markNotificationAsRead = (notificationId) => {
    try {
      if (currentStaff?.id) {
        const staffNotifications = JSON.parse(localStorage.getItem(`notifications_${currentStaff.id}`) || '[]');
        const updatedNotifications = staffNotifications.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        );
        localStorage.setItem(`notifications_${currentStaff.id}`, JSON.stringify(updatedNotifications));
        loadNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // ✅ FIXED: Improved task loading with proper state updates
  const loadHousekeepingData = () => {
    try {
      console.log('🔄 Loading housekeeping data...');
      
      // Load tasks assigned by admin (from housekeepingTasks)
      const allAssignedTasks = JSON.parse(localStorage.getItem('housekeepingTasks') || '[]');
      
      console.log('🔍 All tasks in system:', allAssignedTasks.length);
      console.log('👤 Current staff:', currentStaff);
      
      // ✅ FIXED: Better staff identification
      const myAssignedTasks = allAssignedTasks.filter(task => {
        if (!currentStaff) return false;
        
        // Try all possible matching methods
        const isAssignedToMe = 
          task.assignedTo === currentStaff.id ||
          task.assignedTo === currentStaff.name ||
          task.assignedToName === currentStaff.name ||
          (currentStaff.name && task.assignedTo?.includes(currentStaff.name));
        
        return isAssignedToMe && ['assigned', 'in-progress', 'completed'].includes(task.status);
      });
      
      console.log('📋 My assigned tasks:', myAssignedTasks.length);
      setAssignedTasks(myAssignedTasks);
      
      // ✅ FIXED: Calculate stats immediately
      const urgentTasks = cleaningSchedule.filter(task => task.priority === 'high' && task.status !== 'Completed');
      const inProgressTasks = myAssignedTasks.filter(task => task.status === 'in-progress');
      const completedTasks = myAssignedTasks.filter(task => task.status === 'completed');
      
      // Update dashboard stats
      setDashboardStats({
        urgentTasks: urgentTasks.length,
        assignedTasks: myAssignedTasks.filter(task => task.status === 'assigned').length,
        inProgressTasks: inProgressTasks.length,
        completedTasks: completedTasks.length,
        totalRoomsToClean: cleaningSchedule.length
      });
      
      // Load room data for cleaning schedule
      const rooms = JSON.parse(localStorage.getItem('hotelRooms') || '[]');
      const bookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
      
      // Generate cleaning schedule based on room status and bookings
      const schedule = generateCleaningSchedule(rooms, bookings);
      setCleaningSchedule(schedule);
      
      // Update urgent tasks count with actual schedule data
      const actualUrgentTasks = schedule.filter(task => task.priority === 'high' && task.status !== 'Completed');
      setDashboardStats(prev => ({
        ...prev,
        urgentTasks: actualUrgentTasks.length,
        totalRoomsToClean: schedule.length
      }));
      
      // Load inventory data
      const inventoryData = JSON.parse(localStorage.getItem('housekeepingInventory') || '[]');
      setInventory(inventoryData.length > 0 ? inventoryData : getDefaultInventory());
      
    } catch (error) {
      console.error('Error loading housekeeping data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADDED: Function to refresh all data
  const refreshAllData = () => {
    setLoading(true);
    loadHousekeepingData();
    loadNotifications();
  };

  // ✅ ADDED: Debug function with more details
  const debugTaskAssignment = () => {
    console.log('🐛 DEBUG TASK ASSIGNMENT');
    console.log('Current Staff:', currentStaff);
    
    const allTasks = JSON.parse(localStorage.getItem('housekeepingTasks') || '[]');
    console.log('All tasks in system:', allTasks);
    
    const myTasks = allTasks.filter(task => {
      if (!currentStaff) return false;
      return (task.assignedTo === currentStaff.id || 
              task.assignedTo === currentStaff.name || 
              task.assignedToName === currentStaff.name);
    });
    
    console.log('My filtered tasks:', myTasks);
    
    const rooms = JSON.parse(localStorage.getItem('hotelRooms') || '[]');
    const schedule = generateCleaningSchedule(rooms, []);
    
    alert(`Debug Info:
- Current Staff: ${currentStaff?.name} (ID: ${currentStaff?.id})
- Total Tasks in System: ${allTasks.length}
- My Tasks: ${myTasks.length}
- Dashboard Stats:
  • Urgent: ${dashboardStats.urgentTasks}
  • Assigned: ${dashboardStats.assignedTasks} 
  • In Progress: ${dashboardStats.inProgressTasks}
  • Completed: ${dashboardStats.completedTasks}
  • Rooms to Clean: ${dashboardStats.totalRoomsToClean}
Check console for details.`);
  };

  const generateCleaningSchedule = (rooms, bookings) => {
    const today = new Date().toISOString().split('T')[0];
    
    const schedule = rooms.map(room => {
      const roomBooking = bookings.find(booking => 
        booking.roomNumber === room.number && 
        booking.status === 'confirmed' &&
        booking.checkOut === today
      );
      
      const currentBooking = bookings.find(booking => 
        booking.roomNumber === room.number && 
        booking.status === 'confirmed' &&
        booking.checkIn <= today && 
        booking.checkOut >= today
      );

      let cleaningType = 'Vacant Clean';
      let status = 'To Do';
      let guestName = 'Vacant';
      
      if (roomBooking && room.status === 'occupied') {
        cleaningType = 'Check-out Clean';
        guestName = roomBooking.guestName || 'Guest';
        status = 'Urgent';
      } else if (currentBooking) {
        cleaningType = 'Stay-over Clean';
        guestName = currentBooking.guestName || 'Guest';
        status = room.cleanStatus === 'clean' ? 'Completed' : 'To Do';
      } else if (room.status === 'available' && room.cleanStatus !== 'clean') {
        cleaningType = 'Deep Clean';
        status = 'To Do';
      }

      return {
        id: `room_${room.number}`,
        room: room.number,
        type: room.type,
        cleaningType,
        guestName,
        status,
        priority: cleaningType === 'Check-out Clean' ? 'high' : 
                 cleaningType === 'Stay-over Clean' ? 'medium' : 'low',
        lastCleaned: room.lastCleaned || 'Never',
        notes: room.notes || ''
      };
    }).filter(room => room.status !== 'Completed' && room.cleaningType !== 'Vacant Clean');

    console.log('📅 Generated cleaning schedule:', schedule.length, 'rooms');
    return schedule;
  };

  const getDefaultInventory = () => [
    { id: 1, item: 'Bed Sheets', quantity: 150, threshold: 20, status: 'Adequate' },
    { id: 2, item: 'Pillows', quantity: 80, threshold: 10, status: 'Adequate' },
    { id: 3, item: 'Towels', quantity: 200, threshold: 30, status: 'Adequate' },
    { id: 4, item: 'Toilet Paper', quantity: 15, threshold: 20, status: 'Low' },
    { id: 5, item: 'Cleaning Solution', quantity: 8, threshold: 5, status: 'Adequate' },
    { id: 6, item: 'Trash Bags', quantity: 25, threshold: 15, status: 'Adequate' }
  ];

  // ✅ FIXED: Improved task update with immediate state refresh
  const handleAssignedTaskUpdate = (taskId, newStatus) => {
    console.log('🔄 Updating task:', taskId, 'to', newStatus);
    
    const allTasks = JSON.parse(localStorage.getItem('housekeepingTasks') || '[]');
    const updatedTasks = allTasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    
    localStorage.setItem('housekeepingTasks', JSON.stringify(updatedTasks));
    
    // ✅ FIXED: Immediate state update
    const myUpdatedTasks = updatedTasks.filter(task => {
      if (!currentStaff) return false;
      return (task.assignedTo === currentStaff.id || 
              task.assignedTo === currentStaff.name || 
              task.assignedToName === currentStaff.name);
    }).filter(task => ['assigned', 'in-progress', 'completed'].includes(task.status));
    
    setAssignedTasks(myUpdatedTasks);
    
    // ✅ FIXED: Immediate stats update
    const assignedCount = myUpdatedTasks.filter(task => task.status === 'assigned').length;
    const inProgressCount = myUpdatedTasks.filter(task => task.status === 'in-progress').length;
    const completedCount = myUpdatedTasks.filter(task => task.status === 'completed').length;
    
    setDashboardStats(prev => ({
      ...prev,
      assignedTasks: assignedCount,
      inProgressTasks: inProgressCount,
      completedTasks: completedCount
    }));
    
    // Create notification for admin
    const updatedTask = updatedTasks.find(task => task.id === taskId);
    if (updatedTask) {
      createAdminNotification(updatedTask.roomNumber, newStatus);
    }
    
    console.log('✅ Task updated successfully');
  };

  // Handle regular room cleaning updates
  const handleRoomCleaningUpdate = (roomNumber, status) => {
    const rooms = JSON.parse(localStorage.getItem('hotelRooms') || '[]');
    const updatedRooms = rooms.map(room => 
      room.number === roomNumber ? { 
        ...room, 
        cleanStatus: status === 'completed' ? 'clean' : 'cleaning',
        lastCleaned: status === 'completed' ? new Date().toISOString() : room.lastCleaned
      } : room
    );
    
    localStorage.setItem('hotelRooms', JSON.stringify(updatedRooms));
    
    // ✅ FIXED: Refresh data immediately
    setTimeout(() => {
      loadHousekeepingData();
    }, 100);
    
    createAdminNotification(roomNumber, status);
  };

  const createAdminNotification = (roomNumber, status) => {
    const adminNotification = {
      id: `notif_${Date.now()}`,
      type: 'housekeeping_update',
      title: `Room ${roomNumber} ${status}`,
      message: `Room ${roomNumber} has been marked as ${status} by ${currentStaff?.name || 'Housekeeping Staff'}`,
      priority: 'medium',
      timestamp: new Date().toISOString(),
      read: false
    };
    
    const adminNotifications = JSON.parse(localStorage.getItem('notifications_admin') || '[]');
    const updatedAdminNotifications = [adminNotification, ...adminNotifications];
    localStorage.setItem('notifications_admin', JSON.stringify(updatedAdminNotifications));
  };

  const handleInventoryUpdate = (itemId, newQuantity) => {
    const updatedInventory = inventory.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    
    const finalInventory = updatedInventory.map(item => ({
      ...item,
      status: item.quantity <= item.threshold ? 'Low' : 'Adequate'
    }));
    
    localStorage.setItem('housekeepingInventory', JSON.stringify(finalInventory));
    setInventory(finalInventory);
  };

  const requestInventory = (itemName, quantity) => {
    const request = {
      id: `req_${Date.now()}`,
      item: itemName,
      quantity: quantity,
      requestedBy: currentStaff?.name || 'Housekeeping Staff',
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    const inventoryRequests = JSON.parse(localStorage.getItem('inventoryRequests') || '[]');
    const updatedRequests = [request, ...inventoryRequests];
    localStorage.setItem('inventoryRequests', JSON.stringify(updatedRequests));
    
    alert(`Request submitted for ${quantity} ${itemName}`);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border border-green-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'Urgent': return 'bg-red-100 text-red-800';
      case 'To Do': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInventoryStatusColor = (status) => {
    switch (status) {
      case 'Low': return 'bg-red-100 text-red-800';
      case 'Adequate': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <StaffLayout title="Housekeeping Dashboard" role="housekeeping">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading housekeeping dashboard...</p>
          </div>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout title="Housekeeping Dashboard" role="housekeeping">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    🧹 Housekeeping Dashboard
                  </h1>
                  <p className="text-purple-100 text-lg">
                    Welcome, {currentStaff?.name || 'Housekeeping Staff'}! 
                    {currentStaff?.id && ` (ID: ${currentStaff.id})`}
                  </p>
                  <div className="flex items-center space-x-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                        {dashboardStats.totalRoomsToClean} Rooms to Clean
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-red-400 px-3 py-1 rounded-full text-sm">
                        {dashboardStats.urgentTasks} Urgent
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-400 px-3 py-1 rounded-full text-sm">
                        {dashboardStats.assignedTasks} Assigned Tasks
                      </span>
                    </div>
                    {notifications.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="bg-yellow-400 px-3 py-1 rounded-full text-sm">
                          {notifications.length} New Notifications
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Action Buttons */}
                  <div className="flex space-x-2 mt-4">
                    <Button 
                      size="sm" 
                      onClick={refreshAllData}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      🔄 Refresh Data
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={debugTaskAssignment}
                      className="bg-gray-600 hover:bg-gray-700"
                    >
                      🐛 Debug
                    </Button>
                  </div>
                </div>
                <div className="text-4xl">🏨</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-yellow-50 border border-yellow-200">
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-yellow-800">📢 New Notifications</h3>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={refreshAllData}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      🔄 Refresh
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        notifications.forEach(notif => markNotificationAsRead(notif.id));
                      }}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Mark All Read
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 mt-3">
                  {notifications.slice(0, 3).map(notification => (
                    <div key={notification.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-yellow-100">
                      <div>
                        <p className="font-medium text-yellow-900">{notification.title}</p>
                        <p className="text-sm text-yellow-700">{notification.message}</p>
                        <p className="text-xs text-yellow-600">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => markNotificationAsRead(notification.id)}
                        className="bg-yellow-500 hover:bg-yellow-600"
                      >
                        ✓
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Stats Grid - ✅ FIXED: Using dashboardStats state */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-red-100">Urgent Tasks</p>
                  <h3 className="text-2xl font-bold mt-2">{dashboardStats.urgentTasks}</h3>
                </div>
                <div className="text-2xl">🚨</div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100">Assigned Tasks</p>
                  <h3 className="text-2xl font-bold mt-2">{dashboardStats.assignedTasks}</h3>
                </div>
                <div className="text-2xl">📋</div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-yellow-100">In Progress</p>
                  <h3 className="text-2xl font-bold mt-2">{dashboardStats.inProgressTasks}</h3>
                </div>
                <div className="text-2xl">🔄</div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-green-100">Completed Today</p>
                  <h3 className="text-2xl font-bold mt-2">{dashboardStats.completedTasks}</h3>
                </div>
                <div className="text-2xl">✅</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Card className="mb-6">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'tasks', name: 'My Assigned Tasks', icon: '🧹', count: assignedTasks.length },
                { id: 'schedule', name: 'Cleaning Schedule', icon: '📅', count: cleaningSchedule.length },
                { id: 'inventory', name: 'Inventory', icon: '📦', count: inventory.length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </Card>

        {/* Tasks Tab - Show Assigned Tasks from Admin */}
        {activeTab === 'tasks' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <Card>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">My Assigned Tasks</h3>
                  <Button 
                    size="sm" 
                    onClick={refreshAllData}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    🔄 Refresh
                  </Button>
                </div>
                <div className="space-y-4">
                  {assignedTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📭</div>
                      <p className="text-gray-500">No tasks assigned to you yet.</p>
                      <p className="text-gray-400 text-sm mt-1">The supervisor will assign tasks shortly.</p>
                    </div>
                  ) : (
                    assignedTasks.map((task) => (
                      <div key={task.id} className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">🧹</span>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{task.serviceType}</h3>
                              <p className="text-gray-600 text-sm">
                                Room {task.roomNumber} • {task.guestName}
                              </p>
                              <p className="text-xs text-gray-500">
                                Assigned: {new Date(task.assignedAt).toLocaleString()}
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
                            <p className="text-sm text-gray-600"><strong>Due:</strong> {new Date(task.dueDate).toLocaleString()}</p>
                            <p className="text-sm text-gray-600"><strong>Room:</strong> {task.roomNumber}</p>
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
                              onClick={() => handleAssignedTaskUpdate(task.id, 'in-progress')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Start Task
                            </Button>
                          )}
                          {task.status === 'in-progress' && (
                            <Button 
                              onClick={() => handleAssignedTaskUpdate(task.id, 'completed')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Mark Completed
                            </Button>
                          )}
                          {task.status === 'completed' && (
                            <span className="text-green-600 font-semibold">✅ Completed</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Regular Room Cleaning</h3>
                <div className="space-y-4">
                  {cleaningSchedule.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Room {task.room}</p>
                        <p className="text-sm text-gray-600">{task.cleaningType}</p>
                        <p className="text-xs text-gray-400">Guest: {task.guestName}</p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        {task.status === 'To Do' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleRoomCleaningUpdate(task.room, 'in-progress')}
                          >
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {cleaningSchedule.length > 3 && (
                    <div className="text-center">
                      <p className="text-sm text-gray-500">
                        + {cleaningSchedule.length - 3} more rooms to clean
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Housekeeping Inventory</h3>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    📦 Request Supplies
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inventory.map(item => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-900">{item.item}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getInventoryStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Current Stock:</span>
                          <span className="font-medium">{item.quantity}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Low Stock Alert:</span>
                          <span className="font-medium">{item.threshold}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-4">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => requestInventory(item.item, 10)}
                        >
                          Request 10
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => requestInventory(item.item, 25)}
                        >
                          Request 25
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Cleaning Schedule</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cleaning Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Cleaned</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cleaningSchedule.map((task) => (
                        <tr key={task.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            Room {task.room}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {task.type}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {task.cleaningType}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {task.guestName}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {task.lastCleaned}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </StaffLayout>
  );
};

export default HousekeepingDashboard;