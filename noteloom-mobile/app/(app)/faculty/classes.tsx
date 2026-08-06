import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { BookOpen, Check, Plus } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { Screen } from '../../../components/ui/Screen';
import { SubHeader } from '../../../components/ui/SubHeader';
import { SearchBar } from '../../../components/ui/SearchBar';
import { ListCard, LRow } from '../../../components/ui/ListCard';
import { Gradient } from '../../../components/ui/Gradient';
import { EmptyState } from '../../../components/ui/EmptyState';
import { GradButton } from '../../../components/ui/GradButton';
import { API_BASE } from '../../../lib/constants';
import { authHeaders } from '../../../lib/api';
import { getSessionToken } from '../../../lib/storage';

const GRADS = [
  ['#3b82f6', '#6366f1'],
  ['#10b981', '#0d9488'],
  ['#f43f5e', '#e11d48'],
  ['#a855f7', '#7c3aed'],
] as [string, string][];

export default function FacultyClasses() {
  const { theme } = useTheme();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const list = classes.filter(c => (c.name || '').toLowerCase().includes(q.toLowerCase()));

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="My Classes" subtitle={`${classes.length} created · Faculty`} />
        <SearchBar value={q} onChangeText={setQ} placeholder="Search classes…" />

        <GradButton style={styles.createBtn} onPress={() => router.push('/(app)/faculty/create-class')}>
          <Plus size={16} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Create Class</Text>
        </GradButton>

        {loading ? (
          <ActivityIndicator color={theme.violet} style={{ paddingVertical: 60 }} />
        ) : list.length === 0 ? (
          <EmptyState icon={<BookOpen size={44} color={theme.faint} />} message="No classes yet — create your first one" />
        ) : (
          list.map((c, i) => (
            <ListCard key={c._id}>
              <LRow
                icon={<BookOpen size={18} color={GRADS[i % GRADS.length][1]} />}
                iconBg={GRADS[i % GRADS.length]}
                title={c.name}
                subtitle={`${c.subjectCode || 'Subject'} · ${c.stream || 'General'} · ${c.students?.length || 0} students`}
                onPress={() => router.push(`/(app)/faculty/manage-class/${c._id}` as any)}
                trailing={
                  <Gradient colors={theme.gradientCta} radius={10} style={styles.take}>
                    <Text style={styles.takeText}>Manage</Text>
                  </Gradient>
                }
              />
            </ListCard>
          ))
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  take: { paddingHorizontal: 15, paddingVertical: 7 },
  takeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  createBtn: { marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 6 },
});