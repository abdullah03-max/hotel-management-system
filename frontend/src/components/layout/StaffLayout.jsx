import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StaffLayout = ({ children, title, role }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'housekeeping': 'Housekeeping Staff',
      'maintenance': 'Maintenance Staff',
      'kitchen': 'Kitchen Staff',
      'security': 'Security Staff',
      'manager': 'Manager',
      'receptionist': 'Receptionist',
      'admin': 'Administrator',
      'guest': 'Guest'
    };
    return roleNames[role] || role;
  };

  const getRoleIcon = (role) => {
    const icons = {
      'housekeeping': '🧹',
      'maintenance': '🔧',
      'kitchen': '👨‍🍳',
      'security': '🛡️',
      'manager': '👨‍💼',
      'receptionist': '👩‍💼',
      'admin': '⚙️',
      'guest': '👤'
    };
    return icons[role] || '👤';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">
                {getRoleIcon(user?.role)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{getRoleDisplayName(user?.role)}</p>
              </div>
              
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default StaffLayout;
