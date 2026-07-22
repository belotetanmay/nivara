import '../services/polyfill';
import React from 'react';
import { LogBox } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../components/feedback/Toast';
import '../global.css';

LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="offline" options={{ gestureEnabled: false }} />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(app)" />
              </Stack>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
