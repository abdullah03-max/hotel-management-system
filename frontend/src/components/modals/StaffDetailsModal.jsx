import React from 'react';
import { motion } from 'framer-motion';

const StaffDetailsModal = ({ staff, onClose }) => {
  // Get specialization label
  const getSpecializationLabel = (specialization) => {
    const specializations = {
      'plumber': 'Plumber',
      'electrician': 'Electrician',
      'technician': 'Technician',
      'carpenter': 'Carpenter',
      'painter': 'Painter',
      'ac_technician': 'AC Technician',
      'general': 'General Maintenance'
    };
    return specializations[specialization] || specialization || 'Not specified';
  };

  // Get specialization icon
  const getSpecializationIcon = (specialization) => {
    switch (specialization) {
      case 'plumber': return '🔧';
      case 'electrician': return '⚡';
      case 'technician': return '🔌';
      case 'ac_technician': return '❄️';
      case 'carpenter': return '🪚';
      case 'painter': return '🎨';
      default: return '👨‍🔧';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Staff Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Staff Header */}
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              {staff.role === 'maintenance' && staff.specialization ? 
                getSpecializationIcon(staff.specialization) : '👤'
              }
            </div>
            <h3 className="text-xl font-bold text-gray-900">{staff.name}</h3>
            <p className="text-gray-600 capitalize">{staff.role}</p>
            {staff.role === 'maintenance' && staff.specialization && (
              <p className="text-blue-600 font-semibold mt-1">
                {getSpecializationLabel(staff.specialization)}
              </p>
            )}
          </div>

          {/* Personal Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{staff.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{staff.phone || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Department:</span>
                <span className="font-medium capitalize">{staff.department?.replace('-', ' ') || 'Not assigned'}</span>
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Employment Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  staff.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : staff.status === 'inactive'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {staff.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Salary:</span>
                <span className="font-medium">${staff.salary ? staff.salary.toLocaleString() : '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Join Date:</span>
                <span className="font-medium">
                  {staff.joinDate ? new Date(staff.joinDate).toLocaleDateString() : 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Specialization Section for Maintenance Staff */}
          {staff.role === 'maintenance' && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Specialization</h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {getSpecializationIcon(staff.specialization)}
                  </span>
                  <div>
                    <p className="font-medium text-blue-900">
                      {getSpecializationLabel(staff.specialization)}
                    </p>
                    <p className="text-sm text-blue-700">
                      {staff.specialization === 'plumber' && 'Expert in plumbing and water systems'}
                      {staff.specialization === 'electrician' && 'Expert in electrical systems and wiring'}
                      {staff.specialization === 'technician' && 'Expert in technical equipment and electronics'}
                      {staff.specialization === 'ac_technician' && 'Expert in air conditioning systems'}
                      {staff.specialization === 'carpenter' && 'Expert in woodwork and furniture'}
                      {staff.specialization === 'painter' && 'Expert in painting and surface finishing'}
                      {staff.specialization === 'general' && 'General maintenance and repairs'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StaffDetailsModal;
