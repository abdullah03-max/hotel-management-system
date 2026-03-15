import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading notifications data
    setTimeout(() => {
      setNotifications([
        { id: 1, type: 'alert', message: 'Room 201 requires maintenance', time: '2 hours ago', priority: 'high', read: false },
        { id: 2, type: 'info', message: 'New booking received from Jane Smith', time: '1 hour ago', priority: 'medium', read: false },
        { id: 3, type: 'warning', message: 'Low stock of shampoo bottles', time: '3 hours ago', priority: 'medium', read: false },
        { id: 4, type: 'success', message: 'Payment received from John Doe', time: '30 mins ago', priority: 'low', read: true },
        { id: 5, type: 'alert', message: 'System backup completed successfully', time: '5 hours ago', priority: 'low', read: true }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
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
          <h2 className="text-xl font-semibold text-gray-900">Notifications & Alerts</h2>
          <p className="text-gray-600 mt-1">View and manage system notifications</p>
        </div>
        <Button onClick={handleMarkAllAsRead}>
          Mark All as Read
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-l-4 border-l-blue-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Total Notifications</p>
            <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
          </div>
        </Card>
        <Card className="bg-white border-l-4 border-l-red-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Unread</p>
            <p className="text-2xl font-bold text-gray-900">
              {notifications.filter(notif => !notif.read).length}
            </p>
          </div>
        </Card>
        <Card className="bg-white border-l-4 border-l-yellow-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">High Priority</p>
            <p className="text-2xl font-bold text-gray-900">
              {notifications.filter(notif => notif.priority === 'high').length}
            </p>
          </div>
        </Card>
        <Card className="bg-white border-l-4 border-l-green-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Read</p>
            <p className="text-2xl font-bold text-gray-900">
              {notifications.filter(notif => notif.read).length}
            </p>
          </div>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Notifications</h3>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start justify-between p-4 rounded-lg border ${
                  !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`text-lg ${
                    notification.type === 'alert' ? 'text-red-500' :
                    notification.type === 'warning' ? 'text-yellow-500' :
                    notification.type === 'success' ? 'text-green-500' :
                    'text-blue-500'
                  }`}>
                    {notification.type === 'alert' ? '🚨' :
                     notification.type === 'warning' ? '⚠️' :
                     notification.type === 'success' ? '✅' : 'ℹ️'}
                  </div>
                  <div>
                    <p className={`font-medium ${
                      !notification.read ? 'text-gray-900' : 'text-gray-600'
                    }`}>
                      {notification.message}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{notification.time}</p>
                    <span className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full ${
                      notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                      notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {notification.priority} priority
                    </span>
                  </div>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default Notifications;
