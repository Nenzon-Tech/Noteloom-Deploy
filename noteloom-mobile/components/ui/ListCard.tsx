import React, { ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Gradient } from './Gradient';
import { Gradient as GradientTuple } from '../../lib/theme';

interface LRowProps {
  icon?: ReactNode;
  iconBg?: string | GradientTuple;
  iconColor?: string;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  last?: boolean;
}

export const LRow = ({ icon, iconBg, iconColor, title, subtitle, trailing, onPress, last }: LRowProps) => {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: last ? 'transparent' : theme.border },
        pressed && { backgroundColor: theme.surface2 },
      ]}
    >
      {icon && (
        Array.isArray(iconBg) ? (
          <Gradient colors={iconBg} radius={10} style={styles.icon}>
            {icon}
          </Gradient>
        ) : (
          <View style={[styles.icon, { backgroundColor: iconBg || 'rgba(124,58,237,0.12)' }]}>{icon}</View>
        )
      )}
      <View style={styles.text}>
        <Text style={[styles.title, { color: theme.fg }]} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={[styles.sub, { color: theme.faint }]} numberOfLines={1}>{subtitle}</Text>}
      </View>
      {trailing ? (
        <View style={styles.trailingWrap}>{trailing}</View>
      ) : (
        <View style={styles.chevron}><ChevronRight size={16} color={theme.faint} /></View>
      )}
    </Pressable>
  );
};

interface ListCardProps {
  children: ReactNode;
  style?: object;
}

export const ListCard = ({ children, style }: ListCardProps) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, ...theme.elev1 }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1, overflow: 'hidden', marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, minHeight: 56 },
  icon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  text: { flex: 1, minWidth: 0 },
  title: { fontSize: 14, fontWeight: '600' },
  sub: { fontSize: 11, marginTop: 1 },
  trailingWrap: { flexShrink: 0, marginLeft: 8 },
  chevron: { flexShrink: 0, marginLeft: 8 },
});

export default ListCard;
