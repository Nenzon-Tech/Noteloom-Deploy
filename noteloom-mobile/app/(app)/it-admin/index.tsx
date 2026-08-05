import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Sun, Moon, LogOut, Server, Ticket, Users, FileText, Wifi, RefreshCw, AlertTriangle, Check } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { useSession } from '../../../hooks/useSession';
import { Screen } from '../../../components/ui/Screen';
import { GHeader } from '../../../components/ui/GHeader';
import { Avatar } from '../../../components/ui/Avatar';
import { BalanceCard } from '../../../components/ui/BalanceCard';
import { QuickGrid } from '../../../components/ui/QuickGrid';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { RecRow } from '../../../components/ui/RecRow';
import { Gradient } from '../../../components/ui/Gradient';
import { BottomNav } from '../../../components/ui/BottomNav';

export default function ITAdminHome() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useSession();
  const router = useRouter();

  const handleSignOut = async () => { await logout(); router.replace('/college-selection'); };

  const quick = [
    { key: 'servers', label: 'Servers', sub: '8 online', gradient: ['#0ea5e9', '#0284c7'] as [string, string], icon: <Server size={18} color="#fff" />, onPress: () => router.push('/(app)/it-admin/servers') },
    { key: 'tickets', label: 'Tickets', sub: '3 new', gradient: ['#f43f5e', '#e11d48'] as [string, string], icon: <Ticket size={18} color="#fff" />, onPress: () => router.push('/(app)/it-admin/tickets') },
    { key: 'access', label: 'Access', sub: '1,204', gradient: ['#3b82f6', '#6366f1'] as [string, string], icon: <Users size={18} color="#fff" />, onPress: () => router.push('/(app)/it-admin/access') },
    { key: 'audit', label: 'Audit Log', sub: 'Live', gradient: ['#a855f7', '#7c3aed'] as [string, string], icon: <FileText size={18} color="#fff" />, onPress: () => router.push('/(app)/it-admin/audit') },
  ];

  const actions = [
    { key: 'wifi', icon: <Wifi size={17} color="#fff" />, grad: ['#0ea5e9', '#7c3aed'] as [string, string], title: 'Wi-Fi network check', meta: 'All access points · Campus-wide', act: 'Run', actColor: 'cta' as const },
    { key: 'backup', icon: <RefreshCw size={17} color="#fff" />, grad: ['#16a34a', '#0ea5e9'] as [string, string], title: 'Daily backup', meta: 'NAS volume · Completed 02:00', act: 'Done', actColor: 'done' as const },
    { key: 'mem', icon: <AlertTriangle size={17} color="#fff" />, grad: ['#f43f5e', '#a855f7'] as [string, string], title: 'High memory · LMS node', meta: 'prod-lms-02 · 92% usage', act: 'Fix', actColor: 'fix' as const },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <GHeader
          avatar={<Avatar label="IK" gradient={['#0ea5e9', '#7c3aed']} />}
          title={`Hello, ${user?.name || 'I. Kumar'}`}
          subtitle="IT Admin · Network ops"
          actions={
            <>
              <Pressable onPress={toggleTheme} style={[styles.iconBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
                {isDarkMode ? <Sun size={19} color={theme.fg} /> : <Moon size={19} color={theme.fg} />}
              </Pressable>
              <Pressable onPress={handleSignOut} style={[styles.iconBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
                <LogOut size={19} color={theme.red} />
              </Pressable>
            </>
          }
        />

        <BalanceCard
          colors={['#0ea5e9', '#7c3aed']}
          label="Infrastructure uptime"
          pill="Last 30 days"
          value="99.98"
          valueSuffix="  %"
          subLabel="Active incidents"
          subPill="2 open"
        />

        <QuickGrid items={quick} />

        <SectionHeader title="Quick actions" />
        {actions.map(a => (
          <RecRow
            key={a.key}
            dateBox={
              <Gradient colors={a.grad} angle={135} radius={12} style={styles.actDate}>
                {a.icon}
              </Gradient>
            }
            title={a.title}
            subtitle={a.meta}
            trailing={
              a.actColor === 'done' ? (
                <View style={[styles.doneBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
                  <Check size={13} color={theme.faint} />
                  <Text style={[styles.doneText, { color: theme.faint }]}>{a.act}</Text>
                </View>
              ) : a.actColor === 'fix' ? (
                <Gradient colors={['#f43f5e', '#e11d48']} radius={10} style={styles.startBtn}>
                  <Text style={styles.startText}>{a.act}</Text>
                </Gradient>
              ) : (
                <Gradient colors={theme.gradientCta} radius={10} style={styles.startBtn}>
                  <Text style={styles.startText}>{a.act}</Text>
                </Gradient>
              )
            }
          />
        ))}
      </Screen>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  iconBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  actDate: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  startBtn: { paddingHorizontal: 14, paddingVertical: 7 },
  startText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  doneBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  doneText: { fontSize: 11, fontWeight: '600' },
});
