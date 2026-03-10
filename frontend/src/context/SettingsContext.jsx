import React, { createContext, useState, useContext, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    hotelName: 'LuxuryStay Hotel',
    email: 'info@luxurystay.com',
    phone: '+1-555-0123',
    address: '123 Luxury Avenue, City, State 12345',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    currency: 'USD',
    timezone: 'UTC-5',
    maintenanceMode: false,
    allowOnlineBookings: true,
    requireDeposit: true,
    depositAmount: 100
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('hotelSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('hotelSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
  };

  const value = {
    settings,
    updateSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};