import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Shield, Lock } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { authHeaders } from '../../lib/api';
import { saveSessionToken } from '../../lib/storage';
import { Screen } from '../../components/ui/Screen';
import { Gradient } from '../../components/ui/Gradient';
import { GradButton } from '../../components/ui/GradButton';
import { Field } from '../../components/ui/Field';

export default function ITLoginPage() {
  const { theme } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill all fields'); return; }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/auth/it/login`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: theme.bg }]}>
      <Screen>
        <View style={styles.backRow}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
            <ArrowLeft size={18} color={theme.fg} />
          </Pressable>
        </View>

        <Gradient colors={['#0ea5e9', '#7c3aed']} angle={135} radius={20} style={styles.logo}>
          <Shield size={30} color="#fff" />
        </Gradient>
        <Text style={[styles.title, { color: theme.fg }]}>IT Admin Login</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>Note Loom System Access</Text>

        {error ? <View style={[styles.errorBox, { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' }]}><Text style={styles.errorText}>{error}</Text></View> : null}

        <Field
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Field
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
        />

        <GradButton fullWidth size="lg" onPress={handleLogin} loading={loading} colors={['#0ea5e9', '#7c3aed']} icon={<Lock size={17} color="#fff" />}>
          Sign In
        </GradButton>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backRow: { marginBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 64, height: 64, borderRadius: 19, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 13, textAlign: 'center', marginTop: 6, marginBottom: 22 },
  errorBox: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 14 },
  errorText: { color: '#ef4444', fontSize: 13, textAlign: 'center' },
});
