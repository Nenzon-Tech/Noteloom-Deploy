import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Heart, MessageCircle } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface NoticeMiniProps {
  avatar: React.ReactNode;
  title: string;
  meta: string;
  body: string;
  likes: number;
  comments: number;
  onPress?: () => void;
}

export const NoticeMini = ({ avatar, title, meta, body, likes, comments, onPress }: NoticeMiniProps) => {
  const { theme } = useTheme();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: theme.surface, borderColor: theme.border, ...theme.elev1 }, pressed && { transform: [{ scale: 0.98 }] }]}>
      <View style={styles.avatarBox}>{avatar}</View>
      <View style={styles.body}>
        <Text style={[styles.title, { color: theme.fg }]}>{title}</Text>
        <Text style={[styles.meta, { color: theme.faint }]}>{meta}</Text>
        <Text style={[styles.para, { color: theme.muted }]} numberOfLines={2}>{body}</Text>
        <View style={styles.foot}>
          <View style={styles.count}><Heart size={13} color={theme.muted} /><Text style={[styles.countText, { color: theme.muted }]}>{likes}</Text></View>
          <View style={styles.count}><MessageCircle size={13} color={theme.muted} /><Text style={[styles.countText, { color: theme.muted }]}>{comments}</Text></View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 14, flexDirection: 'row', gap: 12, marginBottom: 10 },
  avatarBox: { transform: [{ rotate: '-3deg' }] },
  body: { flex: 1, minWidth: 0 },
  title: { fontSize: 13, fontWeight: '700' },
  meta: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginVertical: 2 },
  para: { fontSize: 12, lineHeight: 18 },
  foot: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8 },
  count: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  countText: { fontSize: 11, fontWeight: '600' },
});

export default NoticeMini;
