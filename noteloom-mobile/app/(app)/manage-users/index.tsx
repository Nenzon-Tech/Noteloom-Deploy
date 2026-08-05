import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { User, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { API_BASE } from '../../../lib/constants';
import { authHeaders } from '../../../lib/api';
import { getSessionToken } from '../../../lib/storage';
import { Screen } from '../../../components/ui/Screen';
import { SubHeader } from '../../../components/ui/SubHeader';
import { SearchBar } from '../../../components/ui/SearchBar';
import { ListCard, LRow } from '../../../components/ui/ListCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Pill } from '../../../components/ui/Pill';

interface UserItem {
  _id: string;
  name: string;
  email: string;
  uid: string;
  role: string;
  status: string;
  deletionScheduledAt?: string;
}

export default function ManageUsers() {
  const { theme } = useTheme();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/admin/users`, {
        headers: authHeaders(token),
      });
      if (response.ok) setUsers(await response.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const token = await getSessionToken();
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await fetch(`${API_BASE}/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({ status: newStatus }),
      });
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, status: newStatus } : u));
    } catch (err) { console.error(err); }
  };

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Manage Users" subtitle={`${users.length} users`} />
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search by name or email..." />

        {loading ? (
          <ActivityIndicator size="large" color={theme.violet} style={{ marginTop: 40 }} />
        ) : filteredUsers.length === 0 ? (
          <EmptyState message="No users found" />
        ) : (
          filteredUsers.map((user) => (
            <ListCard key={user._id}>
              <LRow
                icon={<User size={18} color={theme.violet} />}
                iconBg="rgba(124,58,237,0.12)"
                title={user.name}
                subtitle={`${user.email} · ${user.uid}`}
                last={!user.deletionScheduledAt}
                trailing={
                  <View style={styles.trailing}>
                    <Pill color={user.status === 'active' ? 'green' : 'red'}>{user.status}</Pill>
                    <Pressable
                      onPress={() => toggleUserStatus(user._id, user.status)}
                      style={[styles.toggle, { backgroundColor: user.status === 'active' ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)' }]}
                    >
                      <Text style={[styles.toggleText, { color: user.status === 'active' ? theme.red : theme.green }]}>
                        {user.status === 'active' ? 'Disable' : 'Enable'}
                      </Text>
                    </Pressable>
                  </View>
                }
              />
              {user.deletionScheduledAt && (
                <View style={styles.deletionRow}>
                  <AlertCircle size={12} color={theme.red} />
                  <Text style={[styles.deletionText, { color: theme.red }]}>
                    DELETION: {new Date(user.deletionScheduledAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </ListCard>
          ))
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  trailing: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggle: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 9 },
  toggleText: { fontSize: 11, fontWeight: '700' },
  deletionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: 'rgba(239,68,68,0.08)' },
  deletionText: { fontSize: 11, fontWeight: '700' },
});
