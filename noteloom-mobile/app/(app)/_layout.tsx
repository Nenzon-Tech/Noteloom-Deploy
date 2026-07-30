import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { LayoutDashboard, MessageSquare, Bell, User, GraduationCap, BookOpen, Clock, Library, CalendarCheck, FileText, CreditCard, LucideIcon } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function AppLayout() {
  const { isDarkMode } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDarkMode ? 'rgba(17,24,39,0.95)' : 'rgba(255,255,255,0.95)',
          borderTopColor: isDarkMode ? 'rgba(55,65,81,0.5)' : 'rgba(229,231,235,0.5)',
          borderTopWidth: 1,
          elevation: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: '#7c3aed',
        tabBarInactiveTintColor: isDarkMode ? '#6b7280' : '#9ca3af',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai-chat"
        options={{
          title: 'AI Tutor',
          tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notice-board"
        options={{
          title: 'Notices',
          tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      {/* Hidden screens */}
      <Tabs.Screen name="attendance" options={{ href: null }} />
      <Tabs.Screen name="my-classes" options={{ href: null }} />
      <Tabs.Screen name="library" options={{ href: null }} />
      <Tabs.Screen name="timetable" options={{ href: null }} />
      <Tabs.Screen name="leave" options={{ href: null }} />
      <Tabs.Screen name="coe" options={{ href: null }} />
      <Tabs.Screen name="exam-form" options={{ href: null }} />
      <Tabs.Screen name="fees" options={{ href: null }} />
      <Tabs.Screen name="results" options={{ href: null }} />
      <Tabs.Screen name="academic-calendar" options={{ href: null }} />
      <Tabs.Screen name="it-admin" options={{ href: null }} />
      <Tabs.Screen name="manage-users" options={{ href: null }} />
      <Tabs.Screen name="manage-departments" options={{ href: null }} />
      <Tabs.Screen name="mark-attendance" options={{ href: null }} />
      <Tabs.Screen name="feedback" options={{ href: null }} />
      <Tabs.Screen name="payment-details" options={{ href: null }} />
      <Tabs.Screen name="exam-management" options={{ href: null }} />
    </Tabs>
  );
}
