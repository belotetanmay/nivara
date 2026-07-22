import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F5]">
      {/* Brand Identity Header */}
      <View className="flex-row justify-center mt-6">
        <Text className="text-[#0A2540] text-lg font-bold tracking-[0.25em] font-serif uppercase">
          NIVARA
        </Text>
      </View>

      {/* Main Content Illustration/Logo Container */}
      <View className="flex-1 justify-center items-center px-8">
        <View style={styles.logoContainer} className="border border-[#E5E1D8] items-center justify-center rounded-full overflow-hidden mb-12">
          <Image
            source={require('../../assets/images/nivara_logo_transparent.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text className="text-[#0A2540] text-3xl font-bold font-serif text-center mb-4">
          Wellness Elevated
        </Text>
        
        <Text className="text-gray-500 text-base text-center leading-6 px-4 font-sans mb-8">
          Step into a luxury physical workspace and private therapy pod tailored directly to you, delivered right to your location.
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="px-6 pb-12 space-y-4">
        <Button
          title="Sign In"
          variant="primary"
          onPress={() => router.push('/(auth)/login')}
          className="w-full py-4 rounded-xl"
        />
        
        <View className="h-2" />

        <Button
          title="Create Account"
          variant="outline"
          onPress={() => router.push('/(auth)/register')}
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
  logoContainer: {
    width: 224,
    height: 224,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
});
