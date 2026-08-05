import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Sun, Moon, LogOut, BookOpen, ClipboardCheck, Megaphone, Bot, Check } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { useSession } from '../../../hooks/useSession';
import { Screen } from '../../../components/ui/Screen';
import { GHeader } from '../../../components/ui/GHeader';
import { Avatar } from '../../../components/ui/Avatar';
import { BalanceCard } from '../../../components/ui/BalanceCard';
import { QuickGrid } from '../../../components/ui/QuickGrid';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { RecRow } from '../../../components/ui/RecRow';
import { BottomNav } from '../../../components/ui/BottomNav';
import { Gradient } from '../../../components/ui/Gradient';

export default function FacultyHome() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useSession();
  const router = useRouter();

  const handleSignOut = async () => { await logout(); router.replace('/college-selection'); };

  const quick = [
    { key: 'classes', label: 'My Classes', sub: '4 today', gradient: ['#3b82f6', '#6366f1'] as [string, string], icon: <BookOpen size={18} color="#fff" />, onPress: () => router.push('/(app)/faculty/classes') },
    { key: 'att', label: 'Attendance', sub: '48 students', gradient: ['#10b981', '#0d9488'] as [string, string], icon: <ClipboardCheck size={18} color="#fff" />, onPress: () => router.push('/(app)/faculty/attendance') },
    { key: 'notice', label: 'Notice', sub: 'Draft 1', gradient: ['#f43f5e', '#e11d48'] as [string, string], icon: <Megaphone size={18} color="#fff" />, onPress: () => router.push('/(app)/faculty/notices') },
    { key: 'ai', label: 'Noteloom Ai', sub: 'Lesson plan', gradient: ['#a855f7', '#7c3aed'] as [string, string], icon: <Bot size={18} color="#fff" />, onPress: () => router.push('/(app)/ai-chat') },
  ];

  const schedule = [
    { time: '08', ap: 'AM', cls: 'Mathematics II', meta: 'CSE 3A · Room 402', done: false },
    { time: '10', ap: 'AM', cls: 'Data Structures', meta: 'CSE 3B · Lab 2', done: false },
    { time: '01', ap: 'PM', cls: 'DBMS Lab', meta: 'CSE 3A · Lab 4', done: true },
    { time: '03', ap: 'PM', cls: 'Doubt Session', meta: 'CSE 3A · Room 105', done: true },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <GHeader
          avatar={<Avatar label="NB" gradient={['#3b82f6', '#6366f1']} />}
          title={`Hello, ${user?.name || 'Dr. Bhattacharya'}`}
          subtitle="CSE Dept · Mon 10 Aug"
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
          colors={['#2563EB', '#7c3aed']}
          label="Today · 4 classes"
          pill="Week 11"
          value="08:45"
          valueSuffix="  · next class"
          subLabel="Mathematics II · CSE 3A"
          action={
            <Gradient colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']} radius={10} style={styles.markBtn}>
              <Pressable style={styles.markInner} onPress={() => router.push('/(app)/faculty/attendance')}>
                <ClipboardCheck size={13} color="#fff" />
                <Text style={styles.markText}>Mark Now</Text>
              </Pressable>
            </Gradient>
          }
        />

        <QuickGrid items={quick} />

        <SectionHeader title="Today's Schedule" />
        {schedule.map((s, i) => (
          <RecRow
            key={i}
            dateTop={s.ap}
            dateMain={s.time}
            title={s.cls}
            subtitle={s.meta}
            onPress={s.done ? undefined : () => router.push('/(app)/faculty/attendance')}
            trailing={
              s.done ? (
                <Pressable style={[styles.doneBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
                  <Check size={13} color={theme.faint} />
                  <Text style={[styles.doneText, { color: theme.faint }]}>Done</Text>
                </Pressable>
              ) : (
                <Gradient colors={theme.gradientCta} radius={10} style={styles.startBtn}>
                  <Text style={styles.startText}>Start</Text>
                </Gradient>
              )
            }
          />
        ))}
      </Screen>
      <BottomNav role="faculty" />
    </View>
  );
}

const styles = StyleSheet.create({
  iconBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  markBtn: { padding: 1 },
  markInner: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7 },
  markText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  startBtn: { paddingHorizontal: 14, paddingVertical: 7 },
  startText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  doneBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  doneText: { fontSize: 11, fontWeight: '600' },
});
