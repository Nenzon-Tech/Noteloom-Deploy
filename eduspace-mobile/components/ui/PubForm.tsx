import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Gradient } from './Gradient';
import { GradButton } from './GradButton';

interface PubFormProps {
  title: string;
  bodyLabel: string;
  audiences: string[];
  submitLabel?: string;
  onPublish?: (data: { title: string; body: string; audience: string }) => void;
}

export const PubForm = ({ title, bodyLabel, audiences, submitLabel = 'Publish Notice', onPublish }: PubFormProps) => {
  const { theme } = useTheme();
  const [titleVal, setTitleVal] = useState('');
  const [body, setBody] = useState('');
  const [aud, setAud] = useState(audiences[0]);

  return (
    <View style={[styles.form, { backgroundColor: theme.surface, borderColor: theme.border, ...theme.elev1 }]}>
      <Text style={[styles.label, { color: theme.faint }]}>{title}</Text>
      <TextInput
        value={titleVal}
        onChangeText={setTitleVal}
        placeholder="Notice title…"
        placeholderTextColor={theme.faint}
        style={[styles.input, { backgroundColor: theme.surface2, borderColor: theme.border, color: theme.fg }]}
      />
      <Text style={[styles.label, { color: theme.faint }]}>{bodyLabel}</Text>
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="What should students know?"
        placeholderTextColor={theme.faint}
        multiline
        style={[styles.textarea, { backgroundColor: theme.surface2, borderColor: theme.border, color: theme.fg }]}
      />
      <Text style={[styles.label, { color: theme.faint }]}>Audience</Text>
      <View style={styles.audWrap}>
        {audiences.map(a => {
          const active = a === aud;
          return (
            <Pressable
              key={a}
              onPress={() => setAud(a)}
              style={[
                styles.aud,
                { backgroundColor: active ? 'transparent' : theme.surface2, borderColor: active ? 'transparent' : theme.border },
              ]}
            >
              {active ? (
                <Gradient colors={theme.gradientBrand} angle={135} style={StyleSheet.absoluteFill} radius={999} />
              ) : null}
              <Text style={[styles.audText, { color: active ? '#fff' : theme.muted }]}>{a}</Text>
            </Pressable>
          );
        })}
      </View>
      <GradButton
        fullWidth
        size="md"
        style={styles.submit}
        onPress={() => onPublish?.({ title: titleVal, body, audience: aud })}
      >
        {submitLabel}
      </GradButton>
    </View>
  );
};

const styles = StyleSheet.create({
  form: { borderRadius: 18, borderWidth: 1, padding: 14, marginBottom: 16 },
  label: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.7, marginVertical: 10 },
  input: { borderRadius: 11, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 11, fontSize: 13 },
  textarea: { borderRadius: 11, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 11, fontSize: 13, height: 78, textAlignVertical: 'top' },
  audWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  aud: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, overflow: 'hidden' },
  audText: { fontSize: 11, fontWeight: '600' },
  submit: { marginTop: 12 },
});

export default PubForm;
