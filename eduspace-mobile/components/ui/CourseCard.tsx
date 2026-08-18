import React, { ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Gradient } from './Gradient';
import { Gradient as GradientTuple } from '../../lib/theme';

interface CourseCardProps {
  title: string;
  code: string;
  meta: string;
  gradient: GradientTuple;
  rows: { icon: ReactNode; iconBg: string; iconColor?: string; label: string; value: string }[];
  footerLeft?: ReactNode;
  footerRight?: ReactNode;
  onPress?: () => void;
}

export const CourseCard = ({ title, code, meta, gradient, rows, footerLeft, footerRight, onPress }: CourseCardProps) => {
  const { theme } = useTheme();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: theme.surface, borderColor: theme.border, ...theme.elev1 }, pressed && { transform: [{ scale: 0.98 }] }]}>
      <Gradient colors={gradient} angle={135} radius={20} style={styles.banner}>
        <View style={styles.bannerDecor} />
        <Text style={styles.bannerTitle} numberOfLines={2}>{title}</Text>
        <View style={styles.tags}>
          <Text style={styles.mono}>{code}</Text>
          <Text style={styles.meta}>{meta}</Text>
        </View>
      </Gradient>
      <View style={styles.body}>
        {rows.map((r, i) => (
          <View key={i} style={styles.row}>
            <View style={[styles.rb, { backgroundColor: r.iconBg }]}>{r.icon}</View>
            <View style={styles.rt}>
              <Text style={[styles.rtLabel, { color: theme.faint }]}>{r.label}</Text>
              <Text style={[styles.rtValue, { color: theme.fg }]}>{r.value}</Text>
            </View>
          </View>
        ))}
      </View>
      {(footerLeft || footerRight) && (
        <View style={styles.foot}>
          {footerLeft && <View style={styles.footItem}>{footerLeft}</View>}
          {footerRight && <View style={styles.footItem}>{footerRight}</View>}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  banner: { height: 92, padding: 16, justifyContent: 'center' },
  bannerDecor: { position: 'absolute', right: -40, top: -30, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.08)' },
  bannerTitle: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: -0.2, lineHeight: 22, paddingRight: 20 },
  tags: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 8, flexWrap: 'wrap' },
  mono: { fontSize: 10, fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.22)', paddingVertical: 3, paddingHorizontal: 7, borderRadius: 7, color: '#fff', fontVariant: ['tabular-nums'] },
  meta: { fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.9)' },
  body: { paddingHorizontal: 16, paddingTop: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  rb: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rt: { flex: 1, minWidth: 0 },
  rtLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.7 },
  rtValue: { fontSize: 12, fontWeight: '600' },
  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    marginTop: 8,
  },
  footItem: { flexShrink: 1 },
});

export default CourseCard;
