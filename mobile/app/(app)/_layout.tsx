import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function AppLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/(auth)/login');
      return;
    }

    // Role-based route protection guard
    if (user) {
      const activeGroup = segments[1]; // segments looks like ['(app)', '(customer)', 'explore']
      const role = user.role;

      if (activeGroup === '(customer)' && role !== 'CUSTOMER') {
        console.warn(`[Route Protection]: User role is ${role}, preventing access to (customer) stack.`);
        if (role === 'VENDOR') {
          router.replace('/(app)/(vendor)/dashboard');
        } else if (role === 'ADMIN') {
          router.replace('/(app)/(admin)/dashboard');
        }
      } else if (activeGroup === '(vendor)' && role !== 'VENDOR') {
        console.warn(`[Route Protection]: User role is ${role}, preventing access to (vendor) stack.`);
        if (role === 'CUSTOMER') {
          router.replace('/(app)/(customer)/explore');
        } else if (role === 'ADMIN') {
          router.replace('/(app)/(admin)/dashboard');
        }
      } else if (activeGroup === '(admin)' && role !== 'ADMIN') {
        console.warn(`[Route Protection]: User role is ${role}, preventing access to (admin) stack.`);
        if (role === 'CUSTOMER') {
          router.replace('/(app)/(customer)/explore');
        } else if (role === 'VENDOR') {
          router.replace('/(app)/(vendor)/dashboard');
        }
      }
    }
  }, [isAuthenticated, isLoading, user, segments, router]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#FAF8F5] justify-center items-center">
        <ActivityIndicator size="large" color="#0A2540" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(customer)" />
      <Stack.Screen name="(vendor)" />
      <Stack.Screen name="(admin)" />
    </Stack>
  );
}
