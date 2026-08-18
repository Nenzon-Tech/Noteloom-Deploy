import React, { useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface OtpInputProps {
  code: string[];
  onChange: (index: number, value: string) => void;
  onKeyDown: (index: number, key: string) => void;
  error?: string;
}

export const OtpInput = ({ code, onChange, onKeyDown, error }: OtpInputProps) => {
  const { isDarkMode } = useTheme();
  const refs = useRef<(TextInput | null)[]>([]);

  return (
    <View style={styles.container}>
      {code.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => { refs.current[index] = ref; }}
          value={digit}
          onChangeText={(value) => {
            if (/^[0-9]*$/.test(value)) {
              onChange(index, value.slice(-1));
              if (value && index < 5) refs.current[index + 1]?.focus();
            }
          }}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === 'Backspace' && !digit && index > 0) {
              refs.current[index - 1]?.focus();
            }
          }}
          style={[
            styles.input,
            {
              backgroundColor: isDarkMode ? 'rgba(55,65,81,0.7)' : 'white',
              borderColor: error ? '#ef4444' : isDarkMode ? '#4b5563' : '#d1d5db',
              color: isDarkMode ? 'white' : '#111827',
            },
          ]}
          maxLength={1}
          keyboardType="number-pad"
          textAlign="center"
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  input: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 20,
    fontWeight: '700',
  },
});

export default OtpInput;
