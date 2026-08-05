import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '../../../contexts/ThemeContext';
import { useSession } from '../../../hooks/useSession';
import { Screen } from '../../../components/ui/Screen';
import { SubHeader } from '../../../components/ui/SubHeader';
import { AdmitCard } from '../../../components/ui/AdmitCard';
import { GradButton } from '../../../components/ui/GradButton';
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

export default function AdmitCardScreen() {
  const { theme } = useTheme();
  const { user } = useSession();
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 1500);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Admit Card" />
        <AdmitCard
          title="Note Loom"
          pill="Mid-Sem 2026"
          qr={<QRMock />}
          code={`IEM · ${user?.uid || '2023CS0765'} · SEM-06`}
          cells={[
            { label: 'Student', value: user?.name || 'Arpan Maity' },
            { label: 'Course', value: 'CSE · Sem 6' },
            { label: 'Exam Date', value: '12 Mar 2026' },
            { label: 'Venue', value: 'Block B · Hall 2' },
          ]}
        />
        <GradButton fullWidth size="md" onPress={handleDownload} icon={<Download size={18} color="#fff" />}>
          {generating ? <ActivityIndicator color="#fff" /> : 'Download Admit Card'}
        </GradButton>
      </Screen>
    </View>
  );
}
