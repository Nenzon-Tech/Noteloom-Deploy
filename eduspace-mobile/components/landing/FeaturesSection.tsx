import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Animated,
} from 'react-native';
import { Sparkles, Shield, CheckSquare, Library, TrendingUp, MessageSquare, ChevronDown } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const features = [
  {
    id: 'ai', icon: Sparkles, title: 'AI-Powered Lecture Digest', color: '#8b5cf6',
    tags: ['Smart Notes', 'Auto Summaries', 'Key Insights'], stats: '50k+ notes generated',
    desc: 'Transform your lectures into searchable, summarized notes with AI.',
  },
  {
    id: 'coe', icon: Shield, title: 'Examination Portal', color: '#2563eb',
    tags: ['Exam Forms', 'Results', 'Admit Cards'], stats: '95% satisfaction',
    desc: 'Complete exam lifecycle from registration to result publishing.',
  },
  {
    id: 'attendance', icon: CheckSquare, title: 'Smart Attendance', color: '#059669',
    tags: ['Real-time', 'Reports', 'Analytics'], stats: '10k+ daily entries',
    desc: 'Track and manage attendance with intelligent reporting.',
  },
  {
    id: 'vault', icon: Library, title: 'Document Vault', color: '#d97706',
    tags: ['Notes', 'Assignments', 'Resources'], stats: '100k+ documents',
    desc: 'Secure storage for all your academic materials.',
  },
  {
    id: 'analytics', icon: TrendingUp, title: 'Academic Analytics', color: '#dc2626',
    tags: ['Performance', 'Trends', 'Insights'], stats: 'Dashboard views',
    desc: 'Visual insights into your academic performance trends.',
  },
  {
    id: 'notices', icon: MessageSquare, title: 'Campus Notices', color: '#7c3aed',
    tags: ['Updates', 'Events', 'Announcements'], stats: 'Real-time push',
    desc: 'Instant notifications for all campus announcements.',
  },
];

export const FeaturesSection = () => {
  const { isDarkMode } = useTheme();
  const [activeCard, setActiveCard] = useState<string | null>(null);

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
      <View style={styles.header}>
        <Text style={[styles.heading, { color: isDarkMode ? 'white' : '#111827' }]}>
          Everything you need
        </Text>
        <Text style={[styles.subheading, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>
          Tap any card to learn more
        </Text>
      </View>

      <View style={styles.grid}>
        {features.map((feature) => {
          const Icon = feature.icon;
          const isExpanded = activeCard === feature.id;
          return (
            <TouchableOpacity
              key={feature.id}
              onPress={() => setActiveCard(isExpanded ? null : feature.id)}
              activeOpacity={0.85}
              style={[
                styles.card,
                {
                  backgroundColor: isDarkMode ? 'rgba(30,41,59,0.7)' : 'rgba(255,255,255,0.8)',
                  borderColor: isExpanded
                    ? feature.color
                    : (isDarkMode ? 'rgba(55,65,81,0.5)' : 'rgba(229,231,235,0.5)'),
                },
                activeCard && activeCard !== feature.id && styles.cardDimmed,
              ]}
            >
              <View style={styles.cardTop}>
                <View style={[styles.iconContainer, { backgroundColor: `${feature.color}20` }]}>
                  <Icon size={22} color={feature.color} />
                </View>
                <View style={styles.cardTopText}>
                  <Text style={[styles.cardTitle, { color: isDarkMode ? 'white' : '#111827' }]}>
                    {feature.title}
                  </Text>
                  {!isExpanded && (
                    <Text style={[styles.cardPreview, { color: isDarkMode ? '#6b7280' : '#9ca3af' }]} numberOfLines={1}>
                      {feature.desc}
                    </Text>
                  )}
                </View>
                <ChevronDown
                  size={18}
                  color={isDarkMode ? '#6b7280' : '#9ca3af'}
                  style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
                />
              </View>

              {isExpanded && (
                <View style={styles.expanded}>
                  <Text style={[styles.desc, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>
                    {feature.desc}
                  </Text>
                  <View style={styles.tagRow}>
                    {feature.tags.map((tag) => (
                      <View key={tag} style={[styles.tag, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
                        <Text style={[styles.tagText, { color: feature.color }]}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={[styles.stats, { color: isDarkMode ? '#6b7280' : '#9ca3af' }]}>{feature.stats}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 48, paddingHorizontal: 16 },
  header: { alignItems: 'center', gap: 6, marginBottom: 24 },
  heading: { fontSize: 22, fontWeight: '800' },
  subheading: { fontSize: 13, fontWeight: '500' },
  grid: { gap: 10, maxWidth: 500, marginHorizontal: 'auto' },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  cardDimmed: { opacity: 0.5 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconContainer: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTopText: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  cardPreview: { fontSize: 12, marginTop: 2 },
  expanded: { gap: 10 },
  desc: { fontSize: 13, lineHeight: 19 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 11, fontWeight: '600' },
  stats: { fontSize: 11, fontWeight: '600' },
});

export default FeaturesSection;
