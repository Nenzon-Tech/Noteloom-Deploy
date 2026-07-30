import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarCheck, CheckCircle, XCircle, Clock, Send } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { getSessionToken } from '../../lib/storage';
import GlassHeader from '../../components/ui/GlassHeader';
import { useErrorPopup } from '../../contexts/ErrorPopupContext';

interface LeaveRecord {
  _id: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function Leave() {
  const { isDarkMode } = useTheme();
  const { triggerPopup } = useErrorPopup();
  const insets = useSafeAreaInsets();
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
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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
      case 'approved': return { icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' };
      case 'rejected': return { icon: XCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
      default: return { icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
      <GlassHeader variant="dashboard">
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Leave Management</Text>
          <TouchableOpacity onPress={() => setShowForm(!showForm)} style={styles.addBtn}>
            <Send size={18} color="white" />
          </TouchableOpacity>
        </View>
      </GlassHeader>

      <ScrollView contentContainerStyle={{ paddingTop: 80, padding: 16 }}>
        {showForm && (
          <View style={[styles.formCard, { backgroundColor: isDarkMode ? 'rgba(30,41,59,0.6)' : 'white', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
            <Text style={[styles.formTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Apply for Leave</Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="Enter reason for leave..."
              placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
              multiline
              numberOfLines={3}
              style={[styles.textArea, { backgroundColor: isDarkMode ? 'rgba(55,65,81,0.5)' : '#f9fafb', borderColor: isDarkMode ? '#4b5563' : '#d1d5db', color: isDarkMode ? 'white' : '#111827' }]}
            />
            <TouchableOpacity onPress={submitLeave} disabled={submitting} style={[styles.submitBtn, { opacity: submitting ? 0.7 : 1 }]}>
              {submitting ? <ActivityIndicator color="white" /> : <Text style={styles.submitBtnText}>Submit</Text>}
            </TouchableOpacity>
          </View>
        )}

        {loading ? <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 40 }} /> :
          leaves.length === 0 ? (
            <View style={styles.empty}>
              <CalendarCheck size={48} color={isDarkMode ? '#6b7280' : '#9ca3af'} style={{ opacity: 0.4 }} />
              <Text style={[styles.emptyText, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>No leave applications</Text>
            </View>
          ) : (
            leaves.map((leave) => {
              const s = getStatusStyle(leave.status);
              const StatusIcon = s.icon;
              return (
                <View key={leave._id} style={[styles.card, { backgroundColor: isDarkMode ? 'rgba(30,41,59,0.4)' : 'white', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
                  <View style={styles.cardLeft}>
                    <Text style={[styles.reason, { color: isDarkMode ? 'white' : '#111827' }]} numberOfLines={2}>{leave.reason}</Text>
                    <Text style={[styles.date, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{new Date(leave.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                    <StatusIcon size={16} color={s.color} />
                    <Text style={[styles.statusText, { color: s.color }]}>{leave.status}</Text>
                  </View>
                </View>
              );
            })
          )
        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, paddingBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  addBtn: { backgroundColor: '#7c3aed', padding: 10, borderRadius: 10 },
  formCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  formTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  textArea: { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 15, minHeight: 80, textAlignVertical: 'top', marginBottom: 12 },
  submitBtn: { backgroundColor: '#7c3aed', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: 'white', fontSize: 15, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15 },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  cardLeft: { flex: 1, marginRight: 12 },
  reason: { fontSize: 15, fontWeight: '500', marginBottom: 4 },
  date: { fontSize: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
});
