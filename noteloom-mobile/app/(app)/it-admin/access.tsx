import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Shield } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { Screen } from '../../../components/ui/Screen';
import { SubHeader } from '../../../components/ui/SubHeader';
import { SrvRow } from '../../../components/ui/SrvRow';

export default function ITAdminAccess() {
  const { theme } = useTheme();

  const roles = [
    { _id: 'r1', name: 'IT Admin', meta: '1 active · full access', color: '#a855f7', bg: 'rgba(124,58,237,0.14)' },
    { _id: 'r2', name: 'College Admin', meta: '3 active · approvals & notices', color: '#3b82f6', bg: 'rgba(59,130,246,0.14)' },
    { _id: 'r3', name: 'Faculty', meta: '128 active · classes & attendance', color: '#10b981', bg: 'rgba(16,185,129,0.14)' },
    { _id: 'r4', name: 'Student', meta: '2,304 active · self-service', color: '#f59e0b', bg: 'rgba(245,158,11,0.14)' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Access Control" subtitle="Roles & permissions" />
        {roles.map(r => (
          <SrvRow key={r._id} icon={<Shield size={18} color={r.color} />} iconBg={r.bg} title={r.name} meta={r.meta} action="View" actionColor="ghost" />
        ))}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({});
