import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../ui/ThemeToggle';

export const LandingNavbar = () => {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={[styles.inner, { backgroundColor: isDarkMode ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.7)' }]}>
        <TouchableOpacity style={styles.left}>
          <Text style={[styles.logo, { color: isDarkMode ? 'white' : '#111827' }]}>
            NoteLoom
          </Text>
          <View style={styles.betaBadge}>
            <Text style={styles.betaText}>Beta</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.right}>
          <ThemeToggle />
          <TouchableOpacity onPress={() => router.push('/college-selection')} style={styles.ctaBtn}>
            <Text style={styles.ctaText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    paddingHorizontal: 16,
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.15)',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { fontSize: 19, fontWeight: '800', letterSpacing: -0.5 },
  betaBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 10,
  },
  betaText: { color: 'white', fontSize: 9, fontWeight: '700' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ctaBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  ctaText: { color: 'white', fontSize: 12, fontWeight: '600' },
});

export default LandingNavbar;
