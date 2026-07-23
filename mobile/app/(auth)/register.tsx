import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/feedback/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { FormContainer } from '../../components/layout/FormContainer';
import { User, Store } from 'lucide-react-native';

const registerSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  phone: z.string().min(1, 'Phone number is required').min(10, 'Please enter a valid phone number'),
  password: z.string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .refine((val) => /[a-zA-Z]/.test(val) && /[0-9]/.test(val), {
      message: 'Must contain both letters and numbers',
    }),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
  role: z.enum(['CUSTOMER', 'VENDOR']),
  businessName: z.string().optional(),
  bio: z.string().optional(),
  payoutDetails: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => {
  if (data.role === 'VENDOR') {
    return !!data.businessName && data.businessName.trim().length > 0;
  }
  return true;
}, {
  message: 'Business name is required for wellness partners',
  path: ['businessName'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const { show } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'CUSTOMER',
      businessName: '',
      bio: '',
      payoutDetails: '',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    const result = await register({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: data.role,
      businessName: data.role === 'VENDOR' ? data.businessName : undefined,
      bio: data.role === 'VENDOR' ? data.bio : undefined,
      payoutDetails: data.role === 'VENDOR' ? data.payoutDetails : undefined,
    });
    setLoading(false);

    if (result.success) {
      show('Account created successfully!', 'success');
      router.replace('/');
    } else {
      show(result.error || 'Registration failed', 'error');
    }
  };

  return (
    <FormContainer>
      <View className="flex-1 px-6 justify-center py-8">
          
          {/* Logo brand */}
          <View className="items-center mb-6">
            <View style={styles.logoContainer} className="border border-[#E5E1D8] items-center justify-center rounded-full overflow-hidden mb-3">
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
              Create Account
            </Text>
            <Text className="text-gray-500 text-base text-center">
              Join the Nivara wellness sanctuary.
            </Text>
          </View>

          {/* Role Selection (Stitch Toggle Cards) */}
          <View className="mb-6">
            <Text className="text-[#0A2540] text-sm font-medium mb-3 ml-0.5">Select Account Type</Text>
            <View className="flex-row space-x-4">
              {/* Customer Option */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setValue('role', 'CUSTOMER')}
                style={[
                  styles.roleCard,
                  selectedRole === 'CUSTOMER' && styles.roleCardActive
                ]}
                className="flex-1"
              >
                <User size={24} color={selectedRole === 'CUSTOMER' ? '#2C5234' : '#0A2540'} />
                <Text style={[styles.roleLabel, selectedRole === 'CUSTOMER' && styles.roleLabelActive]} className="mt-2 font-serif">
                  Customer
                </Text>
                <Text className="text-gray-400 text-[10px] text-center mt-1">
                  Book spaces & sessions
                </Text>
              </TouchableOpacity>

              <View className="w-3" />

              {/* Vendor Option */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setValue('role', 'VENDOR')}
                style={[
                  styles.roleCard,
                  selectedRole === 'VENDOR' && styles.roleCardActive
                ]}
                className="flex-1"
              >
                <Store size={24} color={selectedRole === 'VENDOR' ? '#2C5234' : '#0A2540'} />
                <Text style={[styles.roleLabel, selectedRole === 'VENDOR' && styles.roleLabelActive]} className="mt-2 font-serif">
                  Wellness Partner
                </Text>
                <Text className="text-gray-400 text-[10px] text-center mt-1">
                  Manage vans & services
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Fields */}
          <View className="mb-4">
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Full Name"
                  placeholder="Evelyn Carter"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email Address"
                  placeholder="evelyn@domain.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Phone Number"
                  placeholder="9876543210"
                  keyboardType="phone-pad"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.phone?.message}
                />
              )}
            />

            {selectedRole === 'VENDOR' && (
              <View className="border-t border-[#E5E1D8] pt-4 mt-2 mb-4">
                <Text className="text-[#2C5234] text-sm font-semibold mb-3 font-serif">
                  Wellness Partner Profile
                </Text>
                
                <Controller
                  control={control}
                  name="businessName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Business Name"
                      placeholder="Serenity Space Co."
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={errors.businessName?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="bio"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Biography / Business Description"
                      placeholder="Tell customers about your wellness offerings..."
                      multiline
                      numberOfLines={3}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={errors.bio?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="payoutDetails"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Payout / Bank Account Details"
                      placeholder="Account number or UPI ID"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={errors.payoutDetails?.message}
                    />
                  )}
                />
              </View>
            )}

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
          <View className="space-y-4 mt-2">
            <Button
              title="Create Account"
              onPress={handleSubmit(onSubmit)}
              isLoading={loading}
              className="w-full py-4 rounded-xl"
            />
          </View>

          {/* Navigation link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-500 text-sm">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text className="text-[#2C5234] text-sm font-semibold">Login</Text>
            </TouchableOpacity>
          </View>

        </View>
    </FormContainer>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 40,
    height: 40,
  },
  logoContainer: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  roleCard: {
    backgroundColor: '#white',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCardActive: {
    borderColor: '#2C5234',
    backgroundColor: '#2C52340C', // 5% opacity
    borderWidth: 2,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0A2540',
  },
  roleLabelActive: {
    color: '#2C5234',
  },
});
