import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { BookOpen, Check } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { Screen } from '../../../components/ui/Screen';
import { SubHeader } from '../../../components/ui/SubHeader';
import { SearchBar } from '../../../components/ui/SearchBar';
import { ListCard, LRow } from '../../../components/ui/ListCard';
import { Gradient } from '../../../components/ui/Gradient';

export default function FacultyClasses() {
  const { theme } = useTheme();
  const router = useRouter();
  const [q, setQ] = useState('');

  const classes = [
    { _id: 'c1', name: 'Mathematics II', meta: 'CSE 3A · Mon · Room 402 · 08:45', grad: ['#3b82f6', '#6366f1'] as [string, string], done: false },
    { _id: 'c2', name: 'Data Structures', meta: 'CSE 3B · Tue · Room 402 · 10:00', grad: ['#10b981', '#0d9488'] as [string, string], done: false },
    { _id: 'c3', name: 'DBMS Lab', meta: 'CSE 3A · Wed · Lab 4 · 13:00', grad: ['#f43f5e', '#e11d48'] as [string, string], done: true },
    { _id: 'c4', name: 'Doubt Session', meta: 'CSE 3A · Thu · Room 105 · 15:00', grad: ['#a855f7', '#7c3aed'] as [string, string], done: true },
  ];

  const list = classes.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="My Classes" subtitle="CSE Dept · Semester VI" />
        <SearchBar value={q} onChangeText={setQ} placeholder="Search classes…" />
        {list.map(c => (
          <ListCard key={c._id}>
            <LRow
              icon={<BookOpen size={18} color={c.grad[1]} />}
              iconBg={c.grad}
              title={c.name}
              subtitle={c.meta}
              onPress={c.done ? undefined : () => router.push('/(app)/faculty/attendance')}
              trailing={
                c.done ? (
                  <View style={[styles.done, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
                    <Check size={13} color={theme.faint} />
                    <Text style={[styles.doneText, { color: theme.faint }]}>Done</Text>
                  </View>
                ) : (
                  <Gradient colors={theme.gradientCta} radius={10} style={styles.take}>
                    <Text style={styles.takeText}>Take</Text>
                  </Gradient>
                )
              }
            />
          </ListCard>
        ))}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  take: { paddingHorizontal: 15, paddingVertical: 7 },
  takeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  done: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  doneText: { fontSize: 11, fontWeight: '600' },
});
