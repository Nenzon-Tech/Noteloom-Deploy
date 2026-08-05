import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing, StyleSheet, StatusBar, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { Fingerprint, Lock, GraduationCap, Bell, Bot, Building2 } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getSessionToken, getSecure, isBiometricEnabled } from '../lib/storage';
import { Gradient } from '../components/ui/Gradient';
import { GradButton } from '../components/ui/GradButton';
import { Screen } from '../components/ui/Screen';

export default function Index() {
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [biometricGate, setBiometricGate] = useState(false);
  const [biometricUnlocking, setBiometricUnlocking] = useState(false);
  const [biometricUnavailable, setBiometricUnavailable] = useState(false);

  const INITIAL_SPLASH_MS = 1600;

  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const dot1Anim = useRef(new Animated.Value(0.3)).current;
  const dot2Anim = useRef(new Animated.Value(0.3)).current;
  const dot3Anim = useRef(new Animated.Value(0.3)).current;

  const brandAnim = useRef(new Animated.Value(0)).current;
  const featsAnim = useRef(new Animated.Value(0)).current;
  const footAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for splash halo ring
  useEffect(() => {
    if (!checking) return;
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.ease, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, easing: Easing.ease, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();

    // 3-dot breathing indicator
    const createDotLoop = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      );

    const l1 = createDotLoop(dot1Anim, 0);
    const l2 = createDotLoop(dot2Anim, 200);
    const l3 = createDotLoop(dot3Anim, 400);

    l1.start();
    l2.start();
    l3.start();

    return () => {
      pulseLoop.stop();
      l1.stop();
      l2.stop();
      l3.stop();
    };
  }, [checking]);

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
      const minSplash = new Promise(resolve => setTimeout(resolve, INITIAL_SPLASH_MS));
      const [token, collegeCode, biometrics] = await Promise.all([
        getSessionToken(),
        getSecure('selectedCollegeCode'),
        isBiometricEnabled(),
      ]);
      await minSplash;

      if (token && biometrics) {
        setBiometricGate(true);
      } else if (token) {
        router.replace('/(app)/dashboard');
      } else if (collegeCode) {
        router.replace(`/(auth)/login?code=${encodeURIComponent(collegeCode)}`);
      } else {
        setChecking(false);
      }
    };
    init();
  }, []);

  const handleBiometricUnlock = async () => {
    if (biometricUnlocking) return;
    setBiometricUnlocking(true);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        setBiometricUnavailable(true);
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock NoteLoom with Biometrics',
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
      });
      if (result.success) {
        router.replace('/(app)/dashboard');
      }
    } catch {
      setBiometricUnavailable(true);
    } finally {
      setBiometricUnlocking(false);
    }
  };

  if (biometricGate) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <Screen hasHeader={false} contentContainerStyle={styles.gateContainer}>
          <Gradient colors={theme.gradientBrand} angle={140} radius={26} style={styles.gateLogo}>
            <Fingerprint size={40} color="#fff" />
          </Gradient>
          <Text style={[styles.gateTitle, { color: theme.fg }]}>Welcome back</Text>
          <Text style={[styles.gateSubtitle, { color: theme.muted }]}>
            Unlock NoteLoom to continue to your dashboard.
          </Text>

          {biometricUnavailable ? (
            <GradButton fullWidth size="lg" icon={<Lock size={17} color="#fff" />} onPress={() => router.replace('/(auth)/login')}>
              Sign In with Password
            </GradButton>
          ) : (
            <GradButton
              fullWidth
              size="lg"
              icon={<Fingerprint size={17} color="#fff" />}
              onPress={handleBiometricUnlock}
              loading={biometricUnlocking}
            >
              {biometricUnlocking ? 'Verifying…' : 'Unlock with Biometrics'}
            </GradButton>
          )}

          <Pressable onPress={() => router.replace('/college-selection')}>
            <Text style={[styles.gateChange, { color: theme.faint }]}>Not you? Choose a different college</Text>
          </Pressable>
        </Screen>
      </View>
    );
  }

  if (checking) {
    return (
      <View style={[styles.splashContainer, { backgroundColor: theme.bg }]}>
        <View style={styles.splashScene}>
          <Animated.View
            style={[
              styles.splashRing,
              {
                borderColor: theme.violet,
                opacity: pulseAnim,
                transform: [
                  {
                    scale: pulseAnim.interpolate({
                      inputRange: [0.4, 1],
                      outputRange: [0.95, 1.15],
                    }),
                  },
                ],
              },
            ]}
          />
          <Gradient colors={theme.gradientBrand} angle={140} radius={28} style={styles.splashLogo}>
            <GraduationCap size={44} color="#fff" />
          </Gradient>
        </View>

        <Text style={[styles.splashTitle, { color: theme.fg }]}>NoteLoom</Text>

        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, { backgroundColor: theme.violet, opacity: dot1Anim }]} />
          <Animated.View style={[styles.dot, { backgroundColor: theme.indigo, opacity: dot2Anim }]} />
          <Animated.View style={[styles.dot, { backgroundColor: theme.blue, opacity: dot3Anim }]} />
        </View>

        <Text style={[styles.splashText, { color: theme.faint }]}>Your campus, connected.</Text>
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
      <Screen hasHeader={false}>
        <Animated.View style={[styles.brand, fadeUp(brandAnim)]}>
          <Gradient colors={theme.gradientBrand} angle={135} radius={26} style={styles.logo}>
            <GraduationCap size={40} color="#fff" />
          </Gradient>
          <Text style={[styles.brandName, { color: theme.indigo }]}>NoteLoom</Text>
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
  splashContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  splashScene: { position: 'relative', width: 140, height: 140, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  splashRing: { position: 'absolute', width: 130, height: 130, borderRadius: 65, borderWidth: 2 },
  splashLogo: {
    width: 86,
    height: 86,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(124,58,237,0.5)',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.7,
    shadowRadius: 28,
    elevation: 12,
  },
  splashTitle: { fontSize: 32, fontWeight: '800', letterSpacing: -0.8 },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 4 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  splashText: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },
  brand: { alignItems: 'center', marginTop: 40, marginBottom: 28 },
  logo: {
    width: 86,
    height: 86,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: 'rgba(124,58,237,0.5)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 10,
  },
  brandName: { fontSize: 32, fontWeight: '800', letterSpacing: -0.8 },
  tagline: { fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 10, paddingHorizontal: 18 },
  feats: { gap: 10, marginBottom: 28 },
  feat: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  featIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  featText: { flex: 1, minWidth: 0 },
  featTitle: { fontSize: 14, fontWeight: '700' },
  featDesc: { fontSize: 11, lineHeight: 16, marginTop: 2 },
  foot: { gap: 14 },
  note: { fontSize: 11, textAlign: 'center', lineHeight: 16 },
  gateContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingBottom: 40 },
  gateLogo: {
    width: 86,
    height: 86,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: 'rgba(124,58,237,0.5)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 10,
  },
  gateTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.6 },
  gateSubtitle: { fontSize: 13, lineHeight: 20, textAlign: 'center', paddingHorizontal: 24, marginBottom: 10 },
  gateChange: { fontSize: 12, textAlign: 'center', marginTop: 8, textDecorationLine: 'underline' },
});
