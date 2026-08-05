import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { Screen } from '../../../components/ui/Screen';
import { SubHeader } from '../../../components/ui/SubHeader';
import { SearchBar } from '../../../components/ui/SearchBar';
import { FilterChips } from '../../../components/ui/FilterChips';
import { SrvRow } from '../../../components/ui/SrvRow';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Gradient } from '../../../components/ui/Gradient';

type DepFilter = 'all' | 'cse' | 'ece' | 'me';

const UserAvatar = ({ label, gradient }: { label: string; gradient?: [string, string] }) => (
  <Gradient colors={gradient || ['#6366f1', '#8b5cf6']} angle={135} radius={11} style={{ width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{label}</Text>
  </Gradient>
);

export default function AdminUsers() {
  const { theme } = useTheme();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<DepFilter>('all');

  const students = [
    { _id: 'u1', label: 'A', name: 'Arpan Maity', meta: 'CSE · 2023CS0765 · Student', dep: 'cse' as const },
    { _id: 'u2', label: 'P', name: 'Priyanka Saha', meta: 'CSE · 2023CS0891 · Student', dep: 'cse' as const },
    { _id: 'u3', label: 'V', name: 'Vivek Tiwari', meta: 'ECE · 2023EC0507 · Student', dep: 'ece' as const },
    { _id: 'u4', label: 'R', name: 'Rohit Singh', meta: 'ME · 2023ME0211 · Student', dep: 'me' as const },
  ];

  const faculty = [
    { _id: 'u5', label: 'N', name: 'Dr. N. Bhattacharya', meta: 'ME Dept · FR-118', grad: ['#3b82f6', '#6366f1'] as [string, string] },
    { _id: 'u6', label: 'S', name: 'Mrs. S. Bose', meta: 'EE Dept · FR-121', grad: ['#f59e0b', '#ea580c'] as [string, string] },
  ];

  const sList = students.filter(s => (filter === 'all' || s.dep === filter) && s.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Users" subtitle="2,304 active accounts" />
        <SearchBar value={q} onChangeText={setQ} placeholder="Search students…" />
        <FilterChips<DepFilter>
          options={[{ value: 'all', label: 'All' }, { value: 'cse', label: 'CSE' }, { value: 'ece', label: 'ECE' }, { value: 'me', label: 'ME' }]}
          value={filter}
          onChange={setFilter}
        />
        {sList.length === 0 ? (
          <EmptyState message="No users found" />
        ) : (
          sList.map(s => (
            <SrvRow
              key={s._id}
              avatar={<UserAvatar label={s.label} />}
              title={s.name}
              meta={s.meta}
              action="Active"
              actionColor="ghost"
            />
          ))
        )}
        {filter === 'all' && q === '' && (
          <>
            <SectionHeader title="Faculty" />
            {faculty.map(f => (
              <SrvRow
                key={f._id}
                avatar={<UserAvatar label={f.label} gradient={f.grad} />}
                title={f.name}
                meta={f.meta}
                action="Active"
                actionColor="ghost"
              />
            ))}
          </>
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({});
