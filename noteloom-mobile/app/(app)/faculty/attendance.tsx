import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ClipboardCheck } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { Screen } from '../../../components/ui/Screen';
import { SubHeader } from '../../../components/ui/SubHeader';
import { FilterChips } from '../../../components/ui/FilterChips';
import { AttRow } from '../../../components/ui/AttRow';
import { GradButton } from '../../../components/ui/GradButton';
import { EmptyState } from '../../../components/ui/EmptyState';

type AttFilter = 'all' | 'present' | 'absent';
type AttStatus = 'present' | 'absent' | 'unmarked';

export default function FacultyAttendance() {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<AttFilter>('all');
  const [rows, setRows] = useState<{ _id: string; name: string; id: string; status: AttStatus }[]>([
    { _id: 's1', name: 'Arpan Maity', id: '2023CS0765', status: 'absent' },
    { _id: 's2', name: 'Priyanka Saha', id: '2023CS0891', status: 'absent' },
    { _id: 's3', name: 'Ritam Das', id: '2023CS0634', status: 'absent' },
    { _id: 's4', name: 'Sneha Roy', id: '2023CS0712', status: 'absent' },
    { _id: 's5', name: 'Kunal Sharma', id: '2023CS0588', status: 'absent' },
    { _id: 's6', name: 'Ishita Ghosh', id: '2023CS0924', status: 'absent' },
  ]);

  const setStatus = (id: string, status: AttStatus) => setRows(prev => prev.map(p => p._id === id ? { ...p, status } : p));

  const marked = rows.filter(r => r.status !== 'absent').length;
  const list = rows.filter(r => filter === 'all' || r.status === filter);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Mark Attendance" subtitle="Mathematics II · CSE 3A · Room 402" />
        <FilterChips<AttFilter>
          options={[{ value: 'all', label: 'All' }, { value: 'present', label: 'Present' }, { value: 'absent', label: 'Absent' }]}
          value={filter}
          onChange={setFilter}
        />
        {list.length === 0 ? (
          <EmptyState message="No students in this filter" />
        ) : (
          list.map(r => (
            <AttRow
              key={r._id}
              initial={r.name[0]}
              name={r.name}
              id={r.id}
              status={r.status}
              onChange={s => setStatus(r._id, s)}
            />
          ))
        )}
        <View style={{ height: 14 }} />
        <GradButton fullWidth size="lg" icon={<ClipboardCheck size={18} color="#fff" />}>
          Submit · {marked} marked
        </GradButton>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({});
