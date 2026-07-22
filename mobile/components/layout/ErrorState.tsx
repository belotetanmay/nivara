import React from 'react';
import { View, Text } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Button } from '../ui/Button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something Went Wrong',
  description = 'An error occurred while loading this section. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <View className={`items-center justify-center p-8 bg-red-50/50 border border-red-200 rounded-2xl ${className}`}>
      <View className="mb-4 bg-red-100 p-3 rounded-full">
        <AlertTriangle size={32} color="#DC2626" />
      </View>
      <Text className="text-[#0A2540] text-lg font-bold text-center mb-1.5">
        {title}
      </Text>
      <Text className="text-gray-500 text-sm text-center mb-5 max-w-[240px]">
        {description}
      </Text>
      {onRetry && (
        <Button
          title="Retry"
          onPress={onRetry}
          variant="outline"
          size="sm"
          className="border-red-200"
        />
      )}
    </View>
  );
};
export default ErrorState;
