import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css'; // Import the CSS file

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showStaffRoleSelection, setShowStaffRoleSelection] = useState(false);
  const [selectedStaffRole, setSelectedStaffRole] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, user, debugUsers } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { state } = location;
  const redirectTo = state?.redirectTo || '/guest/panel';
  const roomData = state?.room;

  // Debug user state
  useEffect(() => {
    console.log('🔍 Login Component - Current User:', user);
  }, [user]);

  // CORRECT VERSION - Add this function inside the component
  const debugAllUsers = () => {
    const users = debugUsers();
    console.log('🔍 DEBUG - All registered users:', users);
    alert(`Total registered users: ${users.length}\n\nCheck console for details.`);
  };

  const roles = [
    {
      id: 'admin',
      title: 'Admin',
      description: 'Manage hotel operations, staff, and overall system',
      icon: '👨‍💼',
      color: '#dc2626'
    },
    {
      id: 'receptionist',
      title: 'Receptionist',
      description: 'Handle guest check-ins, check-outs, and room management',
      icon: '👩‍💼',
      color: '#2563eb'
    },
    {
      id: 'guest',
      title: 'Guest',
      description: 'Book rooms, manage reservations, and access services',
      icon: '👨‍👩‍👧‍👦',
      color: '#059669'
    }
  ];

  const staffRoles = [
    {
      id: 'receptionist',
      title: 'Receptionist',
      description: 'Front desk operations, guest services',
      icon: '👩‍💼',
      color: '#2563eb'
    },
    {
      id: 'housekeeping',
      title: 'Housekeeping Staff',
      description: 'Room cleaning and maintenance',
      icon: '🧹',
      color: '#7c3aed'
    },
    {
      id: 'maintenance',
      title: 'Maintenance Staff',
      description: 'Repairs and facility maintenance',
      icon: '🔧',
      color: '#d97706'
    },
    {
      id: 'kitchen',
      title: 'Kitchen Staff',
      description: 'Food preparation and service',
      icon: '👨‍🍳',
      color: '#ea580c'
    },
    {
      id: 'security',
      title: 'Security Staff',
      description: 'Safety and security monitoring',
      icon: '🛡️',
      color: '#4b5563'
    },
    {
      id: 'manager',
      title: 'Manager',
      description: 'Hotel operations management',
      icon: '👨‍💼',
      color: '#3730a3'
    }
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    
    if (role === 'receptionist') {
      setShowStaffRoleSelection(true);
      setError('');
    } else {
      setShowLoginForm(true);
      setError('');
    }
    
    console.log('🎯 Role Selected:', role);
  };

  const handleStaffRoleSelect = (staffRole) => {
    setSelectedStaffRole(staffRole);
    setShowStaffRoleSelection(false);
    setShowLoginForm(true);
    console.log('🎯 Staff Role Selected:', staffRole);
  };

  const handleBackToRoleSelect = () => {
    setSelectedRole('');
    setSelectedStaffRole('');
    setShowLoginForm(false);
    setShowStaffRoleSelection(false);
    setFormData({ email: '', password: '' });
    setError('');
  };

  const handleBackToStaffRoleSelect = () => {
    setSelectedStaffRole('');
    setShowStaffRoleSelection(true);
    setShowLoginForm(false);
    setFormData({ email: '', password: '' });
    setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🚀 STARTING LOGIN PROCESS ================');
    console.log('📧 Email:', formData.email);
    console.log('🔑 Password:', formData.password);
    console.log('🎯 Selected Role:', selectedRole);
    console.log('🎯 Selected Staff Role:', selectedStaffRole);

    try {
      const result = await login(formData, selectedStaffRole || selectedRole);
      
      console.log('📋 LOGIN RESULT:', result);
      
      if (result.success) {
        console.log('🎉 LOGIN SUCCESSFUL - Starting redirect...');
        console.log('👤 Logged in user:', result.user);
        
        setTimeout(() => {
          const actualUserRole = result.user?.role;
          console.log('🔄 REDIRECTING based on ACTUAL role:', actualUserRole);
          
          switch(actualUserRole) {
            case 'guest':
              console.log('➡️ Going to Guest Panel');
              navigate('/guest/panel');
              break;
            case 'admin':
              console.log('➡️ Going to Admin Dashboard');
              navigate('/admin/dashboard');
              break;
            case 'receptionist':
              console.log('➡️ Going to Receptionist Dashboard');
              navigate('/receptionist/dashboard');
              break;
            case 'housekeeping':
              console.log('➡️ Going to Housekeeping Dashboard');
              navigate('/staff/housekeeping');
              break;
            case 'maintenance':
              console.log('➡️ Going to Maintenance Dashboard');
              navigate('/staff/maintenance');
              break;
            case 'kitchen':
              console.log('➡️ Going to Kitchen Staff Dashboard');
              navigate('/staff/kitchen');
              break;
            case 'security':
              console.log('➡️ Going to Security Dashboard');
              navigate('/staff/security');
              break;
            case 'manager':
              console.log('➡️ Going to Manager Dashboard');
              navigate('/manager/dashboard');
              break;
            default:
              console.log('❓ Unknown role, going home');
              navigate('/');
          }
        }, 500);
        
      } else {
        console.log('❌ LOGIN FAILED:', result.error);
        setError(result.error);
      }
    } catch (err) {
      console.error('💥 LOGIN ERROR:', err);
      setError('Login failed. Please try again.');
    }

    setLoading(false);
  };

  // Show staff role selection screen
  if (showStaffRoleSelection) {
    return (
      <div className="login-page">
        {/* Header */}
        <header className="login-header">
          <div className="container">
            <div className="login-nav-container">
              <h1 className="login-logo" onClick={() => navigate('/')}>Luxury Stay</h1>
              <div className="login-nav-buttons">
                <button 
                  className="login-nav-btn register"
                  onClick={() => navigate('/register')}
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="staff-role-container">
          {/* Back Button */}
          <button
            onClick={handleBackToRoleSelect}
            className="back-button"
          >
            ← Back to Main Role Selection
          </button>

          <div className="staff-role-header">
            <h2 className="staff-role-title">Hotel Staff Login</h2>
            <p className="staff-role-subtitle">Select your specific staff role</p>
          </div>

          <div className="staff-role-grid">
            {staffRoles.map((role) => (
              <div
                key={role.id}
                onClick={() => handleStaffRoleSelect(role.id)}
                className="role-card"
              >
                <div className="role-card-content">
                  <div className="role-icon">{role.icon}</div>
                  <h3 className="role-card-title">{role.title}</h3>
                  <p className="role-card-description">{role.description}</p>
                </div>
                <div className="role-card-footer">
                  <span className="role-card-action">Click to login →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show role selection screen
  if (!showLoginForm) {
    return (
      <div className="login-page">
        {/* Header */}
        <header className="login-header">
          <div className="container">
            <div className="login-nav-container">
              <h1 className="login-logo" onClick={() => navigate('/')}>Luxury Stay</h1>
              <div className="login-nav-buttons">
                <button 
                  className="login-nav-btn register"
                  onClick={() => navigate('/register')}
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="role-selection-container">
          <div className="role-selection-header">
            <h2 className="role-selection-title">LuxuryStay Hotel</h2>
            <p className="role-selection-subtitle">Select your role to login</p>
          </div>

          <div className="role-grid">
            {roles.map((role) => (
              <div
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className="role-card"
              >
                <div className="role-card-content">
                  <div className="role-icon">{role.icon}</div>
                  <h3 className="role-card-title">{role.title}</h3>
                  <p className="role-card-description">{role.description}</p>
                </div>
                <div className="role-card-footer">
                  <span className="role-card-action">Click to login →</span>
                </div>
              </div>
            ))}
          </div>

          {/* Demo Credentials Section */}
          <div className="demo-section">
            <h4 className="demo-section-title">Quick Login (Click to auto-fill):</h4>
            <div className="demo-buttons">
              <button
                onClick={() => {
                  setSelectedRole('admin');
                  setShowLoginForm(true);
                  setFormData({
                    email: 'admin@hotel.com',
                    password: '123456'
                  });
                }}
                className="demo-btn admin"
              >
                Admin
              </button>
              <button
                onClick={() => {
                  setSelectedRole('receptionist');
                  setShowLoginForm(true);
                  setFormData({
                    email: 'receptionist@hotel.com',
                    password: '123456'
                  });
                }}
                className="demo-btn receptionist"
              >
                Receptionist
              </button>
              <button
                onClick={() => {
                  setSelectedRole('guest');
                  setShowLoginForm(true);
                  setFormData({
                    email: 'guest@example.com',
                    password: '123456'
                  });
                }}
                className="demo-btn guest"
              >
                Guest
              </button>
            </div>
          </div>

          {/* Debug Tools Section */}
          <div className="debug-section">
            <h4 className="debug-section-title">Debug Tools:</h4>
            <div className="debug-buttons">
              <button
                onClick={debugAllUsers}
                className="debug-btn"
              >
                Check All Users
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  alert('All data cleared! Refresh the page.');
                  window.location.reload();
                }}
                className="debug-btn clear"
              >
                Clear All Data
              </button>
            </div>
          </div>

          <div className="register-link">
            <p className="register-text">
              Don't have an account?{' '}
              <button 
                onClick={() => navigate('/register')}
                className="register-btn"
              >
                Register as Guest
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Login Form
  const getRoleData = () => {
    if (selectedStaffRole) {
      return staffRoles.find(role => role.id === selectedStaffRole);
    }
    return roles.find(role => role.id === selectedRole);
  };

  const selectedRoleData = getRoleData();

  return (
    <div className="login-page">
      {/* Header */}
      <header className="login-header">
        <div className="container">
          <div className="login-nav-container">
            <h1 className="login-logo" onClick={() => navigate('/')}>Luxury Stay</h1>
            <div className="login-nav-buttons">
              <button 
                className="login-nav-btn register"
                onClick={() => navigate('/register')}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="login-form-container">
        <div className="login-form-card">
          {/* Back Button */}
          <button
            onClick={selectedStaffRole ? handleBackToStaffRoleSelect : handleBackToRoleSelect}
            className="back-button"
          >
            ← {selectedStaffRole ? 'Back to Staff Roles' : 'Back to Role Selection'}
          </button>

          {/* Role Header */}
          <div className="login-form-header">
            <div className="login-role-icon">{selectedRoleData?.icon}</div>
            <h2 className="login-form-title">{selectedRoleData?.title} Login</h2>
            <p className="login-form-subtitle">{selectedRoleData?.description}</p>
            <p className="role-note">
              ⚠️ Note: Your actual role in the system will determine where you're redirected
            </p>
          </div>
          
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-submit-btn"
            >
              {loading && <span className="login-loading"></span>}
              {loading ? 'Signing in...' : `Sign in as ${selectedRoleData?.title}`}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="demo-credentials-panel">
            <h4 className="demo-credentials-title">Demo Credentials:</h4>
            <div className="credentials-list">
              <div className="credential-item">
                <span className="credential-label">Admin:</span>
                <span>admin@hotel.com / 123456</span>
              </div>
              <div className="credential-item">
                <span className="credential-label">Receptionist:</span>
                <span>receptionist@hotel.com / 123456</span>
              </div>
              <div className="credential-item">
                <span className="credential-label">Guest:</span>
                <span>guest@example.com / 123456</span>
              </div>
              <div className="credential-item">
                <span className="credential-label">Staff:</span>
                <span>Use staff email from database</span>
              </div>
            </div>
            <p className="credential-note">
              ⚠️ Your actual role in system determines redirect, not role selection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;