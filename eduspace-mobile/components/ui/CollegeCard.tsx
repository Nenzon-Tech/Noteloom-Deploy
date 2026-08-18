import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Building2, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Gradient } from './Gradient';

interface CollegeCardProps {
  name: string;
  meta: string;
  onPress?: () => void;
}

export const CollegeCard = ({ name, meta, onPress }: CollegeCardProps) => {
  const { theme } = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: theme.surface, borderColor: theme.border, ...theme.elev1 }, pressed && { transform: [{ scale: 0.98 }] }]}>
      <Gradient colors={theme.gradientBrand} angle={135} radius={13} style={styles.icon}>
        <Building2 size={21} color="#fff" />
      </Gradient>
      <View style={styles.meta}>
        <Text style={[styles.name, { color: theme.fg }]} numberOfLines={1}>{name}</Text>
        <Text style={[styles.sub, { color: theme.faint }]}>{meta}</Text>
      </View>
      <ChevronRight size={16} color={theme.faint} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  icon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  meta: { flex: 1, minWidth: 0 },
  name: { fontSize: 14, fontWeight: '700' },
  sub: { fontSize: 11, marginTop: 1 },
});

export default CollegeCard;
