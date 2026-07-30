import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarCheck, CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { getSessionToken } from '../../lib/storage';
import GlassHeader from '../../components/ui/GlassHeader';

interface AttendanceItem {
  _id: string;
  subject: string;
  date: string;
  status: 'present' | 'absent' | 'late';
}

export default function Attendance() {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [records, setRecords] = useState<AttendanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/attendance/my-attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRecords(Array.isArray(data) ? data : []);
      } else setError('Failed to load attendance');
    } catch { setError('Failed to connect'); }
    finally { setLoading(false); }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle size={18} color="#22c55e" />;
      case 'absent': return <XCircle size={18} color="#ef4444" />;
      case 'late': return <Clock size={18} color="#f59e0b" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return '#22c55e';
      case 'absent': return '#ef4444';
      case 'late': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
      <GlassHeader variant="dashboard">
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Attendance</Text>
        </View>
      </GlassHeader>

      <ScrollView contentContainerStyle={{ paddingTop: 80, padding: 16 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 60 }} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : records.length === 0 ? (
          <View style={styles.empty}>
            <CalendarCheck size={48} color={isDarkMode ? '#6b7280' : '#9ca3af'} style={{ opacity: 0.4 }} />
            <Text style={[styles.emptyText, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>No attendance records found</Text>
          </View>
        ) : (
          records.map((record) => (
            <View key={record._id} style={[styles.card, { backgroundColor: isDarkMode ? 'rgba(30,41,59,0.4)' : 'white', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
              <View style={styles.cardLeft}>
                <Text style={[styles.subject, { color: isDarkMode ? 'white' : '#111827' }]}>{record.subject}</Text>
                <Text style={[styles.date, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{new Date(record.date).toLocaleDateString()}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(record.status) + '20' }]}>
                {getStatusIcon(record.status)}
                <Text style={[styles.statusText, { color: getStatusColor(record.status) }]}>{record.status}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 4, paddingBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  errorText: { color: '#ef4444', textAlign: 'center', marginTop: 40 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15 },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  cardLeft: { flex: 1 },
  subject: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  date: { fontSize: 13 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
});
