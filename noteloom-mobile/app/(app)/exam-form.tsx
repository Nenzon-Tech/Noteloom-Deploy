import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { ClipboardList } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { authHeaders } from '../../lib/api';
import { getSessionToken } from '../../lib/storage';
import { Screen } from '../../components/ui/Screen';
import { SubHeader } from '../../components/ui/SubHeader';
import { SrvRow } from '../../components/ui/SrvRow';
import { EmptyState } from '../../components/ui/EmptyState';
import { BottomNav } from '../../components/ui/BottomNav';

export default function ExamForm() {
  const { theme } = useTheme();
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchForms(); }, []);

  const fetchForms = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/exam/forms`, {
        headers: authHeaders(token),
      });
      if (response.ok) {
        const data = await response.json();
        setForms(Array.isArray(data) ? data : []);
      }
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Exam Form" subtitle="Submit your examination forms" />
        {loading ? (
          <ActivityIndicator color={theme.violet} style={{ paddingVertical: 60 }} />
        ) : forms.length === 0 ? (
          <EmptyState message="No examination forms available" />
        ) : (
          forms.map(form => (
            <SrvRow
              key={form._id}
              icon={<ClipboardList size={17} color={theme.violet} />}
              iconBg="rgba(124,58,237,0.12)"
              title={form.examName || 'Examination Form'}
              meta={`Due ${form.dueDate ? new Date(form.dueDate).toLocaleDateString() : 'N/A'} · Fee ₹${form.fee ?? 'N/A'}`}
              action={form.submitted ? 'Submitted' : 'Fill Form'}
              actionColor={form.submitted ? 'green' : 'blue'}
            />
          ))
        )}
      </Screen>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({});
