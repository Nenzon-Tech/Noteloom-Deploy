import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { API_BASE } from '../../../lib/constants';
import { authHeaders } from '../../../lib/api';
import { getSessionToken } from '../../../lib/storage';
import { Screen } from '../../../components/ui/Screen';
import { SubHeader } from '../../../components/ui/SubHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

interface CollegeRequest {
  _id: string;
  collegeName?: string;
  adminName?: string;
  adminEmail?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

const statusLabel = (s?: string) => (s ? s[0].toUpperCase() + s.slice(1) : 'Pending');

export default function ITAdminAudit() {
  const { theme } = useTheme();
  const [requests, setRequests] = useState<CollegeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getSessionToken();
        const res = await fetch(`${API_BASE}/it-admin/college-requests`, { headers: authHeaders(token) });
        if (res.ok) {
          const d = await res.json();
          setRequests(Array.isArray(d) ? d : []);
        }
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Request Log" subtitle={`${requests.length} college requests`} />
        {loading ? (
          <EmptyState message="Loading requests…" />
        ) : requests.length === 0 ? (
          <EmptyState message="No requests logged" />
        ) : (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, ...theme.elev1 }]}>
            {requests.map((l, i) => (
              <View key={l._id || i} style={[styles.row, { borderBottomColor: theme.border }, i === requests.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={[styles.time, { color: theme.violet }]}>
                  {l.createdAt ? new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                </Text>
                <View style={styles.info}>
                  <Text style={[styles.title, { color: theme.fg }]} numberOfLines={1}>{l.collegeName || 'College request'}</Text>
                  <Text style={[styles.meta, { color: theme.faint }]} numberOfLines={1}>
                    {l.adminName || ''} · {l.adminEmail || ''} · {statusLabel(l.status)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1 },
  time: { fontSize: 12, fontWeight: '800', width: 48 },
  info: { flex: 1, minWidth: 0 },
  title: { fontSize: 13, fontWeight: '600' },
  meta: { fontSize: 10, marginTop: 2 },
});