import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing, StyleSheet, StatusBar, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { GraduationCap, Bell, Bot, Building2 } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getSessionToken, getSecure } from '../lib/storage';
import { Gradient } from '../components/ui/Gradient';
import { GradButton } from '../components/ui/GradButton';
import { Screen } from '../components/ui/Screen';

export default function Index() {
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const brandAnim = useRef(new Animated.Value(0)).current;
  const featsAnim = useRef(new Animated.Value(0)).current;
  const footAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (checking) return;
    const ease = Easing.bezier(0.2, 0, 0, 1);
    Animated.stagger(90, [
      Animated.timing(brandAnim, { toValue: 1, duration: 300, easing: ease, useNativeDriver: true }),
      Animated.timing(featsAnim, { toValue: 1, duration: 300, easing: ease, useNativeDriver: true }),
      Animated.timing(footAnim, { toValue: 1, duration: 300, easing: ease, useNativeDriver: true }),
    ]).start();
  }, [checking]);

  const fadeUp = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
  });


  useEffect(() => {
    const init = async () => {
      const token = await getSessionToken();
      const collegeCode = await getSecure('selectedCollegeCode');

      if (token) {
        router.replace('/(app)');
      } else if (collegeCode) {
        router.replace('/(auth)/login');
      } else {
        setChecking(false);
      }
    };
    init();
  }, []);

  if (checking) {
    return (
      <View style={[styles.splashContainer, { backgroundColor: theme.bg }]}>
        <Gradient colors={theme.gradientBrand} angle={135} radius={20} style={styles.splashLogo}>
          <GraduationCap size={34} color="#fff" />
        </Gradient>
        <Text style={[styles.splashText, { color: theme.muted }]}>Starting NoteLoom...</Text>
      </View>
    );
  }

  const feats = [
    { key: 'notes', icon: <Building2 size={17} color="#10b981" />, bg: 'rgba(16,185,129,0.12)', title: 'Smart notes', desc: 'Semester-wise notes, libraries and admit cards in one place.' },
    { key: 'notices', icon: <Bell size={17} color="#3b82f6" />, bg: 'rgba(59,130,246,0.12)', title: 'Live notices', desc: 'Exam alerts, events and campus updates in real time.' },
    { key: 'ai', icon: <Bot size={17} color="#a855f7" />, bg: 'rgba(168,85,247,0.12)', title: 'Noteloom Ai', desc: 'AI answers for your syllabus, timetables and study plans.' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Screen>
        <Animated.View style={[styles.brand, fadeUp(brandAnim)]}>
          <Gradient colors={theme.gradientBrand} angle={135} radius={20} style={styles.logo}>
            <GraduationCap size={30} color="#fff" />
          </Gradient>
          <Text style={[styles.brandName, { color: theme.fg }]}>NoteLoom</Text>
          <Text style={[styles.tagline, { color: theme.muted }]}>
            The all-in-one campus app for notes, attendance, notices, and AI help — trusted by 1,000+ colleges.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.feats, fadeUp(featsAnim)]}>
          {feats.map(f => (
            <View key={f.key} style={[styles.feat, { backgroundColor: theme.surface, borderColor: theme.border, ...theme.elev1 }]}>
              <View style={[styles.featIcon, { backgroundColor: f.bg }]}>{f.icon}</View>
              <View style={styles.featText}>
                <Text style={[styles.featTitle, { color: theme.fg }]}>{f.title}</Text>
                <Text style={[styles.featDesc, { color: theme.faint }]}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        <Animated.View style={[styles.foot, fadeUp(footAnim)]}>
          <GradButton fullWidth size="lg" icon={<Building2 size={17} color="#fff" />} onPress={() => router.push('/college-selection')}>
            Get Started
          </GradButton>
          <Pressable onPress={() => router.push('/college-selection')}>
            <Text style={[styles.note, { color: theme.faint }]}>By continuing you agree to NoteLoom's Terms & Privacy Policy.</Text>
          </Pressable>
        </Animated.View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  splashContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  splashLogo: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  splashText: { fontSize: 14, fontWeight: '600', letterSpacing: 0.5 },
  brand: { alignItems: 'center', marginTop: 40, marginBottom: 28 },
  logo: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 18, shadowColor: 'rgba(124,58,237,0.5)', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.7, shadowRadius: 24, elevation: 10 },
  brandName: { fontSize: 30, fontWeight: '800', letterSpacing: -0.8 },
  tagline: { fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 10, paddingHorizontal: 18 },
  feats: { gap: 10, marginBottom: 28 },
  feat: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  featIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  featText: { flex: 1, minWidth: 0 },
  featTitle: { fontSize: 14, fontWeight: '700' },
  featDesc: { fontSize: 11, lineHeight: 16, marginTop: 2 },
  foot: { gap: 14 },
  note: { fontSize: 11, textAlign: 'center', lineHeight: 16 },
});
