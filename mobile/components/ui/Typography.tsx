import React from 'react';
import { Text, TextProps } from 'react-native';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'detail';
  font?: 'sans' | 'serif';
  className?: string;
  children: React.ReactNode;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  font = 'sans',
  className = '',
  children,
  ...props
}) => {
  const variantStyles = {
    h1: 'text-3xl font-bold tracking-tight',
    h2: 'text-2xl font-bold tracking-tight',
    h3: 'text-lg font-semibold',
    body: 'text-base font-normal leading-6',
    caption: 'text-sm font-medium text-gray-500',
    detail: 'text-xs font-medium text-gray-400',
  };

  const fontStyles = {
    sans: 'font-sans text-[#0A2540]',
    serif: 'font-serif text-[#0A2540]',
  };

  const getResolvedFont = () => {
    if (variant === 'h1' || variant === 'h2' || variant === 'h3') {
      return fontStyles.serif;
    }
    return fontStyles[font];
  };

  return (
    <Text
      className={`${variantStyles[variant]} ${getResolvedFont()} ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
};
export default Typography;
