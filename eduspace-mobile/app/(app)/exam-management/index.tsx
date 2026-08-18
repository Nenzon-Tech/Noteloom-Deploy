import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { ClipboardList, Calendar, CheckCircle, XCircle } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { API_BASE } from '../../../lib/constants';
import { authHeaders } from '../../../lib/api';
import { getSessionToken } from '../../../lib/storage';
import { Screen } from '../../../components/ui/Screen';
import { SubHeader } from '../../../components/ui/SubHeader';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { RecRow } from '../../../components/ui/RecRow';
import { EmptyState } from '../../../components/ui/EmptyState';

export default function ExamManagement() {
  const { theme } = useTheme();
  const [session, setSession] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStatus(); }, []);

  const fetchStatus = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/coe/admin/exam-status`, {
        headers: authHeaders(token),
      });
      if (response.ok) {
        const data = await response.json();
        setSession(data.session || null);
        setRecords(Array.isArray(data.records) ? data.records : []);
      }
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Exam Management" subtitle={session ? session.sessionName : 'No active session'} />

        <SectionHeader title="Student Form Status" />

        {loading ? (
          <ActivityIndicator color={theme.violet} style={{ paddingVertical: 60 }} />
        ) : records.length === 0 ? (
          <EmptyState icon={<ClipboardList size={44} color={theme.faint} />} message={session ? 'No students found' : 'No active examination session'} />
        ) : (
          records.map((r) => {
            const submitted = r.status === 'Submitted';
            return (
              <RecRow
                key={r.studentId || r.rollNo}
                dateBox={
                  <View style={{ alignItems: 'center', justifyContent: 'center', width: 50, height: 52 }}>
                    <CheckCircle size={20} color={submitted ? theme.green : theme.red} />
                  </View>
                }
                title={r.name}
                subtitle={`${r.course || 'Course'} · Sem ${r.semester ?? '—'} · ${r.rollNo || 'N/A'}`}
                subtitleIcon={<Calendar size={12} color={theme.faint} />}
                trailing={null}
              />
            );
          })
        )}
      </Screen>
    </View>
  );
}
