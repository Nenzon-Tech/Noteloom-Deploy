import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, Clock } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { format } from 'date-fns';

export const ITDashboardFooter = () => {
  const { isDarkMode } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loginTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? 'rgba(31,41,55,0.5)' : 'rgba(229,231,235,0.5)', borderTopColor: isDarkMode ? 'rgba(55,65,81,0.5)' : 'rgba(209,213,219,0.5)' }]}>
      <View style={styles.inner}>
        <View style={styles.left}>
          <Text style={[styles.beta, { color: isDarkMode ? 'white' : '#111827' }]}>Note Loom Beta</Text>
          <Text style={[styles.version, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>V 1.0.0</Text>
        </View>
        <View style={styles.right}>
          <View style={styles.infoRow}>
            <Calendar size={12} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
            <Text style={[styles.infoText, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{format(currentTime, 'dd/MM/yyyy')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Clock size={12} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
            <Text style={[styles.infoText, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{format(currentTime, 'hh:mm:ss a')}</Text>
          </View>
          <Text style={[styles.loginTime, { color: isDarkMode ? '#6b7280' : '#6b7280' }]}>
            Logged in: {format(loginTime, 'hh:mm:ss a')}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 16, paddingHorizontal: 16, borderTopWidth: 1 },
  inner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', maxWidth: 640, width: '100%', marginHorizontal: 'auto' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  beta: { fontSize: 14, fontWeight: '600' },
  version: { fontSize: 12 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 12 },
  loginTime: { fontSize: 11 },
});

export default ITDashboardFooter;
