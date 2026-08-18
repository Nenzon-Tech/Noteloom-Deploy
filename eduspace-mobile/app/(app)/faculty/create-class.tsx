import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { useErrorPopup } from '../../../contexts/ErrorPopupContext';
import { Screen } from '../../../components/ui/Screen';
import { Field } from '../../../components/ui/Field';
import { GradButton } from '../../../components/ui/GradButton';
import { API_BASE } from '../../../lib/constants';
import { authHeaders } from '../../../lib/api';
import { getSessionToken } from '../../../lib/storage';

export default function CreateClass() {
  const { theme } = useTheme();
  const router = useRouter();
  const { triggerPopup } = useErrorPopup();

  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [stream, setStream] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState('3');
  const [batchYear, setBatchYear] = useState('2025');
  const [loading, setLoading] = useState(false);

  const createClass = async () => {
    if (!subjectName.trim() || !subjectCode.trim()) {
      triggerPopup('Subject name and code are required');
      return;
    }
    setLoading(true);
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/classrooms`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({
          subjectName: subjectName.trim(),
          subjectCode: subjectCode.trim().toUpperCase(),
          batchYear: parseInt(batchYear) || 2025,
          stream: stream.trim(),
          semester: parseInt(semester) || 3,
          addMode: 'later',
        }),
      });
      const data = await response.json();
      if (response.ok) {
        router.back();
      } else {
        triggerPopup(data.error || 'Failed to create class');
      }
    } catch {
      triggerPopup('Network error — could not create class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <ArrowLeft size={20} color={theme.fg} />
        </Pressable>

        <Text style={[styles.title, { color: theme.fg }]}>Create Class</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>A class lets you share modules, notes and videos with students.</Text>

        <Field placeholder="Subject name (e.g. Data Structures)" value={subjectName} onChangeText={setSubjectName} />
        <Field placeholder="Subject code (e.g. CS-501)" value={subjectCode} onChangeText={setSubjectCode} autoCapitalize="characters" />
        <Field placeholder="Stream" value={stream} onChangeText={setStream} />
        <Field placeholder="Semester" value={semester} onChangeText={setSemester} keyboardType="numeric" />
        <Field placeholder="Batch year" value={batchYear} onChangeText={setBatchYear} keyboardType="numeric" />

        <GradButton fullWidth size="lg" onPress={createClass} loading={loading} icon={loading ? undefined : <Check size={18} color="#fff" />}>
          {loading ? 'Creating…' : 'Create Class'}
        </GradButton>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 16, paddingBottom: 40 },
  backBtn: { marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, lineHeight: 19, marginTop: 4, marginBottom: 20 },
});