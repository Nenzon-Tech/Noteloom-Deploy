import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Building, Plus, ChevronRight, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { API_BASE } from '../../../lib/constants';
import { getSessionToken } from '../../../lib/storage';
import GlassHeader from '../../../components/ui/GlassHeader';

interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  hod?: string;
  studentCount?: number;
}

export default function ManageDepartments() {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) setDepartments(await response.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
      <GlassHeader variant="dashboard">
        <View style={[styles.headerInner, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={isDarkMode ? 'white' : '#111827'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Departments</Text>
        </View>
      </GlassHeader>

      <ScrollView contentContainerStyle={{ paddingTop: 80, padding: 16, gap: 12 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 60 }} />
        ) : departments.length === 0 ? (
          <View style={styles.empty}>
            <Building size={48} color={isDarkMode ? '#6b7280' : '#9ca3af'} opacity={0.4} />
            <Text style={[styles.emptyText, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>No departments found</Text>
          </View>
        ) : (
          departments.map((dept) => (
            <View key={dept._id} style={[styles.card, { backgroundColor: isDarkMode ? 'rgba(30,41,59,0.6)' : 'white', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
              <View style={styles.cardLeft}>
                <Building size={24} color="#7c3aed" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.deptName, { color: isDarkMode ? 'white' : '#111827' }]}>{dept.name}</Text>
                  <Text style={[styles.deptCode, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{dept.code}</Text>
                </View>
              </View>
              <ChevronRight size={18} color={isDarkMode ? '#6b7280' : '#9ca3af'} />
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
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 14, borderWidth: 1 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  deptName: { fontSize: 15, fontWeight: '600' },
  deptCode: { fontSize: 12, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14 },
});
