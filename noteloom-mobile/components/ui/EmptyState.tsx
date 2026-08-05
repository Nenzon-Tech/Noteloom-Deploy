import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Circle } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface EmptyStateProps {
  icon?: React.ReactNode;
  message: string;
  iconColor?: string;
}

export const EmptyState = ({ icon, message, iconColor }: EmptyStateProps) => {
  const { theme } = useTheme();
  return (
    <View style={styles.wrap}>
      {icon || <Circle size={44} color={theme.faint} style={styles.icon} />}
      <Text style={[styles.text, { color: theme.faint }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 36 },
  icon: { opacity: 0.5, marginBottom: 10 },
  text: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
});

export default EmptyState;
