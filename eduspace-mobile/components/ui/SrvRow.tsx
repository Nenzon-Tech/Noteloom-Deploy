import React, { ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

type ActColor = 'blue' | 'green' | 'red' | 'amber' | 'ghost';

interface SrvRowProps {
  icon?: ReactNode;
  iconBg?: string;
  iconColor?: string;
  title: string;
  meta: string;
  action?: string;
  actionColor?: ActColor;
  onAction?: () => void;
  onPress?: () => void;
  avatar?: ReactNode;
}

const actPalette: Record<ActColor, { bg: string; text: string; border?: boolean }> = {
  blue: { bg: '#2563eb', text: '#fff' },
  green: { bg: '#22c55e', text: '#fff' },
  red: { bg: '#ef4444', text: '#fff' },
  amber: { bg: '#f59e0b', text: '#fff' },
  ghost: { bg: 'transparent', text: '', border: true },
};

export const SrvRow = ({ icon, iconBg, iconColor, title, meta, action, actionColor = 'blue', onAction, onPress, avatar }: SrvRowProps) => {
  const { theme } = useTheme();

  const body = (
    <>
      {avatar ?? (icon ? <View style={[styles.icon, { backgroundColor: iconBg }]}>{icon}</View> : null)}
      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.fg }]} numberOfLines={1}>{title}</Text>
        <Text style={[styles.meta, { color: theme.faint }]} numberOfLines={1}>{meta}</Text>
      </View>
      {action && (
        <Pressable
          onPress={onAction}
          style={[
            styles.act,
            { backgroundColor: actPalette[actionColor].bg },
            actPalette[actionColor].border && { borderWidth: 1, borderColor: theme.border },
            actionColor === 'ghost' && { backgroundColor: theme.surface2 },
          ]}
        >
          <Text style={[styles.actText, { color: actionColor === 'ghost' ? theme.muted : actPalette[actionColor].text }]} numberOfLines={1}>
            {action}
          </Text>
        </Pressable>
      )}
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.row, { backgroundColor: theme.surface, borderColor: theme.border, ...theme.elev1 }, pressed && { transform: [{ scale: 0.98 }] }]}>
        {body}
      </Pressable>
    );
  }
  return <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border, ...theme.elev1 }]}>{body}</View>;
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, minWidth: 0 },
  title: { fontSize: 13, fontWeight: '700' },
  meta: { fontSize: 10, marginTop: 2 },
  act: { paddingVertical: 9, paddingHorizontal: 12, borderRadius: 9, flexShrink: 0 },
  actText: { fontSize: 11, fontWeight: '600', flexShrink: 1 },
});

export default SrvRow;
