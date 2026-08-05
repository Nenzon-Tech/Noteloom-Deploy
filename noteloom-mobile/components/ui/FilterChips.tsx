import React from 'react';
import { View, Pressable, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Gradient } from './Gradient';

interface FilterChipsProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  style?: object;
}

export const FilterChips = <T extends string>({ options, value, onChange, style }: FilterChipsProps<T>) => {
  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={[styles.scroll, style]}
    >
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? 'transparent' : theme.surface,
                borderColor: active ? 'transparent' : theme.border,
              },
              active && theme.cardShadow,
            ]}
          >
            {active ? (
              <Gradient colors={theme.gradientBrand} angle={135} style={styles.chipGrad}>
                <Text style={[styles.text, { color: '#fff' }]}>{opt.label}</Text>
              </Gradient>
            ) : (
              <Text style={[styles.text, { color: theme.muted }]}>{opt.label}</Text>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, marginBottom: 14 },
  row: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
  },
  chipGrad: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 11, fontWeight: '600' },
});

export default FilterChips;
