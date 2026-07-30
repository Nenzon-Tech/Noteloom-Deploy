import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Users, Search, AlertCircle, Trash2, Edit, ArrowLeft, ToggleLeft, ToggleRight } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { API_BASE } from '../../../lib/constants';
import { getSessionToken } from '../../../lib/storage';
import GlassHeader from '../../../components/ui/GlassHeader';

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
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
      <GlassHeader variant="dashboard">
        <View style={[styles.headerInner, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={isDarkMode ? 'white' : '#111827'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Manage Users</Text>
        </View>
      </GlassHeader>

      <View style={{ paddingTop: 80, flex: 1 }}>
        <View style={styles.searchBar}>
          <Search size={16} color={isDarkMode ? '#6b7280' : '#9ca3af'} />
          <TextInput
            style={[styles.searchInput, { color: isDarkMode ? 'white' : '#111827' }]}
            placeholder="Search by name or email..."
            placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          {loading ? (
            <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 40 }} />
          ) : filteredUsers.length === 0 ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>No users found</Text>
            </View>
          ) : (
            filteredUsers.map((user) => (
              <View key={user._id} style={[styles.card, { backgroundColor: isDarkMode ? 'rgba(30,41,59,0.6)' : 'white', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={[styles.userName, { color: isDarkMode ? 'white' : '#111827' }]}>{user.name}</Text>
                    <Text style={[styles.userUid, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{user.uid}</Text>
                    <Text style={[styles.userEmail, { color: isDarkMode ? '#6b7280' : '#9ca3af' }]}>{user.email}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: user.status === 'active' ? 'rgba(5,150,105,0.2)' : 'rgba(239,68,68,0.2)' }]}>
                    <Text style={[styles.statusText, { color: user.status === 'active' ? '#059669' : '#ef4444' }]}>{user.status}</Text>
                  </View>
                </View>

                {user.deletionScheduledAt && (
                  <View style={styles.deletionWarning}>
                    <AlertCircle size={12} color="#ef4444" />
                    <Text style={styles.deletionText}>
                      DELETION: {new Date(user.deletionScheduledAt).toLocaleDateString()}
                    </Text>
                  </View>
                )}

                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => toggleUserStatus(user._id, user.status)}
                    style={[styles.actionBtn, { backgroundColor: user.status === 'active' ? 'rgba(239,68,68,0.1)' : 'rgba(5,150,105,0.1)' }]}
                  >
                    {user.status === 'active' ? <ToggleRight size={16} color="#ef4444" /> : <ToggleLeft size={16} color="#059669" />}
                    <Text style={[styles.actionText, { color: user.status === 'active' ? '#ef4444' : '#059669' }]}>
                      {user.status === 'active' ? 'Disable' : 'Enable'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'rgba(59,130,246,0.1)' }]}>
                    <Edit size={16} color="#3b82f6" />
                    <Text style={[styles.actionText, { color: '#3b82f6' }]}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerInner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4, paddingBottom: 8 },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(55,65,81,0.2)',
  },
  searchInput: { flex: 1, fontSize: 14 },
  card: { padding: 16, borderRadius: 14, borderWidth: 1, gap: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  userName: { fontSize: 16, fontWeight: '700' },
  userUid: { fontSize: 11, fontFamily: 'monospace', color: '#7c3aed', marginTop: 2 },
  userEmail: { fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  deletionWarning: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 8 },
  deletionText: { color: '#ef4444', fontSize: 11, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: 'rgba(55,65,81,0.2)', paddingTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, flex: 1, justifyContent: 'center' },
  actionText: { fontSize: 12, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14 },
});
