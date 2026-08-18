import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

type PillColor = 'purple' | 'blue' | 'green' | 'amber' | 'red' | 'gray' | 'white';

interface PillProps {
  color?: PillColor;
  children: ReactNode;
  style?: object;
  onDark?: boolean;
}

const light = {
  purple: { bg: 'rgba(124,58,237,0.12)', text: '#7c3aed' },
  blue: { bg: 'rgba(37,99,235,0.1)', text: '#2563eb' },
  green: { bg: 'rgba(16,185,129,0.12)', text: '#10b981' },
  amber: { bg: 'rgba(245,158,11,0.14)', text: '#d97706' },
  red: { bg: 'rgba(239,68,68,0.12)', text: '#ef4444' },
  gray: { bg: 'transparent', text: '' },
  white: { bg: 'rgba(255,255,255,0.12)', text: '#fff' },
};

export const Pill = ({ color = 'purple', children, style, onDark }: PillProps) => {
  const { isDarkMode } = useTheme();
  const key = onDark ? 'white' : color;
  const palette = light[key] || light.purple;

  const resolvedColor = isDarkMode && !onDark
    ? light[color]?.text || (color === 'gray' ? '#cbd5e1' : '#a78bfa')
    : palette.text;

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: onDark ? 'rgba(255,255,255,0.14)' : light[color]?.bg,
          borderColor: onDark ? 'rgba(255,255,255,0.28)' : 'transparent',
          borderWidth: onDark ? 1 : 0,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: resolvedColor }]}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  text: { fontSize: 11, fontWeight: '600' },
});

export default Pill;
