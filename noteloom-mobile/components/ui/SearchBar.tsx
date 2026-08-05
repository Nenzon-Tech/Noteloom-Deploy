import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Search } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

export const SearchBar = (props: TextInputProps) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.bar, { backgroundColor: theme.surface, borderColor: theme.border, ...theme.elev1 }]}>
      <Search size={18} color={theme.faint} style={styles.icon} />
      <TextInput
        placeholderTextColor={theme.faint}
        style={[styles.input, { color: theme.fg }]}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  icon: { flexShrink: 0 },
  input: { flex: 1, fontSize: 14, padding: 0 },
});

export default SearchBar;
