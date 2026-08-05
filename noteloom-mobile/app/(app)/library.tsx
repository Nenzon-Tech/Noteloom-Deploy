import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { FileText, Library as LibraryIcon, Play, StickyNote, Download, GraduationCap } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { authHeaders } from '../../lib/api';
import { getSessionToken } from '../../lib/storage';
import { Screen } from '../../components/ui/Screen';
import { SubHeader } from '../../components/ui/SubHeader';
import { FilterChips } from '../../components/ui/FilterChips';
import { EmptyState } from '../../components/ui/EmptyState';
import { BottomNav } from '../../components/ui/BottomNav';

type LibFilter = 'all' | 'syllabus' | 'pyqs' | 'slides' | 'notes';

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
      const response = await fetch(`${API_BASE}/api/library/books`, { headers: authHeaders(token) });
      if (response.ok) {
        const data = await response.json();
        setBooks(Array.isArray(data) ? data : []);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const handleDownload = (doc: any) => {
    setDownloadingId(doc._id);
    setTimeout(() => {
      setDownloadingId(null);
    }, 1200);
  };

  const fallback = [
    { _id: 'l1', title: 'DBMS Syllabus — Sem 6', category: 'syllabus', meta: 'PDF · 3rd Year CSE', icon: <FileText size={19} color="#7c3aed" />, bg: 'rgba(124,58,237,0.1)' },
    { _id: 'l2', title: 'PYQ 2020–2025 · Computer Networks', category: 'pyqs', meta: 'PDF · Combined', icon: <GraduationCap size={19} color="#2563eb" />, bg: 'rgba(59,130,246,0.1)' },
    { _id: 'l3', title: 'OS Lecture Slides — Modules 1–3', category: 'slides', meta: 'PDF · Prof. R. Ghosh', icon: <Play size={19} color="#10b981" />, bg: 'rgba(16,185,129,0.1)' },
    { _id: 'l4', title: 'DSA Handwritten Notes', category: 'notes', meta: 'PDF · Unit 4 Graphs', icon: <StickyNote size={19} color="#d97706" />, bg: 'rgba(245,158,11,0.1)' },
  ];

  const list = (books.length ? books.map(b => ({ _id: b._id, title: b.title, category: 'notes', meta: b.author || 'PDF', icon: <LibraryIcon size={19} color="#7c3aed" />, bg: 'rgba(124,58,237,0.1)' })) : fallback).filter(d => filter === 'all' || d.category === filter);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen hasHeader={false}>
        <SubHeader title="Digital Library" />
        <FilterChips<LibFilter>
          options={[{ value: 'all', label: 'All' }, { value: 'syllabus', label: 'Syllabus' }, { value: 'pyqs', label: 'PYQs' }, { value: 'slides', label: 'Slides' }, { value: 'notes', label: 'Notes' }]}
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
