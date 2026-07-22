import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WifiOff } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Button } from '../components/ui/Button';
import { useNetwork } from '../contexts/NetworkContext';
import { useToast } from '../components/feedback/Toast';

export default function OfflineScreen() {
  const router = useRouter();
  const { isConnected } = useNetwork();
  const { show } = useToast();

  const handleRetry = () => {
    if (isConnected) {
      show('Back online!', 'success');
      router.replace('/');
    } else {
      show('Still offline. Please check your connection.', 'error');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F5] justify-center px-6">
      <View className="items-center p-8 bg-white border border-[#E5E1D8] rounded-2xl shadow-sm">
        <View className="mb-4 bg-red-50 p-4 rounded-full">
          <WifiOff size={40} color="#DC2626" />
        </View>
        
        <Text className="text-[#0A2540] text-2xl font-bold text-center mb-2">
          No Internet Connection
        </Text>
        
        <Text className="text-gray-500 text-sm text-center mb-8 max-w-[260px]">
          We couldn't connect to our services. Check your connection or Wi-Fi settings and try again.
        </Text>
        
        <Button
          title="Retry Connection"
          onPress={handleRetry}
          className="w-full"
        />
      </View>
    </SafeAreaView>
  );
}
