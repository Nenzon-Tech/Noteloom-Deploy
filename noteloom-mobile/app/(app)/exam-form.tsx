import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { ClipboardList } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useSession } from '../../hooks/useSession';
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
  const { user } = useSession();
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user?.id) fetchForms(); }, [user?.id]);

  const fetchForms = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/coe/my-forms/${user?.id}`, {
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
        <SubHeader title="Exam Form" subtitle="Your submitted examination forms" />
        {loading ? (
          <ActivityIndicator color={theme.violet} style={{ paddingVertical: 60 }} />
        ) : forms.length === 0 ? (
          <EmptyState message="No examination forms submitted yet" />
        ) : (
          forms.map(form => {
            const session = form.sessionId || {};
            const paid = form.paymentStatus === 'Paid';
            return (
              <SrvRow
                key={form._id}
                icon={<ClipboardList size={17} color={theme.violet} />}
                iconBg="rgba(124,58,237,0.12)"
                title={session.sessionName || 'Examination Form'}
                meta={`${form.rollNo || 'Roll N/A'} · ${form.verifiedSubjects?.length || 0} subjects`}
                action={paid ? 'Submitted' : 'Pending'}
                actionColor={paid ? 'green' : 'amber'}
              />
            );
          })
        )}
      </Screen>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({});
