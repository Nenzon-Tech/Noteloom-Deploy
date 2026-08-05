import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { IndianRupee, Receipt, Calendar, FileText, Download } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { authHeaders } from '../../lib/api';
import { getSessionToken } from '../../lib/storage';
import { Screen } from '../../components/ui/Screen';
import { SubHeader } from '../../components/ui/SubHeader';
import { ListCard, LRow } from '../../components/ui/ListCard';
import { GradButton } from '../../components/ui/GradButton';
import { Gradient } from '../../components/ui/Gradient';
import { EmptyState } from '../../components/ui/EmptyState';

export default function PaymentDetails() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) fetchPayment(); }, [id]);

  const fetchPayment = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/payments/${id}`, {
        headers: authHeaders(token),
      });
      if (response.ok) setPayment(await response.json());
    } catch {}
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.violet} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Payment Details" subtitle={payment ? `TXN ${payment.transactionId || ''}` : undefined} />

        {payment ? (
          <>
            <Gradient
              colors={(payment.status === 'paid' ? ['#10b981', '#059669'] : theme.gradientCta) as any}
              angle={135}
              radius={20}
              style={styles.amountCard}
            >
              <View style={styles.amountHead}>
                <View style={styles.amountIcon}>
                  <IndianRupee size={24} color="#fff" />
                </View>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{payment.status?.toUpperCase() || 'PENDING'}</Text>
                </View>
              </View>
              <Text style={styles.amount}>₹{payment.amount?.toLocaleString()}</Text>
              <Text style={styles.amountSub}>{payment.description || 'Payment'}</Text>
            </Gradient>

            <ListCard>
              <LRow
                icon={<Receipt size={18} color={theme.violet} />}
                iconBg="rgba(124,58,237,0.12)"
                title={payment.transactionId || '—'}
                subtitle="Transaction ID"
                trailing={<View />}
              />
              <LRow
                icon={<Calendar size={18} color={theme.blue} />}
                iconBg="rgba(59,130,246,0.12)"
                title={new Date(payment.createdAt).toLocaleDateString()}
                subtitle="Date"
                trailing={<View />}
              />
              <LRow
                icon={<FileText size={18} color={theme.amber} />}
                iconBg="rgba(245,158,11,0.12)"
                title={payment.description || 'Payment'}
                subtitle="Description"
                trailing={<View />}
                last
              />
            </ListCard>

            {payment.receiptUrl && (
              <GradButton fullWidth size="lg" icon={<Download size={18} color="#fff" />}>
                Download Receipt
              </GradButton>
            )}
          </>
        ) : (
          <EmptyState message="Payment not found" />
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  amountCard: { padding: 22, marginBottom: 16 },
  amountHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  amountIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  pill: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  pillText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  amount: { color: '#fff', fontSize: 34, fontWeight: '800', letterSpacing: -0.6 },
  amountSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600', marginTop: 4 },
});
