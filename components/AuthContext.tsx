'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
  kycStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  vendorProfile?: {
    id: string;
    businessName: string;
    bio: string;
    verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    payoutDetails: string;
    rejectionReason?: string | null;
  } | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
        if (res.status === 401) {
          await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
        }
      }
    } catch (e) {
      console.error('Error fetching user auth state:', e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        
        // Redirect based on role
        if (data.user.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else if (data.user.role === 'VENDOR') {
          router.push('/vendor/dashboard');
        } else {
          router.push('/customer/dashboard');
        }
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to login' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'An error occurred during login' };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.href = '/login';
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
