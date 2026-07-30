import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, TextInput, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Mail, Shield, LogOut, Fingerprint, Bell, ShieldAlert, Trash2, AlertCircle, GraduationCap, Key, RotateCcw, Edit, X, CheckCircle } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useSession } from '../../hooks/useSession';
import GlassHeader from '../../components/ui/GlassHeader';

export default function Profile() {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, profile, logout, authenticateWithBiometrics } = useSession();
  const router = useRouter();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState('');

  const handleSignOut = async () => {
    await logout();
    router.replace('/college-selection');
  };

  const getRoleBadge = () => {
    switch (profile?.role) {
      case 'student': return { label: 'Student', icon: GraduationCap, color: '#7c3aed' };
      case 'faculty': return { label: 'Faculty', icon: Shield, color: '#2563eb' };
      case 'college_admin': return { label: 'Admin', icon: ShieldAlert, color: '#dc2626' };
      default: return { label: 'User', icon: User, color: '#6b7280' };
    }
  };

  const roleBadge = getRoleBadge();
  const RoleIcon = roleBadge.icon;

  return showDeleteConfirm ? (
    <View style={[styles.deleteContainer, { backgroundColor: isDarkMode ? '#0f172a' : '#f9fafb' }]}>
      <View style={[styles.deleteCard, { backgroundColor: isDarkMode ? 'rgba(239,68,68,0.1)' : 'rgba(254,202,202,0.7)', borderColor: isDarkMode ? 'rgba(239,68,68,0.5)' : 'rgba(239,68,68,0.3)' }]}>
        <AlertCircle size={48} color="#ef4444" />
        <Text style={[styles.deleteTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Delete Account</Text>
        <Text style={[styles.deleteWarning, { backgroundColor: isDarkMode ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)' }]}>
          This will permanently remove all your progress, certificates, and learning data.
        </Text>
        <Text style={[styles.deleteLabel, { color: isDarkMode ? '#e5e7eb' : '#374151' }]}>Type "DELETE" to confirm</Text>
        <TextInput
          value={deleteText}
          onChangeText={setDeleteText}
          placeholder="Type DELETE here"
          placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
          style={[styles.deleteInput, { backgroundColor: isDarkMode ? 'rgba(55,65,81,0.5)' : 'white', borderColor: isDarkMode ? '#4b5563' : '#d1d5db', color: isDarkMode ? 'white' : '#111827' }]}
        />
        <TouchableOpacity onPress={() => Alert.alert('Delete Account', 'Account deletion request submitted.')} disabled={deleteText !== 'DELETE'} style={[styles.deleteBtn, { opacity: deleteText !== 'DELETE' ? 0.5 : 1 }]}>
          <Text style={styles.deleteBtnText}>Permanently Delete Account</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowDeleteConfirm(false)} style={[styles.cancelBtn, { backgroundColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
          <Text style={{ color: isDarkMode ? 'white' : '#111827', fontWeight: '600' }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
      <GlassHeader variant="dashboard">
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Profile</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutBtn}>
            <LogOut size={18} color="white" />
          </TouchableOpacity>
        </View>
      </GlassHeader>

      <ScrollView contentContainerStyle={{ paddingTop: 80, padding: 16 }}>
        <View style={[styles.profileCard, { backgroundColor: isDarkMode ? 'rgba(30,41,59,0.4)' : 'white', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
          <View style={[styles.avatarLarge, { backgroundColor: isDarkMode ? '#374151' : '#f3f4f6' }]}>
            <User size={32} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
          </View>
          <Text style={[styles.name, { color: isDarkMode ? 'white' : '#111827' }]}>{user?.name || 'User'}</Text>
          <Text style={[styles.email, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{user?.email}</Text>
          <View style={[styles.roleBadgeContainer, { backgroundColor: roleBadge.color + '20' }]}>
            <RoleIcon size={14} color={roleBadge.color} />
            <Text style={[styles.roleBadgeText, { color: roleBadge.color }]}>{roleBadge.label}</Text>
          </View>
          {user?.uid && <Text style={[styles.uid, { backgroundColor: isDarkMode ? '#1e293b' : '#f3f4f6', color: isDarkMode ? '#93c5fd' : '#2563eb' }]}>ID: {user.uid}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#e5e7eb' : '#374151' }]}>Security</Text>
          <View style={[styles.settingCard, { backgroundColor: isDarkMode ? 'rgba(30,41,59,0.4)' : 'white', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
            <View style={styles.settingRow}>
              <Fingerprint size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
              <Text style={[styles.settingLabel, { color: isDarkMode ? 'white' : '#111827' }]}>Biometric Quick Unlock</Text>
              <Switch value={biometricEnabled} onValueChange={async (v) => { if (v) { const ok = await authenticateWithBiometrics(); if (ok) setBiometricEnabled(true); } else setBiometricEnabled(false); }} trackColor={{ false: '#374151', true: '#7c3aed' }} thumbColor="white" />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#e5e7eb' : '#374151' }]}>Account</Text>
          {[
            { icon: Edit, label: 'Modify My Details', onPress: () => {} },
            { icon: Key, label: 'Change Password', onPress: () => {} },
            { icon: RotateCcw, label: 'Reset Password', onPress: () => {} },
            { icon: Trash2, label: 'Delete Account', onPress: () => setShowDeleteConfirm(true), danger: true },
          ].map((item, i) => (
            <TouchableOpacity key={i} onPress={item.onPress} style={[styles.menuItem, { backgroundColor: isDarkMode ? 'rgba(30,41,59,0.4)' : 'white', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
              <item.icon size={18} color={item.danger ? '#ef4444' : isDarkMode ? '#9ca3af' : '#6b7280'} />
              <Text style={[styles.menuItemLabel, { color: item.danger ? '#ef4444' : isDarkMode ? 'white' : '#111827' }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, paddingBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  logoutBtn: { backgroundColor: '#7c3aed', padding: 10, borderRadius: 10 },
  profileCard: { alignItems: 'center', padding: 24, borderRadius: 20, borderWidth: 1, marginBottom: 24 },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  name: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  email: { fontSize: 14, marginBottom: 12 },
  roleBadgeContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 12 },
  roleBadgeText: { fontSize: 13, fontWeight: '600' },
  uid: { fontSize: 12, fontFamily: 'monospace', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  settingCard: { padding: 16, borderRadius: 16, borderWidth: 1 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  menuItemLabel: { fontSize: 15, fontWeight: '500' },
  deleteContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  deleteCard: { width: '100%', maxWidth: 400, padding: 32, borderRadius: 20, borderWidth: 1, alignItems: 'center', gap: 16 },
  deleteTitle: { fontSize: 24, fontWeight: '700' },
  deleteWarning: { padding: 12, borderRadius: 10, fontSize: 13, lineHeight: 20, overflow: 'hidden' },
  deleteLabel: { fontSize: 14, fontWeight: '500', alignSelf: 'flex-start' },
  deleteInput: { width: '100%', borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 15 },
  deleteBtn: { backgroundColor: '#dc2626', width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  deleteBtnText: { color: 'white', fontSize: 15, fontWeight: '600' },
  cancelBtn: { width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
});
