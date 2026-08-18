import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { Star, Send, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useSession } from '../../hooks/useSession';
import { API_BASE } from '../../lib/constants';
import { authHeaders } from '../../lib/api';
import { getSessionToken } from '../../lib/storage';
import { Screen } from '../../components/ui/Screen';
import { SubHeader } from '../../components/ui/SubHeader';
import { GradButton } from '../../components/ui/GradButton';
import { Pill } from '../../components/ui/Pill';
import { EmptyState } from '../../components/ui/EmptyState';
import { BottomNav } from '../../components/ui/BottomNav';

interface Subject {
  id: string;
  code: string;
  name: string;
  type?: string;
  semester?: number;
  feedbackSubmitted?: boolean;
}

export default function SemesterFeedback() {
  const { theme } = useTheme();
  const { user } = useSession();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => { if (user?.id) fetchSubjects(); }, [user?.id]);

  const fetchSubjects = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/coe/student/feedback-data/${user?.id}`, {
        headers: authHeaders(token),
      });
      if (response.ok) {
        const data = await response.json();
        setSubjects(Array.isArray(data.subjects) ? data.subjects : []);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const openForm = (id: string) => {
    setExpandedId(id);
    setRating(0);
    setFeedback('');
  };

  const handleSubmit = async (subject: Subject) => {
    if (rating === 0) return;
    setSubmittingId(subject.id);
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/coe/student/submit-feedback`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({
          subjectId: subject.id,
          subjectCode: subject.code,
          semester: subject.semester,
          rating,
          comments: feedback,
        }),
      });
      if (response.ok) {
        setSubjects(prev => prev.map(s => s.id === subject.id ? { ...s, feedbackSubmitted: true } : s));
        setExpandedId(null);
      }
    } catch (err) { console.error(err); }
    finally { setSubmittingId(null); }
  };

  const submittedCount = subjects.filter(s => s.feedbackSubmitted).length;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Semester Feedback" subtitle={`${submittedCount} of ${subjects.length} subjects submitted`} />

        {loading ? (
          <ActivityIndicator color={theme.violet} style={{ paddingVertical: 60 }} />
        ) : subjects.length === 0 ? (
          <EmptyState message="No enrolled subjects to review yet" />
        ) : (
          subjects.map(sub => {
            const isOpen = expandedId === sub.id;
            return (
              <View key={sub.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, ...theme.elev1 }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <Text style={[styles.subjectName, { color: theme.fg }]} numberOfLines={1}>{sub.name}</Text>
                    <Text style={[styles.subjectMeta, { color: theme.faint }]}>
                      {sub.code} · Sem {sub.semester ?? '—'} · {(sub.type || 'Theory').toUpperCase()}
                    </Text>
                  </View>
                  {sub.feedbackSubmitted ? (
                    <Pill color="green">Submitted</Pill>
                  ) : isOpen ? (
                    <Pill color="amber">Editing</Pill>
                  ) : (
                    <Pill color="purple">Pending</Pill>
                  )}
                </View>

                {isOpen && (
                  <>
                    <Text style={[styles.rateLabel, { color: theme.fg }]}>Rate this subject</Text>
                    <View style={styles.stars}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Pressable
                          key={n}
                          onPress={() => setRating(n)}
                          style={({ pressed }) => pressed && { transform: [{ scale: 0.85 }] }}
                        >
                          <Star
                            size={30}
                            color={n <= rating ? theme.amber : theme.faint}
                            fill={n <= rating ? theme.amber : 'transparent'}
                          />
                        </Pressable>
                      ))}
                    </View>

                    <TextInput
                      style={[styles.textArea, { backgroundColor: theme.surface2, color: theme.fg, borderColor: theme.border }]}
                      placeholder="Share your feedback on this subject..."
                      placeholderTextColor={theme.faint}
                      multiline
                      numberOfLines={4}
                      value={feedback}
                      onChangeText={setFeedback}
                    />

                    <GradButton
                      fullWidth
                      size="md"
                      loading={submittingId === sub.id}
                      onPress={() => handleSubmit(sub)}
                      icon={<Send size={16} color="#fff" />}
                      style={rating === 0 ? { opacity: 0.5 } : undefined}
                    >
                      {submittingId === sub.id ? 'Submitting...' : 'Submit Feedback'}
                    </GradButton>
                  </>
                )}

                {sub.feedbackSubmitted && (
                  <View style={styles.submittedRow}>
                    <CheckCircle2 size={14} color={theme.green} />
                    <Text style={[styles.submittedText, { color: theme.green }]}>Thanks for your feedback!</Text>
                  </View>
                )}

                {!sub.feedbackSubmitted && !isOpen && (
                  <Pressable onPress={() => openForm(sub.id)} style={({ pressed }) => [styles.editBtn, { borderColor: theme.border, backgroundColor: theme.surface2 }, pressed && { opacity: 0.7 }]}>
                    <Text style={{ color: theme.violet, fontSize: 13, fontWeight: '600' }}>Rate Subject</Text>
                  </Pressable>
                )}
              </View>
            );
          })
        )}
      </Screen>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  cardInfo: { flex: 1, minWidth: 0 },
  subjectName: { fontSize: 14, fontWeight: '700' },
  subjectMeta: { fontSize: 11, marginTop: 3 },
  rateLabel: { fontSize: 13, fontWeight: '600', marginTop: 14, marginBottom: 4 },
  stars: { flexDirection: 'row', gap: 8, marginVertical: 10 },
  textArea: { padding: 12, borderRadius: 12, borderWidth: 1, fontSize: 13, minHeight: 90, textAlignVertical: 'top', marginBottom: 12 },
  submittedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  submittedText: { fontSize: 12, fontWeight: '600' },
  editBtn: { marginTop: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
});
