import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Gradient } from './Gradient';
import { Gradient as GradientTuple } from '../../lib/theme';

interface BalanceCardProps {
  colors: GradientTuple;
  label: string;
  pill?: string;
  value: string;
  valueSuffix?: string;
  subLabel?: string;
  subPill?: string;
  action?: ReactNode;
}

export const BalanceCard = ({ colors, label, pill, value, valueSuffix, subLabel, subPill, action }: BalanceCardProps) => {
  return (
    <Gradient colors={colors} angle={135} radius={20} style={styles.card}>
      <View style={styles.decor} />
      <View style={styles.row}>
        <Text style={[styles.label, { color: 'rgba(255,255,255,0.8)' }]}>{label}</Text>
        {pill && (
          <View style={styles.pill}>
            <Text style={styles.pillText}>{pill}</Text>
          </View>
        )}
      </View>
      <Text style={styles.value}>
        {value}
        {valueSuffix && <Text style={styles.valueSuffix}>{valueSuffix}</Text>}
      </Text>
      <View style={[styles.row, styles.subRow]}>
        {subLabel ? (
          <Text style={[styles.subLabel, { color: 'rgba(255,255,255,0.8)' }]}>{subLabel}</Text>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        {action}
        {subPill && (
          <View style={styles.pill}>
            <Text style={styles.pillText}>{subPill}</Text>
          </View>
        )}
      </View>
    </Gradient>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 18,
    marginTop: 4,
    shadowColor: 'rgba(124,58,237,0.35)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 8,
  },
  decor: {
    position: 'absolute',
    right: -30,
    top: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  label: { fontSize: 11, fontWeight: '600' },
  pill: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  pillText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  value: { color: '#fff', fontSize: 34, fontWeight: '700', letterSpacing: -0.7, marginVertical: 10 },
  valueSuffix: { fontSize: 15, fontWeight: '700', opacity: 0.75 },
  subRow: { alignItems: 'center' },
  subLabel: { flex: 1, fontSize: 12, fontWeight: '600' },
});

export default BalanceCard;
