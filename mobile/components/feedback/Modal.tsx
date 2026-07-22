import React from 'react';
import { Modal as RNModal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  footer,
  className = '',
}) => {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay} className="bg-black/50 justify-center items-center px-4">
        <View className={`w-full max-w-sm bg-white rounded-2xl border border-[#E5E1D8] shadow-2xl p-5 overflow-hidden ${className}`}>
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[#0A2540] text-lg font-bold flex-1" numberOfLines={1}>
              {title || ''}
            </Text>
            <TouchableOpacity onPress={onClose} className="p-1 rounded-full bg-gray-150">
              <X size={20} color="#0A2540" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View className="mb-4">{children}</View>

          {/* Footer */}
          {footer && <View className="mt-2">{footer}</View>}
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
export default Modal;
