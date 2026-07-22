import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoaderProps {
  message?: string;
  overlay?: boolean;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  message,
  overlay = false,
  className = '',
}) => {
  const containerStyle = overlay
    ? 'absolute inset-0 bg-white/70 justify-center items-center z-50'
    : 'justify-center items-center p-8';

  return (
    <View className={`${containerStyle} ${className}`}>
      <ActivityIndicator size="large" color="#0A2540" />
      {message && (
        <Text className="text-[#0A2540] text-sm font-medium mt-3.5 text-center">
          {message}
        </Text>
      )}
    </View>
  );
};
export default Loader;
