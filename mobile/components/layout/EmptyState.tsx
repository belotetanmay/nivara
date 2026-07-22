import React from 'react';
import { View, Text } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onActionPress?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Found',
  description = 'There is currently no information available here.',
  icon,
  actionLabel,
  onActionPress,
  className = '',
}) => {
  return (
    <View className={`items-center justify-center p-8 bg-white border border-[#E5E1D8] rounded-2xl shadow-sm ${className}`}>
      <View className="mb-4 bg-gray-100 p-4 rounded-full">
        {icon || <Inbox size={32} color="#0A2540" />}
      </View>
      <Text className="text-[#0A2540] text-lg font-bold text-center mb-1.5">
        {title}
      </Text>
      <Text className="text-gray-500 text-sm text-center mb-5 max-w-[240px]">
        {description}
      </Text>
      {actionLabel && onActionPress && (
        <Button title={actionLabel} onPress={onActionPress} size="sm" />
      )}
    </View>
  );
};
export default EmptyState;
