import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSession } from '../../hooks/useSession';
import { clearSessionToken } from '../../lib/storage';
import { useTheme } from '../../contexts/ThemeContext';

export default function RoleGateway() {
  const { profile, loading, isSessionValid } = useSession();
  const router = useRouter();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (loading) return;
    if (!isSessionValid) {
      clearSessionToken();
      router.replace('/college-selection');
      return;
    }
    const role = profile?.role;
    if (role === 'faculty') router.replace('/(app)/faculty');
    else if (role === 'college_admin') router.replace('/(app)/admin');
    else router.replace('/(app)/dashboard');
  }, [loading, isSessionValid, profile?.role]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: isDarkMode ? '#0b0f19' : '#f4f6fb' }}>
      <ActivityIndicator size="large" color="#7c3aed" />
    </View>
  );
}
