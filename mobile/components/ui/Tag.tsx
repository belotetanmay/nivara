import React from 'react';
import { View, Text } from 'react-native';

interface TagProps {
  label: string;
  className?: string;
}

export const Tag: React.FC<TagProps> = ({ label, className = '' }) => {
  return (
    <View className={`bg-[#FAF8F5] border border-[#E5E1D8] px-3 py-1 rounded-lg mr-2 mb-2 ${className}`}>
      <Text className="text-[#0A2540] text-xs font-medium">{label}</Text>
    </View>
  );
};
export default Tag;
