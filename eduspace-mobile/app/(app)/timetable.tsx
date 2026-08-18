import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useSession } from '../../hooks/useSession';
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
  const { user } = useSession();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState<Day>('mon');

  useEffect(() => { if (user?.id) fetchTimetable(); }, [user?.id]);

  const fetchTimetable = async () => {
    try {
      const token = await getSessionToken();

      // Resolve the student's own batch from the batch list (students array)
      const batchRes = await fetch(`${API_BASE}/api/batches`, { headers: authHeaders(token) });
      let batchId: string | null = null;
      if (batchRes.ok) {
        const batches = await batchRes.json();
        const match = (Array.isArray(batches) ? batches : []).find(b =>
          Array.isArray(b?.students) && b.students.some((s: any) => String(s || '') === String(user?.id))
        );
        batchId = match?._id || null;
      }
      if (!batchId) { setEntries([]); return; }

      const routineRes = await fetch(`${API_BASE}/api/routine/batch/${batchId}`, { headers: authHeaders(token) });
      if (routineRes.ok) {
        const routines = await routineRes.json();
        const flattened = (Array.isArray(routines) ? routines : []).flatMap((r: any) =>
          (Array.isArray(r.periods) ? r.periods : []).map((p: any) => ({
            _id: `${r._id}-${p.periodNumber}`,
            subject: p.subject || 'Break',
            room: p.roomNo || '—',
            faculty: p.facultyName || '',
            timeSlot: fmtTime(p.startTime),
            timeEnd: fmtTime(p.end),
            day: (r.dayOfWeek || '').toLowerCase().slice(0, 3),
            isBreak: !!p.isBreak,
          }))
        );
        setEntries(flattened);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const fmtTime = (t?: string) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    if (Number.isNaN(h)) return t;
    const meridiem = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m ?? 0).padStart(2, '0')} ${meridiem}`;
  };

  const list = entries.filter(e => e.day === day);

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
                subtitle={e.isBreak ? 'Break' : `${e.room}${e.faculty ? ' · ' + e.faculty : ''}`}
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
