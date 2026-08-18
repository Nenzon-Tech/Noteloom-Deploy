import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { authHeaders } from '../../lib/api';
import { getSessionToken } from '../../lib/storage';
import { Screen } from '../../components/ui/Screen';
import { SubHeader } from '../../components/ui/SubHeader';
import { StatGrid } from '../../components/ui/StatGrid';
import { RecRow } from '../../components/ui/RecRow';
import { Pill } from '../../components/ui/Pill';
import { EmptyState } from '../../components/ui/EmptyState';
import { BottomNav } from '../../components/ui/BottomNav';

interface ExamRecord {
  _id: string;
  subject: string;
  examType: string;
  marks: number;
  totalMarks: number;
  semester: number;
}

export default function Results() {
  const { theme } = useTheme();
  const [results, setResults] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchResults(); }, []);

  const fetchResults = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/coe/my-results`, {
        headers: authHeaders(token),
      });
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data.results) ? data.results : [];
        setResults(list.map(r => ({
          _id: r._id,
          subject: r.subject,
          examType: r.batch || 'Semester',
          marks: r.marksObtained,
          totalMarks: r.totalMarks,
          semester: r.semester,
        })));
      }
    } catch {}
    finally { setLoading(false); }
  };

  const getPercentage = (marks: number, total: number) => total > 0 ? Math.round((marks / total) * 100) : 0;

  const totalExams = results.length;
  const passedCount = results.filter(r => getPercentage(r.marks, r.totalMarks) >= 40).length;
  const failedCount = totalExams - passedCount;
  const avgPct = totalExams ? Math.round(results.reduce((sum, r) => sum + getPercentage(r.marks, r.totalMarks), 0) / totalExams) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Results & Marks" subtitle="Semester examination performance" />
        <StatGrid
          items={[
            { value: `${avgPct}%`, label: 'Average Score', color: theme.violet, main: true },
            { value: `${totalExams}`, label: 'Exams', color: theme.fg },
            { value: `${passedCount}`, label: 'Passed', color: theme.green },
            { value: `${failedCount}`, label: 'Failed', color: theme.red },
          ]}
        />
        {loading ? (
          <ActivityIndicator color={theme.violet} style={{ paddingVertical: 60 }} />
        ) : results.length === 0 ? (
          <EmptyState message="No results available yet" />
        ) : (
          results.map(r => {
            const pct = getPercentage(r.marks, r.totalMarks);
            const passed = pct >= 40;
            return (
              <RecRow
                key={r._id}
                dateBox={
                  <View style={[styles.scoreBox, { backgroundColor: passed ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)' }]}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: passed ? theme.green : theme.red }}>{pct}%</Text>
                  </View>
                }
                title={r.subject}
                subtitle={`${r.examType} · Sem ${r.semester} · ${r.marks}/${r.totalMarks}`}
                trailing={<Pill color={passed ? 'green' : 'red'}>{passed ? 'Pass' : 'Fail'}</Pill>}
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
  scoreBox: { width: 50, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});
