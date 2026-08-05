import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { Star, Send } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { authHeaders } from '../../lib/api';
import { getSessionToken } from '../../lib/storage';
import { Screen } from '../../components/ui/Screen';
import { SubHeader } from '../../components/ui/SubHeader';
import { GradButton } from '../../components/ui/GradButton';
import { Gradient } from '../../components/ui/Gradient';

export default function SemesterFeedback() {
  const { theme } = useTheme();

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
        headers: authHeaders(token),
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
        headers: authHeaders(token),
        body: JSON.stringify({ rating, feedback, subjects: subjects.map((s) => s._id) }),
      });
      setSubmitted(true);
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Semester Feedback" subtitle="Share your experience" />

        {submitted ? (
          <View style={styles.successCard}>
            <Gradient colors={theme.gradientBrand} angle={135} radius={28} style={styles.successIcon}>
              <Star size={34} color="#fff" fill="#fff" />
            </Gradient>
            <Text style={[styles.successTitle, { color: theme.fg }]}>Thank You!</Text>
            <Text style={[styles.successSub, { color: theme.faint }]}>Your feedback has been recorded.</Text>
          </View>
        ) : loading ? (
          <ActivityIndicator color={theme.violet} style={{ paddingVertical: 60 }} />
        ) : (
          <>
            <Text style={[styles.sectionTitle, { color: theme.fg }]}>Rate your experience this semester</Text>

            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable
                  key={n}
                  onPress={() => setRating(n)}
                  style={({ pressed }) => pressed && { transform: [{ scale: 0.85 }] }}
                >
                  <Star
                    size={36}
                    color={n <= rating ? theme.amber : theme.faint}
                    fill={n <= rating ? theme.amber : 'transparent'}
                  />
                </Pressable>
              ))}
            </View>

            <Text style={[styles.label, { color: theme.fg }]}>Your Feedback</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.surface, color: theme.fg, borderColor: theme.border, ...theme.elev1 }]}
              placeholder="Share your thoughts about this semester..."
              placeholderTextColor={theme.faint}
              multiline
              numberOfLines={6}
              value={feedback}
              onChangeText={setFeedback}
            />

            <GradButton
              fullWidth
              size="lg"
              loading={submitting}
              onPress={handleSubmit}
              icon={<Send size={18} color="#fff" />}
              style={rating === 0 ? { opacity: 0.5 } : undefined}
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </GradButton>
          </>
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 15, fontWeight: '600', textAlign: 'center', marginTop: 8 },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  textArea: { padding: 16, borderRadius: 14, borderWidth: 1, fontSize: 14, minHeight: 140, textAlignVertical: 'top', marginBottom: 18 },
  successCard: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  successIcon: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  successTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  successSub: { fontSize: 14 },
});
