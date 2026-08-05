import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Clock } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { authHeaders } from '../../lib/api';
import { getSessionToken } from '../../lib/storage';
import { Screen } from '../../components/ui/Screen';
import { SubHeader } from '../../components/ui/SubHeader';
import { StatGrid } from '../../components/ui/StatGrid';
import { FilterChips } from '../../components/ui/FilterChips';
import { RecRow } from '../../components/ui/RecRow';
import { Pill } from '../../components/ui/Pill';
import { EmptyState } from '../../components/ui/EmptyState';

type Month = 'all' | 'jan' | 'feb' | 'mar';

export default function Attendance() {
  const { theme } = useTheme();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState<Month>('all');

  useEffect(() => { fetchAttendance(); }, []);

  const fetchAttendance = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/attendance/my-attendance`, { headers: authHeaders(token) });
      if (response.ok) {
        const data = await response.json();
        setRecords(Array.isArray(data) ? data : []);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const fallback = [
    { _id: 'a1', subject: 'Database Management Systems', date: '2026-03-04', status: 'present' },
    { _id: 'a2', subject: 'Data Structures & Algorithms', date: '2026-03-03', status: 'absent' },
    { _id: 'a3', subject: 'Operating Systems', date: '2026-02-27', status: 'present' },
    { _id: 'a4', subject: 'Computer Networks', date: '2026-02-25', status: 'late' },
  ];

  const list = (records.length ? records : fallback).filter(r => {
    if (month === 'all') return true;
    return new Date(r.date).getMonth() + 1 === (month === 'jan' ? 1 : month === 'feb' ? 2 : 3);
  });

  const statusMeta = (status: string) => {
    switch (status) {
      case 'present': return { label: 'Present', color: 'green' as const };
      case 'absent': return { label: 'Absent', color: 'red' as const };
      default: return { label: 'Excused', color: 'amber' as const };
    }
  };

  const d = (iso: string) => { const dt = new Date(iso); return { mon: dt.toLocaleString('en', { month: 'short' }), day: dt.getDate().toString().padStart(2, '0') }; };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="My Attendance" />
        <StatGrid
          items={[
            { value: '84%', label: 'Overall · Sem 6', color: theme.blue, main: true },
            { value: '62', label: 'Present', color: theme.emerald },
            { value: '08', label: 'Absent', color: theme.red },
            { value: '04', label: 'Excused', color: theme.amberText },
          ]}
        />
        <FilterChips<Month>
          options={[{ value: 'all', label: 'All' }, { value: 'jan', label: 'Jan' }, { value: 'feb', label: 'Feb' }, { value: 'mar', label: 'Mar' }]}
          value={month}
          onChange={setMonth}
        />
        {loading ? (
          <ActivityIndicator color={theme.violet} style={{ paddingVertical: 60 }} />
        ) : list.length === 0 ? (
          <EmptyState message="No attendance records in this month" />
        ) : (
          list.map(r => {
            const meta = statusMeta(r.status);
            const date = d(r.date);
            return (
              <RecRow
                key={r._id}
                dateTop={date.mon}
                dateMain={date.day}
                title={r.subject}
                subtitle={`${new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Lecture`}
                subtitleIcon={<Clock size={11} color={theme.faint} />}
                trailing={<Pill color={meta.color}><Text style={{ color: meta.color === 'green' ? theme.emerald : meta.color === 'red' ? theme.red : theme.amberText }}>{meta.label}</Text></Pill>}
              />
            );
          })
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({});
