import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import WelcomeSection from './components/WelcomeSection';
import StatsGrid from './components/StatsGrid';
import NavigationTabs from './components/NavigationTabs';
import OverviewTab from './tabs/OverviewTab';
import BookingsTab from './tabs/BookingsTab';
import NotificationsTab from './tabs/NotificationsTab';
import RoomsTab from './tabs/RoomsTab';
import ProfileTab from './tabs/ProfileTab';
import ServicesTab from './tabs/ServicesTab';

const GuestPanel = () => {
  const { user, logout, updateUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showReportIssueForm, setShowReportIssueForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    roomType: '',
    roomNumber: '',
    roomId: '',
    roomPrice: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    specialRequests: '',
    paymentMethod: 'credit_card'
  });

  const [issueData, setIssueData] = useState({
    roomNumber: '',
    issueType: '',
    description: '',
    priority: 'medium',
    contactNumber: ''
  });

  // Payment methods
  const paymentMethods = [
    { value: 'credit_card', label: 'Credit Card', icon: '💳' },
    { value: 'debit_card', label: 'Debit Card', icon: '💳' },
    { value: 'paypal', label: 'PayPal', icon: '📱' },
    { value: 'cash', label: 'Cash (Pay at Hotel)', icon: '💰' },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
    { value: 'upi', label: 'UPI Payment', icon: '📲' }
  ];

  // Issue types
  const issueTypes = [
    'AC Not Working',
    'Heating Issue',
    'Electrical Problem',
    'Plumbing Issue',
    'TV/Entertainment',
    'WiFi Problem',
    'Furniture Damage',
    'Cleanliness Issue',
    'Noise Complaint',
    'Other'
  ];

  // Priority levels
  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-purple-100 text-purple-800' }
  ];

  // Load rooms from localStorage
  const [availableRooms, setAvailableRooms] = useState([]);

  // Check localStorage size
  const getLocalStorageSize = () => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  };

  // Clean up old data to free up space
  const cleanupOldData = () => {
    try {
      // Keep only recent bookings (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Clean old bookings for all users
      const allKeys = Object.keys(localStorage);
      const bookingKeys = allKeys.filter(key => key.startsWith('bookings_'));
      
      bookingKeys.forEach(key => {
        try {
          const userBookings = JSON.parse(localStorage.getItem(key) || '[]');
          const recentBookings = userBookings.filter(booking => 
            new Date(booking.bookingDate) >= thirtyDaysAgo
          );
          localStorage.setItem(key, JSON.stringify(recentBookings));
        } catch (error) {
          console.warn(`Error cleaning bookings for key ${key}:`, error);
        }
      });

      // Clean old notifications
      const notificationKeys = allKeys.filter(key => key.startsWith('notifications_'));
      notificationKeys.forEach(key => {
        try {
          const userNotifications = JSON.parse(localStorage.getItem(key) || '[]');
          const recentNotifications = userNotifications.filter(notif => 
            new Date(notif.createdAt) >= thirtyDaysAgo
          );
          localStorage.setItem(key, JSON.stringify(recentNotifications));
        } catch (error) {
          console.warn(`Error cleaning notifications for key ${key}:`, error);
        }
      });

      console.log('Storage cleanup completed. Current size:', getLocalStorageSize(), 'bytes');
    } catch (error) {
      console.error('Error during storage cleanup:', error);
    }
  };

  // Initialize default services if none exist
  useEffect(() => {
    const initializeDefaultServices = () => {
      const existingServices = JSON.parse(localStorage.getItem('hotelServices') || '[]');
      if (existingServices.length === 0) {
        const defaultServices = [
          { 
            id: '1', 
            name: 'Spa Treatment', 
            price: 80, 
            category: 'Wellness', 
            status: 'available',
            description: 'Relaxing spa treatment with professional massage therapists'
          },
        ];
        localStorage.setItem('hotelServices', JSON.stringify(defaultServices));
      }
    };

    initializeDefaultServices();
    
    // Clean up old data on component mount
    cleanupOldData();
  }, []);

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
      }
    };

    loadRooms();
    
    const handleStorageChange = () => {
      loadRooms();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Load user's bookings
  const loadUserBookings = () => {
    if (!user?.id) return [];
    try {
      return JSON.parse(localStorage.getItem(`bookings_${user.id}`) || '[]');
    } catch (error) {
      console.error('Error loading bookings:', error);
      return [];
    }
  };

  // Load user's notifications
  const loadUserNotifications = () => {
    if (!user?.id) return [];
    try {
      return JSON.parse(localStorage.getItem(`notifications_${user.id}`) || '[]');
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  };

  // Mark notification as read
  const markNotificationAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
    setNotifications(updatedNotifications);
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
  };

  // Save booking with better error handling
  const saveBooking = (booking) => {
    if (!user?.id) return false;
    try {
      const userBookings = loadUserBookings();
      const updatedBookings = [...userBookings, booking];
      
      // Check if we're approaching storage limit
      const dataSize = JSON.stringify(updatedBookings).length;
      if (dataSize > 1000000) { // 1MB warning
        console.warn('Bookings data getting large:', dataSize, 'bytes');
        // Auto-clean old bookings if data is getting too large
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentBookings = updatedBookings.filter(booking => 
          new Date(booking.bookingDate) >= thirtyDaysAgo
        );
        localStorage.setItem(`bookings_${user.id}`, JSON.stringify(recentBookings));
        console.log('Auto-cleaned old bookings to free up space');
        return true;
      }
      
      localStorage.setItem(`bookings_${user.id}`, JSON.stringify(updatedBookings));
      return true;
    } catch (error) {
      console.error('Error saving booking:', error);
      
      // If storage is full, try to clean up and retry
      if (error.name === 'QuotaExceededError') {
        console.log('Storage full, attempting cleanup...');
        cleanupOldData();
        
        // Try again after cleanup
        try {
          const userBookings = loadUserBookings();
          const updatedBookings = [...userBookings, booking];
          localStorage.setItem(`bookings_${user.id}`, JSON.stringify(updatedBookings));
          console.log('Booking saved successfully after cleanup');
          return true;
        } catch (retryError) {
          console.error('Failed to save booking even after cleanup:', retryError);
          return false;
        }
      }
      return false;
    }
  };

  // Save payment record
  const savePaymentRecord = (payment) => {
    try {
      const existingPayments = JSON.parse(localStorage.getItem('hotelPayments') || '[]');
      const updatedPayments = [...existingPayments, payment];
      localStorage.setItem('hotelPayments', JSON.stringify(updatedPayments));
      return true;
    } catch (error) {
      console.error('Error saving payment:', error);
      return false;
    }
  };

  // Save maintenance request
  const saveMaintenanceRequest = (request) => {
    try {
      const existingRequests = JSON.parse(localStorage.getItem('maintenanceRequests') || '[]');
      const updatedRequests = [...existingRequests, request];
      localStorage.setItem('maintenanceRequests', JSON.stringify(updatedRequests));
      return true;
    } catch (error) {
      console.error('Error saving maintenance request:', error);
      return false;
    }
  };

  // Update guest bookings in admin panel
  const updateGuestBookingsInAdminPanel = () => {
    try {
      const hotelGuests = JSON.parse(localStorage.getItem('hotelGuests') || '[]');
      const currentGuest = hotelGuests.find(guest => guest.id === user?.id);
      
      if (currentGuest) {
        const userBookings = loadUserBookings();
        const updatedGuest = {
          ...currentGuest,
          totalBookings: userBookings.length,
          lastVisit: new Date().toISOString().split('T')[0]
        };
        
        const updatedGuests = hotelGuests.map(guest => 
          guest.id === user?.id ? updatedGuest : guest
        );
        localStorage.setItem('hotelGuests', JSON.stringify(updatedGuests));
      }
    } catch (error) {
      console.error('Error updating guest bookings:', error);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    const userBookings = loadUserBookings();
    setBookings(userBookings);
    
    const userNotifications = loadUserNotifications();
    setNotifications(userNotifications);
    
    if (user?.id) {
      updateGuestBookingsInAdminPanel();
    }
  }, [user?.id]);

  // Booking functions
  const handleBookingChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    });
  };

  // Issue report functions
  const handleIssueChange = (e) => {
    setIssueData({
      ...issueData,
      [e.target.name]: e.target.value
    });
  };

  const handleMakeBooking = async (e) => {
    e.preventDefault();
    
    const selectedRoom = availableRooms.find(room => room.id === bookingData.roomId);
    const nights = Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24));
    const totalAmount = selectedRoom ? selectedRoom.price * nights : bookingData.roomPrice * nights;

    // Create payment record
    const paymentRecord = {
      id: `pay_${Date.now()}`,
      guestId: user.id,
      guestName: user.name || user.email,
      guestEmail: user.email,
      bookingId: `book_${Date.now()}`,
      amount: totalAmount,
      method: bookingData.paymentMethod,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      roomNumber: bookingData.roomNumber,
      roomType: bookingData.roomType,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      nights: nights
    };

    // Create booking record
    const newBooking = {
      id: paymentRecord.bookingId,
      roomType: bookingData.roomType,
      roomNumber: bookingData.roomNumber,
      roomId: bookingData.roomId,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guests: parseInt(bookingData.guests),
      specialRequests: bookingData.specialRequests,
      totalAmount: totalAmount,
      paymentMethod: bookingData.paymentMethod,
      paymentStatus: 'pending',
      status: 'pending',
      bookingDate: new Date().toISOString(),
      roomDetails: selectedRoom,
      nights: nights,
      paymentId: paymentRecord.id
    };

    // Save both booking and payment
    const bookingSuccess = saveBooking(newBooking);
    const paymentSuccess = savePaymentRecord(paymentRecord);
    
    if (bookingSuccess && paymentSuccess) {
      updateGuestBookingsInAdminPanel();
      const updatedBookings = loadUserBookings();
      setBookings(updatedBookings);
      
      // Reset form
      setBookingData({
        roomType: '',
        roomNumber: '',
        roomId: '',
        roomPrice: '',
        checkIn: '',
        checkOut: '',
        guests: 1,
        specialRequests: '',
        paymentMethod: 'credit_card'
      });
      setShowBookingForm(false);
      setActiveTab('bookings');
      
      alert('Booking request submitted! We will review and confirm soon. Payment status will be updated by admin.');
    } else {
      alert('Error submitting booking. Storage might be full. Please try clearing your browser data or contact support.');
    }
  };

  const handleReportIssue = async (e) => {
    e.preventDefault();

    // Get user's current room from confirmed bookings
    const userBookings = loadUserBookings();
    const currentBooking = userBookings.find(booking => 
      booking.status === 'confirmed' && 
      new Date(booking.checkOut) >= new Date()
    );

    if (!currentBooking && !issueData.roomNumber) {
      alert('Please select your room number or make sure you have a confirmed booking.');
      return;
    }

    const maintenanceRequest = {
      id: `maint_${Date.now()}`,
      guestId: user.id,
      guestName: user.name || user.email,
      guestEmail: user.email,
      room: issueData.roomNumber || currentBooking.roomNumber,
      issue: issueData.issueType,
      description: issueData.description,
      priority: issueData.priority,
      contactNumber: issueData.contactNumber || 'Not provided',
      status: 'pending',
      assignedTo: 'Maintenance Team',
      reportedAt: new Date().toLocaleString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const success = saveMaintenanceRequest(maintenanceRequest);
    
    if (success) {
      // Reset form
      setIssueData({
        roomNumber: '',
        issueType: '',
        description: '',
        priority: 'medium',
        contactNumber: ''
      });
      setShowReportIssueForm(false);
      
      alert('Maintenance request submitted successfully! Our team will address it soon.');
    } else {
      alert('Error submitting maintenance request. Please try again.');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (updatedUser) => {
    try {
      // Update the user context
      if (updateUser) {
        updateUser(updatedUser);
      }
      
      // Sync with MongoDB
      const response = await fetch(`/api/guests/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile in database');
      }

      console.log('Profile updated in MongoDB:', updatedUser);
    } catch (error) {
      console.error('Error updating profile in MongoDB:', error);
      // Continue with local storage update even if MongoDB fails
    }
  };

  // Clear all data function
  const handleClearData = () => {
    if (window.confirm('This will clear ALL your booking data. Are you sure?')) {
      localStorage.clear();
      alert('All data cleared! Please refresh the page.');
      window.location.reload();
    }
  };

  const stats = {
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
    totalSpent: bookings.filter(b => b.status === 'confirmed').reduce((sum, booking) => sum + (booking.totalAmount || 0), 0),
    unreadNotifications: notifications.filter(n => !n.read).length
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <WelcomeSection 
          user={user} 
          stats={stats} 
          onLogout={handleLogout} 
        />

        {/* Report Issue Button in Header */}
        <div className="flex justify-between items-center mb-6">
          <StatsGrid stats={stats} />
          <div className="flex space-x-3">
            <Button 
              onClick={() => setShowReportIssueForm(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              🛠️ Report Issue
            </Button>
            <Button 
              onClick={handleClearData}
              className="bg-red-600 hover:bg-red-700 text-xs"
              title="Clear all data if storage is full"
            >
              🗑️ Clear Data
            </Button>
          </div>
        </div>

        <NavigationTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadNotifications={stats.unreadNotifications}
        >
          <OverviewTab
            activeTab={activeTab}
            bookings={bookings}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
            getStatusColor={getStatusColor}
          />

          <BookingsTab
            activeTab={activeTab}
            bookings={bookings}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
            getStatusColor={getStatusColor}
          />

          <ServicesTab
            activeTab={activeTab}
            user={user}
            onLogout={handleLogout}
          />

          <NotificationsTab
            activeTab={activeTab}
            notifications={notifications}
            onMarkAsRead={markNotificationAsRead}
            onMarkAllAsRead={markAllNotificationsAsRead}
            onLogout={handleLogout}
            unreadNotifications={stats.unreadNotifications}
          />

          <RoomsTab
            activeTab={activeTab}
            availableRooms={availableRooms}
            setShowBookingForm={setShowBookingForm}
            setBookingData={setBookingData}
            onLogout={handleLogout}
          />

          <ProfileTab
            activeTab={activeTab}
            user={user}
            stats={stats}
            onLogout={handleLogout}
            onProfileUpdate={handleProfileUpdate}
          />
        </NavigationTabs>
      </div>

      {/* Fixed Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Book Room {bookingData.roomNumber}
                </h2>
                <button 
                  onClick={() => setShowBookingForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleMakeBooking} className="p-6 space-y-6">
              {/* Room Information Summary */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Room Details</h4>
                <div className="text-sm text-blue-700">
                  <p><strong>Room:</strong> {bookingData.roomType} (Room {bookingData.roomNumber})</p>
                  <p><strong>Price:</strong> ${bookingData.roomPrice}/night</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Guests
                  </label>
                  <select
                    name="guests"
                    value={bookingData.guests}
                    onChange={handleBookingChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[1, 2, 3, 4].map(num => (
                      <option key={num} value={num}>
                        {num} Guest{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    name="checkIn"
                    value={bookingData.checkIn}
                    onChange={handleBookingChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    name="checkOut"
                    value={bookingData.checkOut}
                    onChange={handleBookingChange}
                    required
                    min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    name="paymentMethod"
                    value={bookingData.paymentMethod}
                    onChange={handleBookingChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {paymentMethods.map(method => (
                      <option key={method.value} value={method.value}>
                        {method.icon} {method.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select your preferred payment method
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests
                </label>
                <textarea
                  name="specialRequests"
                  value={bookingData.specialRequests}
                  onChange={handleBookingChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any special requests or requirements..."
                />
              </div>

              {bookingData.checkIn && bookingData.checkOut && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Booking Summary</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Room:</strong> {bookingData.roomType} (Room {bookingData.roomNumber})</p>
                    <p><strong>Duration:</strong> {Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24))} nights</p>
                    <p><strong>Payment Method:</strong> {paymentMethods.find(m => m.value === bookingData.paymentMethod)?.icon} {paymentMethods.find(m => m.value === bookingData.paymentMethod)?.label}</p>
                    <p><strong>Total Amount:</strong> ${bookingData.roomPrice * Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24))}</p>
                  </div>
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Confirm Booking
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Report Issue Form Modal */}
      {showReportIssueForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Report Maintenance Issue
                </h2>
                <button 
                  onClick={() => setShowReportIssueForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleReportIssue} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    name="roomNumber"
                    value={issueData.roomNumber}
                    onChange={handleIssueChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your room number"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Please enter the room number where the issue is occurring
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Type *
                  </label>
                  <select
                    name="issueType"
                    value={issueData.issueType}
                    onChange={handleIssueChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Issue Type</option>
                    {issueTypes.map(issue => (
                      <option key={issue} value={issue}>{issue}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level *
                  </label>
                  <select
                    name="priority"
                    value={issueData.priority}
                    onChange={handleIssueChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {priorityLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label} Priority
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={issueData.contactNumber}
                    onChange={handleIssueChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your contact number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Description *
                </label>
                <textarea
                  name="description"
                  value={issueData.description}
                  onChange={handleIssueChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please describe the issue in detail..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Provide as much detail as possible to help us resolve the issue quickly
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Issue Summary</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  {issueData.roomNumber && <p><strong>Room:</strong> {issueData.roomNumber}</p>}
                  {issueData.issueType && <p><strong>Issue:</strong> {issueData.issueType}</p>}
                  {issueData.priority && (
                    <p>
                      <strong>Priority:</strong> 
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        priorityLevels.find(p => p.value === issueData.priority)?.color
                      }`}>
                        {priorityLevels.find(p => p.value === issueData.priority)?.label}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  🛠️ Submit Issue Report
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowReportIssueForm(false)}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GuestPanel;
