import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    hotelName: 'LuxuryStay Hotel',
    hotelEmail: 'info@luxurystay.com',
    hotelPhone: '+1 (555) 123-4567',
    hotelAddress: '123 Luxury Avenue, Premium District',
    timezone: 'America/New_York',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    language: 'en'
  });

  // Booking Settings
  const [bookingSettings, setBookingSettings] = useState({
    minStay: 1,
    maxStay: 30,
    checkInTime: '14:00',
    checkOutTime: '11:00',
    advanceBooking: 365,
    cancellationHours: 24,
    requireDeposit: true,
    depositPercentage: 20
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    acceptedMethods: ['credit_card', 'paypal', 'cash'],
    currency: 'USD',
    taxRate: 8.5,
    serviceCharge: 10,
    autoInvoice: true,
    invoiceDueDays: 7
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.luxurystay.com',
    smtpPort: '587',
    smtpUsername: 'noreply@luxurystay.com',
    emailFrom: 'noreply@luxurystay.com',
    bookingConfirmations: true,
    paymentReceipts: true,
    checkInReminders: true,
    promotionalEmails: false
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 30,
    passwordExpiry: 90,
    twoFactorAuth: true,
    loginAttempts: 5,
    ipWhitelist: [],
    auditLog: true
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    newBookings: true,
    cancellations: true,
    checkIns: true,
    checkOuts: true,
    maintenanceAlerts: true,
    lowStock: true,
    paymentReminders: true,
    systemAlerts: true
  });

  const timezones = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Dubai', 'Asia/Singapore',
    'Asia/Tokyo', 'Australia/Sydney'
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' }
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' }
  ];

  const handleGeneralChange = (field, value) => {
    setGeneralSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleBookingChange = (field, value) => {
    setBookingSettings(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field, value) => {
    setPaymentSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleEmailChange = (field, value) => {
    setEmailSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSecurityChange = (field, value) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field, value) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = async (section) => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Saving ${section} settings:`, {
        general: generalSettings,
        booking: bookingSettings,
        payment: paymentSettings,
        email: emailSettings,
        security: securitySettings,
        notification: notificationSettings
      }[section]);
      
      // Show success message
      alert(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Saving all settings:', {
        generalSettings,
        bookingSettings,
        paymentSettings,
        emailSettings,
        securitySettings,
        notificationSettings
      });
      alert('All settings saved successfully!');
    } catch (error) {
      console.error('Error saving all settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'booking', name: 'Booking', icon: '📅' },
    { id: 'payment', name: 'Payment', icon: '💳' },
    { id: 'email', name: 'Email', icon: '📧' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'backup', name: 'Backup', icon: '💾' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-gray-600 mt-1">Configure your hotel management system</p>
        </div>
        <Button onClick={handleSaveAll} disabled={saving}>
          {saving ? 'Saving All Settings...' : '💾 Save All Settings'}
        </Button>
      </div>

      {/* Tabs */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Name</label>
                  <input
                    type="text"
                    value={generalSettings.hotelName}
                    onChange={(e) => handleGeneralChange('hotelName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Email</label>
                  <input
                    type="email"
                    value={generalSettings.hotelEmail}
                    onChange={(e) => handleGeneralChange('hotelEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Phone</label>
                  <input
                    type="text"
                    value={generalSettings.hotelPhone}
                    onChange={(e) => handleGeneralChange('hotelPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={generalSettings.timezone}
                    onChange={(e) => handleGeneralChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {timezones.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    value={generalSettings.currency}
                    onChange={(e) => handleGeneralChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={generalSettings.language}
                    onChange={(e) => handleGeneralChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Address</label>
                <textarea
                  rows={3}
                  value={generalSettings.hotelAddress}
                  onChange={(e) => handleGeneralChange('hotelAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('general')} disabled={saving}>
                  {saving ? 'Saving...' : 'Save General Settings'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Booking Settings */}
          {activeTab === 'booking' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Booking Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Stay (nights)</label>
                  <input
                    type="number"
                    value={bookingSettings.minStay}
                    onChange={(e) => handleBookingChange('minStay', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Stay (nights)</label>
                  <input
                    type="number"
                    value={bookingSettings.maxStay}
                    onChange={(e) => handleBookingChange('maxStay', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Time</label>
                  <input
                    type="time"
                    value={bookingSettings.checkInTime}
                    onChange={(e) => handleBookingChange('checkInTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Time</label>
                  <input
                    type="time"
                    value={bookingSettings.checkOutTime}
                    onChange={(e) => handleBookingChange('checkOutTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Advance Booking (days)</label>
                  <input
                    type="number"
                    value={bookingSettings.advanceBooking}
                    onChange={(e) => handleBookingChange('advanceBooking', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Notice (hours)</label>
                  <input
                    type="number"
                    value={bookingSettings.cancellationHours}
                    onChange={(e) => handleBookingChange('cancellationHours', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={bookingSettings.requireDeposit}
                    onChange={(e) => handleBookingChange('requireDeposit', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700">Require Deposit</label>
                </div>
                {bookingSettings.requireDeposit && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deposit Percentage</label>
                    <input
                      type="number"
                      value={bookingSettings.depositPercentage}
                      onChange={(e) => handleBookingChange('depositPercentage', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      max="100"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('booking')} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Booking Settings'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Payment Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                  <input
                    type="number"
                    value={paymentSettings.taxRate}
                    onChange={(e) => handlePaymentChange('taxRate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Charge (%)</label>
                  <input
                    type="number"
                    value={paymentSettings.serviceCharge}
                    onChange={(e) => handlePaymentChange('serviceCharge', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Due (days)</label>
                  <input
                    type="number"
                    value={paymentSettings.invoiceDueDays}
                    onChange={(e) => handlePaymentChange('invoiceDueDays', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Accepted Payment Methods</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash', 'digital_wallet'].map(method => (
                    <label key={method} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={paymentSettings.acceptedMethods.includes(method)}
                        onChange={(e) => {
                          const newMethods = e.target.checked
                            ? [...paymentSettings.acceptedMethods, method]
                            : paymentSettings.acceptedMethods.filter(m => m !== method);
                          handlePaymentChange('acceptedMethods', newMethods);
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {method.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={paymentSettings.autoInvoice}
                  onChange={(e) => handlePaymentChange('autoInvoice', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">Automatically generate invoices</label>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('payment')} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Payment Settings'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Email Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                  <input
                    type="text"
                    value={emailSettings.smtpHost}
                    onChange={(e) => handleEmailChange('smtpHost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                  <input
                    type="text"
                    value={emailSettings.smtpPort}
                    onChange={(e) => handleEmailChange('smtpPort', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
                  <input
                    type="text"
                    value={emailSettings.smtpUsername}
                    onChange={(e) => handleEmailChange('smtpUsername', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                  <input
                    type="email"
                    value={emailSettings.emailFrom}
                    onChange={(e) => handleEmailChange('emailFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Email Notifications</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'bookingConfirmations', label: 'Booking Confirmations' },
                    { key: 'paymentReceipts', label: 'Payment Receipts' },
                    { key: 'checkInReminders', label: 'Check-in Reminders' },
                    { key: 'promotionalEmails', label: 'Promotional Emails' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={emailSettings[key]}
                        onChange={(e) => handleEmailChange(key, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('email')} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Email Settings'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
                  <input
                    type="number"
                    value={securitySettings.passwordExpiry}
                    onChange={(e) => handleSecurityChange('passwordExpiry', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                  <input
                    type="number"
                    value={securitySettings.loginAttempts}
                    onChange={(e) => handleSecurityChange('loginAttempts', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={securitySettings.twoFactorAuth}
                    onChange={(e) => handleSecurityChange('twoFactorAuth', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700">Enable Two-Factor Authentication</label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={securitySettings.auditLog}
                    onChange={(e) => handleSecurityChange('auditLog', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700">Enable Audit Logging</label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('security')} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Security Settings'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'newBookings', label: 'New Bookings', description: 'Get notified when new bookings are made' },
                  { key: 'cancellations', label: 'Cancellations', description: 'Receive alerts for booking cancellations' },
                  { key: 'checkIns', label: 'Check-ins', description: 'Notifications for guest check-ins' },
                  { key: 'checkOuts', label: 'Check-outs', description: 'Notifications for guest check-outs' },
                  { key: 'maintenanceAlerts', label: 'Maintenance Alerts', description: 'Alerts for maintenance requests' },
                  { key: 'lowStock', label: 'Low Stock', description: 'Notifications for inventory low stock' },
                  { key: 'paymentReminders', label: 'Payment Reminders', description: 'Reminders for pending payments' },
                  { key: 'systemAlerts', label: 'System Alerts', description: 'Important system notifications' }
                ].map(({ key, label, description }) => (
                  <div key={key} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={notificationSettings[key]}
                      onChange={(e) => handleNotificationChange(key, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                    />
                    <div>
                      <label className="text-sm font-medium text-gray-700">{label}</label>
                      <p className="text-sm text-gray-500">{description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('notifications')} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Notification Settings'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Backup Settings */}
          {activeTab === 'backup' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Backup & Maintenance</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Database Backup</h4>
                  <p className="text-gray-600 text-sm mb-4">Create a backup of your system data</p>
                  <div className="space-y-3">
                    <Button className="w-full">🔄 Create Backup Now</Button>
                    <Button className="w-full" variant="outline">📥 Download Latest Backup</Button>
                  </div>
                </Card>

                <Card className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">System Maintenance</h4>
                  <p className="text-gray-600 text-sm mb-4">Perform system maintenance tasks</p>
                  <div className="space-y-3">
                    <Button className="w-full" variant="outline">🧹 Clear Cache</Button>
                    <Button className="w-full" variant="outline">📊 Rebuild Statistics</Button>
                  </div>
                </Card>
              </div>

              <Card className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Auto Backup Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Retention Period</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>7 days</option>
                      <option>30 days</option>
                      <option>90 days</option>
                      <option>1 year</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full">💾 Save Backup Settings</Button>
                  </div>
                </div>
              </Card>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">⚠️</div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-yellow-800">Important</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Regular backups are essential for data security. We recommend scheduling automatic backups and storing them in a secure location.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SystemSettings;
