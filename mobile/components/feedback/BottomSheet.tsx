import React from 'react';
import { Modal as RNModal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { X } from 'lucide-react-native';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  children,
  className = '',
}) => {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay} className="bg-black/50 justify-end">
        {/* Tap outside to dismiss */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        
        <View className={`w-full bg-white rounded-t-3xl border-t border-[#E5E1D8] shadow-2xl p-6 pb-9 overflow-hidden ${className}`}>
          {/* Accent bar indicator */}
          <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-5" />

          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[#0A2540] text-xl font-bold flex-1" numberOfLines={1}>
              {title || ''}
            </Text>
            <TouchableOpacity onPress={onClose} className="p-1.5 rounded-full bg-gray-100">
              <X size={20} color="#0A2540" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View className="mb-4">{children}</View>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
});
export default BottomSheet;
