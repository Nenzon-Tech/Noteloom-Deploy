import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Sun, Moon, LogOut, ClipboardCheck, Users, Megaphone, Bot } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { useSession } from '../../../hooks/useSession';
import { Screen } from '../../../components/ui/Screen';
import { GHeader } from '../../../components/ui/GHeader';
import { Avatar } from '../../../components/ui/Avatar';
import { BalanceCard } from '../../../components/ui/BalanceCard';
import { QuickGrid } from '../../../components/ui/QuickGrid';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { AprRow } from '../../../components/ui/AprRow';
import { BottomNav } from '../../../components/ui/BottomNav';

export default function AdminHome() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useSession();
  const router = useRouter();

  const handleSignOut = async () => { await logout(); router.replace('/college-selection'); };

  const quick = [
    { key: 'ap', label: 'Approvals', sub: '23 pending', gradient: ['#10b981', '#0d9488'] as [string, string], icon: <ClipboardCheck size={18} color="#fff" />, onPress: () => router.push('/(app)/admin/approvals') },
    { key: 'users', label: 'Users', sub: '2,304 active', gradient: ['#3b82f6', '#6366f1'] as [string, string], icon: <Users size={18} color="#fff" />, onPress: () => router.push('/(app)/admin/users') },
    { key: 'notice', label: 'Notice', sub: 'Draft 2', gradient: ['#f43f5e', '#e11d48'] as [string, string], icon: <Megaphone size={18} color="#fff" />, onPress: () => router.push('/(app)/admin/notices') },
    { key: 'ai', label: 'Noteloom Ai', sub: 'Reports', gradient: ['#a855f7', '#7c3aed'] as [string, string], icon: <Bot size={18} color="#fff" />, onPress: () => router.push('/(app)/ai-chat') },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <GHeader
          avatar={<Avatar label="RS" />}
          title={`Good morning, ${user?.name || 'R. Sengupta'}`}
          subtitle="College Admin · IEM Salt Lake"
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
          colors={['#2563EB', '#9333EA']}
          label="Enrolled students"
          pill="FY 2026-27"
          value="12,847"
          subLabel="Campus capacity"
          subPill="94% full"
        />

        <QuickGrid items={quick} />

        <SectionHeader title="Pending approvals" action="See all" onAction={() => router.push('/(app)/admin/approvals')} />
        <AprRow initial="P" name="Priyanka Saha" meta="New admission · CSE · 2h ago" />
        <AprRow initial="N" name="Dr. N. Bhattacharya" meta="New faculty · ME Dept · 1d ago" gradient={['#3b82f6', '#6366f1']} />
      </Screen>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  iconBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
