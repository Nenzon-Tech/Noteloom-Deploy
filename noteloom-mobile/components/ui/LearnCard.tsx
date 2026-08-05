import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Gradient } from './Gradient';
import { Gradient as GradientTuple } from '../../lib/theme';

interface LearnCardProps {
  title: string;
  subtitle: string;
  progress: number;
  timeLeft: string;
  gradient?: GradientTuple;
  code?: string;
  onPress?: () => void;
}

export const LearnCard = ({ title, subtitle, progress, timeLeft, gradient = ['#0d9488', '#065f46'], code, onPress }: LearnCardProps) => {
  const { theme } = useTheme();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: theme.surface, borderColor: theme.border, ...theme.elev1 }, pressed && { transform: [{ scale: 0.98 }] }]}>
      <Gradient colors={gradient} angle={160} style={styles.banner}>
        <BookOpen size={26} color="rgba(255,255,255,0.85)" />
        {code && (
          <View style={styles.code}>
            <Text style={styles.codeText}>{code}</Text>
          </View>
        )}
      </Gradient>
      <View style={styles.body}>
        <Text style={[styles.title, { color: theme.fg }]} numberOfLines={1}>{title}</Text>
        <Text style={[styles.sub, { color: theme.muted }]}>{subtitle}</Text>
        <View style={[styles.bar, { backgroundColor: theme.ringTrack }]}>
          <Gradient colors={theme.gradientBrand} angle={135} style={[styles.fill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.meta}>
          <Text style={[styles.metaText, { color: theme.faint }]}>{progress}% complete</Text>
          <Text style={[styles.metaText, { color: theme.faint }]}>{timeLeft}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1, overflow: 'hidden', flexDirection: 'row', marginBottom: 12 },
  banner: { width: 96, alignItems: 'center', justifyContent: 'center' },
  code: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 6, paddingVertical: 2, paddingHorizontal: 5 },
  codeText: { color: '#fff', fontSize: 8, fontWeight: '700', letterSpacing: 0.4 },
  body: { flex: 1, padding: 14 },
  title: { fontSize: 14, fontWeight: '700', letterSpacing: -0.1, marginBottom: 3 },
  sub: { fontSize: 11, marginBottom: 10 },
  bar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  metaText: { fontSize: 10, fontWeight: '600' },
});

export default LearnCard;
