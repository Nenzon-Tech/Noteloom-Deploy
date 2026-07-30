import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Building2, GraduationCap, Target, Sparkles } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

const benefits = [
  { icon: Building2, title: 'College Partners', color: '#8b5cf6' },
  { icon: Sparkles, title: '100% Free for Students', color: '#059669' },
  { icon: Target, title: 'All-in-One Platform', color: '#2563eb' },
  { icon: GraduationCap, title: 'Enterprise Features', color: '#d97706' },
];

export const TrustBar = () => {
  const { isDarkMode } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' }]}>
      <View style={styles.grid}>
        {benefits.map((item) => {
          const Icon = item.icon;
          return (
            <View key={item.title} style={[styles.pill, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
              <Icon size={14} color={item.color} />
              <Text style={[styles.pillText, { color: isDarkMode ? '#e5e7eb' : '#374151' }]}>{item.title}</Text>
            </View>
          );
        })}
      </View>
      <Text style={[styles.subtext, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>
        Institutions subscribe. Students get premium access for free.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 20, paddingHorizontal: 16, alignItems: 'center', gap: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillText: { fontSize: 13, fontWeight: '600' },
  subtext: { fontSize: 12, textAlign: 'center', maxWidth: 380 },
});

export default TrustBar;
