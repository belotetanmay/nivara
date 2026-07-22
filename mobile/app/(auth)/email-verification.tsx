import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';

export default function EmailVerificationScreen() {
  const router = useRouter();

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
          Check Your Inbox
        </Text>
        
        <Text className="text-gray-500 text-base text-center leading-6 px-4 font-sans mb-8">
          A verification link has been sent to your email. Click the link inside the mail to verify your account and access your sanctuary.
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="px-6 pb-12">
        <Button
          title="Proceed to Sign In"
          variant="primary"
          onPress={() => router.replace('/(auth)/login')}
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
