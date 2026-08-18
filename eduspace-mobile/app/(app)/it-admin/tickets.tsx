import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { API_BASE } from '../../../lib/constants';
import { authHeaders } from '../../../lib/api';
import { getSessionToken } from '../../../lib/storage';
import { Screen } from '../../../components/ui/Screen';
import { SubHeader } from '../../../components/ui/SubHeader';
import { FilterChips } from '../../../components/ui/FilterChips';
import { SrvRow } from '../../../components/ui/SrvRow';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Gradient } from '../../../components/ui/Gradient';

type ReqFilter = 'all' | 'pending' | 'approved' | 'rejected';

interface ReqItem {
  _id: string;
  collegeName?: string;
  adminName?: string;
  adminEmail?: string;
  status?: string;
  createdAt?: string;
}

interface RequestItem extends ReqItem {}

const TicketAvatar = ({ label, gradient }: { label: string; gradient?: [string, string] }) => (
  <Gradient colors={gradient || ['#6366f1', '#8b5cf6']} angle={135} radius={11} style={{ width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{label}</Text>
  </Gradient>
);

export default function ITAdminTickets() {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<ReqFilter>('all');
  const [collegeReqs, setCollegeReqs] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getSessionToken();
        const res = await fetch(`${API_BASE}/it-admin/college-requests`, { headers: authHeaders(token) });
        if (res.ok) {
          const d = await res.json();
          setCollegeReqs(Array.isArray(d) ? d : []);
        }
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const list = filter === 'all' ? collegeReqs : collegeReqs.filter(r => (r.status || 'pending') === filter);
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="College Requests" subtitle={`${collegeReqs.length} onboarding requests`} />
        <FilterChips<ReqFilter>
          options={[{ value: 'all', label: 'All' }, { value: 'pending', label: 'Pending' }]}
          value={filter}
          onChange={setFilter}
        />
        {loading ? (
          <EmptyState message="Loading requests…" />
        ) : list.length === 0 ? (
          <EmptyState message="No onboarding requests" />
        ) : (
          list.map((t, i) => (
            <SrvRow
              key={t._id || i}
              avatar={<TicketAvatar label={(t.collegeName || 'C')[0]} gradient={i % 2 ? ['#0ea5e9', '#7c3aed'] : ['#f43f5e', '#a855f7']} />}
              title={t.collegeName || 'College'}
              meta={`${t.adminName || ''} · ${t.adminEmail || ''} · ${t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ''}`}
              action={t.status || 'pending'}
              actionColor={t.status === 'approved' ? 'green' : t.status === 'rejected' ? 'red' : 'amber'}
            />
          ))
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({});