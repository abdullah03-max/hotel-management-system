import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const guestNavigation = [
    { name: 'Dashboard', href: '/guest/dashboard', icon: '🏠' },
    { name: 'My Bookings', href: '/guest/bookings', icon: '📅' },
    { name: 'Service Requests', href: '/guest/services', icon: '🛎️' },
    { name: 'Payments', href: '/guest/payments', icon: '💳' },
  ];

  const receptionistNavigation = [
    { name: 'Dashboard', href: '/receptionist/dashboard', icon: '🏠' },
    { name: 'Bookings', href: '/receptionist/bookings', icon: '📅' },
    { name: 'Guests', href: '/receptionist/guests', icon: '👥' },
    { name: 'Services', href: '/receptionist/services', icon: '🛎️' },
    { name: 'Payments', href: '/receptionist/payments', icon: '💳' },
  ];

  const adminNavigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: '🏠' },
    { name: 'Rooms', href: '/admin/rooms', icon: '🏨' },
    { name: 'Bookings', href: '/admin/bookings', icon: '📅' },
    { name: 'Staff', href: '/admin/staff', icon: '👥' },
    { name: 'Services', href: '/admin/services', icon: '🛎️' },
    { name: 'Reports', href: '/admin/reports', icon: '📊' },
  ];

  const getNavigation = () => {
    switch (user?.role) {
      case 'admin':
        return adminNavigation;
      case 'receptionist':
        return receptionistNavigation;
      case 'guest':
        return guestNavigation;
      default:
        return [];
    }
  };

  const navigation = getNavigation();

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
            H
          </div>
          <span className="text-xl font-bold text-gray-900">HotelMS</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={() => window.innerWidth < 1024 && onClose()}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-sm text-gray-500 capitalize">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="w-64 flex flex-col">
          {sidebarContent}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
              onClick={onClose}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;