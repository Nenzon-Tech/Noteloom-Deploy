import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { FileText, CheckCircle, XCircle, GraduationCap, ArrowRight } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { useSession } from '../../../hooks/useSession';
import { API_BASE } from '../../../lib/constants';
import { authHeaders } from '../../../lib/api';
import { getSessionToken } from '../../../lib/storage';
import { Screen } from '../../../components/ui/Screen';
import { SubHeader } from '../../../components/ui/SubHeader';
import { ListCard, LRow } from '../../../components/ui/ListCard';
import { Gradient } from '../../../components/ui/Gradient';

export default function COE() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useSession();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user?.id) fetchStatus(); }, [user?.id]);

  const fetchStatus = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/coe/student/eligibility/${user?.id}`, {
        headers: authHeaders(token),
      });
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const eligible = !!status?.eligible;
  const message = eligible
    ? `${status.session?.label || 'Examination'} · ${status.studentProfile?.rollNo || 'Roll N/A'}`
    : status?.error || 'Verification complete';

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Examination Portal" subtitle="Office of the Controller of Examinations" />

        <Gradient colors={theme.gradientBrand} angle={135} radius={20} style={styles.hero}>
          <View style={styles.heroIcon}>
            <GraduationCap size={24} color="#fff" />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Examination Portal</Text>
            <Text style={styles.heroSub}>COE · Student Services</Text>
          </View>
        </Gradient>

        {loading ? (
          <ActivityIndicator color={theme.violet} style={{ paddingVertical: 60 }} />
        ) : (
          <View style={[styles.statusCard, { backgroundColor: theme.surface, borderColor: theme.border, ...theme.elev1 }]}>
            <Text style={[styles.statusTitle, { color: theme.fg }]}>Exam Eligibility Status</Text>
            {status ? (
              <View style={styles.statusContent}>
                <View style={[styles.statusIcon, { backgroundColor: eligible ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }]}>
                  {eligible ? <CheckCircle size={34} color={theme.green} /> : <XCircle size={34} color={theme.red} />}
                </View>
                <Text style={[styles.statusValue, { color: eligible ? theme.green : theme.red }]}>
                  {eligible ? 'Eligible' : 'Not Eligible'}
                </Text>
                <Text style={[styles.statusDetail, { color: theme.faint }]}>{message}</Text>
              </View>
            ) : (
              <Text style={[styles.noData, { color: theme.faint }]}>No status information available</Text>
            )}
          </View>
        )}

        <ListCard>
          <LRow
            icon={<FileText size={20} color={theme.violet} />}
            iconBg="rgba(124,58,237,0.12)"
            title="Admit Card"
            subtitle="Generate and share your digital admit card"
            trailing={<ArrowRight size={16} color={theme.faint} />}
            onPress={() => router.push('/(app)/coe/admit-card')}
            last
          />
        </ListCard>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, marginBottom: 16 },
  heroIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  heroText: { flex: 1 },
  heroTitle: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600', marginTop: 2 },
  statusCard: { padding: 24, borderRadius: 20, borderWidth: 1, marginBottom: 16 },
  statusTitle: { fontSize: 15, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  statusContent: { alignItems: 'center', gap: 10 },
  statusIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  statusValue: { fontSize: 20, fontWeight: '800' },
  statusDetail: { fontSize: 13, textAlign: 'center' },
  noData: { fontSize: 13, textAlign: 'center' },
});
