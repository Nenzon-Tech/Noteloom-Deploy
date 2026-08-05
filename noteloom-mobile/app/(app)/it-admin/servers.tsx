import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Database, Cpu, Server, Wifi } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { Screen } from '../../../components/ui/Screen';
import { SubHeader } from '../../../components/ui/SubHeader';
import { SrvRow } from '../../../components/ui/SrvRow';

export default function ITAdminServers() {
  const { theme } = useTheme();

  const servers = [
    { _id: 's1', icon: <Database size={18} color="#10b981" />, bg: 'rgba(16,185,129,0.14)', name: 'prod-db-01 · PostgreSQL', meta: '4 vCPU · 16 GB · 38% used', act: 'Healthy', color: 'green' as const },
    { _id: 's2', icon: <Cpu size={18} color="#10b981" />, bg: 'rgba(16,185,129,0.14)', name: 'prod-app-01 · API', meta: '8 vCPU · 32 GB · 61% used', act: 'Healthy', color: 'green' as const },
    { _id: 's3', icon: <Server size={18} color="#f43f5e" />, bg: 'rgba(244,63,94,0.14)', name: 'prod-lms-02 · LMS', meta: '4 vCPU · 8 GB · 92% used', act: 'Alert', color: 'red' as const },
    { _id: 's4', icon: <Wifi size={18} color="#f59e0b" />, bg: 'rgba(245,158,11,0.14)', name: 'edge-wifi · Radius', meta: '2 vCPU · 4 GB · 74% used', act: 'Warn', color: 'amber' as const },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Servers" subtitle="8 online · 0 offline" />
        {servers.map(s => (
          <SrvRow key={s._id} icon={s.icon} iconBg={s.bg} title={s.name} meta={s.meta} action={s.act} actionColor={s.color} />
        ))}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({});
