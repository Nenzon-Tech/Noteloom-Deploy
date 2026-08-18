import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface SessionExpiredProps {
  onLoginRedirect: () => void;
}

export const SessionExpired = ({ onLoginRedirect }: SessionExpiredProps) => {
  const { isDarkMode } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#111827' : '#f9fafb' }]}>
      <View style={[styles.card, { backgroundColor: isDarkMode ? 'rgba(234,179,8,0.1)' : 'rgba(254,252,232,0.9)', borderColor: isDarkMode ? 'rgba(234,179,8,0.5)' : 'rgba(253,230,138,0.5)' }]}>
        <WifiOff size={64} color={isDarkMode ? '#eab308' : '#ca8a04'} style={styles.icon} />
        <Text style={[styles.title, { color: isDarkMode ? 'white' : '#111827' }]}>Session Expired</Text>
        <Text style={[styles.subtitle, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>
          Your session has expired. Please login again to continue.
        </Text>
        <View style={[styles.infoBox, { backgroundColor: isDarkMode ? 'rgba(234,179,8,0.15)' : 'rgba(254,240,138,0.5)', borderColor: isDarkMode ? 'rgba(234,179,8,0.3)' : 'rgba(253,230,138,0.3)' }]}>
          <Text style={[styles.infoText, { color: isDarkMode ? '#fef08a' : '#854d0e' }]}>
            For security reasons, you are automatically logged out after 30 minutes of inactivity.
          </Text>
        </View>
        <TouchableOpacity onPress={onLoginRedirect} style={styles.button} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 400, padding: 32, borderRadius: 16, alignItems: 'center', borderWidth: 1 },
  icon: { marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  infoBox: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 24, width: '100%' },
  infoText: { fontSize: 13, lineHeight: 18 },
  button: { backgroundColor: '#7c3aed', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, width: '100%', alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});

export default SessionExpired;
