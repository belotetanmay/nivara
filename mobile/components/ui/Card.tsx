import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'default' | 'glass' | 'outline';
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white border border-[#E5E1D8] shadow-sm rounded-xl p-5',
    glass: 'bg-white/90 border border-[#E5E1D8] shadow-sm rounded-xl p-5', // Fallback for native transparent cards
    outline: 'bg-transparent border border-[#E5E1D8] rounded-xl p-5',
  };

  return (
    <View
      className={`${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </View>
  );
};
export default Card;
