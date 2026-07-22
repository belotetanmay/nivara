import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '../../components/ui/Button';

export default function AccountVerificationScreen() {
  const router = useRouter();
  const { kycStatus = 'PENDING' } = useLocalSearchParams<{ kycStatus: string }>();

  const getStatusContent = () => {
    switch (kycStatus) {
      case 'PENDING':
        return {
          title: 'KYC Under Review',
          subtitle: 'Our administrators are verifying your business documents. We will notify you as soon as your account is approved.',
          buttonText: 'Check Again / Refresh',
          action: () => router.replace('/'),
        };
      case 'REJECTED':
        return {
          title: 'Verification Rejected',
          subtitle: 'Unfortunately, your documents could not be verified. Please log into the web platform to resubmit your details.',
          buttonText: 'Sign Out',
          action: () => {
            router.replace('/(auth)/login');
          },
        };
      default:
        return {
          title: 'Account Verified',
          subtitle: 'Your identity and business credentials have been approved. Welcome to Nivara!',
          buttonText: 'Enter Sanctuary',
          action: () => router.replace('/'),
        };
    }
  };

  const content = getStatusContent();

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F5]">
      {/* Brand Identity Header */}
      <View className="flex-row justify-center mt-6">
        <Text className="text-[#0A2540] text-lg font-bold tracking-[0.25em] font-serif uppercase">
          NIVARA
        </Text>
      </View>

      {/* Main Container */}
      <View className="flex-1 justify-center items-center px-8">
        <View className="w-56 h-56 bg-white/60 rounded-full border border-[#E5E1D8] items-center justify-center shadow-sm overflow-hidden mb-12">
          <Image
            source={require('../../assets/images/nivara_logo_transparent.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text className="text-[#0A2540] text-3xl font-bold font-serif text-center mb-4">
          {content.title}
        </Text>
        
        <Text className="text-gray-500 text-base text-center leading-6 px-4 font-sans mb-8">
          {content.subtitle}
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="px-6 pb-12">
        <Button
          title={content.buttonText}
          variant="primary"
          onPress={content.action}
          className="w-full py-4 rounded-xl"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 140,
    height: 140,
  },
});
