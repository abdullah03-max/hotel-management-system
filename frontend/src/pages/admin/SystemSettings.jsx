import React from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useSettings } from '../../context/SettingsContext';

const SystemSettings = () => {
  const { settings, updateSettings } = useSettings();

  const handleSettingChange = (key, value) => {
    updateSettings({
      ...settings,
      [key]: value
    });
  };

  const handleSaveSettings = () => {
    // Settings are automatically saved via context
    alert('Settings saved successfully! They will reflect on the homepage immediately.');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
          <p className="text-gray-600 mt-1">Configure hotel system settings and preferences</p>
        </div>
        <Button onClick={handleSaveSettings}>
          Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hotel Information */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Hotel Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Name</label>
                <input
                  type="text"
                  value={settings.hotelName}
                  onChange={(e) => handleSettingChange('hotelName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleSettingChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => handleSettingChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={settings.address}
                  onChange={(e) => handleSettingChange('address', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Booking Settings */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Booking Settings</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Time</label>
                  <input
                    type="time"
                    value={settings.checkInTime}
                    onChange={(e) => handleSettingChange('checkInTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Time</label>
                  <input
                    type="time"
                    value={settings.checkOutTime}
                    onChange={(e) => handleSettingChange('checkOutTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleSettingChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleSettingChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="UTC-5">EST (UTC-5)</option>
                  <option value="UTC-8">PST (UTC-8)</option>
                  <option value="UTC+0">GMT (UTC+0)</option>
                  <option value="UTC+1">CET (UTC+1)</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* System Preferences */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">System Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
                  <p className="text-sm text-gray-500">Temporarily disable bookings</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Allow Online Bookings</label>
                  <p className="text-sm text-gray-500">Enable online reservation system</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allowOnlineBookings}
                  onChange={(e) => handleSettingChange('allowOnlineBookings', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Require Deposit</label>
                  <p className="text-sm text-gray-500">Ask for deposit during booking</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.requireDeposit}
                  onChange={(e) => handleSettingChange('requireDeposit', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              {settings.requireDeposit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deposit Amount</label>
                  <input
                    type="number"
                    value={settings.depositAmount}
                    onChange={(e) => handleSettingChange('depositAmount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  These actions are irreversible. Please proceed with caution.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full border-red-300 text-red-600 hover:bg-red-50">
                    Clear All Data
                  </Button>
                  <Button variant="outline" className="w-full border-red-300 text-red-600 hover:bg-red-50">
                    Reset System Settings
                  </Button>
                  <Button variant="outline" className="w-full border-red-300 text-red-600 hover:bg-red-50">
                    Delete All Bookings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default SystemSettings;