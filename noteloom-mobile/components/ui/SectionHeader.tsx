import React, { ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Gradient } from './Gradient';

interface SectionHeaderProps {
  title: string;
  action?: ReactNode;
  onAction?: () => void;
  style?: object;
}

export const SectionHeader = ({ title, action, onAction, style }: SectionHeaderProps) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.row, style]}>
      <View style={styles.titleWrap}>
        <Gradient colors={theme.gradientBrand} angle={135} style={styles.swatch} />
        <Text style={[styles.title, { color: theme.fg }]}>{title}</Text>
      </View>
      {onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          {typeof action === 'string' ? (
            <Text style={[styles.link, { color: theme.violet }]}>{action}</Text>
          ) : (
            action
          )}
        </Pressable>
      ) : (
        action && (typeof action === 'string' ? <Text style={[styles.link, { color: theme.violet }]}>{action}</Text> : <View>{action}</View>)
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  titleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  swatch: { width: 8, height: 20, borderRadius: 4 },
  title: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  link: { fontSize: 12, fontWeight: '600' },
});

export default SectionHeader;
