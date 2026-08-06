import React, { ReactNode, useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { Heart, MessageCircle, Paperclip, Send, Download } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

type TagColor = 'green' | 'blue' | 'red' | 'amber' | 'purple' | 'gray' | 'white';

interface Comment {
  author: string;
  text: string;
}

interface NoticeCardProps {
  avatar?: ReactNode;
  author?: string;
  authorMeta?: string;
  tag?: string;
  tagColor?: 'green' | 'blue' | 'red' | 'amber' | 'purple' | 'gray' | 'white';
  time?: string;
  title: string;
  body: string;
  likes: number;
  comments: number;
  commentsOpen?: Comment[];
  attachment?: { name: string; meta: string; onPress?: () => void };
}

const TAG_COLORS: Record<string, string> = {
  green: '#10b981', blue: '#3b82f6', red: '#ef4444', amber: '#f59e0b', purple: '#8b5cf6', gray: '#6b7280', white: '#ffffff',
};

export const NoticeCard = ({ avatar, author, authorMeta, tag, tagColor = 'purple', time, title, body, likes, comments, commentsOpen, attachment }: NoticeCardProps) => {
  const { theme } = useTheme();
  const [liked, setLiked] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);

  const tagHex = TAG_COLORS[tagColor];

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, ...theme.elev1 }]}>
      {tag ? (
        <View style={styles.tagRow}>
          <View style={[styles.tag, { backgroundColor: `${tagHex}1f` }]}>
            <Text style={[styles.tagText, { color: tagHex }]}>{tag}</Text>
          </View>
          <Text style={[styles.tagTime, { color: theme.faint }]}>{time}</Text>
        </View>
      ) : (
        <View style={styles.head}>
          {avatar}
          <View style={styles.who}>
            <Text style={[styles.author, { color: theme.fg }]}>{author}</Text>
            <Text style={[styles.authorMeta, { color: theme.faint }]}>{authorMeta}</Text>
          </View>
        </View>
      )}
      <View style={styles.body}>
        <Text style={[styles.title, { color: theme.fg }]}>{title}</Text>
        <Text style={[styles.para, { color: theme.muted }]}>{body}</Text>
      </View>
      {attachment && (
        <View style={styles.attach}>
          <View style={styles.attachIcon}>
            <Paperclip size={16} color={theme.red} />
          </View>
          <View style={styles.attachName}>
            <Text style={[styles.attachTitle, { color: theme.fg }]} numberOfLines={1}>{attachment.name}</Text>
            <Text style={[styles.attachMeta, { color: theme.faint }]}>{attachment.meta}</Text>
          </View>
          <Pressable onPress={attachment.onPress} style={styles.attachBtn}>
            <Text style={styles.attachBtnText}>View</Text>
          </Pressable>
        </View>
      )}
      <View style={[styles.foot, { borderTopColor: theme.border }]}>
        <Pressable onPress={() => setLiked(v => !v)} style={styles.act}>
          <Heart size={18} color={liked ? theme.red : theme.muted} fill={liked ? theme.red : 'none'} />
          <Text style={[styles.actText, { color: liked ? theme.red : theme.muted }]}>{likes + (liked ? 1 : 0)}</Text>
        </Pressable>
        <Pressable onPress={() => setCommentOpen(v => !v)} style={styles.act}>
          <MessageCircle size={18} color={theme.muted} />
          <Text style={[styles.actText, { color: theme.muted }]}>{comments}</Text>
        </Pressable>
        {attachment && (
          <Pressable onPress={attachment.onPress} style={styles.act}>
            <Download size={18} color={theme.muted} />
            <Text style={[styles.actText, { color: theme.muted }]}>Open</Text>
          </Pressable>
        )}
      </View>
      {commentOpen && commentsOpen && (
        <View style={styles.comments}>
          {commentsOpen.map((c, i) => (
            <View key={i} style={[styles.comment, { backgroundColor: theme.surface2 }]}>
              <Text style={[styles.commentText, { color: theme.fg }]}>
                <Text style={{ color: theme.blue, fontWeight: '700' }}>{c.author}: </Text>
                {c.text}
              </Text>
            </View>
          ))}
          <View style={styles.cmtInput}>
            <TextInput
              placeholder="Add a comment..."
              placeholderTextColor={theme.faint}
              style={[styles.cmtField, { backgroundColor: theme.surface2, borderColor: theme.border, color: theme.fg }]}
            />
            <Pressable style={styles.sendBtn}>
              <Send size={16} color="#fff" />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 14 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  who: { flex: 1, minWidth: 0 },
  author: { fontSize: 14, fontWeight: '700' },
  authorMeta: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 2 },
  body: { marginTop: 4, marginBottom: 4 },
  title: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2, lineHeight: 21, marginBottom: 6 },
  para: { fontSize: 13, lineHeight: 20 },
  attach: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    padding: 11,
    marginVertical: 12,
    backgroundColor: 'rgba(239,68,68,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.18)',
  },
  attachIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.14)', alignItems: 'center', justifyContent: 'center' },
  attachName: { flex: 1, minWidth: 0 },
  attachTitle: { fontSize: 12, fontWeight: '600' },
  attachMeta: { fontSize: 10, marginTop: 1 },
  attachBtn: { backgroundColor: '#2563eb', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  attachBtnText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  foot: { flexDirection: 'row', alignItems: 'center', gap: 18, paddingTop: 12, borderTopWidth: 1 },
  act: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actText: { fontSize: 12, fontWeight: '600' },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  tag: { borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  tagText: { fontSize: 10, fontWeight: '700' },
  tagTime: { fontSize: 11, fontWeight: '600' },
  comments: { marginTop: 12 },
  comment: { borderRadius: 12, padding: 10, marginBottom: 8 },
  commentText: { fontSize: 12, lineHeight: 18 },
  cmtInput: { flexDirection: 'row', gap: 8, marginTop: 10 },
  cmtField: { flex: 1, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 12 },
  sendBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#9333ea', alignItems: 'center', justifyContent: 'center' },
});

export default NoticeCard;
