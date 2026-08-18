import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Gradient } from './Gradient';

interface AdmitCardProps {
  title: string;
  pill: string;
  qr: ReactNode;
  code: string;
  cells: { label: string; value: string }[];
}

export const AdmitCard = ({ title, pill, qr, code, cells }: AdmitCardProps) => {
  return (
    <Gradient colors={['#1e1b4b', '#6d28d9']} angle={135} radius={20} style={styles.card}>
      <View style={styles.decor} />
      <View style={styles.head}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.pill}>
          <Text style={styles.pillText}>{pill}</Text>
        </View>
      </View>
      <View style={styles.qrBox}>{qr}</View>
      <Text style={styles.code}>{code}</Text>
      <View style={styles.grid}>
        {cells.map((c, i) => (
          <View key={i} style={styles.cell}>
            <Text style={styles.cellLabel}>{c.label}</Text>
            <Text style={styles.cellValue}>{c.value}</Text>
          </View>
        ))}
      </View>
    </Gradient>
  );
};

const styles = StyleSheet.create({
  card: { padding: 20, marginBottom: 16, shadowColor: 'rgba(124,58,237,0.35)', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.6, shadowRadius: 24, elevation: 8 },
  decor: { position: 'absolute', right: -40, top: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(168,85,247,0.4)' },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { color: '#fff', fontSize: 16, fontWeight: '700' },
  pill: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  pillText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  qrBox: { width: 86, height: 86, backgroundColor: '#fff', borderRadius: 12, alignSelf: 'center', marginBottom: 14, padding: 8, alignItems: 'center', justifyContent: 'center' },
  code: { textAlign: 'center', fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.85)', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: { width: '47%', backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', borderRadius: 12, padding: 10 },
  cellLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, color: 'rgba(255,255,255,0.75)' },
  cellValue: { color: '#fff', fontSize: 12, fontWeight: '700', marginTop: 2 },
});

export default AdmitCard;
