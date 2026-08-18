import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Sun, Moon, LogOut, Server, Ticket, Users, FileText, RefreshCw, Building } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { useSession } from '../../../hooks/useSession';
import { API_BASE } from '../../../lib/constants';
import { authHeaders } from '../../../lib/api';
import { getSessionToken } from '../../../lib/storage';
import { Screen } from '../../../components/ui/Screen';
import { GHeader } from '../../../components/ui/GHeader';
import { Avatar } from '../../../components/ui/Avatar';
import { BalanceCard } from '../../../components/ui/BalanceCard';
import { QuickGrid } from '../../../components/ui/QuickGrid';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { BottomNav } from '../../../components/ui/BottomNav';

export default function ITAdminHome() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useSession();
  const router = useRouter();

  const [tenantCount, setTenantCount] = useState<number | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [requestCount, setRequestCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const handleSignOut = async () => { await logout(); router.replace('/college-selection'); };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await getSessionToken();
      const [ten, users, reqs] = await Promise.all([
        fetch(`${API_BASE}/it-admin/tenants-list`, { headers: authHeaders(token) }),
        fetch(`${API_BASE}/it-admin/users`, { headers: authHeaders(token) }),
        fetch(`${API_BASE}/it-admin/college-requests`, { headers: authHeaders(token) }),
      ]);
      if (ten.ok) { const d = await ten.json(); setTenantCount(Array.isArray(d) ? d.length : 0); }
      if (users.ok) { const d = await users.json(); setUserCount(Array.isArray(d) ? d.length : 0); }
      if (reqs.ok) { const d = await reqs.json(); setRequestCount(Array.isArray(d) ? d.length : 0); }
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const quick = [
    { key: 'servers', label: 'Tenants', sub: `${tenantCount ?? '…'} colleges`, gradient: ['#0ea5e9', '#0284c7'] as [string, string], icon: <Server size={18} color="#fff" />, onPress: () => router.push('/(app)/it-admin/servers') },
    { key: 'tickets', label: 'Requests', sub: `${requestCount ?? '…'} pending`, gradient: ['#f43f5e', '#e11d48'] as [string, string], icon: <Ticket size={18} color="#fff" />, onPress: () => router.push('/(app)/it-admin/tickets') },
    { key: 'access', label: 'Access', sub: `${userCount ?? '…'} admins`, gradient: ['#3b82f6', '#6366f1'] as [string, string], icon: <Users size={18} color="#fff" />, onPress: () => router.push('/(app)/it-admin/access') },
    { key: 'audit', label: 'Audit Log', sub: 'Requests', gradient: ['#a855f7', '#7c3aed'] as [string, string], icon: <FileText size={18} color="#fff" />, onPress: () => router.push('/(app)/it-admin/audit') },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <GHeader
          avatar={<Avatar label={(user?.name || 'I')[0]} gradient={['#0ea5e9', '#7c3aed']} />}
          title={`Hello, ${user?.name || 'IT Admin'}`}
          subtitle="IT Admin · Network ops"
          actions={
            <>
              <Pressable onPress={toggleTheme} style={[styles.iconBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
                {isDarkMode ? <Sun size={19} color={theme.fg} /> : <Moon size={19} color={theme.fg} />}
              </Pressable>
              <Pressable onPress={fetchData} style={[styles.iconBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
                <RefreshCw size={19} color={theme.fg} />
              </Pressable>
              <Pressable onPress={handleSignOut} style={[styles.iconBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
                <LogOut size={19} color={theme.red} />
              </Pressable>
            </>
          }
        />

        <BalanceCard
          colors={['#0ea5e9', '#7c3aed']}
          label="Registered tenants"
          pill="Platform-wide"
          value={loading ? '…' : String(tenantCount ?? 0)}
          valueSuffix="  tenants"
          subLabel={`${userCount ?? 0} IT users`}
          subPill={`${requestCount ?? 0} requests`}
        />

        <QuickGrid items={quick} />

        <SectionHeader title="Platform overview" />
        {loading ? (
          <EmptyState message="Loading…" />
        ) : (
          <Text style={{ color: theme.faint, fontSize: 12, lineHeight: 18 }}>
            Real platform data from the live API. Use the quick actions to review tenants, IT users, and onboarding requests.
          </Text>
        )}
      </Screen>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  iconBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});