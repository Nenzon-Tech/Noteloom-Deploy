import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';

type BadgeVariant = 'purple' | 'blue' | 'green' | 'red' | 'gray' | 'yellow';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: ReactNode;
}

const variants: Record<BadgeVariant, { bg: string; text: string }> = {
  purple: { bg: '#7c3aed', text: 'white' },
  blue: { bg: '#2563eb', text: 'white' },
  green: { bg: '#16a34a', text: 'white' },
  red: { bg: '#dc2626', text: 'white' },
  gray: { bg: '#4b5563', text: 'white' },
  yellow: { bg: '#d97706', text: 'white' },
};

export const Badge = ({ label, variant = 'gray', icon }: BadgeProps) => {
  const v = variants[variant];
  return (
    <View style={[styles.badge, { backgroundColor: v.bg }]}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.text, { color: v.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  icon: { marginRight: 6 },
  text: { fontSize: 13, fontWeight: '600' },
});

export default Badge;
