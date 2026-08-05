import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { Screen } from '../../../components/ui/Screen';
import { SubHeader } from '../../../components/ui/SubHeader';

export default function ITAdminAudit() {
  const { theme } = useTheme();

  const logs = [
    { time: '09:12', title: 'Ticket TX-4412 escalated', meta: 'I. Kumar · support queue' },
    { time: '08:58', title: 'Role change · new faculty', meta: 'R. Sengupta · approved FR-121' },
    { time: '08:41', title: 'Backup completed', meta: 'prod-db-01 · 2.4 GB · success' },
    { time: '08:02', title: 'Memory alert cleared', meta: 'prod-lms-02 · restarted clean' },
    { time: '07:31', title: 'User login · new device', meta: 'P. Saha · 2023CS0891 · Android' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Audit Log" subtitle="Live · last 24h" />
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, ...theme.elev1 }]}>
          {logs.map((l, i) => (
            <View key={i} style={[styles.row, { borderBottomColor: theme.border }, i === logs.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={[styles.time, { color: theme.violet }]}>{l.time}</Text>
              <View style={styles.info}>
                <Text style={[styles.title, { color: theme.fg }]}>{l.title}</Text>
                <Text style={[styles.meta, { color: theme.faint }]}>{l.meta}</Text>
              </View>
            </View>
          ))}
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1 },
  time: { fontSize: 12, fontWeight: '800', width: 44 },
  info: { flex: 1 },
  title: { fontSize: 13, fontWeight: '600' },
  meta: { fontSize: 10, marginTop: 2 },
});
