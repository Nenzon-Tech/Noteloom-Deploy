import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Sun, Moon, Bell, LogOut, BookOpen, Library, CheckSquare, Megaphone, Calendar, Clock, QrCode, GraduationCap, BookMarked, Heart, MessageCircle, TrendingUp } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useSession } from '../../hooks/useSession';
import { API_BASE } from '../../lib/constants';
import { authHeaders } from '../../lib/api';
import { getSessionToken } from '../../lib/storage';
import { Screen } from '../../components/ui/Screen';
import { GHeader } from '../../components/ui/GHeader';
import { Avatar } from '../../components/ui/Avatar';
import { HeroCard } from '../../components/ui/HeroCard';
import { QuickGrid } from '../../components/ui/QuickGrid';
import { LearnCard } from '../../components/ui/LearnCard';
import { NoticeMini } from '../../components/ui/NoticeMini';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { BottomNav } from '../../components/ui/BottomNav';

export default function StudentHome() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { user, profile, logout } = useSession();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const token = await getSessionToken();
      const [nRes, cRes] = await Promise.all([
        fetch(`${API_BASE}/api/notices`, { headers: authHeaders(token) }),
        fetch(`${API_BASE}/api/classrooms`, { headers: authHeaders(token) }),
      ]);
      if (nRes.ok) { const d = await nRes.json(); if (Array.isArray(d)) setNotices(d); }
      if (cRes.ok) { const d = await cRes.json(); if (Array.isArray(d)) setClasses(d); }
    } catch {} finally { setLoaded(true); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => { setRefreshing(true); await loadData(); setRefreshing(false); }, [loadData]);

  const handleSignOut = async () => { await logout(); router.replace('/college-selection'); };

  const quickModules = [
    { key: 'courses', label: 'My Courses', gradient: ['#10b981', '#0d9488'] as [string, string], icon: <BookOpen size={18} color="#fff" />, onPress: () => router.push('/(app)/my-classes') },
    { key: 'library', label: 'Library', gradient: ['#6366f1', '#a855f7'] as [string, string], icon: <Library size={18} color="#fff" />, onPress: () => router.push('/(app)/library') },
    { key: 'attendance', label: 'Attendance', gradient: ['#3b82f6', '#6366f1'] as [string, string], icon: <CheckSquare size={18} color="#fff" />, onPress: () => router.push('/(app)/attendance') },
    { key: 'notice', label: 'Notices', gradient: ['#f59e0b', '#ea580c'] as [string, string], icon: <Megaphone size={18} color="#fff" />, onPress: () => router.push('/(app)/notice-board') },
    { key: 'calendar', label: 'Calendar', gradient: ['#475569', '#334155'] as [string, string], icon: <Calendar size={18} color="#fff" />, onPress: () => router.push('/(app)/academic-calendar') },
    { key: 'timetable', label: 'Timetable', gradient: ['#3b82f6', '#2563eb'] as [string, string], icon: <Clock size={18} color="#fff" />, onPress: () => router.push('/(app)/timetable') },
    { key: 'admit', label: 'Admit Card', gradient: ['#ef4444', '#db2777'] as [string, string], icon: <QrCode size={18} color="#fff" />, onPress: () => router.push('/(app)/coe/admit-card') },
    { key: 'univ', label: 'University', gradient: ['#6366f1', '#a855f7'] as [string, string], icon: <GraduationCap size={18} color="#fff" />, onPress: () => router.push('/(app)/results') },
  ];

  const learnItem = classes[0]
    ? { title: classes[0].name || 'Course', subtitle: 'Module · Continue where you left', code: classes[0].subjectCode, progress: 72, timeLeft: '24 min left' }
    : { title: 'Database Management Systems', subtitle: 'Module 4 · Normalization', code: 'CS-502', progress: 72, timeLeft: '24 min left' };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.violet} />}>
        <GHeader
          avatar={<Avatar label={user?.name?.[0] || 'A'} />}
          title={`Hi, ${user?.name?.split(' ')[0] || 'Arpan'} 👋`}
          subtitle={`${profile?.college || 'IEM'} · Active`}
          actions={
            <>
              <Pressable onPress={toggleTheme} style={[styles.iconBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
                {isDarkMode ? <Sun size={19} color={theme.fg} /> : <Moon size={19} color={theme.fg} />}
              </Pressable>
              <Pressable onPress={() => router.push('/(app)/notice-board')} style={[styles.iconBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
                <Bell size={19} color={theme.fg} />
              </Pressable>
              <Pressable onPress={handleSignOut} style={[styles.iconBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
                <LogOut size={19} color={theme.red} />
              </Pressable>
            </>
          }
        />

        <HeroCard
          title="Attendance Overview"
          pillLabel="Sem 6 · 2026"
          ringPercent={84}
          big="74"
          small="/88"
          label="lectures covered"
          trend="+6% vs last month"
          chips={[{ value: '62', label: 'Present' }, { value: '08', label: 'Absent' }, { value: '04', label: 'Excused' }]}
        />

        <SectionHeader title="Quick Modules" action="All" onAction={() => router.push('/(app)/my-classes')} />
        {!loaded ? (
          <ActivityIndicator color={theme.violet} style={{ paddingVertical: 30 }} />
        ) : (
          <QuickGrid items={quickModules} />
        )}

        <SectionHeader title="Continue Learning" action="See all" onAction={() => router.push('/(app)/my-classes')} />
        <LearnCard {...learnItem} onPress={() => router.push(`/(app)/classroom/${classes[0]?._id || ''}` as any)} />

        <SectionHeader title="Latest Notices" action="See all" onAction={() => router.push('/(app)/notice-board')} />
        {notices.length === 0 ? (
          <>
            <NoticeMini
              avatar={<Avatar label="S" gradient={['#3b82f6', '#6366f1']} />}
              title="Mid-Sem Exam Schedule Released"
              meta="Prof. S. Banerjee · CSE Dept · 2h ago"
              body="Mid-semester examinations for all branches will begin from 12 March. Admit cards are now available in the exam portal."
              likes={48}
              comments={12}
              onPress={() => router.push('/(app)/notice-board')}
            />
            <NoticeMini
              avatar={<Avatar label="H" gradient={['#f59e0b', '#ea580c']} />}
              title="Library: New PYQ Uploads"
              meta="Central Library · 5h ago"
              body="Previous year question papers (2020–2025) for core engineering subjects are now available in the Digital Library."
              likes={23}
              comments={5}
              onPress={() => router.push('/(app)/notice-board')}
            />
          </>
        ) : (
          notices.slice(0, 3).map(n => (
            <NoticeMini
              key={n._id}
              avatar={<Avatar label={n.category?.[0] || 'N'} />}
              title={n.title}
              meta={n.category || 'Campus'}
              body={n.content || ''}
              likes={0}
              comments={0}
              onPress={() => router.push('/(app)/notice-board')}
            />
          ))
        )}
      </Screen>
      <BottomNav role="student" />
    </View>
  );
}

const styles = StyleSheet.create({
  iconBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
