import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Gradient } from './Gradient';

interface AvatarProps {
  label: string;
  size?: number;
  radius?: number;
  gradient?: [string, string, ...string[]];
  style?: object;
}

const DEFAULT = ['#6366f1', '#a855f7'] as [string, string, ...string[]];

export const Avatar = ({ label, size = 38, radius = 12, gradient, style }: AvatarProps) => {
  const { theme } = useTheme();
  const initials = (label || '?').slice(0, 2).toUpperCase();
  const font = size * 0.4;

  return (
    <Gradient colors={gradient || DEFAULT} radius={radius} style={[styles.box, { width: size, height: size, borderRadius: radius }, style]}>
      <View style={styles.center}>
        <Text style={[styles.text, { color: '#fff', fontSize: font }]}>{initials}</Text>
      </View>
    </Gradient>
  );
};

const styles = StyleSheet.create({
  box: {
    flexShrink: 0,
    shadowColor: 'rgba(124,58,237,0.35)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 3,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontWeight: '700' },
});

export default Avatar;
