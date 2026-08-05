import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface RoleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected?: boolean;
  onPress?: () => void;
}

export const RoleCard = ({ icon, title, description, selected, onPress }: RoleCardProps) => {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: selected ? 'rgba(124,58,237,0.08)' : theme.surface,
          borderColor: selected ? theme.violet : theme.border,
        },
        selected && { shadowColor: 'rgba(124,58,237,0.35)', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.6, shadowRadius: 14, elevation: 3 },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: selected ? theme.violet : theme.surface2 }]}>
        {React.cloneElement(icon as React.ReactElement<any>, { color: selected ? '#fff' : theme.muted, size: 17 })}
      </View>
      <Text style={[styles.title, { color: theme.fg }]}>{title}</Text>
      <Text style={[styles.desc, { color: theme.faint }]}>{description}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'column', gap: 6, alignItems: 'flex-start', padding: 13, borderRadius: 14, borderWidth: 1, minHeight: 106 },
  icon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 12, fontWeight: '700' },
  desc: { fontSize: 9.5, lineHeight: 13 },
});

export default RoleCard;
