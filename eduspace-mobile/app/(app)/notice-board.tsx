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

type Filter = 'all' | 'staff' | 'departmental';

interface Notice {
  _id: string;
  type?: string;
  title: string;
  content: string;
  posterName?: string;
  posterRole?: string;
  reactions?: { userId: string; userName: string }[];
  comments?: { userName: string; text: string }[];
  createdAt: string;
}

const TYPE_GRADIENTS: Record<string, [string, string]> = {
  staff: ['#3b82f6', '#6366f1'],
  departmental: ['#10b981', '#047857'],
};

export default function NoticeBoard() {
  const { theme } = useTheme();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => { fetchNotices(); }, []);

  const fetchNotices = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/notices/staff`, { headers: authHeaders(token) });
      if (response.ok) {
        const data = await response.json();
        setNotices(Array.isArray(data) ? data : []);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const list = notices.filter(n => {
    if (filter === 'all') return true;
    return (n.type || '').toLowerCase() === filter;
  });

  const chips: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'staff', label: 'Staff' },
    { value: 'departmental', label: 'Departmental' },
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
              avatar={<Avatar label={(n.type || 'N')[0]} gradient={TYPE_GRADIENTS[n.type?.toLowerCase() || ''] || ['#3b82f6', '#6366f1']} />}
              author={n.type ? n.type.charAt(0).toUpperCase() + n.type.slice(1) : 'Staff'}
              authorMeta={`${n.posterName || 'Notice'}`}
              title={n.title}
              body={n.content}
              likes={n.reactions?.length || 0}
              comments={n.comments?.length || 0}
              commentsOpen={(n.comments || []).map(c => ({ author: c.userName || 'User', text: c.text }))}
              attachment={undefined}
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