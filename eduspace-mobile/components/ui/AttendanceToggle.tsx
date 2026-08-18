import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Check, X, FileText, Ban } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface AttendanceToggleProps {
  status: string;
  onChange: (value: string) => void;
}

const options = [
  { value: 'Present', icon: Check, color: '#10b981' },
  { value: 'Absent', icon: X, color: '#ef4444' },
  { value: 'Excused', icon: FileText, color: '#eab308' },
  { value: 'NotMarked', icon: Ban, color: '#9ca3af' },
];

export const AttendanceToggle = ({ status, onChange }: AttendanceToggleProps) => {
  const { isDarkMode } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1e293b' : '#f3f4f6', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = status === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.button,
              isActive && { backgroundColor: opt.color },
            ]}
          >
            <Icon
              size={18}
              strokeWidth={2.5}
              color={isActive ? 'white' : opt.color}
              opacity={isActive ? 1 : 0.6}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
  },
  button: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AttendanceToggle;
