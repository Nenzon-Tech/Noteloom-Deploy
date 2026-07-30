import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Shield, Settings, Users, BookOpen, LogOut, Building, FileCog, UserPlus } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { useSession } from '../../../hooks/useSession';
import GlassHeader from '../../../components/ui/GlassHeader';
import ITDashboardFooter from '../../../components/ui/ITDashboardFooter';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

const menuItems = [
  { key: 'features', title: 'Feature Manager', icon: Settings, desc: 'Manage platform features', color: '#8b5cf6' },
  { key: 'content', title: 'Content Manager', icon: BookOpen, desc: 'Add/Edit learning content', color: '#2563eb' },
  { key: 'departments', title: 'Departments', icon: Building, desc: 'Manage departments', color: '#059669' },
  { key: 'users', title: 'Users', icon: Users, desc: 'Manage system users', color: '#d97706' },
  { key: 'roles', title: 'Role Manager', icon: UserPlus, desc: 'Manage roles & permissions', color: '#dc2626' },
  { key: 'config', title: 'System Config', icon: FileCog, desc: 'Platform configuration', color: '#7c3aed' },
];

export default function ITAdminDashboard() {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, loading, isSessionValid, profile } = useSession();

  const handleNavigate = (key: string) => {
    const routes: Record<string, string> = {
      features: '/it-admin/feature-manager',
      content: '/it-admin/content/add',
      departments: '/manage-departments',
      users: '/manage-users',
    };
    router.push(routes[key] || '/' as any);
  };

  if (loading) return <LoadingSpinner message="Loading IT Dashboard..." />;

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
      <GlassHeader variant="dashboard">
        <View style={[styles.headerInner, { paddingTop: insets.top + 8 }]}>
          <Shield size={24} color="#7c3aed" />
          <View>
            <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : '#111827' }]}>IT Admin</Text>
            <Text style={[styles.headerSub, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{user?.name || 'Admin'}</Text>
          </View>
        </View>
      </GlassHeader>

      <ScrollView contentContainerStyle={{ paddingTop: 80, padding: 16, gap: 12 }}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>System Management</Text>
        <View style={styles.grid}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity key={item.key} onPress={() => handleNavigate(item.key)} style={[styles.card, { backgroundColor: isDarkMode ? 'rgba(30,41,59,0.6)' : 'white', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
                <View style={[styles.iconBox, { backgroundColor: `${item.color}20` }]}>
                  <Icon size={24} color={item.color} />
                </View>
                <Text style={[styles.cardTitle, { color: isDarkMode ? 'white' : '#111827' }]}>{item.title}</Text>
                <Text style={[styles.cardDesc, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{item.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      <ITDashboardFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerInner: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4, paddingBottom: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerSub: { fontSize: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', padding: 16, borderRadius: 16, borderWidth: 1, gap: 8 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  cardDesc: { fontSize: 11, lineHeight: 16 },
});
