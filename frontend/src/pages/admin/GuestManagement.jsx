import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const GuestManagement = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [profilePictures, setProfilePictures] = useState({});

  useEffect(() => {
    loadGuestsData();
    
    // Listen for storage changes instead of auto-refresh
    const handleStorageChange = () => {
      console.log('🔄 Storage changed, reloading guests data');
      loadGuestsData();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadGuestsData = () => {
    try {
      setLoading(true);
      console.log('🔄 Loading guests data...');
      
      // Load from hotelGuests (primary source for admin panel)
      let guestData = JSON.parse(localStorage.getItem('hotelGuests') || '[]');
      
      console.log('📊 Loaded guests from hotelGuests:', guestData.length);
      
      // Calculate real-time bookings from localStorage for each guest
      guestData = guestData.map(guest => {
        try {
          // Get actual bookings count from user's bookings storage
          const userBookings = JSON.parse(localStorage.getItem(`bookings_${guest.id}`) || '[]');
          return {
            ...guest,
            totalBookings: userBookings.length,
            // Update last visit if there are bookings
            lastVisit: userBookings.length > 0 
              ? userBookings[userBookings.length - 1]?.checkIn || guest.lastVisit
              : guest.lastVisit
          };
        } catch (error) {
          return guest;
        }
      });
      
      setGuests(guestData);
      
      // Load profile pictures from localStorage for all guests
      loadProfilePictures(guestData);
      
      setLoading(false);
      console.log('✅ Guests data loaded successfully');
      
    } catch (error) {
      console.error('❌ Error loading guest data:', error);
      setLoading(false);
    }
  };

  const loadProfilePictures = (guestData) => {
    const pictures = {};
    
    guestData.forEach(guest => {
      try {
        const savedPicture = localStorage.getItem(`profile_picture_${guest.id}`);
        if (savedPicture) {
          pictures[guest.id] = savedPicture;
          console.log(`✅ Loaded profile picture for guest ${guest.id}`);
        } else {
          console.log(`❌ No profile picture found for guest ${guest.id}`);
        }
      } catch (error) {
        console.error(`Error loading profile picture for guest ${guest.id}:`, error);
      }
    });
    
    setProfilePictures(pictures);
    console.log('✅ All profile pictures loaded');
  };

  // View Guest Details
  const handleViewGuest = (guest) => {
    setSelectedGuest(guest);
    setShowViewModal(true);
  };

  // Edit Guest (Only basic info - NOT bookings)
  const handleEditGuest = (guest) => {
    setSelectedGuest(guest);
    setEditFormData({
      name: guest.name,
      email: guest.email,
      phone: guest.phone,
      address: guest.address,
      city: guest.city,
      country: guest.country,
      dateOfBirth: guest.dateOfBirth,
      status: guest.status,
      loyaltyStatus: guest.loyaltyStatus || 'member'
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateGuest = () => {
    try {
      // Update in localStorage
      const updatedGuests = guests.map(guest => 
        guest.id === selectedGuest.id 
          ? { 
              ...guest, 
              name: editFormData.name,
              email: editFormData.email,
              phone: editFormData.phone,
              address: editFormData.address,
              city: editFormData.city,
              country: editFormData.country,
              dateOfBirth: editFormData.dateOfBirth,
              status: editFormData.status,
              loyaltyStatus: editFormData.loyaltyStatus
            }
          : guest
      );
      
      setGuests(updatedGuests);
      localStorage.setItem('hotelGuests', JSON.stringify(updatedGuests));
      
      // Also update in registeredUsers
      updateGuestInRegisteredUsers(selectedGuest.id, editFormData);
      
      setShowEditModal(false);
      setSelectedGuest(null);
      
      // Trigger storage event to notify other components
      window.dispatchEvent(new Event('storage'));
      
      alert('Guest information updated successfully!');
    } catch (error) {
      console.error('Error updating guest:', error);
      alert('Error updating guest information. Please try again.');
    }
  };

  // Update guest in registeredUsers
  const updateGuestInRegisteredUsers = (guestId, updatedData) => {
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const updatedUsers = registeredUsers.map(user => 
        user.id === guestId 
          ? { 
              ...user, 
              name: updatedData.name,
              email: updatedData.email,
              phone: updatedData.phone,
              address: updatedData.address,
              city: updatedData.city,
              country: updatedData.country,
              dateOfBirth: updatedData.dateOfBirth,
              status: updatedData.status,
              loyaltyStatus: updatedData.loyaltyStatus
            }
          : user
      );
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    } catch (error) {
      console.error('Error updating guest in registeredUsers:', error);
    }
  };

  // Delete Guest
  const handleDeleteGuest = (guest) => {
    setSelectedGuest(guest);
    setShowDeleteModal(true);
  };

  const confirmDeleteGuest = () => {
    try {
      // Remove from hotelGuests
      const updatedGuests = guests.filter(guest => guest.id !== selectedGuest.id);
      setGuests(updatedGuests);
      localStorage.setItem('hotelGuests', JSON.stringify(updatedGuests));
      
      // Also remove from registeredUsers to disable login
      removeGuestFromRegisteredUsers(selectedGuest.id);
      
      // Also remove guest's bookings
      removeGuestBookings(selectedGuest.id);
      
      // Remove profile picture from localStorage
      localStorage.removeItem(`profile_picture_${selectedGuest.id}`);
      
      setShowDeleteModal(false);
      setSelectedGuest(null);
      
      // Trigger storage event
      window.dispatchEvent(new Event('storage'));
      
      alert('Guest deleted successfully!');
    } catch (error) {
      console.error('Error deleting guest:', error);
      alert('Error deleting guest. Please try again.');
    }
  };

  // Remove guest from registeredUsers
  const removeGuestFromRegisteredUsers = (guestId) => {
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const updatedUsers = registeredUsers.filter(user => user.id !== guestId);
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    } catch (error) {
      console.error('Error removing guest from registeredUsers:', error);
    }
  };

  // Remove guest's bookings
  const removeGuestBookings = (guestId) => {
    try {
      localStorage.removeItem(`bookings_${guestId}`);
    } catch (error) {
      console.error('Error removing guest bookings:', error);
    }
  };

  // Add New Guest
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGuestData, setNewGuestData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    dateOfBirth: '',
    status: 'active',
    loyaltyStatus: 'member'
  });

  const handleAddGuest = () => {
    setNewGuestData({
      name: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      dateOfBirth: '',
      status: 'active',
      loyaltyStatus: 'member'
    });
    setShowAddModal(true);
  };

  const handleAddChange = (e) => {
    setNewGuestData({
      ...newGuestData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateGuest = () => {
    if (!newGuestData.name || !newGuestData.email || !newGuestData.password) {
      alert('Please fill all required fields: Name, Email, and Password');
      return;
    }

    if (newGuestData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    // Check if email already exists
    const emailExists = guests.some(guest => guest.email === newGuestData.email);
    if (emailExists) {
      alert('A guest with this email already exists!');
      return;
    }

    const guestId = Date.now();
    const newGuest = {
      id: guestId,
      name: newGuestData.name,
      email: newGuestData.email,
      phone: newGuestData.phone || '',
      address: newGuestData.address || '',
      city: newGuestData.city || '',
      country: newGuestData.country || '',
      dateOfBirth: newGuestData.dateOfBirth || '',
      totalBookings: 0,
      lastVisit: new Date().toISOString().split('T')[0],
      status: newGuestData.status,
      loyaltyStatus: newGuestData.loyaltyStatus,
      registrationDate: new Date().toISOString()
    };

    try {
      // Add to hotelGuests (for admin panel)
      const updatedGuests = [...guests, newGuest];
      setGuests(updatedGuests);
      localStorage.setItem('hotelGuests', JSON.stringify(updatedGuests));

      // Also add to registeredUsers (for login)
      addGuestToRegisteredUsers(guestId, newGuestData);

      setShowAddModal(false);
      
      // Trigger storage event
      window.dispatchEvent(new Event('storage'));
      
      alert('New guest added successfully! They can now login with their email and password.');
    } catch (error) {
      console.error('Error creating guest:', error);
      alert('Error creating guest. Please try again.');
    }
  };

  // Add guest to registeredUsers for login
  const addGuestToRegisteredUsers = (guestId, guestData) => {
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      const newUser = {
        id: guestId,
        name: guestData.name,
        email: guestData.email,
        password: guestData.password,
        role: 'guest',
        phone: guestData.phone || '',
        address: guestData.address || '',
        city: guestData.city || '',
        country: guestData.country || '',
        dateOfBirth: guestData.dateOfBirth || '',
        totalBookings: 0,
        lastVisit: new Date().toISOString().split('T')[0],
        status: guestData.status || 'active',
        loyaltyStatus: guestData.loyaltyStatus || 'member',
        createdAt: new Date().toISOString()
      };

      registeredUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
      
      // Initialize empty bookings for new guest
      localStorage.setItem(`bookings_${guestId}`, JSON.stringify([]));
      
    } catch (error) {
      console.error('Error adding guest to registeredUsers:', error);
    }
  };

  const refreshGuests = () => {
    console.log('🔄 Manual refresh triggered');
    loadGuestsData();
  };

  // ✅ Function to view guest's actual bookings (READ ONLY)
  const viewGuestBookings = (guest) => {
    try {
      const guestBookings = JSON.parse(localStorage.getItem(`bookings_${guest.id}`) || '[]');
      
      if (guestBookings.length === 0) {
        alert(`${guest.name} has no bookings yet.`);
      } else {
        const bookingsInfo = guestBookings.map((booking, index) => 
          `\n${index + 1}. ${booking.roomType} - ${new Date(booking.checkIn).toLocaleDateString()} to ${new Date(booking.checkOut).toLocaleDateString()} - $${booking.totalAmount}`
        ).join('');
        
        alert(`📅 ${guest.name}'s Bookings (${guestBookings.length} total):${bookingsInfo}`);
      }
    } catch (error) {
      alert('Error loading guest bookings.');
    }
  };

  const getLoyaltyStatusColor = (status) => {
    switch (status) {
      case 'platinum': return 'bg-purple-100 text-purple-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'member': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLoyaltyStatusEmoji = (status) => {
    switch (status) {
      case 'platinum': return '🏆';
      case 'gold': return '⭐';
      case 'silver': return '🔹';
      case 'member': return '👤';
      default: return '👤';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading guest data...</p>
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
          <h2 className="text-xl font-semibold text-gray-900">Guest Management</h2>
          <p className="text-gray-600 mt-1">Manage hotel guests and their information</p>
          <p className="text-sm text-green-600 mt-1">
            ✅ Total Guests: {guests.length} | 
            📊 Total Bookings: {guests.reduce((total, guest) => total + (guest.totalBookings || 0), 0)} |
            🟢 Active: {guests.filter(g => g.status === 'active').length} | 
            💜 VIP: {guests.filter(g => g.status === 'vip').length}
          </p>
          <p className="text-xs text-orange-600 mt-1">
            ⚠️ Note: Bookings are managed by guests only. Admin can view but not modify bookings.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={refreshGuests}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            ↻ Refresh
          </Button>
          <Button 
            onClick={handleAddGuest}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <span className="mr-2">+</span> Add Guest
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-l-4 border-l-blue-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Total Guests</p>
            <p className="text-2xl font-bold text-gray-900">{guests.length}</p>
          </div>
        </Card>
        <Card className="bg-white border-l-4 border-l-green-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">VIP Guests</p>
            <p className="text-2xl font-bold text-gray-900">
              {guests.filter(g => g.status === 'vip').length}
            </p>
          </div>
        </Card>
        <Card className="bg-white border-l-4 border-l-purple-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Active Guests</p>
            <p className="text-2xl font-bold text-gray-900">
              {guests.filter(g => g.status === 'active').length}
            </p>
          </div>
        </Card>
        <Card className="bg-white border-l-4 border-l-orange-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Total Bookings</p>
            <p className="text-2xl font-bold text-gray-900">
              {guests.reduce((total, guest) => total + (guest.totalBookings || 0), 0)}
            </p>
          </div>
        </Card>
      </div>

      {/* Guests Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Bookings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loyalty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {guests.map((guest) => (
                <tr key={guest.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden">
                      {profilePictures[guest.id] ? (
                        <img 
                          src={profilePictures[guest.id]} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('❌ Error loading profile image for guest:', guest.id);
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span>{guest.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{guest.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                    <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                      guest.status === 'vip' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {guest.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{guest.email}</div>
                    <div className="text-sm text-gray-500">{guest.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-medium text-gray-900">{guest.totalBookings}</div>
                      {guest.totalBookings > 0 && (
                        <button 
                          onClick={() => viewGuestBookings(guest)}
                          className="text-blue-600 hover:text-blue-900 text-xs bg-blue-50 px-2 py-1 rounded"
                          title="View bookings"
                        >
                          👁️ View
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">Last: {guest.lastVisit}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLoyaltyStatusColor(guest.loyaltyStatus)}`}>
                      {getLoyaltyStatusEmoji(guest.loyaltyStatus)} {guest.loyaltyStatus?.toUpperCase() || 'MEMBER'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleViewGuest(guest)}
                      className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                    >
                      👁️ View
                    </button>
                    <button 
                      onClick={() => handleEditGuest(guest)}
                      className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-lg transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteGuest(guest)}
                      className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-lg transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {guests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏨</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Guests Found</h3>
            <p className="text-gray-600 mb-6">Start by adding your first guest!</p>
            <Button 
              onClick={handleAddGuest}
              className="bg-blue-600 hover:bg-blue-700"
            >
              + Add First Guest
            </Button>
          </div>
        )}
      </Card>

      {/* View Guest Modal */}
      {showViewModal && selectedGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Guest Details</h2>
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden border-4 border-white shadow-lg">
                  {profilePictures[selectedGuest.id] ? (
                    <img 
                      src={profilePictures[selectedGuest.id]} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('❌ Error loading profile image in modal for guest:', selectedGuest.id);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span>{selectedGuest.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedGuest.name}</h3>
                  <p className="text-gray-600">{selectedGuest.email}</p>
                  <div className="flex space-x-2 mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedGuest.status === 'vip' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedGuest.status.toUpperCase()}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLoyaltyStatusColor(selectedGuest.loyaltyStatus)}`}>
                      {getLoyaltyStatusEmoji(selectedGuest.loyaltyStatus)} {selectedGuest.loyaltyStatus?.toUpperCase() || 'MEMBER'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Guest ID</p>
                      <p className="font-medium">#{selectedGuest.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-medium">{selectedGuest.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedGuest.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{selectedGuest.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-medium">
                        {selectedGuest.dateOfBirth ? new Date(selectedGuest.dateOfBirth).toLocaleDateString() : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedGuest.status === 'vip' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {selectedGuest.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Loyalty Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLoyaltyStatusColor(selectedGuest.loyaltyStatus)}`}>
                        {getLoyaltyStatusEmoji(selectedGuest.loyaltyStatus)} {selectedGuest.loyaltyStatus?.toUpperCase() || 'MEMBER'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Bookings</p>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{selectedGuest.totalBookings} bookings</p>
                        {selectedGuest.totalBookings > 0 && (
                          <button 
                            onClick={() => {
                              setShowViewModal(false);
                              viewGuestBookings(selectedGuest);
                            }}
                            className="text-blue-600 hover:text-blue-900 text-xs bg-blue-50 px-2 py-1 rounded"
                          >
                            View All
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Visit</p>
                      <p className="font-medium">{selectedGuest.lastVisit}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Registration Date</p>
                      <p className="font-medium">
                        {selectedGuest.registrationDate ? new Date(selectedGuest.registrationDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-gray-700">
                    <strong>Address:</strong> {selectedGuest.address || 'Not provided'}
                  </p>
                  <p className="text-gray-700">
                    <strong>City:</strong> {selectedGuest.city || 'Not provided'}
                  </p>
                  <p className="text-gray-700">
                    <strong>Country:</strong> {selectedGuest.country || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-yellow-700 text-sm">
                  ⚠️ <strong>Admin Note:</strong> Bookings are managed by guests only. 
                  You can view booking details but cannot modify them.
                </p>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditGuest(selectedGuest);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  ✏️ Edit Guest Info
                </Button>
                <Button
                  onClick={() => setShowViewModal(false)}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Guest Modal */}
      {showEditModal && selectedGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Edit Guest</h2>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={editFormData.dateOfBirth}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="vip">VIP</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loyalty Status
                  </label>
                  <select
                    name="loyaltyStatus"
                    value={editFormData.loyaltyStatus}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="member">👤 Member</option>
                    <option value="silver">🔹 Silver</option>
                    <option value="gold">⭐ Gold</option>
                    <option value="platinum">🏆 Platinum</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={editFormData.city}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={editFormData.country}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-yellow-700 text-sm">
                  💡 <strong>Note:</strong> You can only edit guest information. 
                  Bookings are managed by guests and will be automatically calculated.
                </p>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  onClick={handleUpdateGuest}
                  className="bg-green-600 hover:bg-green-700"
                >
                  💾 Update Guest
                </Button>
                <Button
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full"
          >
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Confirm Delete</h2>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete guest <strong>{selectedGuest.name}</strong>?
              </p>
              <p className="text-red-600 text-sm mb-6">
                ⚠️ This will permanently remove:
                <br/>• Guest information
                <br/>• All their bookings ({selectedGuest.totalBookings} bookings)
                <br/>• Login credentials
              </p>

              <div className="flex space-x-4">
                <Button
                  onClick={confirmDeleteGuest}
                  className="bg-red-600 hover:bg-red-700"
                >
                  🗑️ Delete Guest
                </Button>
                <Button
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Add New Guest</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newGuestData.name}
                    onChange={handleAddChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newGuestData.email}
                    onChange={handleAddChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={newGuestData.password}
                    onChange={handleAddChange}
                    required
                    minLength="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="At least 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={newGuestData.phone}
                    onChange={handleAddChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={newGuestData.dateOfBirth}
                    onChange={handleAddChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={newGuestData.status}
                    onChange={handleAddChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loyalty Status
                  </label>
                  <select
                    name="loyaltyStatus"
                    value={newGuestData.loyaltyStatus}
                    onChange={handleAddChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="member">👤 Member</option>
                    <option value="silver">🔹 Silver</option>
                    <option value="gold">⭐ Gold</option>
                    <option value="platinum">🏆 Platinum</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={newGuestData.address}
                  onChange={handleAddChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={newGuestData.city}
                    onChange={handleAddChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={newGuestData.country}
                    onChange={handleAddChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-700 text-sm">
                  ✅ This guest will be able to login immediately using their email and password.
                  They will start with 0 bookings and can create bookings from their guest panel.
                </p>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  onClick={handleCreateGuest}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!newGuestData.name || !newGuestData.email || !newGuestData.password}
                >
                  ➕ Create Guest
                </Button>
                <Button
                  onClick={() => setShowAddModal(false)}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default GuestManagement;