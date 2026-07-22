import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/feedback/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { login, appleLogin, googleMobileLogin } = useAuth();
  const { show } = useToast();
  const [loading, setLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    const result = await login(data.email, data.password);
    setLoading(false);

    if (result.success && result.user) {
      show('Successfully logged in!', 'success');
      const role = result.user.role;
      if (role === 'VENDOR') {
        router.replace('/(app)/(vendor)/dashboard');
      } else if (role === 'ADMIN') {
        router.replace('/(app)/(admin)/dashboard');
      } else {
        router.replace('/(app)/(customer)/explore');
      }
    } else {
      show(result.error || 'Invalid email or password', 'error');
    }
  };

  const handleAppleLogin = async () => {
    try {
      setAppleLoading(true);
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      
      let payload: any;
      if (isAvailable) {
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });

        const name = credential.fullName
          ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
          : undefined;

        payload = {
          identityToken: credential.identityToken,
          email: credential.email || undefined,
          name: name || undefined,
          userIdentifier: credential.user,
          role: 'CUSTOMER',
        };
      }

      const result = await appleLogin(payload);
      setAppleLoading(false);

      if (result.success && result.user) {
        show('Signed in with Apple successfully!', 'success');
        const role = result.user.role;
        if (role === 'VENDOR') {
          router.replace('/(app)/(vendor)/dashboard');
        } else {
          router.replace('/(app)/(customer)/explore');
        }
      } else {
        show(result.error || 'Apple Sign-In failed', 'error');
      }
    } catch (error: any) {
      setAppleLoading(false);
      if (error.code === 'ERR_REQUEST_CANCELED') {
        // User cancelled native Apple ID prompt
        return;
      }
      show(error.message || 'Apple Sign-In failed', 'error');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);

      const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID?.trim();
      const redirectUri = 'https://nivara-ten.vercel.app/api/auth/google/callback';

      if (clientId && !clientId.includes('GOOGLE_CLIENT_ID')) {
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=openid%20email%20profile&prompt=select_account`;
        const authSessionResult = await WebBrowser.openAuthSessionAsync(googleAuthUrl, redirectUri);

        if (authSessionResult.type === 'cancel' || authSessionResult.type === 'dismiss') {
          setGoogleLoading(false);
          return;
        }
      }

      const result = await googleMobileLogin();
      setGoogleLoading(false);

      if (result.success && result.user) {
        show('Signed in with Google successfully!', 'success');
        const role = result.user.role;
        if (role === 'VENDOR') {
          router.replace('/(app)/(vendor)/dashboard');
        } else {
          router.replace('/(app)/(customer)/explore');
        }
      } else {
        show(result.error || 'Google Sign-In failed', 'error');
      }
    } catch (error: any) {
      setGoogleLoading(false);
      show(error.message || 'Google Sign-In failed', 'error');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F5]">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 justify-center py-8">
          
          {/* Logo & Header */}
          <View className="items-center mb-8">
            <View style={styles.logoContainer} className="border border-[#E5E1D8] items-center justify-center rounded-full overflow-hidden mb-4">
              <Image
                source={require('../../assets/images/nivara_logo_transparent.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text className="text-[#0A2540] text-2xl font-bold tracking-[0.2em] font-serif uppercase">
              NIVARA
            </Text>
            <Text className="text-gray-400 text-xs tracking-widest uppercase mt-1">
              Wellness On Wheels
            </Text>
          </View>

          {/* Intro Headers */}
          <View className="mb-6">
            <Text className="text-[#0A2540] text-3xl font-semibold font-serif mb-2 text-center">
              Welcome Back
            </Text>
            <Text className="text-gray-500 text-base text-center leading-6">
              Enter your credentials to access your sanctuary.
            </Text>
          </View>

          {/* Form */}
          <View className="mb-4">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email Address"
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.email?.message}
                />
              )}
            />

            <View className="flex-row items-center justify-between mb-1 ml-0.5 mt-2">
              <Text className="text-[#0A2540] text-sm font-medium">Password</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                <Text className="text-gray-500 text-xs font-semibold">Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <PasswordInput
                  placeholder="••••••••"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                />
              )}
            />
          </View>

          {/* Action Buttons */}
          <View className="space-y-3">
            <Button
              title="Access Nivara Dashboard"
              onPress={handleSubmit(onSubmit)}
              isLoading={loading}
              className="w-full py-4 rounded-xl"
            />
            
            <View className="flex-row items-center justify-center py-3">
              <View className="flex-1 h-[1px] bg-[#E5E1D8]" />
              <Text className="text-gray-400 text-xs px-3 uppercase font-semibold">or</Text>
              <View className="flex-1 h-[1px] bg-[#E5E1D8]" />
            </View>

            {/* Apple Sign-In (iOS Exclusive) */}
            {Platform.OS === 'ios' && (
              <Button
                title="Continue with Apple"
                onPress={handleAppleLogin}
                isLoading={appleLoading}
                style={styles.appleBtn}
                className="w-full py-3.5 rounded-xl mb-2"
              />
            )}

            {/* Google Sign-In */}
            <Button
              title="Continue with Google"
              onPress={handleGoogleLogin}
              isLoading={googleLoading}
              variant="outline"
              className="w-full py-3.5 rounded-xl border-[#E5E1D8]"
            />
          </View>

          {/* Navigation link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-500 text-sm">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text className="text-[#2C5234] text-sm font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 60,
    height: 60,
  },
  logoContainer: {
    width: 96,
    height: 96,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  appleBtn: {
    backgroundColor: '#000000',
    borderColor: '#000000',
    borderRadius: 12,
  },
});
