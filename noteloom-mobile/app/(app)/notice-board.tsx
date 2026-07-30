import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, CalendarDays } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { getSessionToken } from '../../lib/storage';
import GlassHeader from '../../components/ui/GlassHeader';

interface Notice {
  _id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

export default function NoticeBoard() {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotices(); }, []);

  const fetchNotices = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/notices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setNotices(Array.isArray(data) ? data : []);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const getCategoryColor = (category: string) => {
    const map: Record<string, string> = {
      exam: '#7c3aed',
      academic: '#2563eb',
      event: '#16a34a',
      holiday: '#f59e0b',
      general: '#6b7280',
    };
    return map[category?.toLowerCase()] || '#6b7280';
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
      <GlassHeader variant="dashboard">
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Notice Board</Text>
        </View>
      </GlassHeader>

      <ScrollView contentContainerStyle={{ paddingTop: 80, padding: 16 }}>
        {loading ? <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 60 }} /> :
          notices.length === 0 ? (
            <View style={styles.empty}>
              <Bell size={48} color={isDarkMode ? '#6b7280' : '#9ca3af'} style={{ opacity: 0.4 }} />
              <Text style={[styles.emptyText, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>No notices yet</Text>
            </View>
          ) : (
            notices.map((notice) => (
              <View key={notice._id} style={[styles.card, { backgroundColor: isDarkMode ? 'rgba(30,41,59,0.4)' : 'white', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
                <View style={styles.topRow}>
                  <Text style={[styles.category, { backgroundColor: getCategoryColor(notice.category) + '20', color: getCategoryColor(notice.category) }]}>
                    {notice.category || 'General'}
                  </Text>
                  <View style={styles.dateRow}>
                    <CalendarDays size={12} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                    <Text style={[styles.date, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{new Date(notice.createdAt).toLocaleDateString()}</Text>
                  </View>
                </View>
                <Text style={[styles.title, { color: isDarkMode ? 'white' : '#111827' }]}>{notice.title}</Text>
                <Text style={[styles.content, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]} numberOfLines={3}>{notice.content}</Text>
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
  header: { paddingHorizontal: 4, paddingBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15 },
  card: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  category: { fontSize: 11, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  date: { fontSize: 12 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  content: { fontSize: 14, lineHeight: 20 },
});
