import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { authHeaders } from '../../lib/api';
import { getSessionToken } from '../../lib/storage';
import { Screen } from '../../components/ui/Screen';
import { SubHeader } from '../../components/ui/SubHeader';
import { StatGrid } from '../../components/ui/StatGrid';
import { SrvRow } from '../../components/ui/SrvRow';
import { EmptyState } from '../../components/ui/EmptyState';
import { BottomNav } from '../../components/ui/BottomNav';

interface FeeRecord {
  _id: string;
  type: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: 'paid' | 'partial' | 'unpaid';
}

export default function Fees() {
  const { theme } = useTheme();
  const [records, setRecords] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchFees(); }, []);

  const fetchFees = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/fees/my-fees`, {
        headers: authHeaders(token),
      });
      if (response.ok) {
        const data = await response.json();
        setRecords(Array.isArray(data) ? data : []);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid': return { icon: CheckCircle, color: theme.green, bg: 'rgba(16,185,129,0.12)', label: 'Paid', actionColor: 'green' as const };
      case 'partial': return { icon: Clock, color: theme.amber, bg: 'rgba(245,158,11,0.14)', label: 'Partial', actionColor: 'amber' as const };
      default: return { icon: AlertCircle, color: theme.red, bg: 'rgba(239,68,68,0.12)', label: 'Unpaid', actionColor: 'red' as const };
    }
  };

  const totalDue = records.reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalPaid = records.reduce((sum, r) => sum + (r.paidAmount || 0), 0);
  const pending = totalDue - totalPaid;
  const money = (n: number) => n.toLocaleString();

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Fees & Payments" subtitle="Track dues and paid amounts" />
        <StatGrid
          items={[
            { value: `₹${money(totalDue)}`, label: 'Total Dues', color: theme.violet, main: true },
            { value: `₹${money(totalPaid)}`, label: 'Paid', color: theme.green },
            { value: `₹${money(pending)}`, label: 'Pending', color: theme.amberText },
          ]}
        />
        {loading ? (
          <ActivityIndicator color={theme.violet} style={{ paddingVertical: 60 }} />
        ) : records.length === 0 ? (
          <EmptyState message="No fee records found" />
        ) : (
          records.map(record => {
            const s = getStatusStyle(record.status);
            const StatusIcon = s.icon;
            return (
              <SrvRow
                key={record._id}
                icon={<StatusIcon size={17} color={s.color} />}
                iconBg={s.bg}
                title={record.type}
                meta={`Due ${new Date(record.dueDate).toLocaleDateString()} · ₹${money(record.amount)}${record.paidAmount > 0 ? ` · Paid ₹${money(record.paidAmount)}` : ''}`}
                action={s.label}
                actionColor={s.actionColor}
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
