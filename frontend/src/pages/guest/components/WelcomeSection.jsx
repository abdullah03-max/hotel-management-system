import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const WelcomeSection = ({ user, stats, onLogout }) => {
  const [profilePicture, setProfilePicture] = useState('');

  // Load profile picture from localStorage
  useEffect(() => {
    if (user?.id) {
      loadProfilePicture();
    }
  }, [user]);

  // Also listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      loadProfilePicture();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  const loadProfilePicture = () => {
    try {
      console.log('🔄 Loading profile picture for user:', user.id);
      const savedPicture = localStorage.getItem(`profile_picture_${user.id}`);
      if (savedPicture) {
        setProfilePicture(savedPicture);
        console.log('✅ Profile picture loaded in WelcomeSection');
      } else {
        console.log('❌ No profile picture found for WelcomeSection');
        setProfilePicture('');
      }
    } catch (error) {
      console.error('Error loading profile picture in WelcomeSection:', error);
      setProfilePicture('');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getLoyaltyStatus = () => {
    if (stats.totalBookings >= 10) return { level: 'Platinum', emoji: '🏆', color: 'from-purple-600 to-pink-600' };
    if (stats.totalBookings >= 5) return { level: 'Gold', emoji: '⭐', color: 'from-yellow-500 to-orange-500' };
    if (stats.totalBookings >= 2) return { level: 'Silver', emoji: '🔹', color: 'from-gray-400 to-gray-600' };
    return { level: 'Member', emoji: '👤', color: 'from-blue-600 to-purple-700' };
  };

  const loyaltyStatus = getLoyaltyStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <Card className={`bg-gradient-to-r ${loyaltyStatus.color} text-white`}>
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold overflow-hidden border-2 border-white/30 shadow-lg">
                  {profilePicture ? (
                    <img 
                      src={profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('❌ Error loading profile image in WelcomeSection');
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white text-blue-600 rounded-full p-1 text-xs font-bold">
                  {loyaltyStatus.emoji}
                </div>
              </div>

              {/* Welcome Text */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1">
                  {getGreeting()}, {user?.name}!
                </h1>
                <p className="text-white/90 text-sm md:text-base">
                  {loyaltyStatus.emoji} {loyaltyStatus.level} Member • 🏨 Luxury Stay
                </p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs md:text-sm">
                  <span className="bg-white/20 px-2 py-1 rounded-full">
                    📊 {stats.totalBookings} Bookings
                  </span>
                  <span className="bg-white/20 px-2 py-1 rounded-full">
                    ✅ {stats.confirmedBookings} Confirmed
                  </span>
                  {stats.unreadNotifications > 0 && (
                    <span className="bg-red-500 px-2 py-1 rounded-full">
                      🔔 {stats.unreadNotifications} New
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats and Actions */}
            <div className="flex items-center space-x-3">
              {/* Quick Stats */}
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <div className="text-center">
                  <div className="text-white/80">Total Spent</div>
                  <div className="font-bold text-lg">${stats.totalSpent}</div>
                </div>
                <div className="h-8 w-px bg-white/30"></div>
                <div className="text-center">
                  <div className="text-white/80">Member Since</div>
                  <div className="font-bold">
                    {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
                  </div>
                </div>
              </div>

              {/* Notification Badge and Logout */}
              <div className="flex items-center space-x-2">
                {stats.unreadNotifications > 0 && (
                  <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                    {stats.unreadNotifications}
                  </div>
                )}
                <Button 
                  onClick={onLogout}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
                >
                  🚪 Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Progress Bar for Next Level */}
          {stats.totalBookings < 10 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-white/80 mb-1">
                <span>Progress to {stats.totalBookings >= 5 ? 'Platinum' : stats.totalBookings >= 2 ? 'Gold' : 'Silver'}</span>
                <span>{stats.totalBookings}/{stats.totalBookings >= 5 ? 10 : stats.totalBookings >= 2 ? 5 : 2}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ 
                    width: `${(stats.totalBookings / (stats.totalBookings >= 5 ? 10 : stats.totalBookings >= 2 ? 5 : 2)) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default WelcomeSection;