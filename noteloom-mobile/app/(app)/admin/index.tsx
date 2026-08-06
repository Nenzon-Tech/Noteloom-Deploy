import React, { useState, useEffect, useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Sun, Moon, LogOut, ClipboardCheck, Users, Megaphone, Bot, RefreshCw } from 'lucide-react-native';
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
import { AprRow } from '../../../components/ui/AprRow';
import { EmptyState } from '../../../components/ui/EmptyState';
import { BottomNav } from '../../../components/ui/BottomNav';

interface RequestItem {
  _id: string;
  collegeName?: string;
  adminName?: string;
  adminEmail?: string;
  requestedBy?: string;
  status?: string;
  createdAt?: string;
}

export default function AdminHome() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useSession();
  const router = useRouter();

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [facultyCount, setFacultyCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const handleSignOut = async () => { await logout(); router.replace('/college-selection'); };

  const fetchData = useCallback(async () => {
    try {
      const token = await getSessionToken();
      const [reqRes, stuRes, facRes] = await Promise.all([
        fetch(`${API_BASE}/api/college-admin/requests`, { headers: authHeaders(token) }),
        fetch(`${API_BASE}/api/college-admin/users/student`, { headers: authHeaders(token) }),
        fetch(`${API_BASE}/api/college-admin/users/faculty`, { headers: authHeaders(token) }),
      ]);
      if (reqRes.ok) {
        const data = await reqRes.json();
        setRequests(Array.isArray(data) ? data.filter((r: RequestItem) => r.status === 'pending') : []);
      }
      if (stuRes.ok) {
        const data = await stuRes.json();
        setStudentCount(Array.isArray(data) ? data.length : 0);
      }
      if (facRes.ok) {
        const data = await facRes.json();
        setFacultyCount(Array.isArray(data) ? data.length : 0);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const pending = requests.length;
  const totalUsers = studentCount + facultyCount;

  const quick = [
    { key: 'ap', label: 'Approvals', sub: `${pending} pending`, gradient: ['#10b981', '#0d9488'] as [string, string], icon: <ClipboardCheck size={18} color="#fff" />, onPress: () => router.push('/(app)/admin/approvals') },
    { key: 'users', label: 'Users', sub: `${totalUsers} active`, gradient: ['#3b82f6', '#6366f1'] as [string, string], icon: <Users size={18} color="#fff" />, onPress: () => router.push('/(app)/admin/users') },
    { key: 'notice', label: 'Notice', sub: 'Announce', gradient: ['#f43f5e', '#e11d48'] as [string, string], icon: <Megaphone size={18} color="#fff" />, onPress: () => router.push('/(app)/admin/notices') },
    { key: 'ai', label: 'Noteloom Ai', sub: 'Reports', gradient: ['#a855f7', '#7c3aed'] as [string, string], icon: <Bot size={18} color="#fff" />, onPress: () => router.push('/(app)/ai-chat') },
  ];

  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <GHeader
          avatar={<Avatar label={(user?.name || 'A')[0]} />}
          title={`Good morning, ${user?.name || 'College Admin'}`}
          subtitle={`College Admin · ${today}`}
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
          colors={['#2563EB', '#9333EA']}
          label="Registered users"
          pill="This college"
          value={loading ? '…' : String(totalUsers)}
          subLabel={`${studentCount} students · ${facultyCount} faculty`}
          subPill={`${pending} pending`}
        />

        <QuickGrid items={quick} />

        <SectionHeader title="Pending approvals" action="See all" onAction={() => router.push('/(app)/admin/approvals')} />
        {loading ? (
          <EmptyState message="Loading requests…" />
        ) : pending === 0 ? (
          <EmptyState message="No pending approvals" />
        ) : (
          requests.slice(0, 3).map(r => (
            <AprRow
              key={r._id}
              initial={(r.adminName || 'A')[0]}
              name={r.adminName || 'Unknown'}
              meta={`${r.collegeName || 'College'} · ${r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'recent'}`}
              gradient={['#3b82f6', '#6366f1']}
              onApprove={() => {}}
              onReject={() => {}}
            />
          ))
        )}
      </Screen>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  iconBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
