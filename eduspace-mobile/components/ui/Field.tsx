import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export const Field = (props: TextInputProps) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.field, { backgroundColor: theme.surface, borderColor: theme.border, ...theme.elev1 }]}>
      <TextInput
        placeholderTextColor={theme.faint}
        style={[styles.input, { color: theme.fg }]}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  input: { flex: 1, fontSize: 14, padding: 0 },
});

export default Field;
