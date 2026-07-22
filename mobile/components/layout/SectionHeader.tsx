import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionLabel,
  onActionPress,
  className = '',
}) => {
  return (
    <View className={`flex-row items-center justify-between py-2 mb-3.5 ${className}`}>
      <Text className="text-[#0A2540] text-lg font-bold tracking-tight">
        {title}
      </Text>
      {actionLabel && onActionPress && (
        <TouchableOpacity activeOpacity={0.7} onPress={onActionPress}>
          <Text className="text-[#2C5234] text-sm font-semibold">
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
export default SectionHeader;
