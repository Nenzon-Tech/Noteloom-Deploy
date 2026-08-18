import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Sun, Moon, LogOut, BookOpen, ClipboardCheck, Megaphone, Bot, Check, Loader } from 'lucide-react-native';
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
import { RecRow } from '../../../components/ui/RecRow';
import { EmptyState } from '../../../components/ui/EmptyState';
import { BottomNav } from '../../../components/ui/BottomNav';
import { Gradient } from '../../../components/ui/Gradient';

interface Batch {
  _id: string;
  name?: string;
  section?: string;
  studentCount?: number;
}

interface Period {
  periodNumber?: number;
  startTime?: string;
  endTime?: string;
  subject?: string;
  facultyName?: string;
  roomNo?: string;
  isBreak?: boolean;
  note?: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function FacultyHome() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useSession();
  const router = useRouter();

  const [batches, setBatches] = useState<Batch[]>([]);
  const [schedule, setSchedule] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSignOut = async () => { await logout(); router.replace('/college-selection'); };

  const dayName = DAYS[new Date().getDay()];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getSessionToken();
      const res = await fetch(`${API_BASE}/api/batches/my-batches`, { headers: authHeaders(token) });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setBatches(list);
        if (list.length) {
          const routineRes = await fetch(`${API_BASE}/api/routine/batch/${list[0]._id}`, { headers: authHeaders(token) });
          if (routineRes.ok) {
            const routines = await routineRes.json();
            if (Array.isArray(routines)) {
              const today = routines.find((r: any) => (r.dayOfWeek || '').toLowerCase() === dayName.toLowerCase());
              setSchedule(today?.periods || []);
            }
          }
        }
      }
    } catch {}
    finally { setLoading(false); }
  }, [dayName]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const todayCount = schedule.length;

  const quick = [
    { key: 'classes', label: 'My Classes', sub: `${batches.length} batches`, gradient: ['#3b82f6', '#6366f1'] as [string, string], icon: <BookOpen size={18} color="#fff" />, onPress: () => router.push('/(app)/faculty/classes') },
    { key: 'att', label: 'Attendance', sub: 'Mark now', gradient: ['#10b981', '#0d9488'] as [string, string], icon: <ClipboardCheck size={18} color="#fff" />, onPress: () => router.push('/(app)/faculty/attendance') },
    { key: 'notice', label: 'Notice', sub: 'Faculty desk', gradient: ['#f43f5e', '#e11d48'] as [string, string], icon: <Megaphone size={18} color="#fff" />, onPress: () => router.push('/(app)/faculty/notices') },
    { key: 'ai', label: 'EduSpace Ai', sub: 'Lesson plan', gradient: ['#a855f7', '#7c3aed'] as [string, string], icon: <Bot size={18} color="#fff" />, onPress: () => router.push('/(app)/ai-chat') },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <GHeader
          avatar={<Avatar label={(user?.name || 'N')[0]} gradient={['#3b82f6', '#6366f1']} />}
          title={`Hello, ${user?.name || 'Faculty'}`}
          subtitle={`Faculty · ${dayName} ${new Date().toLocaleDateString()}`}
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
          label={`Today · ${todayCount} classes`}
          pill={batches[0]?.name || 'My batches'}
          value={loading ? '…' : String(todayCount)}
          valueSuffix="  · classes"
          subLabel={batches.length ? `${batches.length} batch${batches.length > 1 ? 'es' : ''} assigned` : 'No batches assigned'}
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
        {loading ? (
          <EmptyState message="Loading schedule…" />
        ) : schedule.length === 0 ? (
          <EmptyState message="No classes scheduled today" />
        ) : (
          schedule.map((p, i) => (
            <RecRow
              key={i}
              dateTop="PER"
              dateMain={String(p.periodNumber || i + 1)}
              title={p.subject || 'Class'}
              subtitle={`${p.startTime || ''}${p.endTime ? ` – ${p.endTime}` : ''} · ${p.roomNo || 'Room'}`}
              onPress={() => router.push('/(app)/faculty/attendance')}
              trailing={
                <Pressable style={[styles.doneBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
                  <Check size={13} color={theme.faint} />
                  <Text style={[styles.doneText, { color: theme.faint }]}>Attend</Text>
                </Pressable>
              }
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
  markBtn: { padding: 1 },
  markInner: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7 },
  markText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  startBtn: { paddingHorizontal: 14, paddingVertical: 7 },
  startText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  doneBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  doneText: { fontSize: 11, fontWeight: '600' },
});