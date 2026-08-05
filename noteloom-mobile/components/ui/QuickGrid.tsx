import React from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Gradient } from './Gradient';
import { Gradient as GradientTuple } from '../../lib/theme';

interface QuickItem {
  key: string;
  label: string;
  sub?: string;
  gradient: GradientTuple;
  icon: React.ReactNode;
  onPress?: () => void;
}

export const QuickGrid = ({ items, columns = 4 }: { items: QuickItem[]; columns?: number }) => {
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  const gap = 10;
  const horizontalPadding = 32; // 16px on each side of Screen
  const itemWidth = Math.floor((screenWidth - horizontalPadding - gap * (columns - 1)) / columns);

  return (
    <View style={[styles.grid, { gap }]}>
      {items.map(item => (
        <Pressable
          key={item.key}
          onPress={item.onPress}
          style={({ pressed }) => [
            styles.cell,
            { width: itemWidth, backgroundColor: theme.surface, borderColor: theme.border, ...theme.elev1 },
            pressed && { transform: [{ scale: 0.94 }] },
          ]}
        >
          <Gradient colors={item.gradient} angle={135} radius={12} style={styles.icon}>
            {item.icon}
          </Gradient>
          <Text style={[styles.label, { color: theme.muted }]} numberOfLines={1}>{item.label}</Text>
          {item.sub && <Text style={[styles.sub, { color: theme.faint }]} numberOfLines={1}>{item.sub}</Text>}
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16 },
  cell: {
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 11, fontWeight: '700', marginTop: 7, textAlign: 'center' },
  sub: { fontSize: 9, textAlign: 'center', lineHeight: 12 },
});

export default QuickGrid;
