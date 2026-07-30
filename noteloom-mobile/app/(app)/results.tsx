import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Award, CheckCircle, XCircle } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { getSessionToken } from '../../lib/storage';
import GlassHeader from '../../components/ui/GlassHeader';

interface ExamRecord {
  _id: string;
  subject: string;
  examType: string;
  marks: number;
  totalMarks: number;
  semester: number;
}

export default function Results() {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [results, setResults] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchResults(); }, []);

  const fetchResults = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/student/marks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setResults(Array.isArray(data) ? data : []);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const getPercentage = (marks: number, total: number) => total > 0 ? Math.round((marks / total) * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
      <GlassHeader variant="dashboard">
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Award size={22} color="#7c3aed" />
          <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Results & Marks</Text>
        </View>
      </GlassHeader>
      <ScrollView contentContainerStyle={{ paddingTop: 80, padding: 16 }}>
        {loading ? <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 60 }} /> :
          results.map((r) => {
            const pct = getPercentage(r.marks, r.totalMarks);
            const passed = pct >= 40;
            return (
              <View key={r._id} style={[styles.card, { backgroundColor: isDarkMode ? 'rgba(30,41,59,0.4)' : 'white', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
                <View style={styles.topRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.subject, { color: isDarkMode ? 'white' : '#111827' }]}>{r.subject}</Text>
                    <Text style={[styles.examType, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{r.examType} • Sem {r.semester}</Text>
                  </View>
                  {passed ? <CheckCircle size={20} color="#22c55e" /> : <XCircle size={20} color="#ef4444" />}
                </View>
                <View style={styles.scoreRow}>
                  <Text style={[styles.marks, { color: isDarkMode ? 'white' : '#111827' }]}>{r.marks}<Text style={{ fontSize: 14, color: isDarkMode ? '#9ca3af' : '#6b7280' }}>/{r.totalMarks}</Text></Text>
                  <View style={[styles.pctBadge, { backgroundColor: passed ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }]}>
                    <Text style={[styles.pctText, { color: passed ? '#22c55e' : '#ef4444' }]}>{pct}%</Text>
                  </View>
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
  topRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  subject: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  examType: { fontSize: 13 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  marks: { fontSize: 24, fontWeight: '700' },
  pctBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  pctText: { fontSize: 14, fontWeight: '700' },
});
