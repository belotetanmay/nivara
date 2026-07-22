import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

interface PasswordInputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  error,
  className,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(true);

  const borderColor = error
    ? '#EF4444'
    : isFocused
    ? '#2C5234'
    : '#E5E1D8';

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <View style={[styles.inputContainer, { borderColor }, isFocused && styles.focused]}>
        <TextInput
          style={styles.input}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={isSecure}
          onFocus={(e) => {
            setIsFocused(true);
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          {...props}
        />
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsSecure(!isSecure)}
          style={styles.eyeButton}
        >
          {isSecure
            ? <Eye size={20} color="#6B7280" />
            : <EyeOff size={20} color="#6B7280" />
          }
        </TouchableOpacity>
      </View>
      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    color: '#0A2540',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    marginLeft: 2,
  },
  inputContainer: {
    width: '100%',
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  focused: {
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    color: '#0A2540',
    fontSize: 16,
    padding: 0,
    marginRight: 8,
  },
  eyeButton: {
    padding: 4,
  },
  error: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default PasswordInput;
