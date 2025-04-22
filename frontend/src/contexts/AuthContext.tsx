import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';
import type { AuthContextType, User } from './types';

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Role helpers
  const hasRole = (role: string) => user?.role === role;
  const isAdmin = () => user?.role === 'admin';

  // Fetch current user on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setLoading(true);
      api
        .get('/auth/profile')
        .then(res => setUser(res.data.user))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    }
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return res.data.user;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Register function
  const register = async (email: string, password: string, name?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/register', { email, password, name });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return res.data.user;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    register,
    loading,
    error,
    hasRole,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
