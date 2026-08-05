import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import { Gradient } from './Gradient';

interface HeroCardProps {
  title: string;
  ringPercent: number;
  big: string;
  small: string;
  label: string;
  trend?: string;
  chips: { label: string; value: string }[];
  pillLabel?: string;
}

const R = 36;
const CIRC = 2 * Math.PI * R;

export const HeroCard = ({ title, ringPercent, big, small, label, trend, chips, pillLabel }: HeroCardProps) => {
  const { theme } = useTheme();
  const offset = CIRC - (CIRC * ringPercent) / 100;

  return (
    <Gradient colors={theme.gradientHero} angle={135} radius={20} style={styles.card}>
      <View style={styles.decor} />
      <View style={styles.top}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.pill}>
          <View style={styles.liveDot} />
          <Text style={styles.pillText}>{pillLabel}</Text>
        </View>
      </View>
      <View style={styles.row}>
        <Svg width={86} height={86} style={styles.ring}>
          <Defs>
            <SvgLinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#60a5fa" />
              <Stop offset="1" stopColor="#c084fc" />
            </SvgLinearGradient>
          </Defs>
          <Circle cx={43} cy={43} r={R} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={9} />
          <Circle
            cx={43}
            cy={43}
            r={R}
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            transform="rotate(-90 43 43)"
          />
          <SvgText x={43} y={41} textAnchor="middle" fill="#fff" fontSize={19} fontWeight="700">
            {ringPercent}%
          </SvgText>
          <SvgText x={43} y={56} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={8} fontWeight="600">
            SCORE
          </SvgText>
        </Svg>
        <View style={styles.meta}>
          <Text style={styles.big}>{big}<Text style={styles.small}>{small.startsWith('/') ? small : `/${small}`}</Text></Text>
          <Text style={styles.lbl}>{label}</Text>
          {trend && (
            <View style={styles.trendPill}>
              <Text style={styles.trendText}>{trend}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.chips}>
        {chips.map(c => (
          <View key={c.label} style={styles.chip}>
            <Text style={styles.chipVal}>{c.value}</Text>
            <Text style={styles.chipLbl}>{c.label}</Text>
          </View>
        ))}
      </View>
    </Gradient>
  );
};

const styles = StyleSheet.create({
  card: { padding: 20, marginTop: 4, shadowColor: 'rgba(124,58,237,0.35)', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.6, shadowRadius: 24, elevation: 8 },
  decor: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(168,85,247,0.4)',
  },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  title: { color: '#fff', fontSize: 15, fontWeight: '700' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  pillText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22c55e' },
  ring: { flexShrink: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  meta: { flexDirection: 'column', gap: 2 },
  big: { color: '#fff', fontSize: 30, fontWeight: '700', letterSpacing: -0.6, lineHeight: 32 },
  small: { fontSize: 14, fontWeight: '600', opacity: 0.8 },
  lbl: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '500' },
  trendPill: { alignSelf: 'flex-start', marginTop: 6, backgroundColor: 'rgba(16,185,129,0.2)', borderRadius: 999, paddingVertical: 3, paddingHorizontal: 8 },
  trendText: { color: '#6ee7b7', fontSize: 10, fontWeight: '600' },
  chips: { flexDirection: 'row', gap: 8, marginTop: 16 },
  chip: { flex: 1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', alignItems: 'center' },
  chipVal: { color: '#fff', fontSize: 16, fontWeight: '700' },
  chipLbl: { color: 'rgba(255,255,255,0.75)', fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 2 },
});

export default HeroCard;
