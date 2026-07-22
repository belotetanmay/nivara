import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? '#EF4444'
    : isFocused
    ? '#0F2D52'
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
    color: '#0F2D52',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 2,
  },
  inputContainer: {
    width: '100%',
    minHeight: 48,
    backgroundColor: '#F7F9F8',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  focused: {
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    color: '#0F2D52',
    fontSize: 15,
    padding: 0,
  },
  error: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default Input;
