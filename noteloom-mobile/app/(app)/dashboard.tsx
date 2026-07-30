import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Wifi, Sparkles, Database, Layout, GraduationCap, Users, Shield, LogOut, ArrowRight } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useSession } from '../../hooks/useSession';
import { API_BASE, ROLE_LABELS } from '../../lib/constants';
import { getSessionToken } from '../../lib/storage';
import GlassHeader from '../../components/ui/GlassHeader';
import ThemeToggle from '../../components/ui/ThemeToggle';
import UserProfileDropdown from '../../components/ui/UserProfileDropdown';
import DashboardCard from '../../components/ui/DashboardCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SessionExpired from '../../components/ui/SessionExpired';

interface MenuItem {
  key: string;
  title: string;
  description: string;
  icon: string;
  category: 'LMS' | 'ERP';
}

const { width } = Dimensions.get('window');

const routeMap: Record<string, string> = {
  attendance: '/(app)/attendance',
  my_classes: '/(app)/my-classes',
  notice_board: '/(app)/notice-board',
  timetable: '/(app)/timetable',
  library: '/(app)/library',
  leave: '/(app)/leave',
  coe: '/(app)/coe',
  ai_chat: '/(app)/ai-chat',
  profile: '/(app)/profile',
  mark_attendance: '/(app)/mark-attendance',
  manage_users: '/(app)/manage-users',
  manage_departments: '/(app)/manage-departments',
  exam_form: '/(app)/exam-form',
  fees: '/(app)/fees',
  results: '/(app)/results',
  academic_calendar: '/(app)/academic-calendar',
  courses: '/(app)/my-classes',
  feedback: '/(app)/feedback',
  chat: '/(app)/ai-chat',
  library_books: '/(app)/library',
  admit_card: '/(app)/coe/admit-card',
  exam_portal: '/(app)/coe',
  question_bank: '/(app)/coe',
  leave_apply: '/(app)/leave',
  leave_manager: '/(app)/leave',
  fees_exam_records: '/(app)/fees',
  exam_management: '/(app)/exam-management',
  university_marks: '/(app)/results',
  staff_notices: '/(app)/notice-board',
  dept_notices: '/(app)/notice-board',
  account_creation: '/(app)/manage-users',
};

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function Dashboard() {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, profile, loading, isSessionValid, logout, fetchMenu } = useSession();
  const router = useRouter();
  const [lmsItems, setLmsItems] = useState<MenuItem[]>([]);
  const [erpItems, setErpItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMenu = useCallback(async () => {
    setMenuLoading(true);
    try {
      const token = await getSessionToken();
      if (!token) { setMenuLoading(false); return; }
      const response = await fetch(`${API_BASE}/session/menu`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        const lms: MenuItem[] = [];
        const erp: MenuItem[] = [];
        const lmsKeywords = ['notes', 'assignments', 'exams', 'classroom', 'library', 'quiz', 'course', 'faculty', 'attendance', 'notice', 'project', 'class', 'routine', 'timetable'];
        data.forEach((item: MenuItem) => {
          const key = item.key?.toLowerCase() || '';
          const title = item.title?.toLowerCase() || '';
          const matchesKeyword = lmsKeywords.some(kw => key.includes(kw) || title.includes(kw));
          if (item.category === 'LMS' || matchesKeyword) lms.push(item);
          else erp.push(item);
        });
        setLmsItems(lms);
        setErpItems(erp);
      }
    } catch (error) { console.error('Error fetching menu:', error); }
    finally { setMenuLoading(false); }
  }, []);

  useEffect(() => { if (isSessionValid) loadMenu(); }, [isSessionValid]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMenu();
    setRefreshing(false);
  }, [loadMenu]);

  const handleCardPress = (item: MenuItem) => {
    const route = routeMap[item.key] || `/(app)/${item.key.replace(/_/g, '-')}`;
    router.push(route as any);
  };

  const handleSignOut = async () => {
    await logout();
    router.replace('/college-selection');
  };

  const getRoleInfo = () => {
    const map: Record<string, { label: string; icon: any }> = {
      student: { label: 'Student Dashboard', icon: GraduationCap },
      faculty: { label: 'Faculty Dashboard', icon: Users },
      college_admin: { label: 'Admin Dashboard', icon: Shield },
    };
    return map[profile?.role || 'student'] || map.student;
  };

  if (loading || menuLoading) {
    return <LoadingSpinner message="Hang On, Loading..." />;
  }

  if (!isSessionValid) {
    return <SessionExpired onLoginRedirect={() => router.push('/college-selection')} />;
  }

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f3f4f6' }]}>
      <GlassHeader variant="dashboard">
        <View style={[styles.headerInner, { paddingTop: insets.top + 8 }]}>
          <View style={styles.headerLeft}>
            <UserProfileDropdown
              userName={user?.name}
              userEmail={user?.email}
              userUid={user?.uid}
              onOptionClick={(id) => console.log(id)}
            />
            <View>
              <View style={styles.roleRow}>
                <View style={styles.roleBadge}>
                  <RoleIcon size={14} color="white" />
                  <Text style={styles.roleBadgeText}>{roleInfo.label}</Text>
                </View>
                <View style={styles.activeBadge}>
                  <Wifi size={10} color="#22c55e" />
                  <Text style={styles.activeText}>Active</Text>
                </View>
              </View>
              <Text style={[styles.collegeName, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>
                {profile?.college || 'Note Loom'}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <ThemeToggle />
            <TouchableOpacity onPress={handleSignOut} style={[styles.signOutBtn, { backgroundColor: isDarkMode ? 'rgba(55,65,81,0.7)' : '#7c3aed' }]}>
              <LogOut size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </GlassHeader>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: 100, paddingBottom: 100, paddingHorizontal: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
      >
        {lmsItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Sparkles size={20} color="#7c3aed" />
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#f3f4f6' : '#111827' }]}>Learning & Academics</Text>
            </View>
            <View style={styles.grid}>
              {lmsItems.map((item, index) => (
                <DashboardCard key={item.key} item={item} index={index} onPress={() => handleCardPress(item)} />
              ))}
            </View>
          </View>
        )}

        {erpItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Database size={20} color="#2563eb" />
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#f3f4f6' : '#111827' }]}>Resource Planning & Management</Text>
            </View>
            <View style={styles.grid}>
              {erpItems.map((item, index) => (
                <DashboardCard key={item.key} item={item} index={index} onPress={() => handleCardPress(item)} />
              ))}
            </View>
          </View>
        )}

        {lmsItems.length === 0 && erpItems.length === 0 && (
          <View style={styles.empty}>
            <Layout size={64} color={isDarkMode ? '#6b7280' : '#9ca3af'} style={{ opacity: 0.4 }} />
            <Text style={[styles.emptyText, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>No active modules assigned to your profile.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, paddingBottom: 8 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#7c3aed', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  roleBadgeText: { color: 'white', fontSize: 12, fontWeight: '600' },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  activeText: { color: '#22c55e', fontSize: 11 },
  collegeName: { fontSize: 13, fontWeight: '500' },
  signOutBtn: { padding: 10, borderRadius: 10 },
  scroll: { flex: 1 },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(55,65,81,0.3)' },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  empty: { alignItems: 'center', paddingVertical: 80, gap: 16 },
  emptyText: { fontSize: 15, textAlign: 'center', opacity: 0.6 },
});
