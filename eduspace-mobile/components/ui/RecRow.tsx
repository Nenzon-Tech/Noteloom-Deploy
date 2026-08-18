import React, { ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface RecRowProps {
  dateTop?: string;
  dateMain?: string;
  dateStyle?: object;
  dateBox?: ReactNode;
  title: string;
  subtitle?: string;
  subtitleIcon?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
}

export const RecRow = ({ dateTop, dateMain, dateStyle, dateBox, title, subtitle, subtitleIcon, trailing, onPress }: RecRowProps) => {
  const { theme } = useTheme();

  const inner = (
    <>
      {dateBox ??
        (dateTop && (
          <View style={[styles.datebox, { backgroundColor: theme.surface2, borderColor: theme.border }, dateStyle]}>
            <Text style={styles.dateTop}>{dateTop}</Text>
            <Text style={styles.dateMain}>{dateMain}</Text>
          </View>
        ))}
      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.fg }]} numberOfLines={1}>{title}</Text>
        {subtitle && (
          <View style={styles.subWrap}>
            {subtitleIcon}
            <Text style={[styles.sub, { color: theme.faint }]} numberOfLines={1}>{subtitle}</Text>
          </View>
        )}
      </View>
      {trailing && <View style={styles.trailingWrap}>{trailing}</View>}
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.row, { backgroundColor: theme.surface, borderColor: theme.border, ...theme.elev1 }, pressed && { transform: [{ scale: 0.98 }] }]}>
        {inner}
      </Pressable>
    );
  }
  return <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border, ...theme.elev1 }]}>{inner}</View>;
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  datebox: {
    width: 50,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dateTop: { fontSize: 9, fontWeight: '700', color: '#ef4444', textTransform: 'uppercase', letterSpacing: 0.5 },
  dateMain: { fontSize: 16, fontWeight: '700' },
  info: { flex: 1, minWidth: 0 },
  title: { fontSize: 13, fontWeight: '600' },
  subWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  sub: { fontSize: 10, flexShrink: 1 },
  trailingWrap: { flexShrink: 0, marginLeft: 8 },
});

export default RecRow;
