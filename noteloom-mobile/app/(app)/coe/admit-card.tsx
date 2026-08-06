import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '../../../contexts/ThemeContext';
import { useSession } from '../../../hooks/useSession';
import { API_BASE } from '../../../lib/constants';
import { authHeaders } from '../../../lib/api';
import { getSessionToken } from '../../../lib/storage';
import { Screen } from '../../../components/ui/Screen';
import { SubHeader } from '../../../components/ui/SubHeader';
import { AdmitCard } from '../../../components/ui/AdmitCard';
import { GradButton } from '../../../components/ui/GradButton';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { RecRow } from '../../../components/ui/RecRow';
import { Download } from 'lucide-react-native';

const QRMock = () => {
  const cells: [number, number][] = [
    [0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [3, 1], [0, 2], [3, 2], [0, 3], [1, 3], [2, 3], [3, 3],
    [6, 0], [7, 0], [8, 0], [9, 0], [6, 1], [9, 1], [6, 2], [9, 2], [6, 3], [7, 3], [8, 3], [9, 3],
    [0, 6], [0, 7], [0, 8], [0, 9], [1, 6], [2, 6], [3, 6], [3, 7], [3, 8], [3, 9],
    [6, 6], [7, 6], [8, 6], [9, 6], [6, 7], [9, 7], [7, 8], [8, 8], [6, 9], [9, 9],
    [1, 4], [4, 2], [4, 5], [5, 4], [5, 8], [2, 4], [4, 7], [7, 4], [8, 4], [4, 4],
  ];
  return (
    <Svg viewBox="0 0 10 10" width={70} height={70}>
      {cells.map(([x, y], i) => (
        <Rect key={i} x={x} y={y} width={1.1} height={1.1} fill="#111" />
      ))}
    </Svg>
  );
};

interface AdmitData {
  candidate?: {
    name?: string;
    program?: string;
    stream?: string;
    registrationNo?: string;
    examRollNo?: string;
    examCenter?: string;
  };
  history?: { id: number; label: string; status: string; payment: string; isCurrent?: boolean }[];
  schedule?: { code: string; subject: string; type?: string }[];
  instructions?: string[];
}

export default function AdmitCardScreen() {
  const { theme } = useTheme();
  const { user } = useSession();
  const [data, setData] = useState<AdmitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await getSessionToken();
        const uid = user?.id || '';
        if (!uid) return;
        const response = await fetch(`${API_BASE}/api/coe/admit-card/${uid}`, { headers: authHeaders(token) });
        if (response.ok) {
          setData(await response.json());
        }
      } catch {}
      finally { setLoading(false); }
    })();
  }, [user?.id]);

  const handleDownload = async () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 1500);
  };

  const cand = data?.candidate || {};
  const history = data?.history || [];
  const currentSem = history.find(h => h.isCurrent) || history[history.length - 1];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Admit Card" subtitle={currentSem?.label || 'Examination'} />
        {loading ? (
          <ActivityIndicator color={theme.violet} style={{ paddingVertical: 60 }} />
        ) : !data ? (
          <EmptyState message="No admit card available yet. Complete your exam form first." />
        ) : (
          <>
            <AdmitCard
              title="Note Loom"
              pill={currentSem?.status || 'Generated'}
              qr={<QRMock />}
              code={`${cand.registrationNo || 'N/A'} · ${cand.examRollNo || 'N/A'}`}
              cells={[
                { label: 'Student', value: cand.name || 'N/A' },
                { label: 'Program', value: `${cand.program || ''} · ${cand.stream || ''}` },
                { label: 'Reg. No', value: cand.registrationNo || 'N/A' },
                { label: 'Roll No', value: cand.examRollNo || 'N/A' },
              ]}
            />
            <GradButton fullWidth size="md" onPress={handleDownload} icon={<Download size={18} color="#fff" />}>
              {generating ? <ActivityIndicator color="#fff" /> : 'Download Admit Card'}
            </GradButton>

            <SectionHeader title="Exam Schedule" />
            {data.schedule?.length ? (
              data.schedule.map((s, i) => (
                <RecRow
                  key={i}
                  dateTop="SUB"
                  dateMain={s.code || 'N/A'}
                  title={s.subject || 'Subject'}
                  subtitle={`${s.type || 'Regular'} · ${cand.examCenter || 'Main Block'}`}
                />
              ))
            ) : (
              <EmptyState message="Schedule not released yet" />
            )}
          </>
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({});
