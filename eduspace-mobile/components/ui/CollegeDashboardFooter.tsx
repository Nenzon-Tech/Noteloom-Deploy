import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import CollegeBannerLogo from './CollegeBannerLogo';

export const CollegeDashboardFooter = () => {
  const { isDarkMode } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? 'rgba(31,41,55,0.5)' : 'rgba(229,231,235,0.5)', borderTopColor: isDarkMode ? 'rgba(55,65,81,0.5)' : 'rgba(209,213,219,0.5)' }]}>
      <View style={styles.inner}>
        <View style={styles.left}>
          <CollegeBannerLogo size="sm" />
          <Text style={[styles.powered, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>Powered by Note Loom</Text>
        </View>
        <View style={styles.right}>
          <TouchableOpacity>
            <Text style={[styles.link, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>Tech Support</Text>
          </TouchableOpacity>
          <Text style={[styles.copyright, { color: isDarkMode ? '#6b7280' : '#9ca3af' }]}>© 2026 Note Loom</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 16, paddingHorizontal: 16, borderTopWidth: 1 },
  inner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', maxWidth: 640, width: '100%', marginHorizontal: 'auto' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  powered: { fontSize: 12, fontWeight: '500' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  link: { fontSize: 12 },
  copyright: { fontSize: 12 },
});

export default CollegeDashboardFooter;
