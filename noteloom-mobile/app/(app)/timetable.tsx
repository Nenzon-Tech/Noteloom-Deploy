import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock, MapPin, User } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { getSessionToken } from '../../lib/storage';
import GlassHeader from '../../components/ui/GlassHeader';

interface TimetableEntry {
  _id: string;
  subject: string;
  room: string;
  faculty: string;
  timeSlot: string;
  day: string;
}

export default function Timetable() {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTimetable(); }, []);

  const fetchTimetable = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/routine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setEntries(Array.isArray(data) ? data : []);
      }
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
      <GlassHeader variant="dashboard">
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Timetable</Text>
        </View>
      </GlassHeader>
      <ScrollView contentContainerStyle={{ paddingTop: 80, padding: 16 }}>
        {loading ? <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 60 }} /> :
          entries.map((entry) => (
            <View key={entry._id} style={[styles.card, { backgroundColor: isDarkMode ? 'rgba(30,41,59,0.4)' : 'white', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
              <View style={styles.topRow}>
                <Text style={[styles.subject, { color: isDarkMode ? 'white' : '#111827' }]}>{entry.subject}</Text>
                <Text style={[styles.day, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{entry.day}</Text>
              </View>
              <View style={styles.details}>
                <View style={styles.detailRow}>
                  <Clock size={14} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                  <Text style={[styles.detailText, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>{entry.timeSlot}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MapPin size={14} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                  <Text style={[styles.detailText, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>{entry.room}</Text>
                </View>
                <View style={styles.detailRow}>
                  <User size={14} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                  <Text style={[styles.detailText, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>{entry.faculty}</Text>
                </View>
              </View>
            </View>
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
  card: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  subject: { fontSize: 16, fontWeight: '600' },
  day: { fontSize: 13 },
  details: { gap: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 14 },
});
