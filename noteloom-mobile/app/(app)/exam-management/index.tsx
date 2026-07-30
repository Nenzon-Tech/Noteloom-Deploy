import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ClipboardList, Users, FileText, CheckCircle, XCircle } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { API_BASE } from '../../../lib/constants';
import { getSessionToken } from '../../../lib/storage';
import GlassHeader from '../../../components/ui/GlassHeader';

export default function ExamManagement() {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchExams(); }, []);

  const fetchExams = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/exams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) setExams(await response.json());
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
      <GlassHeader variant="dashboard">
        <View style={[styles.headerInner, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={isDarkMode ? 'white' : '#111827'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Exam Management</Text>
        </View>
      </GlassHeader>

      <ScrollView contentContainerStyle={{ paddingTop: 80, padding: 16, gap: 12 }}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>Active Exams</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 40 }} />
        ) : exams.length === 0 ? (
          <View style={styles.empty}>
            <ClipboardList size={48} color={isDarkMode ? '#6b7280' : '#9ca3af'} opacity={0.4} />
            <Text style={[styles.emptyText, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>No exams scheduled</Text>
          </View>
        ) : (
          exams.map((exam) => (
            <View key={exam._id} style={[styles.card, { backgroundColor: isDarkMode ? 'rgba(30,41,59,0.6)' : 'white', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.examName, { color: isDarkMode ? 'white' : '#111827' }]}>{exam.name}</Text>
                {exam.status === 'active' ? <CheckCircle size={16} color="#059669" /> : <XCircle size={16} color="#ef4444" />}
              </View>
              <Text style={[styles.examDetail, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>Date: {new Date(exam.date).toLocaleDateString()}</Text>
              {exam.totalStudents && (
                <View style={styles.stat}>
                  <Users size={14} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                  <Text style={[styles.statText, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{exam.totalStudents} students</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerInner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4, paddingBottom: 8 },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  sectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  card: { padding: 16, borderRadius: 14, borderWidth: 1, gap: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  examName: { fontSize: 15, fontWeight: '700' },
  examDetail: { fontSize: 13 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 12 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14 },
});
