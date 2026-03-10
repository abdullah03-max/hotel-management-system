import React, { useState } from 'react';
import { motion } from 'framer-motion';

const MaintenanceRequestForm = ({ onClose, onRequestCreated }) => {
  const [formData, setFormData] = useState({
    room: '',
    issue: '',
    priority: 'medium',
    description: '',
    assignedTo: ''
  });

  const [loading, setLoading] = useState(false);

  const availableRooms = [
    { number: '101', type: 'Single' },
    { number: '102', type: 'Double' },
    { number: '201', type: 'Deluxe' },
    { number: '202', type: 'Suite' },
    { number: '301', type: 'Single' },
    { number: '302', type: 'Double' }
  ];

  const maintenanceStaff = [
    { id: 1, name: 'John Doe', specialization: 'General' },
    { id: 2, name: 'Mike Smith', specialization: 'Plumbing' },
    { id: 3, name: 'Sarah Wilson', specialization: 'Electrical' },
    { id: 4, name: 'Tom Brown', specialization: 'HVAC' }
  ];

  const commonIssues = [
    'AC Not Working',
    'Leaky Faucet',
    'Electrical Problem',
    'TV Remote Issue',
    'WiFi Connection',
    'Furniture Damage',
    'Plumbing Issue',
    'Lighting Problem',
    'Door Lock',
    'Window Issue'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newRequest = {
        id: Date.now(),
        ...formData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        reportedBy: 'Admin'
      };

      onRequestCreated(newRequest);
      onClose();
      
    } catch (error) {
      console.error('Error creating maintenance request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">New Maintenance Request</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room *</label>
              <select name="room" required value={formData.room} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select a room</option>
                {availableRooms.map(room => (
                  <option key={room.number} value={room.number}>
                    {room.number} - {room.type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
              <select name="priority" required value={formData.priority} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type *</label>
            <select name="issue" required value={formData.issue} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select an issue</option>
              {commonIssues.map(issue => (
                <option key={issue} value={issue}>{issue}</option>
              ))}
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea name="description" required rows={4} value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Please describe the issue in detail..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
            <select name="assignedTo" value={formData.assignedTo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Unassigned</option>
              {maintenanceStaff.map(staff => (
                <option key={staff.id} value={staff.name}>
                  {staff.name} ({staff.specialization})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {loading ? 'Creating Request...' : 'Create Request'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default MaintenanceRequestForm;