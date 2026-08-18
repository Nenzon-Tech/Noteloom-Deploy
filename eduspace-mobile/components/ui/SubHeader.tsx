import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

export const SubHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => {
  const { theme } = useTheme();
  const router = useRouter();
  return (
    <View style={styles.row}>
      <Pressable onPress={() => router.back()} style={[styles.btn, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
        <ArrowLeft size={18} color={theme.fg} />
      </Pressable>
      <View style={styles.titles}>
        <Text style={[styles.title, { color: theme.fg }]} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: theme.faint }]} numberOfLines={1}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  btn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  titles: { flex: 1, minWidth: 0 },
  title: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  subtitle: { fontSize: 11, fontWeight: '500', marginTop: 1 },
});

export default SubHeader;
