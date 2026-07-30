import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { getSessionToken, getSecure } from '../lib/storage';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import TrustBar from '../components/landing/TrustBar';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import ContactSection from '../components/landing/ContactSection';
import Footer from '../components/ui/Footer';

export default function Index() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = await getSessionToken();
      const collegeCode = await getSecure('selectedCollegeCode');

      if (token) {
        router.replace('/(app)/dashboard');
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
      <View style={[styles.splashContainer, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
        <View style={styles.splashSpinner}>
          <View style={[styles.outerRing, { borderColor: '#3b82f6', borderLeftColor: 'transparent' }]} />
          <ActivityIndicator size="small" color="#3b82f6" />
        </View>
        <Text style={[styles.splashText, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>Starting NoteLoom...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <LandingNavbar />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop: 80 }}>
          <HeroSection />
          <TrustBar />
          <FeaturesSection />
          <HowItWorksSection />
          <ContactSection />
          <Footer />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  splashContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  splashSpinner: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  outerRing: { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 3 },
  splashText: { fontSize: 14, fontWeight: '600', letterSpacing: 0.5 },
});
