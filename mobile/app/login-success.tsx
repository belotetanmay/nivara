import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/feedback/Toast';

export default function LoginSuccessScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { googleMobileLogin } = useAuth();
  const { email } = useLocalSearchParams<{ email?: string; role?: string; token?: string }>();

  useEffect(() => {
    async function processLogin() {
      if (email) {
        try {
          const res = await googleMobileLogin({
            email: email,
            name: email.split('@')[0],
          });
          if (res.success && res.user) {
            show(`Signed in as ${res.user.email}`, 'success');
            if (res.user.role === 'VENDOR') {
              router.replace('/(app)/(vendor)/dashboard');
            } else {
              router.replace('/(app)/(customer)/explore');
            }
            return;
          }
        } catch (err) {
          console.error('[login-success error]:', err);
        }
      }
      router.replace('/(app)/(customer)/explore');
    }

    processLogin();
  }, [email]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#16A34A" />
      <Text style={styles.text}>Completing Google Sign-In...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    color: '#0F2D52',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
});
