import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  className = '',
}) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.8,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 0.3,
        duration: 900,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(pulse).start();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={{
        width: width as any,
        height: height as any,
        borderRadius,
        opacity: pulseAnim,
      }}
      className={`bg-gray-200 ${className}`}
    />
  );
};
export default LoadingSkeleton;
