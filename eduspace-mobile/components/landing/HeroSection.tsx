import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions,
  Animated, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Sparkles, GraduationCap, ChevronDown } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

const headlines = [
  { pre: 'Welcome To ', highlight: 'EduSpace' },
  { pre: 'Your Personalized ', highlight: 'Learning Platform' },
  { pre: 'Let\'s Connect, ', highlight: 'Grow & Excel' },
  { pre: 'Smarter Insights, ', highlight: 'Better Grades' },
  { pre: 'Master Coursework ', highlight: 'Stress-Free' },
  { pre: 'All Class Resources ', highlight: 'In One Place' },
];

const VIDEO_URL = 'https://cdn.pixabay.com/video/2015/09/27/846-140823862_large.mp4';

export const HeroSection = () => {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [slideIndex, setSlideIndex] = useState(0);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0, duration: 250, useNativeDriver: true,
      }).start(() => {
        setSlideIndex((prev) => (prev + 1) % headlines.length);
        Animated.timing(fadeAnim, {
          toValue: 1, duration: 250, useNativeDriver: true,
        }).start();
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const videoHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #000; overflow: hidden; width: 100vw; height: 100vh; }
        video {
          position: absolute; top: 50%; left: 50%;
          min-width: 100%; min-height: 100%;
          width: auto; height: auto;
          transform: translate(-50%, -50%);
          object-fit: cover;
        }
      </style>
    </head>
    <body>
      <video autoplay muted loop playsinline>
        <source src="${VIDEO_URL}" type="video/mp4">
      </video>
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, { minHeight: height * 0.85 }]}>
      {!videoError ? (
        <View style={styles.videoWrapper}>
          <WebView
            source={{ html: videoHtml }}
            style={styles.video}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            scrollEnabled={false}
            onError={() => setVideoError(true)}
            opacity={0.3}
          />
        </View>
      ) : null}

      <View style={[
        styles.overlay,
        isDarkMode
          ? styles.overlayDark
          : styles.overlayLight,
      ]} />

      <View style={[styles.bottomFade, { backgroundColor: isDarkMode ? '#0a051d' : '#050716' }]} />
      <View style={[styles.centerGlow, isDarkMode ? styles.glowPurple : styles.glowIndigo]} />

      <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
        <View style={styles.badge}>
          <Sparkles size={14} color="#a78bfa" />
          <Text style={styles.badgeText}>AI-Powered Campus Platform</Text>
        </View>

        <View style={styles.headlineWrapper}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.headline}>
              <Text style={styles.headlinePre}>{headlines[slideIndex].pre}</Text>
              <Text style={styles.headlineHighlight}>{headlines[slideIndex].highlight}</Text>
            </Text>
          </Animated.View>
        </View>

        <Text style={styles.subtext}>
          Revolutionizing education through AI-powered insights, smart automation, and meaningful connections.
        </Text>

        <TouchableOpacity
          onPress={() => router.push('/college-selection')}
          style={styles.primaryBtn}
          activeOpacity={0.85}
        >
          <GraduationCap size={18} color="white" />
          <Text style={styles.primaryBtnText}>Select Your College</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.scrollIndicator}>
        <Text style={styles.scrollText}>Scroll to discover</Text>
        <ChevronDown size={20} color={isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.5)'} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  videoWrapper: { ...StyleSheet.absoluteFill },
  video: { flex: 1, backgroundColor: 'black' },

  overlay: { ...StyleSheet.absoluteFill },
  overlayDark: {
    backgroundColor: 'rgba(6,10,20,0.62)',
  },
  overlayLight: {
    backgroundColor: 'rgba(4,6,19,0.7)',
  },

  bottomFade: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: 120,
    opacity: 0.7,
  },
  centerGlow: {
    position: 'absolute',
    top: '20%', left: '10%', right: '10%', bottom: '30%',
    borderRadius: 400,
    opacity: 0.12,
  },
  glowPurple: { backgroundColor: '#8b5cf6' },
  glowIndigo: { backgroundColor: '#6366f1' },

  content: {
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 28,
    paddingBottom: 80,
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(139,92,246,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
  },
  badgeText: { color: '#a78bfa', fontSize: 12, fontWeight: '600' },

  headlineWrapper: { height: 64, justifyContent: 'center' },
  headline: { fontSize: 30, fontWeight: '800', textAlign: 'center' },
  headlinePre: { color: 'white' },
  headlineHighlight: {
    color: '#a78bfa',
  },

  subtext: {
    fontSize: 15,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
    maxWidth: 360,
  },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#7c3aed',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },

  scrollIndicator: {
    position: 'absolute',
    bottom: 32,
    alignItems: 'center',
    gap: 4,
  },
  scrollText: {
    fontSize: 10,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.35)',
  },
});

export default HeroSection;
