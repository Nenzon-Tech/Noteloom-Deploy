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
import { BottomNav } from '../../components/ui/BottomNav';

type Month = 'all' | 'jan' | 'feb' | 'mar';

export default function Attendance() {
  const { theme } = useTheme();
  const [records, setRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState<Month>('all');

  useEffect(() => { fetchAttendance(); }, []);

  const fetchAttendance = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/attendance/my-records`, { headers: authHeaders(token) });
      if (response.ok) {
        const data = await response.json();
        setRecords(Array.isArray(data.records) ? data.records : []);
        if (data.summary) setSummary(data.summary);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const pad = (n: string | number) => String(n).padStart(2, '0');
  const overall = summary?.overall ?? 0;
  const statItems = [
    { value: `${overall}%`, label: 'Overall attendance', color: theme.blue, main: true },
    { value: pad(summary?.present ?? 0), label: 'Present', color: theme.emerald },
    { value: pad(summary?.absent ?? 0), label: 'Absent', color: theme.red },
    { value: pad((summary?.late ?? 0) + (summary?.excused ?? 0)), label: 'Late / Excused', color: theme.amberText },
  ];

  const list = records.filter(r => {
    if (month === 'all') return true;
    return new Date(r.date).getMonth() + 1 === (month === 'jan' ? 1 : month === 'feb' ? 2 : 3);
  });

  const statusMeta = (status: string) => {
    switch (status) {
      case 'present': return { label: 'Present', color: 'green' as const };
      case 'absent': return { label: 'Absent', color: 'red' as const };
      case 'late': return { label: 'Late', color: 'amber' as const };
      default: return { label: 'Excused', color: 'amber' as const };
    }
  };

  const d = (iso: string) => { const dt = new Date(iso); return { mon: dt.toLocaleString('en', { month: 'short' }), day: dt.getDate().toString().padStart(2, '0') }; };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen hasHeader={false}>
        <SubHeader title="My Attendance" />
        <StatGrid items={statItems} />
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
                trailing={<Pill color={meta.color}>{meta.label}</Pill>}
              />
            );
          })
        )}
      </Screen>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({});
