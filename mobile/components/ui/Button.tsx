import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps, View } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  // Styles mapping matching the NIVARA brand and Stitch Design
  const variantStyles = {
    primary: 'bg-[#0A2540] border border-[#0A2540] active:bg-[#0A2540]/90',
    secondary: 'bg-[#2C5234] border border-[#2C5234] active:bg-[#2C5234]/90',
    outline: 'bg-transparent border border-[#E5E1D8] active:bg-gray-100',
    ghost: 'bg-transparent active:bg-gray-100',
    danger: 'bg-transparent border border-red-200 active:bg-red-50',
  };

  const textStyles = {
    primary: 'text-white font-semibold',
    secondary: 'text-white font-semibold',
    outline: 'text-[#0A2540] font-semibold',
    ghost: 'text-[#0A2540] font-semibold',
    danger: 'text-red-600 font-semibold',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 rounded-md text-sm',
    md: 'px-4 py-2.5 rounded-lg text-base',
    lg: 'px-6 py-3.5 rounded-xl text-lg',
  };

  const isBtnDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={isBtnDisabled}
      className={`flex-row items-center justify-center ${variantStyles[variant]} ${sizeStyles[size]} ${
        isBtnDisabled ? 'opacity-50' : 'opacity-100'
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'secondary' ? '#FFFFFF' : '#0A2540'}
        />
      ) : (
        <View className="flex-row items-center justify-center">
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Text className={`${textStyles[variant]} text-center`}>{title}</Text>
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};
