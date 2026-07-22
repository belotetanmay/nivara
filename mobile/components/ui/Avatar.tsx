import React from 'react';
import { View, Text, Image } from 'react-native';

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name = 'User',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'w-8 h-8 rounded-full',
    md: 'w-12 h-12 rounded-full',
    lg: 'w-16 h-16 rounded-full',
    xl: 'w-24 h-24 rounded-full',
  };

  const textStyles = {
    sm: 'text-xs font-semibold',
    md: 'text-base font-semibold',
    lg: 'text-xl font-bold',
    xl: 'text-3xl font-bold',
  };

  const getInitials = (fullName: string) => {
    const parts = fullName.split(' ');
    const initials = parts.map((p) => p[0]).join('');
    return initials.substring(0, 2).toUpperCase();
  };

  return (
    <View className={`justify-center items-center overflow-hidden bg-gray-200 border border-[#E5E1D8] ${sizeStyles[size]} ${className}`}>
      {source ? (
        <Image
          source={{ uri: source }}
          className="w-full h-full"
          resizeMode="cover"
        />
      ) : (
        <Text className={`text-[#0A2540] ${textStyles[size]}`}>
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
};
export default Avatar;
