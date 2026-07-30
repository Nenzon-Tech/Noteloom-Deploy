import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageSquare, Send, Paperclip, Bot, User, GraduationCap } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { getSessionToken } from '../../lib/storage';
import GlassHeader from '../../components/ui/GlassHeader';

interface ChatMessage {
  _id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export default function AIChat() {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { _id: '1', content: 'Hello! I\'m your Socratic AI Tutor. How can I help you with your studies today?', sender: 'ai', timestamp: new Date().toISOString() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { _id: Date.now().toString(), content: input.trim(), sender: 'user', timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input.trim(), mode: 'socratic' }),
      });
      if (response.ok) {
        const data = await response.json();
        const aiMsg: ChatMessage = { _id: (Date.now() + 1).toString(), content: data.response || data.message || 'I understand. Could you elaborate?', sender: 'ai', timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        setMessages(prev => [...prev, { _id: (Date.now() + 1).toString(), content: 'Sorry, I encountered an error. Please try again.', sender: 'ai', timestamp: new Date().toISOString() }]);
      }
    } catch {
      setMessages(prev => [...prev, { _id: (Date.now() + 1).toString(), content: 'Network error. Please check your connection.', sender: 'ai', timestamp: new Date().toISOString() }]);
    }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
      <GlassHeader variant="dashboard">
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Bot size={22} color="#7c3aed" />
          <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : '#111827' }]}>AI Tutor</Text>
        </View>
      </GlassHeader>

      <ScrollView ref={scrollRef} style={styles.chatArea} contentContainerStyle={{ paddingTop: 80, paddingBottom: 20 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View key={msg._id} style={[styles.messageRow, msg.sender === 'user' ? styles.userRow : styles.aiRow]}>
            {msg.sender === 'ai' && <View style={styles.aiAvatar}><Bot size={16} color="white" /></View>}
            <View style={[styles.bubble, msg.sender === 'user' ? { backgroundColor: '#7c3aed' } : { backgroundColor: isDarkMode ? '#1e293b' : '#f3f4f6' }]}>
              <Text style={[styles.bubbleText, { color: msg.sender === 'user' ? 'white' : isDarkMode ? '#e5e7eb' : '#374151' }]}>{msg.content}</Text>
            </View>
            {msg.sender === 'user' && <View style={[styles.userAvatar, { backgroundColor: isDarkMode ? '#374151' : '#e5e7eb' }]}><User size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} /></View>}
          </View>
        ))}
        {loading && (
          <View style={styles.aiRow}>
            <View style={styles.aiAvatar}><Bot size={16} color="white" /></View>
            <ActivityIndicator size="small" color="#7c3aed" style={{ marginLeft: 12 }} />
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputBar, { backgroundColor: isDarkMode ? 'rgba(17,24,39,0.95)' : 'rgba(255,255,255,0.95)', borderTopColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask your AI Tutor..."
          placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
          style={[styles.input, { backgroundColor: isDarkMode ? 'rgba(55,65,81,0.5)' : '#f3f4f6', color: isDarkMode ? 'white' : '#111827' }]}
          multiline
        />
        <TouchableOpacity onPress={sendMessage} disabled={!input.trim() || loading} style={[styles.sendBtn, { opacity: !input.trim() ? 0.5 : 1 }]}>
          <Send size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4, paddingBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  chatArea: { flex: 1, paddingHorizontal: 16 },
  messageRow: { flexDirection: 'row', marginBottom: 16, maxWidth: '85%' },
  userRow: { alignSelf: 'flex-end' },
  aiRow: { alignSelf: 'flex-start' },
  aiAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  userAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  bubble: { padding: 14, borderRadius: 18 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  inputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, gap: 8 },
  input: { flex: 1, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100 },
  sendBtn: { backgroundColor: '#7c3aed', padding: 12, borderRadius: 24 },
});
