import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { authHeaders } from '../../lib/api';
import { getSessionToken } from '../../lib/storage';
import { Screen } from '../../components/ui/Screen';
import { SubHeader } from '../../components/ui/SubHeader';
import { FilterChips } from '../../components/ui/FilterChips';
import { RecRow } from '../../components/ui/RecRow';
import { EmptyState } from '../../components/ui/EmptyState';
import { Gradient } from '../../components/ui/Gradient';
import { BottomNav } from '../../components/ui/BottomNav';

type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri';

export default function Timetable() {
  const { theme } = useTheme();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState<Day>('mon');

  useEffect(() => { fetchTimetable(); }, []);

  const fetchTimetable = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/routine`, { headers: authHeaders(token) });
      if (response.ok) {
        const data = await response.json();
        setEntries(Array.isArray(data) ? data : []);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const fallback = [
    { _id: 't1', subject: 'Operating Systems', room: 'Room 401 · Prof. R. Ghosh', timeSlot: '09:00 AM', day: 'mon' },
    { _id: 't2', subject: 'Database Management Systems', room: 'Lab 2 · Prof. S. Banerjee', timeSlot: '10:00 AM', day: 'mon' },
    { _id: 't3', subject: 'Data Structures & Algorithms', room: 'Room 305 · Dr. M. Chatterjee', timeSlot: '12:00 PM', day: 'mon' },
    { _id: 't4', subject: 'Computer Networks', room: 'Room 208 · Dr. P. Mukherjee', timeSlot: '02:00 PM', day: 'mon' },
  ];

  const list = (entries.length ? entries : fallback).filter(e => (e.day || 'mon').toLowerCase().startsWith(day.slice(0, 3)) || e.day?.toLowerCase() === day);

  const first = list[0];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Timetable" />
        <FilterChips<Day>
          options={[{ value: 'mon', label: 'Mon' }, { value: 'tue', label: 'Tue' }, { value: 'wed', label: 'Wed' }, { value: 'thu', label: 'Thu' }, { value: 'fri', label: 'Fri' }]}
          value={day}
          onChange={setDay}
        />
        {loading ? (
          <ActivityIndicator color={theme.violet} style={{ paddingVertical: 60 }} />
        ) : list.length === 0 ? (
          <EmptyState message="No classes scheduled" />
        ) : (
          list.map((e, i) => {
            const isFirst = i === 0;
            return (
              <RecRow
                key={e._id}
                dateBox={isFirst ? (
                  <Gradient colors={theme.gradientBrand} angle={135} radius={12} style={styles.gradDate}>
                    <Text style={styles.gradDateTop}>{e.timeSlot.split(' ')[1]}</Text>
                    <Text style={styles.gradDateMain}>{e.timeSlot.split(' ')[0]}</Text>
                  </Gradient>
                ) : undefined}
                dateTop={e.timeSlot.split(' ')[1]}
                dateMain={e.timeSlot.split(' ')[0]}
                dateStyle={isFirst ? { backgroundColor: 'transparent', borderWidth: 0 } : { backgroundColor: theme.surface2 }}
                title={e.subject}
                subtitle={e.room}
                subtitleIcon={<MapPin size={11} color={theme.faint} />}
                onPress={() => {}}
              />
            );
          })
        )}
      </Screen>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  gradDate: { width: 50, height: 52, alignItems: 'center', justifyContent: 'center' },
  gradDateTop: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' },
  gradDateMain: { fontSize: 12, fontWeight: '700', color: '#fff' },
});
