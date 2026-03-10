import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AddStaffForm = ({ onClose, onStaffAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'receptionist',
    specialization: '',
    phone: '',
    salary: '',
    joinDate: new Date().toISOString().split('T')[0],
    address: '',
    emergencyContact: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backendStatus, setBackendStatus] = useState('checking');
  const [showPassword, setShowPassword] = useState(false);

  const roles = [
    { value: 'receptionist', label: 'Receptionist' },
    { value: 'housekeeping', label: 'Housekeeping Staff' },
    { value: 'manager', label: 'Manager' },
    { value: 'maintenance', label: 'Maintenance Staff' },
    { value: 'kitchen', label: 'Kitchen Staff' },
    { value: 'security', label: 'Security Staff' },
    { value: 'admin', label: 'Administrator' }
  ];

  const specializations = [
    { value: 'plumber', label: 'Plumber' },
    { value: 'electrician', label: 'Electrician' },
    { value: 'technician', label: 'Technician' },
    { value: 'carpenter', label: 'Carpenter' },
    { value: 'painter', label: 'Painter' },
    { value: 'ac_technician', label: 'AC Technician' },
    { value: 'general', label: 'General Maintenance' }
  ];

  const getDepartmentFromRole = (role) => {
    const roleToDepartment = {
      'receptionist': 'front-desk',
      'housekeeping': 'housekeeping',
      'manager': 'management',
      'maintenance': 'maintenance',
      'kitchen': 'kitchen',
      'security': 'security',
      'admin': 'management'
    };
    return roleToDepartment[role] || 'front-desk';
  };

  // Sync housekeeping staff to localStorage
  const syncHousekeepingStaffToLocalStorage = (staffData) => {
    try {
      const existingStaff = JSON.parse(localStorage.getItem('hotelStaff') || '[]');
      const staffExists = existingStaff.find(staff => staff.email === staffData.email);
      
      if (!staffExists) {
        const newStaff = {
          id: staffData._id || Date.now().toString(),
          name: staffData.name,
          email: staffData.email,
          role: staffData.role,
          department: staffData.department,
          specialization: staffData.specialization || '',
          phone: staffData.phone,
          salary: staffData.salary,
          status: 'active',
          joinDate: staffData.joinDate,
          lastLogin: 'Never'
        };
        
        existingStaff.push(newStaff);
        localStorage.setItem('hotelStaff', JSON.stringify(existingStaff));
        console.log('✅ Housekeeping staff synced to localStorage:', newStaff.name);
      }
    } catch (error) {
      console.error('❌ Error syncing staff to localStorage:', error);
    }
  };

  useEffect(() => {
    testBackendConnection();
  }, []);

  useEffect(() => {
    if (formData.role !== 'maintenance') {
      setFormData(prev => ({
        ...prev,
        specialization: ''
      }));
    }
  }, [formData.role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const testBackendConnection = async () => {
    try {
      setBackendStatus('checking');
      const response = await fetch('http://localhost:5000/api/health');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setBackendStatus('connected');
        return true;
      } else {
        setBackendStatus('error');
        return false;
      }
    } catch (error) {
      console.error('Backend connection test failed:', error);
      setBackendStatus('error');
      setError(`Cannot connect to server: ${error.message}`);
      return false;
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.salary) {
      setError('All required fields must be filled');
      return false;
    }

    if (!formData.password) {
      setError('Password is required');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.role === 'maintenance' && !formData.specialization) {
      setError('Please select specialization for maintenance staff');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      const isConnected = await testBackendConnection();
      if (!isConnected) {
        setError('Cannot connect to backend server. Please make sure it is running on port 5000.');
        setLoading(false);
        return;
      }

      const department = getDepartmentFromRole(formData.role);

      console.log('Sending staff data:', formData);
      console.log('Auto-generated department:', department);

      const apiData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: department,
        specialization: formData.specialization,
        phone: formData.phone,
        salary: Number(formData.salary),
        joinDate: formData.joinDate
      };

      const response = await fetch('http://localhost:5000/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log('✅ Staff created:', result.data.staff);
        
        const newStaff = {
          id: result.data.staff._id,
          name: result.data.staff.name,
          email: result.data.staff.email,
          role: result.data.staff.role,
          department: result.data.staff.department,
          specialization: result.data.staff.specialization,
          status: result.data.staff.status || 'active',
          phone: result.data.staff.phone,
          salary: result.data.staff.salary,
          joinDate: result.data.staff.joinDate,
          lastLogin: 'Never'
        };

        // ✅ CRITICAL: Sync housekeeping staff to localStorage
        if (formData.role === 'housekeeping') {
          syncHousekeepingStaffToLocalStorage(newStaff);
        }

        onStaffAdded(newStaff);
        onClose();
        
        const specializationText = formData.specialization ? `\nSpecialization: ${formData.specialization}` : '';
        alert(`Staff member ${formData.name} added successfully!\n\nLogin Credentials:\nEmail: ${formData.email}\nPassword: ${formData.password}\nRole: ${formData.role}${specializationText}\nDepartment: ${department}`);
        
      } else {
        setError(result.message || 'Error adding staff member');
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      
      if (error.message.includes('Failed to fetch')) {
        setError('Cannot connect to server. Please make sure the backend is running on http://localhost:5000');
      } else if (error.message.includes('404')) {
        setError('API endpoint not found. Please check if the server routes are properly configured.');
      } else if (error.message.includes('500')) {
        setError('Server error. Please check the backend console for details.');
      } else if (error.message.includes('duplicate')) {
        setError('Staff member with this email already exists. Please use a different email.');
      } else if (error.message.includes('department')) {
        setError('Department field is required. Please try again.');
      } else {
        setError(`Failed to add staff: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    switch (backendStatus) {
      case 'connected':
        return { message: '✅ Backend server is connected and ready!', color: 'green' };
      case 'error':
        return { message: '❌ Cannot connect to backend server', color: 'red' };
      case 'checking':
        return { message: '⏳ Checking backend connection...', color: 'yellow' };
      default:
        return { message: '⏳ Checking backend connection...', color: 'yellow' };
    }
  };

  const status = getStatusMessage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Add New Staff Member</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Connection Status */}
          <div className={`bg-${status.color}-50 border border-${status.color}-200 rounded-lg p-4`}>
            <div className="flex items-center">
              <div className={`text-${status.color}-500 mr-2`}>
                {status.color === 'green' ? '✅' : status.color === 'red' ? '❌' : '⏳'}
              </div>
              <p className={`text-${status.color}-700 text-sm`}>{status.message}</p>
            </div>
            {backendStatus === 'connected' && (
              <p className="text-green-600 text-xs mt-2">
                Server is running on http://localhost:5000
              </p>
            )}
            {backendStatus === 'error' && (
              <p className="text-red-600 text-xs mt-2">
                Make sure the backend server is running with: <code className="bg-gray-100 px-1 rounded">npm run dev</code>
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="text-red-500 mr-2">⚠️</div>
                <div>
                  <p className="text-red-700 text-sm font-medium">Error</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={formData.name} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="Enter full name" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="Enter email address" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input 
                  type="tel" 
                  name="phone" 
                  required 
                  value={formData.phone} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="Enter phone number" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Join Date *</label>
                <input 
                  type="date" 
                  name="joinDate" 
                  required 
                  value={formData.joinDate} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
            </div>
          </div>

          {/* Login Credentials */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Login Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password" 
                    required 
                    value={formData.password} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10" 
                    placeholder="Enter password" 
                    minLength="6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                <input 
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword" 
                  required 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="Confirm password" 
                />
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                <select 
                  name="role" 
                  required 
                  value={formData.role} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Department will be auto-assigned: <strong>{getDepartmentFromRole(formData.role)}</strong>
                </p>
              </div>

              {formData.role === 'maintenance' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialization *</label>
                  <select 
                    name="specialization" 
                    required={formData.role === 'maintenance'}
                    value={formData.specialization} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Specialization</option>
                    {specializations.map(spec => (
                      <option key={spec.value} value={spec.value}>{spec.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose the maintenance specialization
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Salary ($) *</label>
                <input 
                  type="number" 
                  name="salary" 
                  required 
                  value={formData.salary} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="Enter monthly salary" 
                  min="0" 
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading || backendStatus !== 'connected'} 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Adding Staff...' : 'Add Staff Member'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddStaffForm;