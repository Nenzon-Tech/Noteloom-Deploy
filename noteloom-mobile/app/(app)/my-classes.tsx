import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Calendar, Users } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { authHeaders } from '../../lib/api';
import { getSessionToken } from '../../lib/storage';
import { Screen } from '../../components/ui/Screen';
import { GHeader } from '../../components/ui/GHeader';
import { SearchBar } from '../../components/ui/SearchBar';
import { CourseCard } from '../../components/ui/CourseCard';
import { GradButton } from '../../components/ui/GradButton';
import { EmptyState } from '../../components/ui/EmptyState';
import { BottomNav } from '../../components/ui/BottomNav';

const COURSE_GRADIENTS = [
  ['#0d9488', '#065f46'],
  ['#6366f1', '#4338ca'],
  ['#0ea5e9', '#0369a1'],
  ['#7c3aed', '#4c1d95'],
] as [string, string][];

export default function MyClasses() {
  const { theme } = useTheme();
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => { fetchClasses(); }, []);

  const fetchClasses = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/classrooms`, { headers: authHeaders(token) });
      if (response.ok) {
        const data = await response.json();
        setClasses(Array.isArray(data) ? data : []);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const filtered = classes.filter(c => {
    const q = query.toLowerCase();
    return (c.name || '').toLowerCase().includes(q) || (c.subjectCode || '').toLowerCase().includes(q);
  });

  const list = filtered;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <GHeader
          title="My Courses"
          subtitle={`${classes.length} courses`}
        />
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search courses..." />

        {loading ? (
          <ActivityIndicator color={theme.violet} style={{ paddingVertical: 60 }} />
        ) : list.length === 0 ? (
          <EmptyState message={classes.length === 0 ? 'No courses yet' : 'No courses found'} />
        ) : (
          list.map((cls, i) => (
            <CourseCard
              key={cls._id}
              title={cls.name}
              code={cls.subjectCode}
              meta="CSE · Core"
              gradient={COURSE_GRADIENTS[i % COURSE_GRADIENTS.length]}
              rows={[
                { icon: <User size={15} color="#10b981" />, iconBg: 'rgba(16,185,129,0.1)', label: 'Faculty', value: 'Course Instructor' },
                { icon: <Calendar size={15} color="#2563eb" />, iconBg: 'rgba(59,130,246,0.1)', label: 'Timeline', value: 'Sem 6 · 3rd Year' },
              ]}
              footerLeft={
                <GradButton size="sm" style={styles.ghostBtn} onPress={() => router.push(`/(app)/classroom/${cls._id}` as any)}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: theme.muted }}>Class Details</Text>
                </GradButton>
              }
              footerRight={
                <Pressable
                  onPress={() => router.push(`/(app)/classroom/${cls._id}` as any)}
                  style={({ pressed }) => [styles.openBtn, pressed && { transform: [{ scale: 0.95 }] }]}
                >
                  <Users size={14} color="#fff" />
                  <Text style={styles.openBtnText}>Open Class</Text>
                </Pressable>
              }
              onPress={() => router.push(`/(app)/classroom/${cls._id}` as any)}
            />
          ))
        )}
      </Screen>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  titleBlock: { marginVertical: 4 },
  title: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  subtitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  ghostBtn: { backgroundColor: 'transparent' },
  openBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#10b981', paddingVertical: 11, paddingHorizontal: 14,
    borderRadius: 10,
    shadowColor: 'rgba(16,185,129,0.5)', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.8, shadowRadius: 18, elevation: 4,
  },
  openBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
