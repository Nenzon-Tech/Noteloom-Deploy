import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IndianRupee, CalendarDays, CheckCircle, AlertCircle, Clock } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { getSessionToken } from '../../lib/storage';
import GlassHeader from '../../components/ui/GlassHeader';

interface FeeRecord {
  _id: string;
  type: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: 'paid' | 'partial' | 'unpaid';
}

export default function Fees() {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [records, setRecords] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchFees(); }, []);

  const fetchFees = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/fees/my-fees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRecords(Array.isArray(data) ? data : []);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid': return { icon: CheckCircle, color: '#22c55e', label: 'Paid' };
      case 'partial': return { icon: Clock, color: '#f59e0b', label: 'Partial' };
      default: return { icon: AlertCircle, color: '#ef4444', label: 'Unpaid' };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
      <GlassHeader variant="dashboard">
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <IndianRupee size={22} color="#7c3aed" />
          <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Fees & Payments</Text>
        </View>
      </GlassHeader>
      <ScrollView contentContainerStyle={{ paddingTop: 80, padding: 16 }}>
        {loading ? <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 60 }} /> :
          records.map((record) => {
            const s = getStatusStyle(record.status);
            const StatusIcon = s.icon;
            return (
              <View key={record._id} style={[styles.card, { backgroundColor: isDarkMode ? 'rgba(30,41,59,0.4)' : 'white', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
                <View style={styles.topRow}>
                  <Text style={[styles.feeType, { color: isDarkMode ? 'white' : '#111827' }]}>{record.type}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: s.color + '20' }]}>
                    <StatusIcon size={12} color={s.color} />
                    <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <IndianRupee size={14} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                  <Text style={[styles.amount, { color: isDarkMode ? 'white' : '#111827' }]}>₹{record.amount.toLocaleString()}</Text>
                  {record.paidAmount > 0 && <Text style={[styles.paidAmount, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}> (Paid: ₹{record.paidAmount.toLocaleString()})</Text>}
                </View>
                <View style={[styles.detailRow, { marginTop: 4 }]}>
                  <CalendarDays size={14} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                  <Text style={[styles.dueDate, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>Due: {new Date(record.dueDate).toLocaleDateString()}</Text>
                </View>
              </View>
            );
          })
        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4, paddingBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  card: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  feeType: { fontSize: 16, fontWeight: '600' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  amount: { fontSize: 16, fontWeight: '700' },
  paidAmount: { fontSize: 13 },
  dueDate: { fontSize: 13 },
});
