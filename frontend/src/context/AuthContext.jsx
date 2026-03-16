import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

// Create and export AuthContext
export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize default users
  const initializeDefaultUsers = () => {
    const defaultUsers = [
      {
        id: 1,
        name: 'Admin User',
        email: 'admin@hotel.com',
        password: '123456',
        role: 'admin',
        phone: '+1234567890',
        address: '123 Admin Street',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Receptionist User',
        email: 'receptionist@hotel.com',
        password: '123456',
        role: 'receptionist',
        phone: '+1234567891',
        address: '456 Reception St',
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Guest User',
        email: 'guest@example.com',
        password: '123456',
        role: 'guest',
        phone: '+1234567892',
        address: '789 Guest Avenue',
        createdAt: new Date().toISOString()
      }
    ];

    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    let usersUpdated = false;
    const mergedUsers = [...existingUsers];
    
    defaultUsers.forEach(defaultUser => {
      const userExists = existingUsers.find(user => user.email === defaultUser.email);
      if (!userExists) {
        mergedUsers.push(defaultUser);
        usersUpdated = true;
        console.log(`✅ Added default user: ${defaultUser.email}`);
      }
    });

    if (usersUpdated) {
      localStorage.setItem('registeredUsers', JSON.stringify(mergedUsers));
      console.log('✅ Default users checked/updated');
    }
    
    return mergedUsers;
  };

  // Add this function to update staff last login in database
  const updateStaffLastLogin = async (staffId, lastLogin) => {
    try {
      const response = await fetch(`https://hotel-management-system-production-9e00.up.railway.app/api/staff/${staffId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lastLogin: lastLogin
        })
      });

      if (response.ok) {
        console.log('✅ Staff last login updated in database');
      } else {
        console.log('⚠️ Could not update staff last login in database');
      }
    } catch (error) {
      console.error('❌ Error updating staff last login:', error);
    }
  };

  // Check staff in database with role verification
  const checkStaffInDatabase = async (email, password, selectedRole) => {
    try {
      console.log('🔍 Checking staff in database...');
      console.log('🎯 Selected Role for verification:', selectedRole);
      
      const response = await fetch('https://hotel-management-system-production-9e00.up.railway.app/api/staff');
      
      if (!response.ok) {
        console.log('❌ Database not available');
        return null;
      }

      const result = await response.json();
      
      if (result.success && result.data.staff) {
        const staffMember = result.data.staff.find(
          staff => staff.email === email && staff.status === 'active'
        );

        if (staffMember) {
          console.log('✅ Staff member found in database:', staffMember.name);
          console.log('🔍 Staff role in database:', staffMember.role);
          console.log('🔍 Selected role for login:', selectedRole);
          console.log('🔍 Staff specialization:', staffMember.specialization);
          
          // Verify the selected role matches the actual role
          if (selectedRole && staffMember.role !== selectedRole) {
            console.log('❌ Role mismatch!');
            return { 
              error: `This account is registered as ${staffMember.role}, not ${selectedRole}. Please select the correct role.` 
            };
          }
          
          // For demo purposes, we'll accept any password for staff
          return {
            id: staffMember._id,
            name: staffMember.name,
            email: staffMember.email,
            role: staffMember.role,
            phone: staffMember.phone,
            department: staffMember.department,
            salary: staffMember.salary,
            joinDate: staffMember.joinDate,
            specialization: staffMember.specialization || 'general', // ✅ ADD SPECIALIZATION
            permissions: staffMember.permissions || [],
            isStaff: true
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error checking staff in database:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('🔄 AuthProvider initializing...');
    
    // Clear any existing problematic data
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        JSON.parse(currentUser);
      } catch (e) {
        console.log('❌ Invalid currentUser data, clearing...');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      }
    }

    // Initialize users
    initializeDefaultUsers();

    // Check for existing user session
    const userData = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');

    if (userData && token) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('🔄 Loaded user from storage:', parsedUser.role);
        setUser(parsedUser);
      } catch (error) {
        console.error('❌ Invalid user data:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      }
    }
    
    setLoading(false);
    console.log('✅ AuthProvider ready');
  }, []);

  const syncGuestForAdminPanel = (userData) => {
    try {
      if (!userData || userData.role !== 'guest') {
        return;
      }

      const storedGuests = JSON.parse(localStorage.getItem('hotelGuests') || '[]');
      const existingGuest = storedGuests.find((guest) => String(guest.id) === String(userData.id));

      if (existingGuest) {
        const updatedGuests = storedGuests.map((guest) => {
          if (String(guest.id) !== String(userData.id)) {
            return guest;
          }

          return {
            ...guest,
            name: userData.name || guest.name,
            email: userData.email || guest.email,
            phone: userData.phone || guest.phone || '',
            address: userData.address || guest.address || '',
            status: guest.status || 'active',
            loyaltyStatus: guest.loyaltyStatus || 'member',
            lastVisit: new Date().toISOString().split('T')[0]
          };
        });

        localStorage.setItem('hotelGuests', JSON.stringify(updatedGuests));
        return;
      }

      const newGuest = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        address: userData.address || '',
        city: '',
        country: '',
        totalBookings: 0,
        lastVisit: new Date().toISOString().split('T')[0],
        status: 'active',
        loyaltyStatus: 'member',
        registrationDate: new Date().toISOString()
      };

      localStorage.setItem('hotelGuests', JSON.stringify([...storedGuests, newGuest]));
    } catch (error) {
      console.error('Error syncing guest for admin panel:', error);
    }
  };

  const syncGuestIntoRegisteredUsers = (userData) => {
    try {
      if (!userData || userData.role !== 'guest') {
        return;
      }

      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const existing = users.find((u) => String(u.id) === String(userData.id) || u.email === userData.email);

      if (existing) {
        const updatedUsers = users.map((u) => {
          if (String(u.id) !== String(existing.id) && u.email !== userData.email) {
            return u;
          }

          return {
            ...u,
            id: u.id || userData.id,
            name: userData.name || u.name,
            email: userData.email || u.email,
            phone: userData.phone || u.phone || '',
            address: userData.address || u.address || '',
            role: 'guest',
            status: u.status || 'active',
            authProvider: userData.authProvider || u.authProvider || 'local',
            createdAt: u.createdAt || new Date().toISOString()
          };
        });

        localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
        return;
      }

      const newGuestUser = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        address: userData.address || '',
        role: 'guest',
        status: 'active',
        authProvider: userData.authProvider || 'local',
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('registeredUsers', JSON.stringify([...users, newGuestUser]));
    } catch (error) {
      console.error('Error syncing guest into registeredUsers:', error);
    }
  };

  const persistAuthenticatedUser = (authPayload) => {
    const userData = {
      id: authPayload._id,
      _id: authPayload._id,
      name: authPayload.name,
      email: authPayload.email,
      role: authPayload.role,
      phone: authPayload.phone || '',
      address: authPayload.address || '',
      profilePicture: authPayload.profilePicture || '',
      authProvider: authPayload.authProvider || 'local',
      lastLogin: new Date().toISOString()
    };

    if (authPayload.token) {
      localStorage.setItem('token', authPayload.token);
    }

    if (authPayload.refreshToken) {
      localStorage.setItem('refreshToken', authPayload.refreshToken);
    }

    localStorage.setItem('currentUser', JSON.stringify(userData));
    syncGuestForAdminPanel(userData);
    syncGuestIntoRegisteredUsers(userData);
    setUser(userData);

    return userData;
  };

  const login = async (credentials, selectedRole = null) => {
    try {
      console.log('🔐 LOGIN ATTEMPT:', credentials.email);
      console.log('🎯 Selected Role:', selectedRole);
      
      // Get all registered users from localStorage
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      console.log('📋 Total registered users in localStorage:', registeredUsers.length);
      
      // Find user by email and password in localStorage
      let foundUser = registeredUsers.find(
        user => user.email === credentials.email && user.password === credentials.password
      );

      console.log('🔍 USER FOUND IN LOCALSTORAGE:', foundUser);

      // If not found in localStorage, check database for staff
      if (!foundUser) {
        console.log('🔍 Checking database for staff member...');
        const staffResult = await checkStaffInDatabase(credentials.email, credentials.password, selectedRole);
        
        if (staffResult) {
          if (staffResult.error) {
            // Return role mismatch error
            return { success: false, error: staffResult.error };
          }
          foundUser = staffResult;
          console.log('✅ Staff user found in database:', staffResult);
        }
      }

      // Fallback to backend authentication (used for verified email/password guest accounts)
      if (!foundUser) {
        try {
          const backendResult = await authService.login(credentials);
          if (backendResult?.success && backendResult?.data) {
            if (selectedRole && backendResult.data.role !== selectedRole) {
              return {
                success: false,
                error: `This account is registered as ${backendResult.data.role}, not ${selectedRole}. Please select the correct role.`
              };
            }

            const authenticatedUser = persistAuthenticatedUser(backendResult.data);
            return {
              success: true,
              user: authenticatedUser,
              message: backendResult.message || 'Login successful.'
            };
          }
        } catch (backendError) {
          if (backendError?.response?.data?.message) {
            return {
              success: false,
              error: backendError.response.data.message
            };
          }
        }
      }

      if (foundUser) {
        // For localStorage users, verify role if selectedRole is provided
        if (selectedRole && foundUser.role !== selectedRole && !foundUser.isStaff) {
          console.log('❌ Role mismatch for localStorage user!');
          return { 
            success: false, 
            error: `This account is registered as ${foundUser.role}, not ${selectedRole}. Please select the correct role.` 
          };
        }

        // Create clean user object with current timestamp
        const userData = {
          id: foundUser.id || foundUser._id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
          phone: foundUser.phone || '',
          address: foundUser.address || '',
          department: foundUser.department || '',
          specialization: foundUser.specialization || 'general', // ✅ ADD SPECIALIZATION
          permissions: foundUser.permissions || [],
          isStaff: foundUser.isStaff || false,
          createdAt: foundUser.createdAt || new Date().toISOString(),
          lastLogin: new Date().toISOString() // ✅ ADD CURRENT TIMESTAMP
        };

        console.log('✅ USER DATA TO SAVE:', userData);

        // Verify role is set
        if (!userData.role) {
          console.error('🚨 CRITICAL ERROR: User role is missing!');
          return { success: false, error: 'User configuration error - role missing' };
        }

        // Save to state and localStorage
        const token = 'hotel-token-' + Date.now();
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // ✅ CRITICAL: Save staff-specific data for maintenance dashboard
        if (userData.role === 'maintenance') {
          localStorage.setItem('currentStaffId', userData.id);
          localStorage.setItem('currentStaffName', userData.name);
          localStorage.setItem('currentStaffRole', userData.role);
          localStorage.setItem('currentStaffSpecialization', userData.specialization);
          console.log('💾 Saved maintenance staff data:', {
            id: userData.id,
            name: userData.name,
            specialization: userData.specialization
          });
        }
        
        setUser(userData);
        
        // ✅ UPDATE LAST LOGIN IN DATABASE FOR STAFF
        if (foundUser.isStaff) {
          await updateStaffLastLogin(userData.id, userData.lastLogin);
        }
        
        console.log('🎉 LOGIN SUCCESSFUL!');
        console.log('   User:', userData.name);
        console.log('   Role:', userData.role);
        console.log('   Email:', userData.email);
        console.log('   Specialization:', userData.specialization);
        console.log('   Last Login:', userData.lastLogin);
        console.log('   Is Staff:', userData.isStaff);
        
        return { 
          success: true, 
          user: userData,
          message: `Welcome ${userData.name}! Redirecting to ${userData.role} dashboard...`
        };
      } else {
        console.log('❌ LOGIN FAILED: Invalid credentials');
        return { 
          success: false, 
          error: 'Invalid email or password. Please check your credentials.' 
        };
      }
    } catch (error) {
      console.error('💥 LOGIN ERROR:', error);
      return { 
        success: false, 
        error: 'Login failed. Please try again.' 
      };
    }
  };

  const loginWithGoogle = async (idToken) => {
    try {
      const result = await authService.googleLogin(idToken);

      if (!result?.success || !result?.data) {
        return {
          success: false,
          error: result?.message || 'Google sign-in failed.'
        };
      }

      const authenticatedUser = persistAuthenticatedUser(result.data);

      return {
        success: true,
        user: authenticatedUser,
        message: result.message || 'Signed in with Google successfully.'
      };
    } catch (error) {
      console.error('Google login failed:', error);
      return {
        success: false,
        error: error?.response?.data?.message || 'Google sign-in failed. Please try again.'
      };
    }
  };

  const register = async (userData) => {
    try {
      const payload = {
        ...userData,
        role: 'guest'
      };

      const result = await authService.register(payload);

      if (result?.success && result?.requiresEmailVerification) {
        return {
          success: true,
          requiresEmailVerification: true,
          email: result?.data?.email || userData.email,
          verificationCode: result?.data?.verificationCode,
          message: result?.message || 'Verification code sent. Please verify your email.'
        };
      }

      if (result?.success && result?.data) {
        const authenticatedUser = persistAuthenticatedUser(result.data);
        return { success: true, user: authenticatedUser };
      }

      return {
        success: false,
        error: result?.message || 'Registration failed. Please try again.'
      };

    } catch (error) {
      console.error('💥 REGISTRATION ERROR:', error);
      return {
        success: false,
        error: error?.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  };

  const verifyEmail = async (email, code) => {
    try {
      const result = await authService.verifyEmail({ email, code });

      if (!result?.success || !result?.data) {
        return {
          success: false,
          error: result?.message || 'Email verification failed.'
        };
      }

      const authenticatedUser = persistAuthenticatedUser(result.data);

      return {
        success: true,
        user: authenticatedUser,
        message: result.message || 'Email verified successfully.'
      };
    } catch (error) {
      return {
        success: false,
        error: error?.response?.data?.message || 'Email verification failed.'
      };
    }
  };

  const resendVerificationCode = async (email) => {
    try {
      const result = await authService.resendVerificationCode({ email });
      return {
        success: !!result?.success,
        verificationCode: result?.data?.verificationCode,
        message: result?.message || 'Verification code sent.'
      };
    } catch (error) {
      return {
        success: false,
        error: error?.response?.data?.message || 'Unable to resend verification code.'
      };
    }
  };

  const logout = () => {
    console.log('🚪 LOGGING OUT USER:', user?.name);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    
    // Also clear maintenance staff specific data
    localStorage.removeItem('currentStaffId');
    localStorage.removeItem('currentStaffName');
    localStorage.removeItem('currentStaffRole');
    localStorage.removeItem('currentStaffSpecialization');
    
    setUser(null);
  };

  // Helper function to debug users
  const debugUsers = () => {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    console.log('🔍 DEBUG - All registered users:');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.role}) - ${user.name}`);
    });
    
    // Also log current user
    console.log('🔍 Current logged in user:', user);
    
    return users;
  };

  const value = {
    user,
    login,
    register,
    verifyEmail,
    resendVerificationCode,
    loginWithGoogle,
    logout,
    loading,
    isAuthenticated: !!user,
    debugUsers
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
