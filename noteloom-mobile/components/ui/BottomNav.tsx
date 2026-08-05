import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname, useRouter } from 'expo-router';
import { Home, BookOpen, Bell, Bot, User, ClipboardCheck, Users, Server, Ticket, Shield, FileText } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

import { useSession } from '../../hooks/useSession';

export type TabRoute = {
  key: string;
  label: string;
  route: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
};

export const ROLE_TABS: Record<string, TabRoute[]> = {
  student: [
    { key: 'home', label: 'Home', route: '/(app)/dashboard', icon: Home },
    { key: 'courses', label: 'Courses', route: '/(app)/my-classes', icon: BookOpen },
    { key: 'notice', label: 'Notices', route: '/(app)/notice-board', icon: Bell },
    { key: 'ai', label: 'Noteloom Ai', route: '/(app)/ai-chat', icon: Bot },
    { key: 'profile', label: 'Profile', route: '/(app)/profile', icon: User },
  ],
  faculty: [
    { key: 'home', label: 'Home', route: '/(app)/faculty', icon: Home },
    { key: 'classes', label: 'Classes', route: '/(app)/faculty/classes', icon: BookOpen },
    { key: 'attendance', label: 'Attendance', route: '/(app)/faculty/attendance', icon: ClipboardCheck },
    { key: 'notice', label: 'Notices', route: '/(app)/faculty/notices', icon: Bell },
    { key: 'ai', label: 'Noteloom Ai', route: '/(app)/ai-chat', icon: Bot },
  ],
  college_admin: [
    { key: 'home', label: 'Home', route: '/(app)/admin', icon: Home },
    { key: 'approvals', label: 'Approvals', route: '/(app)/admin/approvals', icon: ClipboardCheck },
    { key: 'users', label: 'Users', route: '/(app)/admin/users', icon: Users },
    { key: 'notice', label: 'Notices', route: '/(app)/admin/notices', icon: Bell },
    { key: 'ai', label: 'Noteloom Ai', route: '/(app)/ai-chat', icon: Bot },
  ],
  it: [
    { key: 'home', label: 'Home', route: '/(app)/it-admin', icon: Home },
    { key: 'servers', label: 'Servers', route: '/(app)/it-admin/servers', icon: Server },
    { key: 'tickets', label: 'Tickets', route: '/(app)/it-admin/tickets', icon: Ticket },
    { key: 'users', label: 'Access', route: '/(app)/it-admin/access', icon: Shield },
    { key: 'audit', label: 'Audit', route: '/(app)/it-admin/audit', icon: FileText },
  ],
};

interface BottomNavProps {
  role?: string;
}

export const BottomNav = ({ role }: BottomNavProps) => {
  const { theme } = useTheme();
  const { profile } = useSession();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();

  const activeRole = role || profile?.role || 'student';
  const tabs = ROLE_TABS[activeRole] || ROLE_TABS.student;

  const isActive = (route: string) => {
    const base = route.replace('/(app)', '');
    const current = (pathname || '').replace('/(app)', '');
    if (base === '/dashboard') {
      return current === '/dashboard' || current === '/' || current === '';
    }
    if (base === '/my-classes') {
      return current === '/my-classes' || current.startsWith('/classroom/');
    }
    return current === base || current.startsWith(base + '/');
  };

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          paddingBottom: insets.bottom + 8,
        },
      ]}
    >
      {tabs.map(tab => {
        const Icon = tab.icon;
        const active = isActive(tab.route);
        return (
          <Pressable key={tab.key} onPress={() => router.push(tab.route)} style={styles.item}>
            <Icon size={22} color={active ? theme.violet : theme.faint} strokeWidth={active ? 2.4 : 2} />
            <Text style={[styles.label, { color: active ? theme.violet : theme.faint }]} numberOfLines={1}>
              {tab.label}
            </Text>
            <View style={[styles.ind, { backgroundColor: active ? theme.violet : 'transparent' }]} />
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 6,
    paddingHorizontal: 8,
    shadowColor: 'rgba(17,24,39,0.06)',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 10,
  },
  item: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4, minHeight: 52, justifyContent: 'center' },
  label: { fontSize: 10, fontWeight: '600', maxWidth: 68, textAlign: 'center' },
  ind: { width: 26, height: 3, borderRadius: 2 },
});

export default BottomNav;
