import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { Screen } from '../../../components/ui/Screen';
import { SubHeader } from '../../../components/ui/SubHeader';
import { FilterChips } from '../../../components/ui/FilterChips';
import { AprRow } from '../../../components/ui/AprRow';
import { EmptyState } from '../../../components/ui/EmptyState';

type AprFilter = 'all' | 'student' | 'faculty';

export default function AdminApprovals() {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<AprFilter>('all');
  const [rows, setRows] = useState([
    { _id: 'a1', initial: 'P', name: 'Priyanka Saha', meta: 'New admission · CSE · Roll 2023CS0891 · 2h ago', type: 'student' as const },
    { _id: 'a2', initial: 'V', name: 'Vivek Tiwari', meta: 'New admission · ECE · Roll 2023EC0507 · 5h ago', type: 'student' as const },
    { _id: 'a3', initial: 'N', name: 'Dr. N. Bhattacharya', meta: 'New faculty · ME Dept · Ref FR-118 · 1d ago', type: 'faculty' as const, gradient: ['#3b82f6', '#6366f1'] as [string, string] },
    { _id: 'a4', initial: 'S', name: 'Mrs. S. Bose', meta: 'New faculty · EE Dept · Ref FR-121 · 2d ago', type: 'faculty' as const, gradient: ['#f59e0b', '#ea580c'] as [string, string] },
  ]);

  const remove = (id: string) => setRows(prev => prev.filter(r => r._id !== id));
  const list = rows.filter(r => filter === 'all' || r.type === filter);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Approvals" subtitle={`${rows.length} pending requests`} />
        <FilterChips<AprFilter>
          options={[{ value: 'all', label: 'All' }, { value: 'student', label: 'Students' }, { value: 'faculty', label: 'Faculty' }]}
          value={filter}
          onChange={setFilter}
        />
        {list.length === 0 ? (
          <EmptyState message="Nothing pending" />
        ) : (
          list.map(r => (
            <AprRow
              key={r._id}
              initial={r.initial}
              name={r.name}
              meta={r.meta}
              gradient={r.gradient}
              onApprove={() => remove(r._id)}
              onReject={() => remove(r._id)}
            />
          ))
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({});
