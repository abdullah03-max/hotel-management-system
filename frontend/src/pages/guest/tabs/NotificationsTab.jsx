import React from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const NotificationsTab = ({ 
  activeTab, 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onLogout, 
  unreadNotifications 
}) => {
  if (activeTab !== 'notifications') return null;

  // Function to get notification icon based on type/status
  const getNotificationIcon = (notification) => {
    if (notification.type === 'booking_status') {
      switch (notification.status) {
        case 'confirmed': return '✅';
        case 'cancelled': return '❌';
        case 'pending': return '⏳';
        default: return '📢';
      }
    }
    return '🔔';
  };

  // Function to format notification time
  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInHours = Math.floor((now - notificationTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
      return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return notificationTime.toLocaleDateString();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Notifications</h3>
          <p className="text-gray-600 mt-1">
            {unreadNotifications > 0 
              ? `You have ${unreadNotifications} unread notification${unreadNotifications > 1 ? 's' : ''}`
              : 'All caught up! No new notifications'
            }
          </p>
        </div>
        <div className="flex space-x-3">
          {unreadNotifications > 0 && (
            <Button 
              onClick={onMarkAllAsRead}
              className="bg-blue-600 hover:bg-blue-700"
            >
              📪 Mark All Read
            </Button>
          )}
          <Button 
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700"
          >
            🚪 Logout
          </Button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Notifications</h3>
            <p className="text-gray-600">You don't have any notifications yet.</p>
            <p className="text-sm text-gray-500 mt-2">
              Notifications will appear here when your booking status changes.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`border-l-4 ${
                !notification.read 
                  ? 'bg-blue-50 border-blue-400 shadow-sm' 
                  : 'bg-white border-gray-200'
              } transition-all duration-200 hover:shadow-md`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">
                          {getNotificationIcon(notification)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-lg font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.message}
                        </p>
                        
                        {/* Show booking details if available */}
                        {notification.bookingId && (
                          <p className="text-sm text-gray-500 mt-1">
                            Booking ID: #{notification.bookingId}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 mt-2">
                          <p className="text-sm text-gray-500">
                            {formatNotificationTime(notification.timestamp)}
                          </p>
                          
                          {!notification.read && (
                            <button
                              onClick={() => onMarkAsRead(notification.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {!notification.read && (
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium ml-4 flex-shrink-0">
                      New
                    </span>
                  )}
                </div>
                
                {/* Action buttons for booking notifications */}
                {notification.type === 'booking_status' && notification.status === 'confirmed' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex space-x-3">
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-xs"
                        onClick={() => {
                          // Navigate to bookings tab or show booking details
                          console.log('View booking details:', notification.bookingId);
                        }}
                      >
                        📋 View Booking
                      </Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-xs"
                        onClick={() => {
                          // Navigate to services
                          console.log('Explore services');
                        }}
                      >
                        🛎️ Explore Services
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Notifications Stats */}
      {notifications.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Showing {notifications.length} notification{notifications.length > 1 ? 's' : ''} • 
            {' '}{unreadNotifications} unread
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsTab;
