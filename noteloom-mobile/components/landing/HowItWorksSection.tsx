import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Search, LogIn, LayoutDashboard } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

const steps = [
  {
    icon: Search, title: 'Select Your College',
    desc: 'Find and choose your institution from our partner directory.',
    step: '01',
  },
  {
    icon: LogIn, title: 'Sign In Securely',
    desc: 'Use your academic credentials to access your personalized portal.',
    step: '02',
  },
  {
    icon: LayoutDashboard, title: 'Start Learning',
    desc: 'Your dashboard is ready with all tools, resources, and insights.',
    step: '03',
  },
];

export const HowItWorksSection = () => {
  const { isDarkMode } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Getting Started</Text>
      </View>
      <Text style={[styles.heading, { color: isDarkMode ? 'white' : '#111827' }]}>
        How It Works
      </Text>
      <Text style={[styles.subtext, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>
        Three simple steps to transform your campus experience
      </Text>

      <View style={styles.timeline}>
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isLast = idx === steps.length - 1;
          return (
            <View key={step.step} style={styles.stepRow}>
              <View style={styles.stepLineCol}>
                <View style={[styles.stepCircle, { backgroundColor: isDarkMode ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.1)', borderColor: '#7c3aed' }]}>
                  <Text style={styles.stepNum}>{step.step}</Text>
                </View>
                {!isLast && <View style={[styles.connector, { backgroundColor: isDarkMode ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.15)' }]} />}
              </View>
              <View style={[styles.stepCard, { backgroundColor: isDarkMode ? 'rgba(30,41,59,0.5)' : 'rgba(255,255,255,0.7)' }]}>
                <View style={[styles.iconBox, { backgroundColor: isDarkMode ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)' }]}>
                  <Icon size={22} color="#7c3aed" />
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: isDarkMode ? 'white' : '#111827' }]}>{step.title}</Text>
                  <Text style={[styles.stepDesc, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{step.desc}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 48, paddingHorizontal: 16, alignItems: 'center' },
  badge: {
    backgroundColor: 'rgba(139,92,246,0.15)',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16,
  },
  badgeText: { color: '#a78bfa', fontSize: 11, fontWeight: '700' },
  heading: { fontSize: 22, fontWeight: '800', marginTop: 12, marginBottom: 4 },
  subtext: { fontSize: 13, textAlign: 'center', maxWidth: 320, marginBottom: 28 },
  timeline: { gap: 0, width: '100%', maxWidth: 420 },
  stepRow: { flexDirection: 'row', gap: 12 },
  stepLineCol: { alignItems: 'center', width: 36 },
  stepCircle: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  stepNum: { color: '#7c3aed', fontSize: 11, fontWeight: '800' },
  connector: { width: 2, flex: 1, minHeight: 24 },
  stepCard: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepContent: { flex: 1, gap: 2 },
  stepTitle: { fontSize: 15, fontWeight: '700' },
  stepDesc: { fontSize: 12, lineHeight: 17 },
});

export default HowItWorksSection;
