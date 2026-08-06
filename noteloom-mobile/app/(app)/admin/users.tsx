import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { API_BASE } from '../../../lib/constants';
import { authHeaders } from '../../../lib/api';
import { getSessionToken } from '../../../lib/storage';
import { Screen } from '../../../components/ui/Screen';
import { SubHeader } from '../../../components/ui/SubHeader';
import { SearchBar } from '../../../components/ui/SearchBar';
import { FilterChips } from '../../../components/ui/FilterChips';
import { SrvRow } from '../../../components/ui/SrvRow';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Gradient } from '../../../components/ui/Gradient';

type RoleFilter = 'all' | 'student' | 'faculty';

interface UserItem {
  _id: string;
  name: string;
  email: string;
  uid?: string;
  status?: string;
}

const UserAvatar = ({ label, gradient }: { label: string; gradient?: [string, string] }) => (
  <Gradient colors={gradient || ['#6366f1', '#8b5cf6']} angle={135} radius={11} style={{ width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{label}</Text>
  </Gradient>
);

export default function AdminUsers() {
  const { theme } = useTheme();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<RoleFilter>('all');
  const [students, setStudents] = useState<UserItem[]>([]);
  const [faculty, setFaculty] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const token = await getSessionToken();
      const [stuRes, facRes] = await Promise.all([
        fetch(`${API_BASE}/api/college-admin/users/student`, { headers: authHeaders(token) }),
        fetch(`${API_BASE}/api/college-admin/users/faculty`, { headers: authHeaders(token) }),
      ]);
      if (stuRes.ok) { const d = await stuRes.json(); setStudents(Array.isArray(d) ? d : []); }
      if (facRes.ok) { const d = await facRes.json(); setFaculty(Array.isArray(d) ? d : []); }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleStatus = async (id: string, status: string) => {
    const next = status === 'suspended' ? 'active' : 'suspended';
    try {
      const token = await getSessionToken();
      await fetch(`${API_BASE}/api/college-admin/users/${id}/status`, {
        method: 'PATCH',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
    } catch {}
    setStudents(prev => prev.map(u => u._id === id ? { ...u, status: next } : u));
    setFaculty(prev => prev.map(u => u._id === id ? { ...u, status: next } : u));
  };

  const sList = students.filter(s => (filter === 'all' || filter === 'student') && s.name.toLowerCase().includes(q.toLowerCase()));
  const fList = faculty.filter(f => (filter === 'all' || filter === 'faculty') && f.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Users" subtitle={`${students.length + faculty.length} accounts`} />
        <SearchBar value={q} onChangeText={setQ} placeholder="Search users…" />
        <FilterChips<RoleFilter>
          options={[{ value: 'all', label: 'All' }, { value: 'student', label: 'Students' }, { value: 'faculty', label: 'Faculty' }]}
          value={filter}
          onChange={setFilter}
        />
        {loading ? (
          <EmptyState message="Loading users…" />
        ) : sList.length === 0 && fList.length === 0 ? (
          <EmptyState message="No users found" />
        ) : (
          <>
            {sList.length > 0 && <SectionHeader title="Students" />}
            {sList.map(s => {
              const active = s.status !== 'suspended';
              return (
                <SrvRow
                  key={s._id}
                  avatar={<UserAvatar label={s.name[0]} />}
                  title={s.name}
                  meta={`${s.email} · UID ${s.uid || 'N/A'}`}
                  action={active ? 'Active' : 'Suspend'}
                  actionColor={active ? 'green' : 'red'}
                  onAction={() => toggleStatus(s._id, s.status || 'active')}
                />
              );
            })}
            {fList.length > 0 && <SectionHeader title="Faculty" />}
            {fList.map(f => {
              const active = f.status !== 'suspended';
              return (
                <SrvRow
                  key={f._id}
                  avatar={<UserAvatar label={f.name[0]} gradient={['#3b82f6', '#6366f1']} />}
                  title={f.name}
                  meta={`${f.email} · UID ${f.uid || 'N/A'}`}
                  action={active ? 'Active' : 'Suspend'}
                  actionColor={active ? 'green' : 'red'}
                  onAction={() => toggleStatus(f._id, f.status || 'active')}
                />
              );
            })}
          </>
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({});