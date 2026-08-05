import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Gradient } from './Gradient';

interface AprRowProps {
  initial: string;
  name: string;
  meta: string;
  gradient?: [string, string, ...string[]];
  onApprove?: () => void;
  onReject?: () => void;
}

export const AprRow = ({ initial, name, meta, gradient, onApprove, onReject }: AprRowProps) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border, ...theme.elev1 }]}>
      <Gradient colors={gradient || theme.gradientBrand} angle={135} radius={11} style={styles.ava}>
        <Text style={styles.avaText}>{initial}</Text>
      </Gradient>
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.fg }]} numberOfLines={1}>{name}</Text>
        <Text style={[styles.meta, { color: theme.faint }]}>{meta}</Text>
      </View>
      <View style={styles.acts}>
        <Pressable onPress={onApprove} style={[styles.btn, { backgroundColor: theme.green }]}>
          <Text style={styles.btnText}>Verify</Text>
        </Pressable>
        <Pressable onPress={onReject} style={[styles.btn, { backgroundColor: theme.surface2, borderColor: theme.border, borderWidth: 1 }]}>
          <Text style={[styles.btnText, { color: theme.muted }]}>Reject</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  ava: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  avaText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 13, fontWeight: '700' },
  meta: { fontSize: 10, marginTop: 1 },
  acts: { flexDirection: 'row', gap: 6 },
  btn: { paddingVertical: 9, paddingHorizontal: 12, borderRadius: 9 },
  btnText: { color: '#fff', fontSize: 11, fontWeight: '600' },
});

export default AprRow;
