import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  className = '',
}) => {
  const variantStyles = {
    primary: 'bg-[#0A2540]/10 text-[#0A2540]',
    secondary: 'bg-[#2C5234]/10 text-[#2C5234]',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-850',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <View
      className={`px-2.5 py-1 rounded-full items-center justify-center self-start ${
        variantStyles[variant].split(' ')[0]
      } ${className}`}
    >
      <Text
        className={`text-xs font-semibold ${
          variantStyles[variant].split(' ')[1]
        }`}
      >
        {label}
      </Text>
    </View>
  );
};
export default Badge;
