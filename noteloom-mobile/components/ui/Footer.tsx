import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Globe, Camera, Send, Heart } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

export const Footer = () => {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  const socialLinks = [
    { icon: Globe, label: 'Website', color: '#6366f1' },
    { icon: Send, label: 'Contact', color: '#3b82f6' },
    { icon: Heart, label: 'Support', color: '#ef4444' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1f2937' : '#e5e7eb', paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.inner}>
        <View style={styles.grid}>
          <View style={styles.brandSection}>
            <Text style={[styles.brandName, { color: isDarkMode ? 'white' : '#111827' }]}>Note Loom</Text>
            <Text style={[styles.description, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>
              Empowering educational institutions with comprehensive learning management solutions.
              {'\n'}Email: support@eduspace.in
            </Text>
            <View style={styles.socialRow}>
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <TouchableOpacity
                    key={social.label}
                    style={[styles.socialIcon, { backgroundColor: isDarkMode ? '#374151' : '#d1d5db' }]}
                  >
                    <Icon size={18} color={social.color} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.linksSection}>
            <View style={styles.linkColumn}>
              <Text style={[styles.linkHeader, { color: isDarkMode ? '#f3f4f6' : '#111827' }]}>Company</Text>
              {['About Us', 'Contact Us', 'Pricing', 'Careers'].map((link) => (
                <TouchableOpacity key={link}><Text style={[styles.linkItem, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{link}</Text></TouchableOpacity>
              ))}
            </View>
            <View style={styles.linkColumn}>
              <Text style={[styles.linkHeader, { color: isDarkMode ? '#f3f4f6' : '#111827' }]}>Services</Text>
              {['for Institutions', 'for Students'].map((link) => (
                <TouchableOpacity key={link}><Text style={[styles.linkItem, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{link}</Text></TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={[styles.divider, { borderTopColor: isDarkMode ? '#374151' : '#d1d5db' }]} />
        <View style={styles.bottom}>
          <Text style={[styles.copyright, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>© 2026 Note Loom. All rights reserved.</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingTop: 32 },
  inner: { paddingHorizontal: 16, maxWidth: 640, width: '100%', marginHorizontal: 'auto' },
  grid: { flexDirection: 'column', gap: 24, marginBottom: 24 },
  brandSection: { gap: 12 },
  brandName: { fontSize: 20, fontWeight: '700' },
  description: { fontSize: 13, lineHeight: 20 },
  socialRow: { flexDirection: 'row', gap: 8 },
  socialIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  linksSection: { flexDirection: 'row', gap: 24, flexWrap: 'wrap' },
  linkColumn: { gap: 8, minWidth: 120 },
  linkHeader: { fontWeight: '600', fontSize: 16 },
  linkItem: { fontSize: 14 },
  divider: { borderTopWidth: 1, marginBottom: 16 },
  bottom: { alignItems: 'center' },
  copyright: { fontSize: 12 },
});

export default Footer;
