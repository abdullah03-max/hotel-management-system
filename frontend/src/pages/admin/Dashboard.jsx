import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';

// Import section components - CORRECTED IMPORT PATHS
import Overview from './Overview';
import StaffManagement from './StaffManagement';
import GuestManagement from './GuestManagement';
import RoomManagement from './RoomManagement';
import BookingManagement from './BookingManagement';
import PaymentManagement from './PaymentManagement';
import ServicesManagement from './ServicesManagement';
import ReportsAnalytics from './ReportsAnalytics';
import Maintenance from './Maintenance';
import InventoryManagement from './InventoryManagement';
import Notifications from './Notifications';
import SystemSettings from './SystemSettings';
import HousekeepingManagement from './HousekeepingManagement';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const { user } = useAuth();

  // Double protection - in case route protection fails
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <Overview />;
      case 'staff':
        return <StaffManagement />;
      case 'guests':
        return <GuestManagement />;
      case 'rooms':
        return <RoomManagement />;
      case 'bookings':
        return <BookingManagement />;
      case 'payments':
        return <PaymentManagement />;
      case 'services':
        return <ServicesManagement />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'maintenance':
        return <Maintenance />;
      case 'inventory':
        return <InventoryManagement />;
      case 'notifications':
        return <Notifications />;
      case 'system-settings':
        return <SystemSettings />;
      case 'housekeeping':
        return <HousekeepingManagement />;
      default:
        return <Overview />;
    }
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg overflow-y-auto">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
            <p className="text-sm text-gray-600 mt-1">Welcome, {user.name}</p>
          </div>
          
          <nav className="mt-6">
            <div className="px-4 space-y-1">
              {[
                { id: 'overview', name: 'Dashboard Overview', icon: '📊' },
                { id: 'staff', name: 'Staff Management', icon: '👥' },
                { id: 'guests', name: 'Guest Management', icon: '👨‍👩‍👧‍👦' },
                { id: 'rooms', name: 'Room Management', icon: '🏨' },
                { id: 'bookings', name: 'Booking Management', icon: '📅' },
                { id: 'payments', name: 'Payment & Billing', icon: '💳' },
                { id: 'services', name: 'Services & Amenities', icon: '🛎️' },
                { id: 'reports', name: 'Reports & Analytics', icon: '📈' },
                { id: 'maintenance', name: 'Maintenance', icon: '🔧' },
                { id: 'housekeeping', name: 'Housekeeping Management', icon: '🧹' },
                { id: 'inventory', name: 'Inventory Management', icon: '📦' },
                { id: 'notifications', name: 'Notifications', icon: '🔔' },
                { id: 'system-settings', name: 'System Settings', icon: '⚙️' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-100 text-blue-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="px-8 py-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {activeSection === 'overview' && '📊 Dashboard Overview'}
                {activeSection === 'staff' && '👥 Staff Management'}
                {activeSection === 'guests' && '👨‍👩‍👧‍👦 Guest Management'}
                {activeSection === 'rooms' && '🏨 Room Management'}
                {activeSection === 'bookings' && '📅 Booking Management'}
                {activeSection === 'payments' && '💳 Payment & Billing'}
                {activeSection === 'services' && '🛎️ Services & Amenities'}
                {activeSection === 'reports' && '📈 Reports & Analytics'}
                {activeSection === 'maintenance' && '🔧 Maintenance'}
                {activeSection === 'housekeeping' && '🧹 Housekeeping Management'}
                {activeSection === 'inventory' && '📦 Inventory Management'}
                {activeSection === 'notifications' && '🔔 Notifications & Alerts'}
                {activeSection === 'system-settings' && '⚙️ System Settings'}
              </h1>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8">
            {renderSection()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;