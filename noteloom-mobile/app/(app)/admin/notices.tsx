import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { Screen } from '../../../components/ui/Screen';
import { GHeader } from '../../../components/ui/GHeader';
import { Avatar } from '../../../components/ui/Avatar';
import { PubForm } from '../../../components/ui/PubForm';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { NoticeCard } from '../../../components/ui/NoticeCard';

export default function AdminNotices() {
  const { theme } = useTheme();

  const notices = [
    {
      _id: 'an1',
      tag: 'Campus',
      tagColor: 'green' as const,
      time: '1h',
      title: 'Tech Fest registrations open',
      body: 'Annual TechnoVation 2026 opens 15 Aug. Teams of up to 4, register at the student council.',
      likes: 2100,
      comments: 156,
    },
    {
      _id: 'an2',
      tag: 'Exam',
      tagColor: 'blue' as const,
      time: '3h',
      title: 'SEM-06 examination hall plan',
      body: 'Hall plan released for CSE & ECE. Verify seat allotment before 14 Aug.',
      likes: 1800,
      comments: 94,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <GHeader avatar={<Avatar label="RS" />} title="Campus Notice" subtitle="Admin desk" />
        <PubForm title="Announce to campus" bodyLabel="Details" audiences={['All', 'Students', 'Faculty', 'Staff']} />
        <SectionHeader title="Recent" />
        {notices.map(n => (
          <NoticeCard
            key={n._id}
            tag={n.tag}
            tagColor={n.tagColor}
            time={n.time}
            title={n.title}
            body={n.body}
            likes={n.likes}
            comments={n.comments}
          />
        ))}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({});
