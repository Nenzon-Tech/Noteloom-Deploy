import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowRight, BookOpen, Users, Shield, Calendar, FileText, CheckCircle, Clock, Settings, Building, Library, Sparkles, Database, Circle } from 'lucide-react-native';
import { MenuItem } from '../../lib/types';

const iconMap: Record<string, any> = {
  BookOpen,
  Users,
  Shield,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  Settings,
  Building,
  Library,
  Sparkles,
  Database,
  Default: Circle,
};

interface DashboardCardProps {
  item: MenuItem;
  onPress: () => void;
  isDarkMode?: boolean;
  type?: 'LMS' | 'ERP';
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  item,
  onPress,
  isDarkMode = false,
  type = 'ERP',
}) => {
  const IconComponent = iconMap[item.icon] || iconMap.Default;
  const isLMS = type === 'LMS';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`p-5 rounded-2xl border mb-4 shadow-sm ${
        isDarkMode
          ? 'bg-gray-800/80 border-gray-700'
          : 'bg-white border-gray-100'
      }`}
    >
      <View className="flex-row items-start justify-between mb-3">
        <View
          className={`p-3 rounded-xl ${
            isLMS
              ? 'bg-purple-100 dark:bg-purple-950/60'
              : 'bg-blue-100 dark:bg-blue-950/60'
          }`}
        >
          <IconComponent
            size={24}
            color={isLMS ? '#9333ea' : '#2563eb'}
          />
        </View>

        <View className="p-1 rounded-full bg-gray-100 dark:bg-gray-700">
          <ArrowRight size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
        </View>
      </View>

      <Text
        className={`text-lg font-bold mb-1 ${
          isDarkMode ? 'text-gray-100' : 'text-gray-900'
        }`}
      >
        {item.title}
      </Text>

      <Text
        numberOfLines={2}
        className={`text-xs leading-5 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}
      >
        {item.description}
      </Text>
    </TouchableOpacity>
  );
};
