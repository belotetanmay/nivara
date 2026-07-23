import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://nivara-ten.vercel.app/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds
});

// Storage keys
export const AUTH_TOKEN_KEY = 'nivara_auth_token';
export const USER_ROLE_KEY = 'nivara_user_role';

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      console.log(`[Axios Outgoing Request]: ${config.method?.toUpperCase()} ${config.baseURL || ''}${config.url || ''}`);
      console.log(`[Axios Outgoing Token]: ${token ? token.substring(0, 15) + '...' : 'null'}`);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`[Axios Outgoing Header]: Authorization: Bearer ${token.substring(0, 15)}...`);
      } else {
        console.log(`[Axios Outgoing Header]: No Authorization Header Added`);
      }
    } catch (error) {
      console.error('Error reading auth token from SecureStore:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    console.error(`[Axios Response Error]: URL=${error.config?.url || ''} STATUS=${error.response?.status || 'no status'} BODY=${JSON.stringify(error.response?.data || {})}`);
    const originalRequest = error.config;
    
    // Global API errors handling (e.g., unauthorized)
    if (error.response?.status === 401) {
      console.warn('Unauthorized request. Clearing auth credentials.');
      try {
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_ROLE_KEY);
        // Dispatch custom event or callback if needed for navigation redirect
      } catch (err) {
        console.error('Failed to clear expired auth tokens:', err);
      }
    }

    return Promise.reject(error);
  }
);
