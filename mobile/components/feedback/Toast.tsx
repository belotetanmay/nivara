import React, { createContext, useContext, useState, useEffect } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react-native';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
  show: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [opacity] = useState(new Animated.Value(0));

  const show = (message: string, type: ToastType = 'info', duration: number = 3000) => {
    setToast({ message, type });
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(duration),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(null);
    });
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color="#065F46" />;
      case 'error':
        return <AlertCircle size={18} color="#991B1B" />;
      default:
        return <Info size={18} color="#1E3A8A" />;
    }
  };

  const getBgColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border border-emerald-250';
      case 'error':
        return 'bg-red-50 border border-red-250';
      default:
        return 'bg-blue-50 border border-blue-250';
    }
  };

  const getTextColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'text-emerald-800';
      case 'error':
        return 'text-red-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.container,
            {
              opacity,
              transform: [
                {
                  translateY: opacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
          className={`px-4 py-3 rounded-xl flex-row items-center shadow-md mx-4 ${getBgColor(
            toast.type
          )}`}
        >
          <View className="mr-2.5">{getIcon(toast.type)}</View>
          <Text className={`text-sm font-medium flex-1 ${getTextColor(toast.type)}`}>
            {toast.message}
          </Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 10,
    right: 10,
    zIndex: 9999,
  },
});

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
