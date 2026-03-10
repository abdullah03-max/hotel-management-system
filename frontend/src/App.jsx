import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import all pages
import Home from "./pages/guest/Home";
import Rooms from "./pages/guest/Rooms";
import Services from "./pages/guest/Services";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/admin/Dashboard";
import GuestPanel from "./pages/guest/GuestPanel";
import ReceptionistDashboard from "./pages/receptionist/Dashboard";

// Import staff dashboards
import HousekeepingDashboard from "./pages/staff/HousekeepingDashboard";
import MaintenanceDashboard from "./pages/staff/MaintenanceDashboard";
import KitchenDashboard from "./pages/staff/KitchenDashboard";
import SecurityDashboard from "./pages/staff/SecurityDashboard";
import ManagerDashboard from "./pages/staff/ManagerDashboard";

// Import SystemSettings
import SystemSettings from "./pages/admin/SystemSettings";

// Set future flags to suppress warnings (optional)
if (typeof window !== 'undefined') {
  window.__reactRouterVersion = '6';
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router 
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/services" element={<Services />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route 
                path="/guest/panel" 
                element={
                  <ProtectedRoute requiredRole="guest">
                    <GuestPanel />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/settings" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <SystemSettings />
                  </ProtectedRoute>
                } 
              />
              
              {/* Receptionist Routes */}
              <Route 
                path="/receptionist/dashboard" 
                element={
                  <ProtectedRoute requiredRole="receptionist">
                    <ReceptionistDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Staff Dashboard Routes */}
              <Route 
                path="/staff/housekeeping" 
                element={
                  <ProtectedRoute requiredRole="housekeeping">
                    <HousekeepingDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/staff/maintenance" 
                element={
                  <ProtectedRoute requiredRole="maintenance">
                    <MaintenanceDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/staff/kitchen" 
                element={
                  <ProtectedRoute requiredRole="kitchen">
                    <KitchenDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/staff/security" 
                element={
                  <ProtectedRoute requiredRole="security">
                    <SecurityDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/manager/dashboard" 
                element={
                  <ProtectedRoute requiredRole="manager">
                    <ManagerDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;