import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { ClipboardCheck } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { API_BASE } from '../../../lib/constants';
import { authHeaders } from '../../../lib/api';
import { getSessionToken } from '../../../lib/storage';
import { Screen } from '../../../components/ui/Screen';
import { SubHeader } from '../../../components/ui/SubHeader';
import { FilterChips } from '../../../components/ui/FilterChips';
import { AttRow } from '../../../components/ui/AttRow';
import { GradButton } from '../../../components/ui/GradButton';
import { EmptyState } from '../../../components/ui/EmptyState';

type AttFilter = 'all' | 'present' | 'absent';
type AttStatus = 'present' | 'absent' | 'unmarked';

interface Batch { _id: string; name?: string; section?: string; }
interface Student { _id: string; name: string; uid?: string; }

export default function FacultyAttendance() {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<AttFilter>('all');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchId, setBatchId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [rows, setRows] = useState<{ _id: string; name: string; id: string; status: AttStatus }[]>([]);
  const [day, setDay] = useState('');
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadBatches = useCallback(async () => {
    try {
      const token = await getSessionToken();
      const res = await fetch(`${API_BASE}/api/batches/my-batches`, { headers: authHeaders(token) });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setBatches(list);
        if (list.length) { setBatchId(list[0]._id); await loadStudents(list[0]._id); }
      }
    } catch {}
    finally { setLoadingBatches(false); }
  }, []);

  const loadStudents = async (id: string) => {
    setLoading(true);
    try {
      const token = await getSessionToken();
      const res = await fetch(`${API_BASE}/api/attendance/faculty/init?batchId=${encodeURIComponent(id)}`, { headers: authHeaders(token) });
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
        setDay(data.day || '');
        const seeded = (data.students || []).map((s: Student) => {
          const existing = data.existingAttendance || {};
          const status: AttStatus = 'unmarked';
          return { _id: s._id, name: s.name, id: s.uid || 'N/A', status };
        });
        setRows(seeded);
      } else {
        setRows([]);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const pickBatch = (id: string) => { setBatchId(id); loadStudents(id); };

  useEffect(() => { loadBatches(); }, [loadBatches]);

  const setStatus = (id: string, status: AttStatus) => setRows(prev => prev.map(p => p._id === id ? { ...p, status } : p));

  const marked = rows.filter(r => r.status !== 'unmarked').length;
  const list = rows.filter(r => filter === 'all' || r.status === filter);

  const submit = async () => {
    const records = rows
      .filter(r => r.status !== 'unmarked')
      .map(r => ({ studentId: r._id, status: r.status === 'present' ? 'Present' : 'Absent' }));
    if (!records.length) return;
    setSubmitting(true);
    try {
      const token = await getSessionToken();
      await fetch(`${API_BASE}/api/attendance/mark`, {
        method: 'POST',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId, records, date: new Date().toISOString().slice(0, 10) }),
      });
    } catch {}
    finally { setSubmitting(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Mark Attendance" subtitle={day ? `${day} · ${batches.find(b => b._id === batchId)?.name || ''}` : undefined} />

        {loadingBatches ? (
          <EmptyState message="Loading batches…" />
        ) : (
          <FilterChips<string>
            options={batches.map(b => ({ value: b._id, label: b.name || 'Batch' }))}
            value={batchId}
            onChange={pickBatch}
          />
        )}

        {loading ? (
          <ActivityIndicator color={theme.violet} style={{ paddingVertical: 40 }} />
        ) : rows.length === 0 ? (
          <EmptyState message="No students in this batch" />
        ) : (
          <>
            <FilterChips<AttFilter>
              options={[{ value: 'all', label: 'All' }, { value: 'present', label: 'Present' }, { value: 'absent', label: 'Absent' }]}
              value={filter}
              onChange={setFilter}
            />
            {list.map(r => (
              <AttRow
                key={r._id}
                initial={r.name[0]}
                name={r.name}
                id={r.id}
                status={r.status}
                onChange={s => setStatus(r._id, s)}
              />
            ))}
          </>
        )}
        <View style={{ height: 14 }} />
        <GradButton fullWidth size="lg" loading={submitting} icon={<ClipboardCheck size={18} color="#fff" />} onPress={submit}>
          {submitting ? 'Saving…' : `Submit · ${marked} marked`}
        </GradButton>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({});