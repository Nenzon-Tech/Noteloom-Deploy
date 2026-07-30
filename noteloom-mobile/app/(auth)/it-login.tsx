import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { saveSessionToken } from '../../lib/storage';

export default function ITLoginPage() {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill all fields'); return; }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/auth/it/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem('itLoginTime', new Date().toISOString());
        await saveSessionToken(data.token);
        router.replace('/(app)/it-admin');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch {
      setError('Connection failed. Check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc', paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.back, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>Back</Text>
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.body}>
        <View style={styles.card}>
          <View style={styles.iconRow}>
            <Shield size={40} color="#7c3aed" />
          </View>
          <Text style={[styles.title, { color: isDarkMode ? 'white' : '#111827' }]}>IT Admin Login</Text>
          <Text style={[styles.subtitle, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>Note Loom System Access</Text>

          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

          <View style={styles.field}>
            <Mail size={18} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
            <TextInput
              style={[styles.input, { color: isDarkMode ? 'white' : '#111827' }]}
              placeholder="Email"
              placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Lock size={18} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
            <TextInput
              style={[styles.input, { color: isDarkMode ? 'white' : '#111827' }]}
              placeholder="Password"
              placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} color="#9ca3af" /> : <Eye size={18} color="#9ca3af" />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleLogin} disabled={loading} style={styles.loginBtn}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.loginText}>Sign In</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16 },
  back: { fontSize: 15, fontWeight: '600' },
  body: { flex: 1, justifyContent: 'center', padding: 24 },
  card: { gap: 16, maxWidth: 400, width: '100%', marginHorizontal: 'auto' },
  iconRow: { alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center' },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  errorText: { color: '#ef4444', fontSize: 13, textAlign: 'center' },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(55,65,81,0.2)',
  },
  input: { flex: 1, fontSize: 15 },
  loginBtn: {
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
