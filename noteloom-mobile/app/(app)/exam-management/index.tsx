import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { ClipboardList, Users, Calendar, CheckCircle, XCircle } from 'lucide-react-native';
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
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchExams(); }, []);

  const fetchExams = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/exams`, {
        headers: authHeaders(token),
      });
      if (response.ok) setExams(await response.json());
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Exam Management" subtitle="Scheduled examinations" />

        <SectionHeader title="Active Exams" />

        {loading ? (
          <ActivityIndicator color={theme.violet} style={{ paddingVertical: 60 }} />
        ) : exams.length === 0 ? (
          <EmptyState icon={<ClipboardList size={44} color={theme.faint} />} message="No exams scheduled" />
        ) : (
          exams.map((exam) => {
            const d = exam.date ? new Date(exam.date) : null;
            const active = exam.status === 'active';
            return (
              <RecRow
                key={exam._id}
                dateTop={d ? d.toLocaleString('en', { month: 'short' }) : '—'}
                dateMain={d ? String(d.getDate()) : '—'}
                title={exam.name}
                subtitle={exam.totalStudents ? `${exam.totalStudents} students` : 'Scheduled'}
                subtitleIcon={exam.totalStudents ? <Users size={12} color={theme.faint} /> : <Calendar size={12} color={theme.faint} />}
                trailing={active ? <CheckCircle size={18} color={theme.green} /> : <XCircle size={18} color={theme.red} />}
              />
            );
          })
        )}
      </Screen>
    </View>
  );
}
