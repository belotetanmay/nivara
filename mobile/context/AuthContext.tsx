import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../services/api';

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        // Fetch current user details from /api/auth/me
        const response = await apiClient.get('/auth/me');
        if (response.data.authenticated) {
          setUser(response.data.user);
        } else {
          // Token expired or invalid
          await SecureStore.deleteItemAsync('auth_token');
          setUser(null);
        }
      }
    } catch (e) {
      console.warn('Failed to verify token on startup', e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token, user: userData } = response.data;
        await SecureStore.setItemAsync('auth_token', token);
        setUser(userData);
        return { success: true };
      }
      return { success: false, error: response.data.error || 'Login failed' };
    } catch (error: any) {
      const message = error.response?.data?.error || 'Server error, please try again';
      return { success: false, error: message };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/register', { name, email, password });
      if (response.data.success) {
        // Automatically login the user after registration
        const { token, user: userData } = response.data;
        await SecureStore.setItemAsync('auth_token', token);
        setUser(userData);
        return { success: true };
      }
      return { success: false, error: response.data.error || 'Registration failed' };
    } catch (error: any) {
      const message = error.response?.data?.error || 'Server error, please try again';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      setUser(null);
    } catch (e) {
      console.warn('Failed to remove auth token on logout', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
