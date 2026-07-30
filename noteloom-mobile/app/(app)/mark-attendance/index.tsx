import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, X, FileText, Ban, ArrowLeft, Users } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { API_BASE } from '../../../lib/constants';
import { getSessionToken } from '../../../lib/storage';
import GlassHeader from '../../../components/ui/GlassHeader';
import AttendanceToggle from '../../../components/ui/AttendanceToggle';

interface Student {
  _id: string;
  name: string;
  uid: string;
  attendance: string;
}

export default function MarkAttendance() {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/attendance/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data.map((s: any) => ({ ...s, attendance: 'NotMarked' })));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const updateAttendance = (studentId: string, value: string) => {
    setStudents((prev) => prev.map((s) => s._id === studentId ? { ...s, attendance: value } : s));
  };

  const markAll = (value: string) => {
    setStudents((prev) => prev.map((s) => ({ ...s, attendance: value })));
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const token = await getSessionToken();
      await fetch(`${API_BASE}/api/attendance/mark`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: selectedSession,
          records: students.map((s) => ({ studentId: s._id, status: s.attendance })),
        }),
      });
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
      <GlassHeader variant="dashboard">
        <View style={[styles.headerInner, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={isDarkMode ? 'white' : '#111827'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Mark Attendance</Text>
        </View>
      </GlassHeader>

      <ScrollView contentContainerStyle={{ paddingTop: 80, padding: 16, gap: 12 }}>
        <View style={styles.bulkActions}>
          <Text style={[styles.bulkLabel, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>Mark All:</Text>
          <AttendanceToggle status="" onChange={(v) => markAll(v)} />
        </View>

        {students.map((student) => (
          <View key={student._id} style={[styles.studentCard, { backgroundColor: isDarkMode ? 'rgba(30,41,59,0.6)' : 'white', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
            <View style={styles.studentInfo}>
              <View style={styles.avatar}>
                <Users size={18} color="#7c3aed" />
              </View>
              <View>
                <Text style={[styles.studentName, { color: isDarkMode ? 'white' : '#111827' }]}>{student.name}</Text>
                <Text style={[styles.studentUid, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{student.uid}</Text>
              </View>
            </View>
            <AttendanceToggle status={student.attendance} onChange={(v) => updateAttendance(student._id, v)} />
          </View>
        ))}

        <TouchableOpacity onPress={saveAttendance} disabled={saving} style={styles.saveBtn}>
          <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Attendance'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerInner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4, paddingBottom: 8 },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  bulkActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bulkLabel: { fontSize: 13, fontWeight: '600' },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  studentInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(124,58,237,0.15)', alignItems: 'center', justifyContent: 'center' },
  studentName: { fontSize: 14, fontWeight: '600' },
  studentUid: { fontSize: 11 },
  saveBtn: { backgroundColor: '#7c3aed', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveText: { color: 'white', fontSize: 15, fontWeight: '700' },
});
