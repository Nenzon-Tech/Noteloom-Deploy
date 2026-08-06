import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Send } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useSession } from '../../hooks/useSession';
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
import { FilterChips } from '../../components/ui/FilterChips';
import { EmptyState } from '../../components/ui/EmptyState';

type LeaveStatus = 'pending' | 'approved' | 'rejected';

interface LeaveRecord {
  _id: string;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
  leaveType?: string;
}

const LEAVE_TYPES = ['Casual', 'Sick', 'Duty', 'Maternity', 'Paternity', 'Loss of Pay'] as const;

export default function Leave() {
  const { theme } = useTheme();
  const { user } = useSession();
  const { triggerPopup } = useErrorPopup();
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [leaveType, setLeaveType] = useState<string>('Casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { if (user?.id) fetchLeaves(); }, [user?.id]);

  const fetchLeaves = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/leave/history/${user?.id}`, {
        headers: authHeaders(token),
      });
      if (response.ok) {
        const data = await response.json();
        setLeaves(Array.isArray(data) ? data.map(normalize) : []);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const normalize = (l: any): LeaveRecord => ({
    _id: l._id,
    reason: l.reason || 'Leave request',
    leaveType: l.leaveType,
    status: (l.status === 'Approved' ? 'approved' : l.status === 'Declined' ? 'rejected' : 'pending') as LeaveStatus,
    createdAt: l.createdAt,
  });

  const submitLeave = async () => {
    if (!reason.trim() || reason.trim().length < 10) { triggerPopup('Please enter a reason (min 10 characters)', 'error'); return; }
    if (!startDate || !endDate) { triggerPopup('Please enter start and end dates (YYYY-MM-DD)', 'error'); return; }
    if (Date.parse(endDate) < Date.parse(startDate)) { triggerPopup('End date must be after start date', 'error'); return; }
    setSubmitting(true);
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/leave/apply`, {
        method: 'POST',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaveType, startDate, endDate, reason: reason.trim() }),
      });
      if (response.ok) {
        triggerPopup('Leave applied successfully', 'success');
        setReason('');
        setStartDate('');
        setEndDate('');
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
            <Text style={[styles.formLabel, { color: theme.fg }]}>Leave Type</Text>
            <FilterChips<string>
              options={LEAVE_TYPES.map(t => ({ value: t, label: t }))}
              value={leaveType}
              onChange={setLeaveType}
            />
            <View style={styles.dateRow}>
              <Field
                value={startDate}
                onChangeText={setStartDate}
                placeholder="Start (YYYY-MM-DD)"
                style={styles.dateField}
              />
              <Field
                value={endDate}
                onChangeText={setEndDate}
                placeholder="End (YYYY-MM-DD)"
                style={styles.dateField}
              />
            </View>
            <Field
              value={reason}
              onChangeText={setReason}
              placeholder="Enter reason for leave (min 10 chars)..."
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
                subtitle={`${leave.leaveType || 'Leave'} · ${dt.toLocaleDateString()}`}
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
  formLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  dateRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  dateField: { flex: 1 },
  textArea: { textAlignVertical: 'top', minHeight: 80, paddingVertical: 10 },
});
