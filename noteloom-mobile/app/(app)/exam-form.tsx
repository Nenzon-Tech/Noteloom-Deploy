import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileText, CheckCircle, Clock, IndianRupee } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { getSessionToken } from '../../lib/storage';
import GlassHeader from '../../components/ui/GlassHeader';

export default function ExamForm() {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchForms(); }, []);

  const fetchForms = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/exam/forms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setForms(Array.isArray(data) ? data : []);
      }
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
      <GlassHeader variant="dashboard">
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <FileText size={22} color="#7c3aed" />
          <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Exam Form</Text>
        </View>
      </GlassHeader>
      <ScrollView contentContainerStyle={{ paddingTop: 80, padding: 16 }}>
        {loading ? <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 60 }} /> :
          forms.map((form) => (
            <View key={form._id} style={[styles.card, { backgroundColor: isDarkMode ? 'rgba(30,41,59,0.4)' : 'white', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
              <View style={styles.topRow}>
                <Text style={[styles.formTitle, { color: isDarkMode ? 'white' : '#111827' }]}>{form.examName || 'Examination Form'}</Text>
                <View style={[styles.statusDot, { backgroundColor: form.submitted ? '#22c55e' : '#f59e0b' }]} />
              </View>
              <View style={styles.detailRow}>
                <Clock size={14} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <Text style={[styles.detailText, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>Due: {form.dueDate ? new Date(form.dueDate).toLocaleDateString() : 'N/A'}</Text>
              </View>
              {form.fee && <View style={styles.detailRow}>
                <IndianRupee size={14} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <Text style={[styles.detailText, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>Fee: ₹{form.fee}</Text>
              </View>}
              <TouchableOpacity disabled={form.submitted} style={[styles.actionBtn, { backgroundColor: form.submitted ? '#374151' : '#7c3aed', opacity: form.submitted ? 0.5 : 1 }]}>
                <Text style={styles.actionBtnText}>{form.submitted ? 'Submitted' : 'Fill Form'}</Text>
              </TouchableOpacity>
            </View>
          ))
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
  formTitle: { fontSize: 16, fontWeight: '600' },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  detailText: { fontSize: 14 },
  actionBtn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  actionBtnText: { color: 'white', fontSize: 15, fontWeight: '600' },
});
