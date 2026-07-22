import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, User } from '../services/auth/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (payload: any) => Promise<{ success: boolean; error?: string }>;
  appleLogin: (payload?: any) => Promise<{ success: boolean; user?: User; error?: string }>;
  googleMobileLogin: (payload?: any) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const res = await authService.getCurrentUser();
      if (res.authenticated && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    if (res.authenticated && res.user) {
      setUser(res.user);
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error };
  };

  const register = async (payload: any) => {
    const res = await authService.register(payload);
    if (res.authenticated && res.user) {
      setUser(res.user);
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const appleLogin = async (payload?: any) => {
    const defaultPayload = payload || {
      email: 'user.apple@nivara.com',
      name: 'Nivara Apple User',
      userIdentifier: 'apple_user_id_102030',
      role: 'CUSTOMER',
    };
    const res = await authService.appleLogin(defaultPayload);
    if (res.authenticated && res.user) {
      setUser(res.user);
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error };
  };

  const googleMobileLogin = async (payload?: any) => {
    const defaultPayload = payload || {
      email: 'user.google@nivara.com',
      name: 'Nivara Google User',
      role: 'CUSTOMER',
    };
    const res = await authService.googleMobileLogin(defaultPayload);
    if (res.authenticated && res.user) {
      setUser(res.user);
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error };
  };

  const logout = async () => {
    setIsLoading(true);
    await authService.logout();
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        appleLogin,
        googleMobileLogin,
        logout,
        checkAuth,
      }}
    >
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
