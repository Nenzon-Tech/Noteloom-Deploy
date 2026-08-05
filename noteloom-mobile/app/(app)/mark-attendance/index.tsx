import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
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

type BulkFilter = 'present' | 'absent' | 'unmarked';
type AttStatus = 'present' | 'absent' | 'unmarked';

interface Student {
  _id: string;
  name: string;
  uid: string;
  attendance: string;
}

export default function MarkAttendance() {
  const { theme } = useTheme();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState('');
  const [saving, setSaving] = useState(false);
  const [bulk, setBulk] = useState<BulkFilter>('present');

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/attendance/students`, {
        headers: authHeaders(token),
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data.map((s: any) => ({ ...s, attendance: 'NotMarked' })));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const updateAttendance = (studentId: string, value: string) => {
    setStudents((prev) => prev.map((s) => s._id === studentId ? { ...s, attendance: value } : s));
  };

  const markAll = (value: string) => {
    setStudents((prev) => prev.map((s) => ({ ...s, attendance: value })));
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const token = await getSessionToken();
      await fetch(`${API_BASE}/api/attendance/mark`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({
          session: selectedSession,
          records: students.map((s) => ({ studentId: s._id, status: s.attendance })),
        }),
      });
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const toStatus = (value: string): AttStatus =>
    value === 'Present' ? 'present' : value === 'Absent' ? 'absent' : 'unmarked';

  const toValue = (status: AttStatus): string =>
    status === 'present' ? 'Present' : status === 'absent' ? 'Absent' : 'NotMarked';

  const presentCount = students.filter((s) => s.attendance === 'Present').length;
  const absentCount = students.filter((s) => s.attendance === 'Absent').length;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Mark Attendance" subtitle={`${presentCount} present · ${absentCount} absent`} />

        {loading ? (
          <ActivityIndicator size="large" color={theme.violet} style={{ marginTop: 40 }} />
        ) : (
          <>
            <FilterChips<BulkFilter>
              options={[
                { value: 'present', label: 'Mark All Present' },
                { value: 'absent', label: 'Mark All Absent' },
                { value: 'unmarked', label: 'Unmark All' },
              ]}
              value={bulk}
              onChange={(v) => { setBulk(v); markAll(toValue(v)); }}
            />

            {students.length === 0 ? (
              <EmptyState message="No students found" />
            ) : (
              students.map((student) => (
                <AttRow
                  key={student._id}
                  initial={student.name?.[0]}
                  name={student.name}
                  id={student.uid}
                  status={toStatus(student.attendance)}
                  onChange={(status) => updateAttendance(student._id, toValue(status))}
                />
              ))
            )}

            <View style={{ height: 14 }} />
            <GradButton
              fullWidth
              size="lg"
              loading={saving}
              onPress={saveAttendance}
              icon={<ClipboardCheck size={18} color="#fff" />}
            >
              {saving ? 'Saving...' : 'Save Attendance'}
            </GradButton>
          </>
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({});
