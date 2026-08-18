import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Building, CheckCircle, XCircle, Clock3 } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { API_BASE } from '../../../lib/constants';
import { authHeaders } from '../../../lib/api';
import { getSessionToken } from '../../../lib/storage';
import { Screen } from '../../../components/ui/Screen';
import { SubHeader } from '../../../components/ui/SubHeader';
import { SrvRow } from '../../../components/ui/SrvRow';
import { EmptyState } from '../../../components/ui/EmptyState';

interface Tenant {
  _id: string;
  name?: string;
  type?: string;
  status?: string;
  collegeCode?: string;
  location?: string;
  createdAt?: string;
}

const colorFor = (status?: string): 'green' | 'red' | 'amber' | 'ghost' => {
  if (status === 'active') return 'green';
  if (status === 'suspended') return 'red';
  if (status === 'pending') return 'amber';
  return 'ghost';
};

export default function ITAdminServers() {
  const { theme } = useTheme();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getSessionToken();
        const res = await fetch(`${API_BASE}/it-admin/tenants-list`, { headers: authHeaders(token) });
        if (res.ok) {
          const d = await res.json();
          setTenants(Array.isArray(d) ? d : []);
        }
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Tenants" subtitle={`${tenants.length} colleges on platform`} />
        {loading ? (
          <EmptyState message="Loading tenants…" />
        ) : tenants.length === 0 ? (
          <EmptyState message="No tenants yet" />
        ) : (
          tenants.map((t, i) => (
            <SrvRow
              key={t._id || i}
              icon={<Building size={18} color={t.status === 'active' ? '#10b981' : t.status === 'suspended' ? '#f43f5e' : '#f59e0b'} />}
              iconBg={t.status === 'active' ? 'rgba(16,185,129,0.14)' : t.status === 'suspended' ? 'rgba(244,63,94,0.14)' : 'rgba(245,158,11,0.14)'}
              title={t.name || 'Tenant'}
              meta={`${t.type || ''} · ${t.collegeCode || ''} · ${t.location || ''}`}
              action={t.status || 'active'}
              actionColor={colorFor(t.status)}
            />
          ))
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({});