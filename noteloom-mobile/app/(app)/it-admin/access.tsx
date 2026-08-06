import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { API_BASE } from '../../../lib/constants';
import { authHeaders } from '../../../lib/api';
import { getSessionToken } from '../../../lib/storage';
import { Screen } from '../../../components/ui/Screen';
import { SubHeader } from '../../../components/ui/SubHeader';
import { SrvRow } from '../../../components/ui/SrvRow';
import { EmptyState } from '../../../components/ui/EmptyState';

interface ITUser {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
  uid?: string;
}

export default function ITAdminAccess() {
  const { theme } = useTheme();
  const [users, setUsers] = useState<ITUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getSessionToken();
        const res = await fetch(`${API_BASE}/it-admin/users`, { headers: authHeaders(token) });
        if (res.ok) {
          const d = await res.json();
          setUsers(Array.isArray(d) ? d : []);
        }
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="IT Access" subtitle={`${users.length} IT users`} />
        {loading ? (
          <EmptyState message="Loading users…" />
        ) : users.length === 0 ? (
          <EmptyState message="No IT users yet" />
        ) : (
          users.map((u, i) => (
            <SrvRow
              key={u._id || i}
              avatar={<Text style={styles.avatarText}>{u.name?.[0]?.toUpperCase() || 'U'}</Text>}
              title={u.name || 'User'}
              meta={`${u.email || ''} · UID ${u.uid || 'N/A'}`}
              action={u.role === 'noteloom_admin' ? 'Admin' : 'Manager'}
              actionColor={u.role === 'noteloom_admin' ? 'red' : 'blue'}
            />
          ))
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarText: {
    width: 36, height: 36, borderRadius: 11, textAlign: 'center', lineHeight: 36,
    backgroundColor: 'rgba(99,102,241,0.14)', color: '#6366f1', fontSize: 13, fontWeight: '700',
  },
});