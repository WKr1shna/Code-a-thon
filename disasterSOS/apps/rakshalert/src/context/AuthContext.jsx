import React, { createContext, useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check storage on load
    const storedUser = localStorage.getItem('rakshalert_user');
    const storedToken = localStorage.getItem('rakshalert_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role = 'citizen') => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { user: userData, accessToken } = response.data.data;
        
        setUser(userData);
        localStorage.setItem('rakshalert_user', JSON.stringify(userData));
        localStorage.setItem('rakshalert_token', accessToken);
        
        toast.success('Successfully logged in!');
        return userData;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rakshalert_user');
    localStorage.removeItem('rakshalert_token');
    toast.success('Logged out securely.');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        toast.error('Please login to access this page.');
      } else if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        toast.error('You do not have permission to access this portal.');
      }
    }
  }, [user, loading, allowedRoles]);

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={(user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') ? '/admin' : '/dashboard'} replace />;
  }

  return children;
};
