import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Gradient } from './Gradient';

type AttStatus = 'present' | 'absent' | 'unmarked';

interface AttRowProps {
  initial?: string;
  name: string;
  id: string;
  status?: AttStatus;
  onChange?: (status: AttStatus) => void;
}

export const AttRow = ({ initial, name, id, status = 'unmarked', onChange }: AttRowProps) => {
  const { theme } = useTheme();

  const cycle = () => {
    const next: AttStatus = status === 'present' ? 'absent' : status === 'absent' ? 'unmarked' : 'present';
    onChange?.(next);
  };

  return (
    <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border, ...theme.elev1 }]}>
      <Gradient colors={theme.gradientBrand} angle={135} radius={11} style={styles.ava}>
        <Text style={styles.avaText}>{initial || name?.[0] || '?'}</Text>
      </Gradient>
      <View style={styles.name}>
        <Text style={[styles.nameText, { color: theme.fg }]} numberOfLines={1}>{name}</Text>
        <Text style={[styles.idText, { color: theme.faint }]}>{id}</Text>
      </View>
      <Pressable
        onPress={cycle}
        style={[
          styles.btn,
          status === 'present' && { backgroundColor: theme.green, borderColor: theme.green },
          status === 'absent' && { backgroundColor: theme.red, borderColor: theme.red },
          status === 'unmarked' && { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.btnText, { color: status === 'unmarked' ? theme.muted : '#fff' }]}>
          {status === 'unmarked' ? '?' : status === 'present' ? 'P' : 'A'}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  ava: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  avaText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  name: { flex: 1, minWidth: 0 },
  nameText: { fontSize: 12, fontWeight: '600' },
  idText: { fontSize: 10, marginTop: 1 },
  btn: { width: 40, height: 40, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 12, fontWeight: '700' },
});

export default AttRow;
