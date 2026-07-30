import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileText, CheckCircle, XCircle, AlertCircle, ArrowRight } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { API_BASE } from '../../../lib/constants';
import { getSessionToken } from '../../../lib/storage';
import GlassHeader from '../../../components/ui/GlassHeader';

export default function COE() {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStatus(); }, []);

  const fetchStatus = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/coe/student/form-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
      <GlassHeader variant="dashboard">
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <FileText size={22} color="#7c3aed" />
          <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Examination Portal</Text>
        </View>
      </GlassHeader>

      <ScrollView contentContainerStyle={{ paddingTop: 80, padding: 16 }}>
        {loading ? <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 60 }} /> :
          <View style={[styles.statusCard, { backgroundColor: isDarkMode ? 'rgba(30,41,59,0.4)' : 'white', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
            <Text style={[styles.statusTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Exam Eligibility Status</Text>
            {status ? (
              <View style={styles.statusContent}>
                <View style={[styles.statusIcon, { backgroundColor: status.eligible ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }]}>
                  {status.eligible ? <CheckCircle size={32} color="#22c55e" /> : <XCircle size={32} color="#ef4444" />}
                </View>
                <Text style={[styles.statusValue, { color: status.eligible ? '#22c55e' : '#ef4444' }]}>
                  {status.eligible ? 'Eligible' : 'Not Eligible'}
                </Text>
                <Text style={[styles.statusDetail, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{status.message || 'Verification complete'}</Text>
              </View>
            ) : (
              <Text style={[styles.noData, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>No status information available</Text>
            )}
          </View>
        }

        <TouchableOpacity onPress={() => router.push('/(app)/coe/admit-card')} style={[styles.menuCard, { backgroundColor: isDarkMode ? 'rgba(30,41,59,0.4)' : 'white', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
          <View style={styles.menuContent}>
            <FileText size={24} color="#7c3aed" />
            <View style={styles.menuText}>
              <Text style={[styles.menuTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Admit Card</Text>
              <Text style={[styles.menuDesc, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>Generate and share your digital admit card</Text>
            </View>
          </View>
          <ArrowRight size={18} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4, paddingBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  statusCard: { padding: 24, borderRadius: 20, borderWidth: 1, marginBottom: 16 },
  statusTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  statusContent: { alignItems: 'center', gap: 12 },
  statusIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  statusValue: { fontSize: 20, fontWeight: '700' },
  statusDetail: { fontSize: 14, textAlign: 'center' },
  noData: { fontSize: 14, textAlign: 'center' },
  menuCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  menuContent: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  menuText: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '600' },
  menuDesc: { fontSize: 13, marginTop: 2 },
});
