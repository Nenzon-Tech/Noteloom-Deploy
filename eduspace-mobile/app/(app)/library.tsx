import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, Linking } from 'react-native';
import { FileText, Play, StickyNote, Download, GraduationCap } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { authHeaders } from '../../lib/api';
import { getSessionToken } from '../../lib/storage';
import { Screen } from '../../components/ui/Screen';
import { SubHeader } from '../../components/ui/SubHeader';
import { FilterChips } from '../../components/ui/FilterChips';
import { EmptyState } from '../../components/ui/EmptyState';
import { BottomNav } from '../../components/ui/BottomNav';

type LibFilter = 'all' | 'Notes' | 'E-Book' | 'Paper' | 'Video';

const chipOptions: { value: LibFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'Notes', label: 'Notes' },
  { value: 'E-Book', label: 'E-Books' },
  { value: 'Paper', label: 'Papers' },
  { value: 'Video', label: 'Videos' },
];

export default function LibraryScreen() {
  const { theme } = useTheme();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LibFilter>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => { fetchBooks(); }, []);

  const fetchBooks = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/library/digital`, { headers: authHeaders(token) });
      if (response.ok) {
        const data = await response.json();
        const resources = Array.isArray(data.resources) ? data.resources : [];
        setBooks(resources.map((b: any) => ({
          _id: b._id,
          title: b.title,
          category: b.type || 'Notes',
          meta: `${b.author || 'Library'} · ${b.department || 'General'}`,
          url: b.url,
          icon: iconFor(b.type),
          bg: bgFor(b.type),
        })));
      }
    } catch {}
    finally { setLoading(false); }
  };

  const iconFor = (type?: string) => {
    switch ((type || '').toLowerCase()) {
      case 'video': return <Play size={19} color="#10b981" />;
      case 'paper': return <GraduationCap size={19} color="#2563eb" />;
      case 'notes': return <StickyNote size={19} color="#d97706" />;
      default: return <FileText size={19} color="#7c3aed" />;
    }
  };

  const bgFor = (type?: string) => {
    switch ((type || '').toLowerCase()) {
      case 'video': return 'rgba(16,185,129,0.1)';
      case 'paper': return 'rgba(59,130,246,0.1)';
      case 'notes': return 'rgba(245,158,11,0.1)';
      default: return 'rgba(124,58,237,0.1)';
    }
  };

  const handleDownload = (doc: any) => {
    setDownloadingId(doc._id);
    if (doc.url) Linking.openURL(doc.url).catch(() => {});
    setTimeout(() => { setDownloadingId(null); }, 1200);
  };

  const list = books.filter(d => filter === 'all' || d.category === filter);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen hasHeader={false}>
        <SubHeader title="Digital Library" />
        <FilterChips<LibFilter>
          options={chipOptions}
          value={filter}
          onChange={setFilter}
        />
        {loading ? (
          <ActivityIndicator color={theme.violet} style={{ paddingVertical: 60 }} />
        ) : list.length === 0 ? (
          <EmptyState message="No documents in this category" />
        ) : (
          list.map(d => (
            <View key={d._id} style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border, ...theme.elev1 }]}>
              <View style={[styles.ic, { backgroundColor: d.bg }]}>{d.icon}</View>
              <View style={styles.info}>
                <Text style={[styles.title, { color: theme.fg }]} numberOfLines={1}>{d.title}</Text>
                <Text style={[styles.meta, { color: theme.faint }]}>{d.meta}</Text>
              </View>
              <Pressable
                onPress={() => handleDownload(d)}
                style={({ pressed }) => [
                  styles.dl,
                  { backgroundColor: theme.surface2, borderColor: theme.border },
                  pressed && { transform: [{ scale: 0.92 }] },
                ]}
              >
                {downloadingId === d._id ? (
                  <ActivityIndicator size="small" color={theme.violet} />
                ) : (
                  <Download size={15} color={theme.violet} />
                )}
              </Pressable>
            </View>
          ))
        )}
      </Screen>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  ic: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, minWidth: 0 },
  title: { fontSize: 13, fontWeight: '600' },
  meta: { fontSize: 10, marginTop: 2 },
  dl: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
