import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight, GraduationCap, Bell, FileText } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { authHeaders } from '../../lib/api';
import { getSessionToken } from '../../lib/storage';
import { Screen } from '../../components/ui/Screen';
import { SubHeader } from '../../components/ui/SubHeader';
import { CalendarGrid } from '../../components/ui/CalendarGrid';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { SrvRow } from '../../components/ui/SrvRow';
import { Pill } from '../../components/ui/Pill';
import { EmptyState } from '../../components/ui/EmptyState';
import { BottomNav } from '../../components/ui/BottomNav';

export default function AcademicCalendar() {
  const { theme } = useTheme();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/academic/calendar`, { headers: authHeaders(token) });
      if (response.ok) {
        const data = await response.json();
        setEvents(Array.isArray(data) ? data : []);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const days = [
    { day: '23', otherMonth: true }, { day: '24', otherMonth: true }, { day: '25', otherMonth: true }, { day: '26', otherMonth: true },
    { day: '27' }, { day: '28' }, { day: '1' },
    { day: '2' }, { day: '3' }, { day: '4', isToday: true }, { day: '5' }, { day: '6' }, { day: '7' }, { day: '8' },
    { day: '9' }, { day: '10' }, { day: '11', hasEvent: true }, { day: '12', hasEvent: true }, { day: '13' }, { day: '14', hasEvent: true }, { day: '15' },
    { day: '16' }, { day: '17' }, { day: '18' }, { day: '19' }, { day: '20' }, { day: '21' }, { day: '22' },
    { day: '23' }, { day: '24' }, { day: '25' }, { day: '26' }, { day: '27' }, { day: '28' }, { day: '29' },
    { day: '30' }, { day: '31' }, { day: '1', otherMonth: true }, { day: '2', otherMonth: true }, { day: '3', otherMonth: true }, { day: '4', otherMonth: true }, { day: '5', otherMonth: true },
  ];

  const fallback = [
    { _id: 'e1', title: 'Mid-Sem Exam begins', date: '2026-03-12', type: 'exam' },
    { _id: 'e2', title: 'Departmental Seminar', date: '2026-03-11', type: 'event' },
    { _id: 'e3', title: 'Assignment 5 due', date: '2026-03-14', type: 'due' },
  ];

  const list = events.length ? events : fallback;

  const typeMeta = (t: string) => {
    switch ((t || '').toLowerCase()) {
      case 'exam': return { label: 'Exam', color: 'red' as const, icon: <GraduationCap size={17} color="#ef4444" />, bg: 'rgba(239,68,68,0.1)' };
      case 'event': return { label: 'Event', color: 'blue' as const, icon: <Bell size={17} color="#2563eb" />, bg: 'rgba(59,130,246,0.1)' };
      default: return { label: 'Due', color: 'green' as const, icon: <FileText size={17} color="#10b981" />, bg: 'rgba(16,185,129,0.1)' };
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Academic Calendar" />
        <View style={styles.monthChip}>
          <Pressable style={[styles.monthBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
            <ChevronLeft size={15} color={theme.fg} />
          </Pressable>
          <Text style={[styles.monthText, { color: theme.fg }]}>March 2026</Text>
          <Pressable style={[styles.monthBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
            <ChevronRight size={15} color={theme.fg} />
          </Pressable>
        </View>
        <CalendarGrid days={days} />

        <SectionHeader title="Upcoming" />
        {loading ? (
          <ActivityIndicator color={theme.violet} style={{ paddingVertical: 40 }} />
        ) : list.length === 0 ? (
          <EmptyState message="No upcoming events" />
        ) : (
          list.map(e => {
            const meta = typeMeta(e.type);
            return (
              <SrvRow
                key={e._id}
                icon={meta.icon}
                iconBg={meta.bg}
                title={e.title}
                meta={`${new Date(e.date).toLocaleDateString('en', { day: 'numeric', month: 'short' })} · 09:30 AM`}
                action={meta.label}
                actionColor={meta.color}
              />
            );
          })
        )}
      </Screen>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  monthChip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, marginBottom: 6 },
  monthText: { fontSize: 15, fontWeight: '700' },
  monthBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
