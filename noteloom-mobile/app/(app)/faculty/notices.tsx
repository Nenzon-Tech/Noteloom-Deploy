import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { Screen } from '../../../components/ui/Screen';
import { GHeader } from '../../../components/ui/GHeader';
import { Avatar } from '../../../components/ui/Avatar';
import { PubForm } from '../../../components/ui/PubForm';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { NoticeCard } from '../../../components/ui/NoticeCard';

export default function FacultyNotices() {
  const { theme } = useTheme();

  const notices = [
    {
      _id: 'fn1',
      tag: 'Faculty',
      tagColor: 'green' as const,
      time: '2h',
      title: 'Internal Assessment 2 schedule',
      body: 'IA-2 begins 24 Aug. Submit question papers for CSE 3A & 3B by Friday.',
      likes: 1200,
      comments: 87,
    },
    {
      _id: 'fn2',
      tag: 'Exam',
      tagColor: 'blue' as const,
      time: '1d',
      title: 'Answer script evaluation',
      body: 'Evaluation for SEM-05 papers to be completed by 19 Aug in the staff room.',
      likes: 640,
      comments: 41,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <GHeader
          avatar={<Avatar label="NB" gradient={['#3b82f6', '#6366f1']} />}
          title="Notices"
          subtitle="Faculty desk"
        />
        <PubForm title="Publish a notice" bodyLabel="Details" audiences={['All Students', 'CSE', 'Faculty', 'Exam Cell']} />
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
