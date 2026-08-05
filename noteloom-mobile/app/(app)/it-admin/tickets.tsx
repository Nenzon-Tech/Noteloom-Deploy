import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { Screen } from '../../../components/ui/Screen';
import { SubHeader } from '../../../components/ui/SubHeader';
import { FilterChips } from '../../../components/ui/FilterChips';
import { SrvRow } from '../../../components/ui/SrvRow';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Gradient } from '../../../components/ui/Gradient';

type TicFilter = 'all' | 'new' | 'open' | 'resolved';

const TicketAvatar = ({ label, gradient }: { label: string; gradient?: [string, string] }) => (
  <Gradient colors={gradient || ['#6366f1', '#8b5cf6']} angle={135} radius={11} style={{ width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{label}</Text>
  </Gradient>
);

export default function ITAdminTickets() {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<TicFilter>('all');

  const tickets = [
    { _id: 't1', label: 'W', name: 'Wi-Fi down in Block C', meta: 'Staff · 10 min ago · #TX-4412', type: 'new' as const, act: 'Open', color: 'blue' as const, grad: ['#f43f5e', '#a855f7'] as [string, string] },
    { _id: 't2', label: 'R', name: 'LMS not loading', meta: 'Student · 26 min ago · #TX-4411', type: 'new' as const, act: 'Open', color: 'blue' as const },
    { _id: 't3', label: 'P', name: 'Printer queue stuck', meta: 'Library · 1h ago · #TX-4408', type: 'new' as const, act: 'Open', color: 'blue' as const, grad: ['#0ea5e9', '#7c3aed'] as [string, string] },
    { _id: 't4', label: 'N', name: 'Email account locked', meta: 'Faculty · 3h ago · #TX-4402', type: 'open' as const, act: 'In Progress', color: 'red' as const },
    { _id: 't5', label: 'D', name: 'Projector not working', meta: 'Room 402 · 1d ago · #TX-4387', type: 'resolved' as const, act: 'Resolved', color: 'green' as const, grad: ['#16a34a', '#0ea5e9'] as [string, string] },
  ];

  const list = tickets.filter(t => filter === 'all' || t.type === filter);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Support Tickets" subtitle="3 new · 12 open" />
        <FilterChips<TicFilter>
          options={[{ value: 'all', label: 'All' }, { value: 'new', label: 'New' }, { value: 'open', label: 'Open' }, { value: 'resolved', label: 'Resolved' }]}
          value={filter}
          onChange={setFilter}
        />
        {list.length === 0 ? (
          <EmptyState message="No tickets" />
        ) : (
          list.map(t => (
            <SrvRow
              key={t._id}
              avatar={<TicketAvatar label={t.label} gradient={t.grad} />}
              title={t.name}
              meta={t.meta}
              action={t.act}
              actionColor={t.color}
            />
          ))
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({});
