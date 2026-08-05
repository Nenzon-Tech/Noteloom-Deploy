import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Send, CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { authHeaders } from '../../lib/api';
import { getSessionToken } from '../../lib/storage';
import { useErrorPopup } from '../../contexts/ErrorPopupContext';
import { Screen } from '../../components/ui/Screen';
import { SubHeader } from '../../components/ui/SubHeader';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { RecRow } from '../../components/ui/RecRow';
import { Pill } from '../../components/ui/Pill';
import { GradButton } from '../../components/ui/GradButton';
import { Field } from '../../components/ui/Field';
import { EmptyState } from '../../components/ui/EmptyState';

interface LeaveRecord {
  _id: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function Leave() {
  const { theme } = useTheme();
  const { triggerPopup } = useErrorPopup();
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/leave/my-leaves`, {
        headers: authHeaders(token),
      });
      if (response.ok) {
        const data = await response.json();
        setLeaves(Array.isArray(data) ? data : []);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const submitLeave = async () => {
    if (!reason.trim()) { triggerPopup('Please enter a reason', 'error'); return; }
    setSubmitting(true);
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/leave/apply`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ reason: reason.trim() }),
      });
      if (response.ok) {
        triggerPopup('Leave applied successfully', 'success');
        setReason('');
        setShowForm(false);
        fetchLeaves();
      } else triggerPopup('Failed to apply leave', 'error');
    } catch { triggerPopup('Network error', 'error'); }
    finally { setSubmitting(false); }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved': return { color: 'green' as const };
      case 'rejected': return { color: 'red' as const };
      default: return { color: 'amber' as const };
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Leave Management" subtitle="Apply and track leave requests" />
        <GradButton onPress={() => setShowForm(!showForm)} fullWidth icon={<Send size={16} color="#fff" />}>
          {showForm ? 'Cancel' : 'Apply for Leave'}
        </GradButton>
        {showForm && (
          <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.border, ...theme.elev1 }]}>
            <Text style={[styles.formTitle, { color: theme.fg }]}>Apply for Leave</Text>
            <Field
              value={reason}
              onChangeText={setReason}
              placeholder="Enter reason for leave..."
              multiline
              numberOfLines={3}
              style={styles.textArea}
            />
            <GradButton onPress={submitLeave} loading={submitting} fullWidth size="lg">
              Submit
            </GradButton>
          </View>
        )}
        <SectionHeader title="History" />
        {loading ? (
          <ActivityIndicator color={theme.violet} style={{ paddingVertical: 40 }} />
        ) : leaves.length === 0 ? (
          <EmptyState message="No leave applications yet" />
        ) : (
          leaves.map(leave => {
            const s = getStatusStyle(leave.status);
            const dt = new Date(leave.createdAt);
            const mon = dt.toLocaleString('en', { month: 'short' });
            const day = dt.getDate().toString().padStart(2, '0');
            return (
              <RecRow
                key={leave._id}
                dateTop={mon}
                dateMain={day}
                title={leave.reason}
                subtitle={dt.toLocaleDateString()}
                trailing={<Pill color={s.color}>{leave.status}</Pill>}
              />
            );
          })
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  formCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginTop: 14, marginBottom: 4 },
  formTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  textArea: { textAlignVertical: 'top', minHeight: 80, paddingVertical: 10 },
});
