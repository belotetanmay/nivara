import React, { useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '../../services/auth/authService';
import { useToast } from '../../components/feedback/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { show } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setLoading(true);
    const result = await authService.forgotPassword(data.email);
    setLoading(false);

    if (result.success) {
      show('Recovery code sent to your email!', 'success');
      // Pass email to OTP screen via query params
      router.push({
        pathname: '/(auth)/otp',
        params: { email: data.email, purpose: 'forgot-password' },
      });
    } else {
      show(result.error || 'Failed to send recovery code', 'error');
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
              Recovery
            </Text>
            <Text className="text-gray-500 text-base text-center leading-6">
              Enter your email address to receive your 6-digit recovery code.
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
          </View>

          {/* Action button */}
          <View className="space-y-4">
            <Button
              title="Send Verification Code"
              onPress={handleSubmit(onSubmit)}
              isLoading={loading}
              className="w-full py-4 rounded-xl"
            />

            <Button
              title="Back to Login"
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
});
