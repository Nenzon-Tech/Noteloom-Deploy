import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Gradient } from './Gradient';

interface StatGridProps {
  items: { value: string; label: string; color?: string; main?: boolean }[];
}

export const StatGrid = ({ items }: StatGridProps) => {
  const { theme } = useTheme();

  return (
    <View style={styles.grid}>
      {items.map((s, i) => (
        <View
          key={i}
          style={[
            styles.box,
            {
              backgroundColor: s.main
                ? 'rgba(124,58,237,0.08)'
                : theme.surface,
              borderColor: s.main ? 'rgba(124,58,237,0.3)' : theme.border,
              ...theme.elev1,
            },
            s.main && styles.main,
          ]}
        >
          <Text style={[styles.val, { color: s.color || theme.fg }]}>{s.value}</Text>
          <Text style={[styles.lbl, { color: theme.faint }]}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  box: { flex: 1, flexBasis: 0, minWidth: 0, borderRadius: 16, padding: 14, borderWidth: 1 },
  main: { flexBasis: '100%' },
  val: { fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  lbl: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 2 },
});

export default StatGrid;
