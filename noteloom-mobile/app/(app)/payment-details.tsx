import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Receipt, IndianRupee, Calendar, FileText, Download } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { getSessionToken } from '../../lib/storage';
import GlassHeader from '../../components/ui/GlassHeader';

export default function PaymentDetails() {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) fetchPayment(); }, [id]);

  const fetchPayment = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/payments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) setPayment(await response.json());
    } catch {}
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
      <GlassHeader variant="dashboard">
        <View style={[styles.headerInner, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={isDarkMode ? 'white' : '#111827'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Payment Details</Text>
        </View>
      </GlassHeader>

      <ScrollView contentContainerStyle={{ paddingTop: 80, padding: 16, gap: 16 }}>
        {payment ? (
          <>
            <View style={[styles.amountCard, { backgroundColor: isDarkMode ? 'rgba(30,41,59,0.6)' : 'white', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
              <IndianRupee size={32} color="#059669" />
              <Text style={[styles.amount, { color: isDarkMode ? 'white' : '#111827' }]}>₹{payment.amount?.toLocaleString()}</Text>
              <Text style={[styles.status, { color: payment.status === 'paid' ? '#059669' : '#f59e0b' }]}>{payment.status?.toUpperCase()}</Text>
            </View>

            <View style={styles.detailRow}>
              <Receipt size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
              <Text style={[styles.detailLabel, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>Transaction ID</Text>
              <Text style={[styles.detailValue, { color: isDarkMode ? 'white' : '#111827' }]}>{payment.transactionId}</Text>
            </View>

            <View style={styles.detailRow}>
              <Calendar size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
              <Text style={[styles.detailLabel, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>Date</Text>
              <Text style={[styles.detailValue, { color: isDarkMode ? 'white' : '#111827' }]}>{new Date(payment.createdAt).toLocaleDateString()}</Text>
            </View>

            <View style={styles.detailRow}>
              <FileText size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
              <Text style={[styles.detailLabel, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>Description</Text>
              <Text style={[styles.detailValue, { color: isDarkMode ? 'white' : '#111827' }]}>{payment.description || 'Payment'}</Text>
            </View>

            {payment.receiptUrl && (
              <TouchableOpacity style={styles.receiptBtn}>
                <Download size={18} color="white" />
                <Text style={styles.receiptText}>Download Receipt</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>Payment not found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerInner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4, paddingBottom: 8 },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  amountCard: { alignItems: 'center', padding: 24, borderRadius: 16, borderWidth: 1, gap: 8 },
  amount: { fontSize: 32, fontWeight: '800' },
  status: { fontSize: 13, fontWeight: '700' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(55,65,81,0.2)' },
  detailLabel: { fontSize: 13, width: 100 },
  detailValue: { fontSize: 14, fontWeight: '600', flex: 1 },
  receiptBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#7c3aed', paddingVertical: 14, borderRadius: 12, marginTop: 8 },
  receiptText: { color: 'white', fontSize: 15, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14 },
});
