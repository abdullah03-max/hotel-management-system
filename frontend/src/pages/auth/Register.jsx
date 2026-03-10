import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Register.css'; // Import the CSS file

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { state } = location;
  const selectedRoom = state?.room;
  const redirectTo = state?.redirectTo || '/guest/panel';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    setLoading(true);

    try {
      const result = await register(formData);
      
      if (result.success) {
        console.log('✅ Registration successful, redirecting to guest panel...');
        setTimeout(() => {
          navigate(redirectTo);
        }, 100);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="register-page">
      {/* Header */}
      <header className="register-header">
        <div className="container">
          <div className="register-nav-container">
            <h1 className="register-logo" onClick={() => navigate('/')}>Luxury Stay</h1>
            <div className="register-nav-buttons">
              <button 
                className="register-nav-btn login"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button 
                className="register-nav-btn home"
                onClick={() => navigate('/')}
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="register-container">
        {/* Room Selection Info */}
        {selectedRoom && (
          <div className="room-banner">
            <div className="room-banner-content">
              <img 
                src={selectedRoom.image} 
                alt={selectedRoom.type}
                className="room-banner-image"
              />
              <div className="room-banner-text">
                <h3>Ready to book: {selectedRoom.type} Room</h3>
                <p>Complete your registration to book this amazing room for ${selectedRoom.price}/night</p>
              </div>
            </div>
          </div>
        )}

        <div className="register-card">
          <div className="register-header-text">
            <h2 className="register-title">Create your account</h2>
            <p className="register-subtitle">
              {selectedRoom 
                ? 'Register to book your selected room' 
                : 'Join Luxury Stay and experience premium hospitality'
              }
            </p>
          </div>
          
          {error && (
            <div className="register-error">
              {error}
            </div>
          )}

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-row">
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-row">
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
                  placeholder="Enter your email address"
                />
              </div>

              <div className="form-row">
                <label htmlFor="phone" className="form-label">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-row full-width">
                <div className="password-grid">
                  <div className="form-row">
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
                      placeholder="Create a password"
                    />
                  </div>

                  <div className="form-row">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>
              </div>

              <div className="form-row full-width">
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your street address"
                />
              </div>

              <div className="form-row full-width">
                <div className="address-grid">
                  <div className="form-row">
                    <label htmlFor="city" className="form-label">
                      City
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter your city"
                    />
                  </div>

                  <div className="form-row">
                    <label htmlFor="postalCode" className="form-label">
                      Postal Code
                    </label>
                    <input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <label htmlFor="country" className="form-label">
                  Country
                </label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your country"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="register-submit-btn"
            >
              {loading && <span className="register-loading"></span>}
              {loading 
                ? 'Creating Account...' 
                : selectedRoom 
                  ? 'Register & Continue to Booking' 
                  : 'Create Account'
              }
            </button>

            <div className="register-login-link">
              <p className="register-login-text">
                Already have an account?{' '}
                <button 
                  type="button"
                  onClick={() => navigate('/login')}
                  className="register-login-btn"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;