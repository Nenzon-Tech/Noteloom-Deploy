import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Switch, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { Bell, Library, ShieldCheck, Moon, Sun, MessageCircle, LogOut, ChevronRight, Fingerprint } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useSession } from '../../hooks/useSession';
import { isBiometricEnabled, setBiometricEnabled } from '../../lib/storage';
import { Screen } from '../../components/ui/Screen';
import { GHeader, Wordmark } from '../../components/ui/GHeader';
import { Gradient } from '../../components/ui/Gradient';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { ListCard, LRow } from '../../components/ui/ListCard';
import { Pill } from '../../components/ui/Pill';
import { BottomNav } from '../../components/ui/BottomNav';

export default function Profile() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { user, profile, logout, authenticateWithBiometrics } = useSession();
  const router = useRouter();
  const [biometricEnabled, setBiometricEnabledState] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const enabled = await isBiometricEnabled();
      if (mounted) setBiometricEnabledState(enabled);
    })();
    return () => { mounted = false; };
  }, []);

  const handleToggleBiometric = async (value: boolean) => {
    setBiometricEnabledState(value);
    if (value) {
      const ok = await authenticateWithBiometrics();
      if (ok) {
        await setBiometricEnabled(true);
      } else {
        setBiometricEnabledState(false);
        await setBiometricEnabled(false);
      }
    } else {
      await setBiometricEnabled(false);
    }
  };

  const handleSignOut = async () => { await logout(); router.replace('/college-selection'); };

  const name = user?.name || 'Arpan Maity';
  const roleLabel = profile?.role === 'faculty' ? 'Faculty' : profile?.role === 'college_admin' ? 'Admin' : 'Student';
  const uid = user?.uid || profile?.college || '2023CS0765';

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <GHeader
          left={<Wordmark />}
        />
        <Gradient colors={theme.gradientHero} angle={135} radius={20} style={styles.cover}>
          <View style={styles.coverDecor} />
          <View style={styles.pfTop}>
            <Gradient colors={['#818cf8', '#c084fc']} angle={135} radius={18} style={styles.pfAva}>
              <Text style={styles.pfAvaText}>{name?.[0]?.toUpperCase() || 'A'}</Text>
            </Gradient>
            <View style={styles.pfInfo}>
              <Text style={styles.pfName}>{name}</Text>
              <Text style={styles.pfMeta}>3rd Year · CSE · UID {uid}</Text>
              <Pill onDark>{roleLabel} · Active</Pill>
            </View>
          </View>
          <View style={styles.pfStats}>
            <View style={styles.st}><Text style={styles.stVal}>6</Text><Text style={styles.stLbl}>Courses</Text></View>
            <View style={styles.st}><Text style={styles.stVal}>84%</Text><Text style={styles.stLbl}>Attendance</Text></View>
            <View style={styles.st}><Text style={styles.stVal}>8.6</Text><Text style={styles.stLbl}>CGPA</Text></View>
          </View>
        </Gradient>

        <SectionHeader title="Account" />
        <ListCard>
          <LRow icon={<Bell size={17} color="#7c3aed" />} iconBg="rgba(124,58,237,0.12)" title="Notifications" subtitle="3 unread · exam alerts" />
          <LRow icon={<Library size={17} color="#10b981" />} iconBg="rgba(16,185,129,0.12)" title="My Library" subtitle="Saved notes & PYQs" onPress={() => router.push('/(app)/library')} />
          <LRow
            icon={<Fingerprint size={17} color="#2563eb" />}
            iconBg="rgba(59,130,246,0.12)"
            title="Biometric Login"
            subtitle="Unlock NoteLoom with fingerprint at launch"
            trailing={<Switch value={biometricEnabled} onValueChange={handleToggleBiometric} trackColor={{ false: theme.border, true: theme.violet }} thumbColor="#fff" />}
          />
          <LRow
            icon={isDarkMode ? <Moon size={17} color="#d97706" /> : <Sun size={17} color="#d97706" />}
            iconBg="rgba(245,158,11,0.12)"
            title="Dark Mode"
            subtitle="Matches system"
            trailing={<Switch value={isDarkMode} onValueChange={toggleTheme} trackColor={{ false: theme.border, true: theme.violet }} thumbColor="#fff" />}
            last
          />
        </ListCard>

        <SectionHeader title="Security" />
        <ListCard>
          <LRow icon={<ShieldCheck size={17} color="#4f46e5" />} iconBg="rgba(99,102,241,0.12)" title="Privacy & Security" subtitle="Manage sessions" />
          <LRow
            icon={<LogOut size={17} color="#ef4444" />}
            iconBg="rgba(239,68,68,0.12)"
            title="Sign Out"
            subtitle="End this session"
            onPress={handleSignOut}
            last
          />
        </ListCard>
        <Text style={[styles.version, { color: theme.faint }]}>NoteLoom App v1.0.1 · Beta</Text>
      </Screen>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { padding: 20, marginTop: 8, shadowColor: 'rgba(124,58,237,0.35)', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.6, shadowRadius: 24, elevation: 8 },
  coverDecor: { position: 'absolute', right: -30, bottom: -50, width: 170, height: 170, borderRadius: 85, backgroundColor: 'rgba(168,85,247,0.4)' },
  pfTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  pfAva: { width: 64, height: 64, borderRadius: 18, borderWidth: 3, borderColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center' },
  pfAvaText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  pfInfo: { flex: 1 },
  pfName: { color: '#fff', fontSize: 19, fontWeight: '700', letterSpacing: -0.3 },
  pfMeta: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginVertical: 4 },
  pfStats: { flexDirection: 'row', gap: 8, marginTop: 18 },
  st: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', borderRadius: 12, paddingVertical: 10 },
  stVal: { color: '#fff', fontSize: 16, fontWeight: '700' },
  stLbl: { color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 2 },
  version: { textAlign: 'center', fontSize: 10, marginVertical: 6 },
});
