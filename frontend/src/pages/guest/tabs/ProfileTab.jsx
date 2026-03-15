import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const ProfileTab = ({ activeTab, user, stats, onLogout, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    dateOfBirth: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || '',
        dateOfBirth: user.dateOfBirth || ''
      });
      
      // Load profile picture from localStorage
      loadProfilePicture();
    }
  }, [user]);

  const loadProfilePicture = () => {
    try {
      // Try localStorage first
      const savedPicture = localStorage.getItem(`profile_picture_${user.id}`);
      if (savedPicture) {
        setPreviewImage(savedPicture);
        console.log('✅ Profile picture loaded from localStorage');
      } else {
        console.log('❌ No profile picture found in localStorage');
      }
    } catch (error) {
      console.error('Error loading profile picture:', error);
    }
  };

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, GIF)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size should be less than 5MB');
        return;
      }

      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
        console.log('✅ Profile picture preview created');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      console.log('💾 Starting profile save process...');
      
      // Save profile picture first
      if (profilePicture) {
        console.log('📸 Saving profile picture...');
        const reader = new FileReader();
        reader.onload = async (e) => {
          const imageData = e.target.result;
          
          // Save to localStorage
          localStorage.setItem(`profile_picture_${user.id}`, imageData);
          console.log('✅ Profile picture saved to localStorage');
          
          // Also save to all user data stores for consistency
          updateProfilePictureInAllStores(imageData);
          
          // Continue with profile data update
          updateProfileData();
        };
        reader.readAsDataURL(profilePicture);
      } else {
        // Just update profile data without picture
        updateProfileData();
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      alert('Error updating profile. Please try again.');
      setIsLoading(false);
    }
  };

  const updateProfilePictureInAllStores = (imageData) => {
    try {
      // Update in hotelUsers
      const users = JSON.parse(localStorage.getItem('hotelUsers') || '[]');
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, profilePicture: imageData } : u
      );
      localStorage.setItem('hotelUsers', JSON.stringify(updatedUsers));

      // Update in registeredUsers
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const updatedRegisteredUsers = registeredUsers.map(u => 
        u.id === user.id ? { ...u, profilePicture: imageData } : u
      );
      localStorage.setItem('registeredUsers', JSON.stringify(updatedRegisteredUsers));

      // Update in hotelGuests (for admin panel)
      const hotelGuests = JSON.parse(localStorage.getItem('hotelGuests') || '[]');
      const updatedGuests = hotelGuests.map(guest =>
        guest.id === user.id ? { ...guest, profilePicture: imageData } : guest
      );
      localStorage.setItem('hotelGuests', JSON.stringify(updatedGuests));

      console.log('✅ Profile picture updated in all data stores');
    } catch (error) {
      console.error('Error updating profile picture in stores:', error);
    }
  };

  const updateProfileData = () => {
    try {
      console.log('📝 Updating profile data...');
      
      // Update user data in localStorage (hotelUsers)
      const users = JSON.parse(localStorage.getItem('hotelUsers') || '[]');
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, ...profileData } : u
      );
      localStorage.setItem('hotelUsers', JSON.stringify(updatedUsers));

      // Update user data in registeredUsers (for login)
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const updatedRegisteredUsers = registeredUsers.map(u => 
        u.id === user.id ? { ...u, ...profileData } : u
      );
      localStorage.setItem('registeredUsers', JSON.stringify(updatedRegisteredUsers));

      // Update guest data in hotelGuests (for admin panel)
      const hotelGuests = JSON.parse(localStorage.getItem('hotelGuests') || '[]');
      const updatedGuests = hotelGuests.map(guest =>
        guest.id === user.id ? { ...guest, ...profileData } : guest
      );
      localStorage.setItem('hotelGuests', JSON.stringify(updatedGuests));

      console.log('✅ Profile data updated in all stores');

      // Call parent callback to update user context
      if (onProfileUpdate) {
        const updatedUser = { ...user, ...profileData };
        if (previewImage) {
          updatedUser.profilePicture = previewImage;
        }
        onProfileUpdate(updatedUser);
        console.log('✅ User context updated');
      }

      setIsEditing(false);
      setIsLoading(false);
      alert('Profile updated successfully!');
      
      // Force refresh to ensure all components get updated data
      setTimeout(() => {
        window.dispatchEvent(new Event('storage'));
      }, 100);
      
    } catch (error) {
      console.error('❌ Error updating profile data:', error);
      alert('Error updating profile. Please try again.');
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      country: user.country || '',
      dateOfBirth: user.dateOfBirth || ''
    });
    setIsEditing(false);
  };

  const removeProfilePicture = () => {
    try {
      setProfilePicture(null);
      setPreviewImage('');
      
      // Remove from localStorage
      localStorage.removeItem(`profile_picture_${user.id}`);
      
      // Remove from all user data stores
      removeProfilePictureFromAllStores();
      
      // Update user context
      if (onProfileUpdate) {
        const updatedUser = { ...user };
        delete updatedUser.profilePicture;
        onProfileUpdate(updatedUser);
      }
      
      alert('Profile picture removed successfully!');
      
      // Force refresh
      setTimeout(() => {
        window.dispatchEvent(new Event('storage'));
      }, 100);
      
    } catch (error) {
      console.error('Error removing profile picture:', error);
      alert('Error removing profile picture. Please try again.');
    }
  };

  const removeProfilePictureFromAllStores = () => {
    try {
      // Remove from hotelUsers
      const users = JSON.parse(localStorage.getItem('hotelUsers') || '[]');
      const updatedUsers = users.map(u => {
        if (u.id === user.id) {
          const { profilePicture, ...rest } = u;
          return rest;
        }
        return u;
      });
      localStorage.setItem('hotelUsers', JSON.stringify(updatedUsers));

      // Remove from registeredUsers
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const updatedRegisteredUsers = registeredUsers.map(u => {
        if (u.id === user.id) {
          const { profilePicture, ...rest } = u;
          return rest;
        }
        return u;
      });
      localStorage.setItem('registeredUsers', JSON.stringify(updatedRegisteredUsers));

      // Remove from hotelGuests
      const hotelGuests = JSON.parse(localStorage.getItem('hotelGuests') || '[]');
      const updatedGuests = hotelGuests.map(guest => {
        if (guest.id === user.id) {
          const { profilePicture, ...rest } = guest;
          return rest;
        }
        return guest;
      });
      localStorage.setItem('hotelGuests', JSON.stringify(updatedGuests));

      console.log('✅ Profile picture removed from all data stores');
    } catch (error) {
      console.error('Error removing profile picture from stores:', error);
    }
  };

  if (activeTab !== 'profile') return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">My Profile</h3>
        <div className="flex space-x-3">
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              ✏️ Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button 
                onClick={handleSaveProfile}
                className="bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? '💾 Saving...' : '💾 Save Changes'}
              </Button>
              <Button 
                onClick={handleCancelEdit}
                className="bg-gray-600 hover:bg-gray-700"
                disabled={isLoading}
              >
                ❌ Cancel
              </Button>
            </div>
          )}
          <Button 
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700"
          >
            🚪 Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture Section */}
        <Card>
          <div className="p-6">
            <h4 className="font-semibold text-gray-900 mb-4 text-center">Profile Picture</h4>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold overflow-hidden border-4 border-white shadow-lg">
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('❌ Error loading profile image');
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                    📷
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePictureChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              {isEditing && (
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    {previewImage ? 'Change picture' : 'Add profile picture'}
                  </p>
                  {previewImage && (
                    <Button 
                      onClick={removeProfilePicture}
                      className="bg-red-600 hover:bg-red-700 text-xs"
                      disabled={isLoading}
                    >
                      Remove Picture
                    </Button>
                  )}
                  <p className="text-xs text-gray-500">
                    JPG, PNG, GIF • Max 5MB
                  </p>
                  <p className="text-xs text-blue-500">
                    Optional - Your picture will show in the welcome section
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                        required
                        readOnly
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your phone number"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={profileData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={profileData.address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your address"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={profileData.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your city"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={profileData.country}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your country"
                        disabled={isLoading}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-medium">{user?.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{user?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-medium">
                        {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">{user?.address || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">City</p>
                      <p className="font-medium">{user?.city || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Country</p>
                      <p className="font-medium">{user?.country || 'Not provided'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Account Information */}
          <Card>
            <div className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Account Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="font-medium">{stats.totalBookings}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Confirmed Bookings</p>
                  <p className="font-medium text-green-600">{stats.confirmedBookings}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Loyalty Status</p>
                  <p className="font-medium text-yellow-600">
                    {stats.totalBookings >= 10 ? '🏆 Platinum' : 
                     stats.totalBookings >= 5 ? '⭐ Gold' : 
                     stats.totalBookings >= 2 ? '🔹 Silver' : '👤 Member'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="font-medium text-green-600">${stats.totalSpent}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Visit</p>
                  <p className="font-medium">
                    {user?.lastVisit ? new Date(user.lastVisit).toLocaleDateString() : 'Today'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
