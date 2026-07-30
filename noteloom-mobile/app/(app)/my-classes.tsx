import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpen, Users } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { getSessionToken } from '../../lib/storage';
import GlassHeader from '../../components/ui/GlassHeader';

interface ClassItem {
  _id: string;
  name: string;
  subjectCode: string;
  studentCount: number;
}

export default function MyClasses() {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchClasses(); }, []);

  const fetchClasses = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/classrooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setClasses(Array.isArray(data) ? data : []);
      }
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
      <GlassHeader variant="dashboard">
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : '#111827' }]}>My Classes</Text>
        </View>
      </GlassHeader>
      <ScrollView contentContainerStyle={{ paddingTop: 80, padding: 16 }}>
        {loading ? <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 60 }} /> :
          classes.map((cls) => (
            <TouchableOpacity key={cls._id} style={[styles.card, { backgroundColor: isDarkMode ? 'rgba(30,41,59,0.4)' : 'white', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]} onPress={() => router.push(`/(app)/classroom/${cls._id}` as any)}>
              <View style={styles.cardLeft}>
                <BookOpen size={24} color="#7c3aed" />
                <View>
                  <Text style={[styles.className, { color: isDarkMode ? 'white' : '#111827' }]}>{cls.name}</Text>
                  <Text style={[styles.code, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{cls.subjectCode}</Text>
                </View>
              </View>
              <View style={styles.studentCount}>
                <Users size={14} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <Text style={[styles.countText, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{cls.studentCount}</Text>
              </View>
            </TouchableOpacity>
          ))
        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 4, paddingBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  className: { fontSize: 16, fontWeight: '600' },
  code: { fontSize: 13, marginTop: 2 },
  studentCount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  countText: { fontSize: 13 },
});
