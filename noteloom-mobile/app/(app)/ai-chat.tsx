import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Send, Bot, X, MessageCircle, GraduationCap, Sparkles, Camera, FileText, Play } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useSession } from '../../hooks/useSession';
import { API_BASE } from '../../lib/constants';
import { authHeaders } from '../../lib/api';
import { getSessionToken } from '../../lib/storage';
import { Screen } from '../../components/ui/Screen';
import { Gradient } from '../../components/ui/Gradient';
import { BottomNav } from '../../components/ui/BottomNav';

interface ChatMessage { _id: string; content: string; sender: 'user' | 'ai'; }

type Mode = 'standard' | 'tutor' | 'mindmap';

export default function AIChat() {
  const { theme } = useTheme();
  const { user } = useSession();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('standard');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { _id: 'welcome', content: `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm Noteloom Ai. Ask me about your DBMS course, summarize a lecture, or generate a mind map. 🎓`, sender: 'ai' },
  ]);
  const scrollRef = useRef<ScrollView>(null);

  const placeholder = mode === 'tutor' ? 'Ask me to teach you something...' : mode === 'mindmap' ? 'Type a topic to map...' : 'Ask me anything...';

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setMessages(prev => [...prev, { _id: Date.now().toString(), content: text, sender: 'user' }]);
    setInput('');
    setLoading(true);
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ message: text, mode }),
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { _id: (Date.now() + 1).toString(), content: data.response || data.message || 'Here is what I found for your question.', sender: 'ai' }]);
      } else {
        setMessages(prev => [...prev, { _id: (Date.now() + 1).toString(), content: 'Sorry, I encountered an error. Please try again.', sender: 'ai' }]);
      }
    } catch {
      setMessages(prev => [...prev, { _id: (Date.now() + 1).toString(), content: 'Network error. Please check your connection.', sender: 'ai' }]);
    }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <Screen contentContainerStyle={{ paddingTop: 12, paddingBottom: 120 }}>
          <Gradient colors={theme.gradientCta} angle={135} radius={18} style={styles.head}>
            <View style={styles.headDecor} />
            <View style={[styles.headBot, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Bot size={21} color="#fff" />
            </View>
            <View style={styles.headText}>
              <Text style={styles.headTitle}>Noteloom Ai</Text>
              <Text style={styles.headSub}>
                <Sparkles size={10} color="#fff" /> Your personalised assistant
              </Text>
            </View>
            <Pressable onPress={() => router.push('/(app)/dashboard')} style={styles.closeBtn}>
              <X size={17} color="#fff" />
            </Pressable>
          </Gradient>

          <View style={[styles.seg, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
            {([
              { m: 'standard' as Mode, icon: <MessageCircle size={13} color="#4b5563" />, label: 'Normal' },
              { m: 'tutor' as Mode, icon: <GraduationCap size={13} color="#4b5563" />, label: 'Tutor' },
              { m: 'mindmap' as Mode, icon: <Sparkles size={13} color="#4b5563" />, label: 'Mind Map' },
            ]).map(seg => {
              const active = mode === seg.m;
              return (
                <Pressable key={seg.m} onPress={() => setMode(seg.m)} style={[styles.segBtn, active && { backgroundColor: theme.surface, borderColor: 'rgba(124,58,237,0.2)', ...theme.cardShadow }]}>
                  {seg.icon}
                  <Text style={[styles.segText, { color: active ? theme.violet : theme.muted }]}>{seg.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.tools}>
            {([
              { icon: <Camera size={14} color="#d97706" />, label: 'Solve', color: '#d97706', border: 'rgba(245,158,11,0.35)' },
              { icon: <FileText size={14} color={theme.blue} />, label: 'Summarizer', color: theme.blue, border: 'rgba(59,130,246,0.3)' },
              { icon: <Play size={14} color={theme.violet} />, label: 'Transcribe', color: theme.violet, border: 'rgba(124,58,237,0.3)' },
            ]).map(t => (
              <Pressable key={t.label} style={[styles.tool, { backgroundColor: theme.surface, borderColor: t.border }]}>
                {t.icon}
                <Text style={[styles.toolText, { color: t.color }]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>

          <ScrollView ref={scrollRef} style={styles.chatScroll} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
            {messages.map(msg => (
              <View key={msg._id} style={[styles.bubbleWrap, msg.sender === 'user' ? styles.userWrap : styles.botWrap]}>
                <View
                  style={[
                    styles.bubble,
                    msg.sender === 'user'
                      ? [styles.userBubble, { backgroundColor: theme.violet }]
                      : [styles.botBubble, { backgroundColor: theme.surface, borderColor: theme.border }],
                  ]}
                >
                  <Text style={[styles.bubbleText, { color: msg.sender === 'user' ? '#fff' : theme.fg }]}>{msg.content}</Text>
                </View>
              </View>
            ))}
            {loading && (
              <View style={styles.typingWrap}>
                <View style={[styles.typing, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  {[0, 1, 2].map(i => <View key={i} style={[styles.typingDot, { backgroundColor: theme.violet }]} />)}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={[styles.inputBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={placeholder}
              placeholderTextColor={theme.faint}
              onSubmitEditing={sendMessage}
              style={[styles.input, { color: theme.fg }]}
            />
            <Pressable onPress={sendMessage} style={({ pressed }) => [styles.sendBtn, { backgroundColor: theme.violet }, pressed && { transform: [{ scale: 0.9 }] }]}>
              {loading ? <ActivityIndicator color="#fff" size="small" /> : <Send size={17} color="#fff" />}
            </Pressable>
          </View>
        </Screen>
      </KeyboardAvoidingView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  head: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, shadowColor: 'rgba(124,58,237,0.35)', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.6, shadowRadius: 24, elevation: 8 },
  headDecor: { position: 'absolute', right: -30, top: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.2)' },
  headBot: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headText: { flex: 1 },
  headTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  headSub: { color: 'rgba(255,255,255,0.85)', fontSize: 10, flexDirection: 'row', alignItems: 'center', gap: 4 },
  closeBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  seg: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  segBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, borderRadius: 11, borderWidth: 1, borderColor: 'transparent' },
  segText: { fontSize: 11, fontWeight: '600' },
  tools: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  tool: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 12, borderWidth: 1 },
  toolText: { fontSize: 11, fontWeight: '600' },
  chatScroll: { flex: 1, minHeight: 200, marginBottom: 10 },
  bubbleWrap: { flexDirection: 'row', marginBottom: 12 },
  userWrap: { justifyContent: 'flex-end' },
  botWrap: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '86%', paddingVertical: 11, paddingHorizontal: 13, borderRadius: 16, fontSize: 13, lineHeight: 20 },
  userBubble: { borderBottomRightRadius: 4 },
  botBubble: { borderBottomLeftRadius: 4, borderWidth: 1 },
  bubbleText: { fontSize: 13, lineHeight: 20 },
  typingWrap: { alignItems: 'flex-start', marginBottom: 12 },
  typing: { flexDirection: 'row', gap: 5, paddingVertical: 13, paddingHorizontal: 15, borderRadius: 16, borderBottomLeftRadius: 4, borderWidth: 1 },
  typingDot: { width: 6, height: 6, borderRadius: 3, opacity: 0.4 },
  inputBar: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, borderRadius: 16, borderWidth: 1, marginTop: 'auto', ...{ shadowColor: 'rgba(17,24,39,0.08)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 6, elevation: 2 } },
  input: { flex: 1, fontSize: 13, paddingVertical: 6, paddingHorizontal: 4 },
  sendBtn: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: 'rgba(147,51,234,0.4)', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.8, shadowRadius: 14, elevation: 3 },
});
