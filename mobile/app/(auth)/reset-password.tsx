import React, { useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '../../services/auth/authService';
import { useToast } from '../../components/feedback/Toast';
import { Button } from '../../components/ui/Button';
import { PasswordInput } from '../../components/ui/PasswordInput';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .refine((val) => /[a-zA-Z]/.test(val) && /[0-9]/.test(val), {
      message: 'Must contain both letters and numbers',
    }),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { email = '', code = '' } = useLocalSearchParams<{ email: string; code: string }>();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    setLoading(true);
    const result = await authService.resetPassword(email, code, data.password);
    setLoading(false);

    if (result.success) {
      show('Password reset successfully! Please log in.', 'success');
      router.replace('/(auth)/login');
    } else {
      show(result.error || 'Failed to reset password', 'error');
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
              New Password
            </Text>
            <Text className="text-gray-500 text-base text-center leading-6">
              Create a secure new password for your account.
            </Text>
          </View>

          {/* Form */}
          <View className="mb-4">
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <PasswordInput
                  label="Password"
                  placeholder="••••••••"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <PasswordInput
                  label="Confirm Password"
                  placeholder="••••••••"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.confirmPassword?.message}
                />
              )}
            />
          </View>

          {/* Action button */}
          <View className="space-y-4">
            <Button
              title="Reset Password"
              onPress={handleSubmit(onSubmit)}
              isLoading={loading}
              className="w-full py-4 rounded-xl"
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
