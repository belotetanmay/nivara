import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Image, Text, Animated, StyleSheet } from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useGlobalStore } from '../store/globalStore';

export default function EntryPoint() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isOnboarded } = useGlobalStore();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  useEffect(() => {
    // Wait for both auth loading and navigation context to be ready
    if (isLoading || !rootNavigationState?.key) return;

    const timer = setTimeout(() => {
      // Check onboarding status first
      if (!isOnboarded) {
        router.replace('/(auth)/onboarding');
        return;
      }

      // Auth redirect
      if (!isAuthenticated) {
        router.replace('/(auth)/welcome');
      } else {
        const role = user?.role;
        console.log('[Splash EntryPoint Navigation Decision]: User role is', role);
        if (role === 'VENDOR') {
          router.replace('/(app)/(vendor)/dashboard');
        } else if (role === 'ADMIN') {
          router.replace('/(app)/(admin)/dashboard');
        } else {
          router.replace('/(app)/(customer)/explore');
        }
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, isOnboarded, user, router, rootNavigationState]);

  return (
    <View className="flex-1 bg-[#FAF8F5] justify-center items-center px-6">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          alignItems: 'center',
        }}
      >
        <Image
          source={require('../assets/images/nivara_logo_transparent.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text className="text-[#0A2540] text-xl font-bold tracking-[0.25em] text-center mt-4 font-serif uppercase">
          NIVARA
        </Text>
        <Text className="text-[#2C5234] text-xs font-semibold tracking-wider text-center mt-2 font-sans uppercase">
          Wellness Sanctuary on Wheels
        </Text>
      </Animated.View>

      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color="#2C5234" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 140,
    height: 140,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 60,
  },
});
