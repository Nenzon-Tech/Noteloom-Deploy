import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { authHeaders } from '../../lib/api';
import { getSessionToken } from '../../lib/storage';
import { Screen } from '../../components/ui/Screen';
import { GHeader } from '../../components/ui/GHeader';
import { NoticeCard } from '../../components/ui/NoticeCard';
import { Avatar } from '../../components/ui/Avatar';
import { FilterChips } from '../../components/ui/FilterChips';
import { EmptyState } from '../../components/ui/EmptyState';
import { BottomNav } from '../../components/ui/BottomNav';

type Filter = 'all' | 'exam' | 'event' | 'campus' | 'library';

interface Notice {
  _id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

const CATEGORY_GRADIENTS: Record<string, [string, string]> = {
  exam: ['#3b82f6', '#6366f1'],
  event: ['#f59e0b', '#ea580c'],
  campus: ['#10b981', '#047857'],
  library: ['#7c3aed', '#4c1d95'],
};

const fallback: Notice[] = [
  { _id: 'n1', title: 'Mid-Sem Exam Schedule Released', content: 'Mid-semester examinations for all branches will begin from 12 March. Admit cards are now available in the exam portal. Kindly report 30 minutes early with your ID card.', category: 'exam', createdAt: new Date().toISOString() },
  { _id: 'n2', title: 'New PYQ Uploads in Digital Library', content: 'Previous year question papers (2020–2025) for core engineering subjects are now available. Browse by subject in the Digital Library module.', category: 'library', createdAt: new Date().toISOString() },
  { _id: 'n3', title: 'Infosys Off-Campus Drive — Register by 20 Mar', content: 'Eligible students (CGPA ≥ 7.5) can register for the upcoming recruitment drive. Carry updated resumes and project certificates.', category: 'event', createdAt: new Date().toISOString() },
];

const demoComments = { n1: [{ author: 'Riya Sharma', text: 'Will the schedule clash with the DBMS practicals?' }, { author: 'Ankit Das', text: 'Checked my admit card, everything looks fine. Thanks!' }], n2: [{ author: 'Sneha Roy', text: 'Please add CN PYQs for 2024 too.' }], n3: [{ author: 'Debashis P', text: 'Is this open for ECE students as well?' }] };

export default function NoticeBoard() {
  const { theme } = useTheme();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => { fetchNotices(); }, []);

  const fetchNotices = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/notices`, { headers: authHeaders(token) });
      if (response.ok) {
        const data = await response.json();
        setNotices(Array.isArray(data) ? data : []);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const list = (notices.length ? notices : fallback).filter(n => {
    if (filter === 'all') return true;
    return (n.category || '').toLowerCase().includes(filter);
  });

  const chips: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'exam', label: 'Exams' },
    { value: 'event', label: 'Events' },
    { value: 'campus', label: 'Campus' },
    { value: 'library', label: 'Library' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <GHeader title="Notice Board" subtitle="Campus updates & announcements" />
        <FilterChips<Filter> options={chips} value={filter} onChange={setFilter} />

        {loading ? (
          <ActivityIndicator color={theme.violet} style={{ paddingVertical: 60 }} />
        ) : list.length === 0 ? (
          <EmptyState message="No notices in this category" />
        ) : (
          list.map(n => (
            <NoticeCard
              key={n._id}
              avatar={<Avatar label={n.category?.[0] || 'N'} gradient={CATEGORY_GRADIENTS[n.category?.toLowerCase()] || ['#3b82f6', '#6366f1']} />}
              author={n.category ? n.category.charAt(0).toUpperCase() + n.category.slice(1) : 'Campus'}
              authorMeta={`Campus Dept · ${n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'recent'}`}
              title={n.title}
              body={n.content}
              likes={48}
              comments={demoComments[n._id]?.length || 0}
              commentsOpen={demoComments[n._id]}
              attachment={{ name: `${(n.title || 'Notice').slice(0, 24)}.pdf`, meta: 'PDF Document · 1.2 MB', onPress: () => {} }}
            />
          ))
        )}
      </Screen>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  titleBlock: { marginVertical: 4 },
  title: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  subtitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },
});
