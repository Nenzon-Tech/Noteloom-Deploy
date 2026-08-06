import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { API_BASE } from '../../../lib/constants';
import { authHeaders } from '../../../lib/api';
import { getSessionToken } from '../../../lib/storage';
import { Screen } from '../../../components/ui/Screen';
import { SubHeader } from '../../../components/ui/SubHeader';
import { FilterChips } from '../../../components/ui/FilterChips';
import { AprRow } from '../../../components/ui/AprRow';
import { EmptyState } from '../../../components/ui/EmptyState';

type AprFilter = 'all' | 'pending';

interface RequestItem {
  _id: string;
  collegeName?: string;
  adminName?: string;
  adminEmail?: string;
  requestedBy?: string;
  status?: string;
  createdAt?: string;
}

export default function AdminApprovals() {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<AprFilter>('all');
  const [rows, setRows] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/college-admin/requests`, { headers: authHeaders(token) });
      if (response.ok) {
        const data = await response.json();
        setRows(Array.isArray(data) ? data.filter((r: RequestItem) => r.status === 'pending') : []);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const decide = async (id: string, action: 'approve' | 'reject') => {
    try {
      const token = await getSessionToken();
      await fetch(`${API_BASE}/api/college-admin/requests/${id}/${action}`, {
        method: 'POST',
        headers: authHeaders(token),
      });
    } catch {}
    setRows(prev => prev.filter(r => r._id !== id));
  };

  const list = rows.filter(r => filter === 'all' || r.status === filter);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Approvals" subtitle={`${rows.length} pending requests`} />
        <FilterChips<AprFilter>
          options={[{ value: 'all', label: 'All' }, { value: 'pending', label: 'Pending' }]}
          value={filter}
          onChange={setFilter}
        />
        {loading ? (
          <EmptyState message="Loading requests…" />
        ) : list.length === 0 ? (
          <EmptyState message="Nothing pending" />
        ) : (
          list.map(r => (
            <AprRow
              key={r._id}
              initial={(r.adminName || 'A')[0]}
              name={r.adminName || 'Unknown'}
              meta={`${r.collegeName || 'College'} · ${r.adminEmail || ''} · ${r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'recent'}`}
              gradient={['#3b82f6', '#6366f1']}
              onApprove={() => decide(r._id, 'approve')}
              onReject={() => decide(r._id, 'reject')}
            />
          ))
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({});
