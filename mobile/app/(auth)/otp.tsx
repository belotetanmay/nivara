import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '../../services/auth/authService';
import { useToast } from '../../components/feedback/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const otpSchema = z.object({
  code: z.string().min(1, 'Verification code is required').length(6, 'Verification code must be exactly 6 digits'),
});

type OtpFormValues = z.infer<typeof otpSchema>;

export default function OtpScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { email = 'your email', purpose = 'forgot-password' } = useLocalSearchParams<{ email: string; purpose: string }>();
  
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for Resend OTP code
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = async (data: OtpFormValues) => {
    setLoading(true);
    const result = await authService.verifyOtp(email, data.code);
    setLoading(false);

    if (result.success) {
      show('Code verified successfully!', 'success');
      
      if (purpose === 'forgot-password') {
        router.replace({
          pathname: '/(auth)/reset-password',
          params: { email, code: data.code },
        });
      } else {
        router.replace('/(auth)/email-verification');
      }
    } else {
      show(result.error || 'Verification failed', 'error');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setLoading(true);
    const result = await authService.resendOtp(email);
    setLoading(false);

    if (result.success) {
      show('A new code has been sent!', 'success');
      setTimer(30);
      setCanResend(false);
    } else {
      show(result.error || 'Failed to resend code', 'error');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F5]">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 justify-center py-8">
          
          {/* Logo brand */}
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-white/60 rounded-full border border-[#E5E1D8] items-center justify-center shadow-sm overflow-hidden mb-3">
              <Image
                source={require('../../assets/images/nivara_logo_transparent.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text className="text-[#0A2540] text-xl font-bold tracking-[0.2em] font-serif uppercase">NIVARA</Text>
          </View>

          {/* Heading */}
          <View className="mb-6">
            <Text className="text-[#0A2540] text-3xl font-semibold font-serif mb-2 text-center">
              Verification
            </Text>
            <Text className="text-gray-500 text-base text-center leading-6">
              Enter the 6-digit code sent to {'\n'}
              <Text className="font-semibold text-[#0A2540]">{email}</Text>
            </Text>
          </View>

          {/* Form */}
          <View className="mb-4">
            <Controller
              control={control}
              name="code"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="6-Digit Code"
                  placeholder="000000"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.code?.message}
                  style={styles.codeInput}
                />
              )}
            />
          </View>

          {/* Resend Link */}
          <View className="flex-row justify-center mb-8">
            {canResend ? (
              <TouchableOpacity onPress={handleResend}>
                <Text className="text-[#2C5234] text-sm font-semibold">Resend Code</Text>
              </TouchableOpacity>
            ) : (
              <Text className="text-gray-400 text-sm">
                Resend code in <Text className="font-semibold text-[#0A2540]">{timer}s</Text>
              </Text>
            )}
          </View>

          {/* Action button */}
          <View className="space-y-4">
            <Button
              title="Verify Code"
              onPress={handleSubmit(onSubmit)}
              isLoading={loading}
              className="w-full py-4 rounded-xl"
            />

            <Button
              title="Cancel"
              onPress={() => router.replace('/(auth)/login')}
              variant="outline"
              className="w-full py-3.5 rounded-xl border-[#E5E1D8]"
            />
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 40,
    height: 40,
  },
  codeInput: {
    textAlign: 'center',
    letterSpacing: 8,
    fontSize: 20,
    fontWeight: 'bold',
  },
});
