import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Star, Send, ArrowLeft, MessageSquare } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { getSessionToken } from '../../lib/storage';
import GlassHeader from '../../components/ui/GlassHeader';

export default function SemesterFeedback() {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/feedback/subjects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) setSubjects(await response.json());
    } catch {}
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      const token = await getSessionToken();
      await fetch(`${API_BASE}/api/feedback/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedback, subjects: subjects.map((s) => s._id) }),
      });
      setSubmitted(true);
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
      <GlassHeader variant="dashboard">
        <View style={[styles.headerInner, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={isDarkMode ? 'white' : '#111827'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Semester Feedback</Text>
        </View>
      </GlassHeader>

      <ScrollView contentContainerStyle={{ paddingTop: 80, padding: 16, gap: 20 }}>
        {submitted ? (
          <View style={styles.successCard}>
            <Star size={48} color="#f59e0b" fill="#f59e0b" />
            <Text style={[styles.successTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Thank You!</Text>
            <Text style={[styles.successSub, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>Your feedback has been recorded.</Text>
          </View>
        ) : (
          <>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>Rate your experience this semester</Text>

            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity key={n} onPress={() => setRating(n)}>
                  <Star
                    size={36}
                    color={n <= rating ? '#f59e0b' : (isDarkMode ? '#6b7280' : '#d1d5db')}
                    fill={n <= rating ? '#f59e0b' : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>Your Feedback</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: isDarkMode ? 'rgba(55,65,81,0.3)' : 'rgba(243,244,246,0.8)', color: isDarkMode ? 'white' : '#111827', borderColor: isDarkMode ? 'rgba(75,85,99,0.5)' : 'rgba(209,213,219,0.5)' }]}
              placeholder="Share your thoughts about this semester..."
              placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
              multiline
              numberOfLines={6}
              value={feedback}
              onChangeText={setFeedback}
            />

            <TouchableOpacity onPress={handleSubmit} disabled={submitting || rating === 0} style={[styles.submitBtn, (submitting || rating === 0) && { opacity: 0.5 }]}>
              <Send size={18} color="white" />
              <Text style={styles.submitText}>{submitting ? 'Submitting...' : 'Submit Feedback'}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerInner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4, paddingBottom: 8 },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  sectionTitle: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  label: { fontSize: 14, fontWeight: '600' },
  textArea: { padding: 16, borderRadius: 12, borderWidth: 1, fontSize: 14, minHeight: 140, textAlignVertical: 'top' },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitText: { color: 'white', fontSize: 15, fontWeight: '700' },
  successCard: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  successTitle: { fontSize: 22, fontWeight: '800' },
  successSub: { fontSize: 14 },
});
