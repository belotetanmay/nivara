import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface ChipProps {
  label: string;
  isSelected?: boolean;
  onPress?: () => void;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  isSelected = false,
  onPress,
  className = '',
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={`px-4 py-2 rounded-full border mr-2 mb-2 items-center justify-center ${
        isSelected
          ? 'border-[#2C5234] bg-[#2C5234]/10'
          : 'border-[#E5E1D8] bg-white'
      } ${className}`}
    >
      <Text
        className={`text-sm font-medium ${
          isSelected ? 'text-[#2C5234]' : 'text-[#0A2540]'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};
export default Chip;
