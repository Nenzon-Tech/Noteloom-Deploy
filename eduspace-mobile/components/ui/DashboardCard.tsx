import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import * as LucideIcons from 'lucide-react-native';
import { ArrowRight } from 'lucide-react-native';
import AnimatedEntrance from './AnimatedEntrance';

interface DashboardCardProps {
  item: {
    key: string;
    title: string;
    description: string;
    icon: string;
    category?: 'LMS' | 'ERP';
  };
  index: number;
  onPress: () => void;
}

export const DashboardCard = ({ item, index, onPress }: DashboardCardProps) => {
  const { isDarkMode } = useTheme();
  const isLMS = item.category === 'LMS';
  const IconComponent = (LucideIcons as any)[item.icon] || LucideIcons.Circle;

  return (
    <AnimatedEntrance index={index}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={[
          styles.card,
          {
            backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.4)' : 'white',
            borderColor: isDarkMode ? '#374151' : '#e5e7eb',
          },
        ]}
      >
      {isLMS && <View style={styles.bgDecoration} />}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? 'rgba(55,65,81,0.5)' : '#f9fafb' }]}>
            <IconComponent size={22} color={isLMS ? '#7c3aed' : isDarkMode ? '#60a5fa' : '#6b7280'} />
          </View>
          <ArrowRight size={14} color={isDarkMode ? '#9ca3af' : '#9ca3af'} style={styles.arrow} />
        </View>
        <Text style={[styles.title, { color: isDarkMode ? '#f3f4f6' : '#111827' }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.description, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]} numberOfLines={2}>
          {item.description || 'Access your learning resources'}
        </Text>
      </View>
    </TouchableOpacity>
    </AnimatedEntrance>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  bgDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 96,
    height: 96,
    backgroundColor: 'rgba(124,58,237,0.05)',
    borderBottomLeftRadius: 96,
  },
  content: { padding: 20, zIndex: 10 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: { padding: 12, borderRadius: 12 },
  arrow: { opacity: 0.4, marginTop: 8 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  description: { fontSize: 12, lineHeight: 18 },
});

export default DashboardCard;
