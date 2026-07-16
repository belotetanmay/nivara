import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// NOTE: Physical mobile devices cannot connect to 'localhost'.
// For Android Emulator, 10.0.2.2 points to your computer's localhost.
// For iOS Simulator, 'localhost' points to your computer's localhost.
// If testing on a physical device, replace this with your computer's local IP address (e.g., 'http://192.168.1.XX:3000/api').
const getBaseUrl = () => {
  return 'http://192.168.1.93:3000/api';
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Automatically inject JWT token into authorization header before every request
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Could not read auth token from SecureStore', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
