import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, CalendarDays, Clock } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { getSessionToken } from '../../lib/storage';
import GlassHeader from '../../components/ui/GlassHeader';

interface CalendarEvent {
  _id: string;
  title: string;
  date: string;
  description?: string;
  type?: string;
}

export default function AcademicCalendar() {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/academic/calendar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(Array.isArray(data) ? data : []);
      }
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
      <GlassHeader variant="dashboard">
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <CalendarDays size={22} color="#7c3aed" />
          <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Academic Calendar</Text>
        </View>
      </GlassHeader>
      <ScrollView contentContainerStyle={{ paddingTop: 80, padding: 16 }}>
        {loading ? <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 60 }} /> :
          events.length === 0 ? (
            <View style={styles.empty}>
              <Calendar size={48} color={isDarkMode ? '#6b7280' : '#9ca3af'} style={{ opacity: 0.4 }} />
              <Text style={[styles.emptyText, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>No upcoming events</Text>
            </View>
          ) : (
            events.map((event) => (
              <View key={event._id} style={[styles.card, { backgroundColor: isDarkMode ? 'rgba(30,41,59,0.4)' : 'white', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
                <View style={styles.dateBox}>
                  <Text style={[styles.dateDay, { color: '#7c3aed' }]}>{new Date(event.date).getDate()}</Text>
                  <Text style={[styles.dateMonth, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                  </Text>
                </View>
                <View style={styles.eventContent}>
                  <Text style={[styles.eventTitle, { color: isDarkMode ? 'white' : '#111827' }]}>{event.title}</Text>
                  {event.description && <Text style={[styles.eventDesc, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{event.description}</Text>}
                  {event.type && <View style={[styles.typeBadge, { backgroundColor: isDarkMode ? '#1e293b' : '#f3f4f6' }]}>
                    <Text style={[styles.typeText, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>{event.type}</Text>
                  </View>}
                </View>
              </View>
            ))
          )
        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4, paddingBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15 },
  card: { flexDirection: 'row', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12, gap: 16 },
  dateBox: { alignItems: 'center', minWidth: 48 },
  dateDay: { fontSize: 24, fontWeight: '800' },
  dateMonth: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  eventContent: { flex: 1 },
  eventTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  eventDesc: { fontSize: 13, marginBottom: 8, lineHeight: 18 },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  typeText: { fontSize: 11, fontWeight: '600' },
});
