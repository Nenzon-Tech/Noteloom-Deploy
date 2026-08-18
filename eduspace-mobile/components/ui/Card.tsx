import React, { ReactNode } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ArrowRight } from 'lucide-react-native';

interface CardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated';
  color?: string;
  index?: number;
}

export const Card = ({ title, description, icon, onPress, variant = 'default', color, index = 0 }: CardProps) => {
  const { isDarkMode } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.4)' : 'white',
          borderColor: isDarkMode ? '#374151' : '#e5e7eb',
        },
        variant === 'elevated' && {
          shadowColor: isDarkMode ? '#000' : '#7c3aed',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDarkMode ? 0.3 : 0.1,
          shadowRadius: 12,
          elevation: 4,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? 'rgba(55,65,81,0.5)' : '#f9fafb' }]}>
              {icon}
            </View>
          )}
          <ArrowRight size={14} color={isDarkMode ? '#9ca3af' : '#9ca3af'} style={styles.arrow} />
        </View>
        <Text style={[styles.title, { color: isDarkMode ? '#f3f4f6' : '#111827' }]} numberOfLines={2}>
          {title}
        </Text>
        {description && (
          <Text style={[styles.description, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]} numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    padding: 12,
    borderRadius: 12,
  },
  arrow: {
    opacity: 0.4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
  },
});

export default Card;
