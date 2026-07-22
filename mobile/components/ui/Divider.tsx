import React from 'react';
import { View, ViewProps } from 'react-native';

interface DividerProps extends ViewProps {
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ className = '', ...props }) => {
  return (
    <View
      className={`h-[1px] w-full bg-[#E5E1D8] ${className}`}
      {...props}
    />
  );
};
export default Divider;
