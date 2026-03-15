import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io('https://hotel-management-system-production-9e00.up.railway.app', {
        transports: ['websocket'],
        auth: {
          userId: user.id,
          role: user.role
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server with ID:', newSocket.id);
        
        // Join user-specific room
        newSocket.emit('join-room', `user-${user.id}`);
        
        // Join role-specific room
        newSocket.emit('join-room', `role-${user.role}`);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      // Listen for notifications
      newSocket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show browser notification if permitted
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/hotel-icon.png'
          });
        }
      });

      // Listen for room updates
      newSocket.on('room-updated', (room) => {
        console.log('Room updated:', room);
        // You can dispatch to Redux store or update context here
      });

      // Listen for booking updates
      newSocket.on('booking-updated', (booking) => {
        console.log('Booking updated:', booking);
        if (booking.guest === user.id) {
          setNotifications(prev => [{
            id: Date.now(),
            title: 'Booking Update',
            message: `Your booking #${booking.bookingId} has been updated`,
            type: 'booking',
            timestamp: new Date()
          }, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      });

      // Listen for service request updates
      newSocket.on('service-request-updated', (service) => {
        console.log('Service request updated:', service);
        if (service.guest === user.id) {
          setNotifications(prev => [{
            id: Date.now(),
            title: 'Service Update',
            message: `Your ${service.serviceType} request has been updated to ${service.status}`,
            type: 'service',
            timestamp: new Date()
          }, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [isAuthenticated, user]);

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const value = {
    socket,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    requestNotificationPermission
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
