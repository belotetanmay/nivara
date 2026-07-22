import { apiClient, AUTH_TOKEN_KEY, USER_ROLE_KEY } from '../api/apiClient';
import * as SecureStore from 'expo-secure-store';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
  kycStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface AuthResponse {
  authenticated: boolean;
  token?: string;
  user?: User;
  error?: string;
}

// Function to extract JWT token from Set-Cookie or custom headers
const extractTokenFromHeaders = (responseHeaders: any): string | null => {
  if (!responseHeaders) return null;

  // Safe getter for Axios 1.x AxiosHeaders vs plain object
  const getHeader = (key: string) => {
    if (typeof responseHeaders.get === 'function') {
      return responseHeaders.get(key);
    }
    return responseHeaders[key] || responseHeaders[key.toLowerCase()] || responseHeaders[key.toUpperCase()];
  };

  // Try custom header first (ideal for React Native)
  const customToken = getHeader('x-auth-token') || getHeader('X-Auth-Token');
  if (customToken) return customToken;

  const setCookieHeader = getHeader('set-cookie') || getHeader('Set-Cookie');
  if (setCookieHeader) {
    const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    for (const cookie of cookies) {
      const match = cookie.match(/auth_token=([^;]+)/);
      if (match) {
        return decodeURIComponent(match[1]);
      }
    }
  }
  return null;
};

export const authService = {
  /**
   * Log in user using credentials and extract session cookie
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      console.log('[AuthService] Sending login request for:', email);
      const response = await apiClient.post('/auth/login', { email, password });
      const data = response.data;

      console.log('[AuthService] Login Response Data:', JSON.stringify(data));
      console.log('[AuthService] Login Response Headers:', JSON.stringify(response.headers));

      // Extract token from Set-Cookie header if not in JSON body
      const token = data.token || extractTokenFromHeaders(response.headers);
      console.log('[AuthService] Extracted Token:', token ? token.substring(0, 15) + '...' : 'null');

      if (token) {
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
        if (data.user?.role) {
          await SecureStore.setItemAsync(USER_ROLE_KEY, data.user.role);
        }
      }

      return {
        authenticated: !!token || data.success,
        token: token || undefined,
        user: data.user,
      };
    } catch (error: any) {
      console.error('[Login API Request Error Details]:', {
        message: error.message,
        code: error.code,
        baseURL: error.config?.baseURL,
        url: error.config?.url,
        headers: error.config?.headers,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
      });
      return {
        authenticated: false,
        error: error.response?.data?.error || error.message || 'Login failed',
      };
    }
  },

  /**
   * Register a new user
   */
  register: async (payload: any): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/register', payload);
      const data = response.data;

      const token = data.token || extractTokenFromHeaders(response.headers);

      if (token) {
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
        if (data.user?.role) {
          await SecureStore.setItemAsync(USER_ROLE_KEY, data.user.role);
        }
      }

      return {
        authenticated: !!token || data.success,
        token: token || undefined,
        user: data.user,
      };
    } catch (error: any) {
      return {
        authenticated: false,
        error: error.response?.data?.error || error.message || 'Registration failed',
      };
    }
  },

  /**
   * Google OAuth Mobile Authentication
   */
  googleMobileLogin: async (payload: { idToken?: string; email: string; name?: string; role?: string }): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/google/mobile', payload);
      const data = response.data;
      const token = data.token || extractTokenFromHeaders(response.headers);

      if (token) {
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
        if (data.user?.role) {
          await SecureStore.setItemAsync(USER_ROLE_KEY, data.user.role);
        }
      }

      return {
        authenticated: !!token || data.success,
        token: token || undefined,
        user: data.user,
      };
    } catch (error: any) {
      return {
        authenticated: false,
        error: error.response?.data?.error || error.message || 'Google login failed',
      };
    }
  },

  /**
   * Apple Sign-In Authentication (iOS)
   */
  appleLogin: async (payload: { identityToken?: string; email?: string; name?: string; userIdentifier?: string; role?: string }): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/apple', payload);
      const data = response.data;
      const token = data.token || extractTokenFromHeaders(response.headers);

      if (token) {
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
        if (data.user?.role) {
          await SecureStore.setItemAsync(USER_ROLE_KEY, data.user.role);
        }
      }

      return {
        authenticated: !!token || data.success,
        token: token || undefined,
        user: data.user,
      };
    } catch (error: any) {
      return {
        authenticated: false,
        error: error.response?.data?.error || error.message || 'Apple Sign-In failed',
      };
    }
  },

  /**
   * Log out current user and clear local storage tokens
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout').catch(() => {});
    } finally {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_ROLE_KEY);
    }
  },

  /**
   * Fetch current session profile details
   */
  getCurrentUser: async (): Promise<AuthResponse> => {
    try {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      if (!token) {
        return { authenticated: false };
      }
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        return { authenticated: false };
      }
      return {
        authenticated: false,
        error: error.response?.data?.error || error.message || 'Fetch profile failed',
      };
    }
  },

  /**
   * Retrieve cached user role from SecureStore
   */
  getCachedRole: async (): Promise<string | null> => {
    return await SecureStore.getItemAsync(USER_ROLE_KEY);
  },

  /**
   * Trigger recovery email for forgot password
   */
  forgotPassword: async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to send recovery code',
      };
    }
  },

  /**
   * Verify reset OTP code
   */
  verifyOtp: async (email: string, code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.post('/auth/verify-otp', { email, code });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Verification failed',
      };
    }
  },

  /**
   * Reset user password
   */
  resetPassword: async (email: string, code: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.post('/auth/reset-password', { email, code, password });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Reset password failed',
      };
    }
  },

  /**
   * Resend OTP
   */
  resendOtp: async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Resend code failed',
      };
    }
  },
};
