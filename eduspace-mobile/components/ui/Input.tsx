import React, { ReactNode, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  isPassword?: boolean;
}

export const Input = ({ label, error, leftIcon, isPassword, style, ...props }: InputProps) => {
  const { isDarkMode } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={[styles.label, { color: isDarkMode ? '#e5e7eb' : '#374151' }]}>{label}</Text>}
      <View style={styles.inputContainer}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          {...props}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
          style={[
            styles.input,
            {
              backgroundColor: isDarkMode ? 'rgba(55,65,81,0.5)' : 'white',
              borderColor: error ? '#ef4444' : isDarkMode ? '#4b5563' : '#d1d5db',
              color: isDarkMode ? 'white' : '#111827',
              paddingLeft: leftIcon ? 40 : 16,
            },
            style,
          ]}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.rightIcon}>
            {showPassword ? <EyeOff size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} /> : <Eye size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  inputContainer: { position: 'relative' },
  leftIcon: { position: 'absolute', left: 12, top: 14, zIndex: 1 },
  rightIcon: { position: 'absolute', right: 12, top: 14, zIndex: 1 },
  input: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingRight: 16,
    fontSize: 15,
    borderWidth: 1,
  },
  error: { marginTop: 4, fontSize: 13, color: '#ef4444' },
});

export default Input;
