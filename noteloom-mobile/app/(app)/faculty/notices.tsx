import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { useSession } from '../../../hooks/useSession';
import { API_BASE } from '../../../lib/constants';
import { authHeaders } from '../../../lib/api';
import { getSessionToken } from '../../../lib/storage';
import { Screen } from '../../../components/ui/Screen';
import { GHeader } from '../../../components/ui/GHeader';
import { Avatar } from '../../../components/ui/Avatar';
import { PubForm } from '../../../components/ui/PubForm';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { NoticeCard } from '../../../components/ui/NoticeCard';
import { EmptyState } from '../../../components/ui/EmptyState';

interface Notice {
  _id: string;
  type?: string;
  title: string;
  content: string;
  posterName?: string;
  reactions?: { userId: string; userName: string }[];
  comments?: { userName: string; text: string }[];
  createdAt?: string;
}

export default function FacultyNotices() {
  const { theme } = useTheme();
  const { user } = useSession();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotices = useCallback(async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/notices/staff`, { headers: authHeaders(token) });
      if (response.ok) {
        const data = await response.json();
        setNotices(Array.isArray(data) ? data : []);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotices(); }, [fetchNotices]);

  const publish = async ({ title, body }: { title: string; body: string; audience: string }) => {
    try {
      const token = await getSessionToken();
      await fetch(`${API_BASE}/api/notices`, {
        method: 'POST',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'staff', title, content: body }),
      });
      await fetchNotices();
    } catch {}
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <GHeader
          avatar={<Avatar label={(user?.name || 'N')[0]} gradient={['#3b82f6', '#6366f1']} />}
          title="Notices"
          subtitle="Faculty desk"
        />
        <PubForm title="Publish a notice" bodyLabel="Details" audiences={['All Students', 'CSE', 'Faculty', 'Exam Cell']} onPublish={publish} />
        <SectionHeader title="Recent" />
        {loading ? (
          <EmptyState message="Loading notices…" />
        ) : notices.length === 0 ? (
          <EmptyState message="No notices published yet" />
        ) : (
          notices.map(n => (
            <NoticeCard
              key={n._id}
              tag={n.type === 'departmental' ? 'Departmental' : 'Staff'}
              tagColor="green"
              time={n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
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
    </View>
  );
}

const styles = StyleSheet.create({});
