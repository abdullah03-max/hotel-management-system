import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AddStaffForm from '../../components/forms/AddStaffForm';
import EditStaffForm from '../../components/forms/EditStaffForm';
import StaffDetailsModal from '../../components/modals/StaffDetailsModal';

const StaffManagement = () => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showEditStaff, setShowEditStaff] = useState(false);
  const [showStaffDetails, setShowStaffDetails] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);

  // Sync housekeeping staff to localStorage
  const syncHousekeepingStaffToLocalStorage = (staffList) => {
    try {
      const housekeepingStaff = staffList.filter(staff => staff.role === 'housekeeping');
      
      if (housekeepingStaff.length > 0) {
        const existingStaff = JSON.parse(localStorage.getItem('hotelStaff') || '[]');
        
        // Remove existing housekeeping staff
        const filteredStaff = existingStaff.filter(staff => staff.role !== 'housekeeping');
        
        // Add current housekeeping staff
        const updatedStaff = [
          ...filteredStaff,
          ...housekeepingStaff.map(staff => ({
            id: staff._id,
            name: staff.name,
            email: staff.email,
            role: staff.role,
            department: staff.department,
            specialization: staff.specialization || '',
            phone: staff.phone,
            salary: staff.salary,
            status: staff.status,
            joinDate: staff.joinDate,
            lastLogin: staff.lastLogin || 'Never'
          }))
        ];
        
        localStorage.setItem('hotelStaff', JSON.stringify(updatedStaff));
        console.log('✅ Synced housekeeping staff to localStorage:', housekeepingStaff.length, 'staff members');
      }
    } catch (error) {
      console.error('❌ Error syncing housekeeping staff:', error);
    }
  };

  const formatLastLogin = (lastLogin) => {
    if (!lastLogin) return 'Never';
    
    const loginDate = new Date(lastLogin);
    const now = new Date();
    const diffInMs = now - loginDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return loginDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSpecializationLabel = (specialization) => {
    const specializations = {
      'plumber': 'Plumber',
      'electrician': 'Electrician',
      'technician': 'Technician',
      'ac_technician': 'AC Technician',
      'carpenter': 'Carpenter',
      'painter': 'Painter',
      'general': 'General Maintenance'
    };
    return specializations[specialization] || specialization || 'General Maintenance';
  };

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://hotel-management-system-production-9e00.up.railway.app/api/staff');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStaffMembers(data.data.staff);
          
          // ✅ CRITICAL: Sync housekeeping staff to localStorage
          syncHousekeepingStaffToLocalStorage(data.data.staff);
        }
      }
    } catch (error) {
      console.error('Error fetching staff data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  // Real-time sync when staff list changes
  useEffect(() => {
    if (staffMembers.length > 0) {
      syncHousekeepingStaffToLocalStorage(staffMembers);
    }
  }, [staffMembers]);

  const showFeedback = (message, type = 'success') => {
    setActionFeedback({ message, type });
    setTimeout(() => {
      setActionFeedback(null);
    }, 3000);
  };

  const handleAddStaff = (newStaff) => {
    setStaffMembers(prev => [newStaff, ...prev]);
    setTimeout(() => {
      fetchStaffData();
    }, 500);
    showFeedback('Staff member added successfully!');
  };

  const handleEditStaff = (staffId) => {
    const staff = staffMembers.find(s => s._id === staffId);
    if (staff) {
      setSelectedStaff(staff);
      setShowEditStaff(true);
    }
  };

  const handleViewDetails = (staffId) => {
    const staff = staffMembers.find(s => s._id === staffId);
    if (staff) {
      setSelectedStaff(staff);
      setShowStaffDetails(true);
    }
  };

  const handleUpdateStaff = async (updatedStaff) => {
    setStaffMembers(prev => prev.map(staff => 
      staff._id === updatedStaff._id ? updatedStaff : staff
    ));
    setShowEditStaff(false);
    setSelectedStaff(null);
    setTimeout(() => {
      fetchStaffData();
    }, 500);
    showFeedback('Staff member updated successfully!');
  };

  const handleDeleteStaff = async (staffId) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      try {
        const response = await fetch(`https://hotel-management-system-production-9e00.up.railway.app/api/staff/${staffId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete staff member');
        }

        const result = await response.json();

        if (result.success) {
          setStaffMembers(prev => prev.filter(staff => staff._id !== staffId));
          showFeedback('Staff member removed successfully!');
          setTimeout(() => {
            fetchStaffData();
          }, 500);
        } else {
          throw new Error(result.message || 'Failed to delete staff member');
        }
      } catch (error) {
        console.error('Error deleting staff:', error);
        showFeedback(`Error: ${error.message}`, 'error');
      }
    }
  };

  const handleToggleStaffStatus = (staffId) => {
    setStaffMembers(prev => prev.map(staff => 
      staff._id === staffId
        ? { ...staff, status: staff.status === 'active' ? 'inactive' : 'active' }
        : staff
    ));
    const staff = staffMembers.find(s => s._id === staffId);
    showFeedback(`Staff status updated to ${staff.status === 'active' ? 'inactive' : 'active'}!`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading staff data...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Feedback Message */}
      {actionFeedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            actionFeedback.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}
        >
          ✅ {actionFeedback.message}
        </motion.div>
      )}

      {/* Modals */}
      {showAddStaff && <AddStaffForm onClose={() => setShowAddStaff(false)} onStaffAdded={handleAddStaff} />}
      {showEditStaff && selectedStaff && (
        <EditStaffForm 
          staff={selectedStaff} 
          onClose={() => {
            setShowEditStaff(false);
            setSelectedStaff(null);
          }} 
          onStaffUpdated={handleUpdateStaff} 
        />
      )}
      {showStaffDetails && selectedStaff && (
        <StaffDetailsModal 
          staff={selectedStaff} 
          onClose={() => {
            setShowStaffDetails(false);
            setSelectedStaff(null);
          }}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Staff Management</h2>
          <p className="text-gray-600 mt-1">Manage your hotel staff members</p>
          <p className="text-sm text-blue-600 mt-1">
            📊 Connected to MongoDB - {staffMembers.length} staff members loaded
          </p>
          <p className="text-sm text-green-600 mt-1">
            ✅ Housekeeping staff synced to localStorage for task assignments
          </p>
        </div>
        <Button onClick={() => setShowAddStaff(true)}>
          <span className="mr-2">+</span> Add Staff Member
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-l-4 border-l-blue-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Total Staff</p>
            <p className="text-2xl font-bold text-gray-900">{staffMembers.length}</p>
          </div>
        </Card>
        <Card className="bg-white border-l-4 border-l-green-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Active Staff</p>
            <p className="text-2xl font-bold text-gray-900">
              {staffMembers.filter(s => s.status === 'active').length}
            </p>
          </div>
        </Card>
        <Card className="bg-white border-l-4 border-l-purple-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Receptionists</p>
            <p className="text-2xl font-bold text-gray-900">
              {staffMembers.filter(s => s.role === 'receptionist').length}
            </p>
          </div>
        </Card>
        <Card className="bg-white border-l-4 border-l-orange-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Housekeeping</p>
            <p className="text-2xl font-bold text-gray-900">
              {staffMembers.filter(s => s.role === 'housekeeping').length}
            </p>
          </div>
        </Card>
      </div>

      {/* Staff Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staffMembers.map((staff) => (
                <tr key={staff._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{staff.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{staff.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {staff.role === 'maintenance' && staff.specialization ? (
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {staff.specialization === 'plumber' && '🔧'}
                        {staff.specialization === 'electrician' && '⚡'}
                        {staff.specialization === 'technician' && '🔌'}
                        {staff.specialization === 'ac_technician' && '❄️'}
                        {staff.specialization === 'carpenter' && '🪚'}
                        {staff.specialization === 'painter' && '🎨'}
                        {!['plumber', 'electrician', 'technician', 'ac_technician', 'carpenter', 'painter'].includes(staff.specialization) && '👨‍🔧'}
                        {getSpecializationLabel(staff.specialization)}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStaffStatus(staff._id)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                        staff.status === 'active' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {staff.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatLastLogin(staff.lastLogin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleViewDetails(staff._id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => handleEditStaff(staff._id)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteStaff(staff._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
};

export default StaffManagement;
