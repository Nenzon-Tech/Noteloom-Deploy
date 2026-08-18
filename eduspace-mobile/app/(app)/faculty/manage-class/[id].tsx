import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, ActivityIndicator, TextInput, ScrollView, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, FolderPlus, Upload, FileText, Plus, Check } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useErrorPopup } from '../../../../contexts/ErrorPopupContext';
import { Screen } from '../../../../components/ui/Screen';
import { Field } from '../../../../components/ui/Field';
import { GradButton } from '../../../../components/ui/GradButton';
import { ListCard, LRow } from '../../../../components/ui/ListCard';
import { API_BASE } from '../../../../lib/constants';
import { authHeaders } from '../../../../lib/api';
import { getSessionToken } from '../../../../lib/storage';

export default function ManageClassContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const router = useRouter();
  const { triggerPopup } = useErrorPopup();

  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [creatingModule, setCreatingModule] = useState(false);

  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [contentTitle, setContentTitle] = useState('');
  const [contentDesc, setContentDesc] = useState('');
  const [doc, setDoc] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const fetchModules = useCallback(async () => {
    try {
      const token = await getSessionToken();
      const res = await fetch(`${API_BASE}/api/classrooms/${id}/modules`, { headers: authHeaders(token) });
      if (res.ok) {
        const data = await res.json();
        setModules(Array.isArray(data) ? data : []);
        if (!selectedModule && Array.isArray(data) && data.length > 0) setSelectedModule(data[0]._id);
      }
    } catch {}
    finally { setLoading(false); }
  }, [id, selectedModule]);

  useEffect(() => { fetchModules(); }, []);

  const createModule = async () => {
    if (!newModuleTitle.trim()) { triggerPopup('Module title required'); return; }
    setCreatingModule(true);
    try {
      const token = await getSessionToken();
      const res = await fetch(`${API_BASE}/api/classrooms/${id}/modules`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ title: newModuleTitle.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewModuleTitle('');
        setModules(prev => [...prev, data]);
        setSelectedModule(data._id);
      } else {
        triggerPopup(data.error || 'Failed to create module');
      }
    } catch { triggerPopup('Network error'); }
    finally { setCreatingModule(false); }
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      setDoc({ uri: asset.uri, name: asset.name, type: asset.mimeType || 'application/octet-stream' });
    } catch { triggerPopup('Could not pick file'); }
  };

  const uploadContent = async () => {
    if (!selectedModule) { triggerPopup('Create or select a module first'); return; }
    if (!contentTitle.trim()) { triggerPopup('Content title required'); return; }
    if (!doc) { triggerPopup('Pick a file to upload'); return; }

    setUploading(true);
    try {
      const token = await getSessionToken();
      const form = new FormData();
      form.append('title', contentTitle.trim());
      form.append('description', contentDesc.trim());
      form.append('type', 'note');
      form.append('allowDownload', 'true');
      form.append('files', { uri: doc.uri, name: doc.name, type: doc.type } as any);

      const res = await fetch(`${API_BASE}/api/modules/${selectedModule}/content`, {
        method: 'POST',
        headers: {
          ...authHeaders(token),
          'Content-Type': 'multipart/form-data',
        },
        body: form,
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', 'Content uploaded to module');
        setContentTitle('');
        setContentDesc('');
        setDoc(null);
        fetchModules();
      } else {
        triggerPopup(data.error || 'Upload failed');
      }
    } catch { triggerPopup('Upload failed — network error'); }
    finally { setUploading(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <ArrowLeft size={20} color={theme.fg} />
        </Pressable>
        <Text style={[styles.title, { color: theme.fg }]}>Manage Class Content</Text>

        {/* Create module */}
        <View style={[styles.section, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.fg }]}>New Module</Text>
          <Field placeholder="Module title (e.g. Unit 1: Arrays)" value={newModuleTitle} onChangeText={setNewModuleTitle} />
          <GradButton onPress={createModule} loading={creatingModule} icon={creatingModule ? undefined : <Plus size={16} color="#fff" />}>
            {creatingModule ? 'Creating…' : 'Add Module'}
          </GradButton>
        </View>

        {/* Module list */}
        {loading ? (
          <ActivityIndicator color={theme.violet} style={{ paddingVertical: 40 }} />
        ) : modules.length > 0 ? (
          <View style={styles.modules}>
            <Text style={[styles.sectionTitle, { color: theme.fg }]}>Modules ({modules.length})</Text>
            {modules.map(m => (
              <ListCard key={m._id}>
                <LRow
                  icon={<FileText size={18} color={theme.blue} />}
                  iconBg="rgba(59,130,246,0.12)"
                  title={m.title}
                  subtitle="Module"
                  onPress={() => setSelectedModule(m._id)}
                  trailing={selectedModule === m._id ? <Check size={18} color={theme.green} /> : undefined}
                />
              </ListCard>
            ))}
          </View>
        ) : (
          <Text style={{ color: theme.muted, textAlign: 'center', paddingVertical: 20 }}>No modules yet.</Text>
        )}

        {/* Upload */}
        <View style={[styles.section, { backgroundColor: theme.surface2, borderColor: theme.border, marginTop: 6 }]}>
          <Text style={[styles.sectionTitle, { color: theme.fg }]}>Upload Content</Text>
          <Text style={[styles.hint, { color: theme.muted }]}>
            Target: {selectedModule ? (modules.find(m => m._id === selectedModule)?.title || 'module') : '— select a module'}
          </Text>
          <Field placeholder="Content title" value={contentTitle} onChangeText={setContentTitle} />
          <Field placeholder="Description (optional)" value={contentDesc} onChangeText={setContentDesc} />

          <Pressable onPress={pickFile} style={[styles.pickBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <FileText size={18} color={theme.violet} />
            <Text style={{ color: doc ? theme.fg : theme.muted, flex: 1 }}>
              {doc ? doc.name : 'Tap to choose a file (PDF / image / video)'}
            </Text>
          </Pressable>

          <GradButton fullWidth size="lg" onPress={uploadContent} loading={uploading} icon={uploading ? undefined : <Check size={18} color="#fff" />}>
            {uploading ? 'Uploading…' : 'Upload Content'}
          </GradButton>
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 16, paddingBottom: 40 },
  backBtn: { marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  section: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  hint: { fontSize: 12, marginBottom: 10 },
  modules: { marginBottom: 8 },
  pickBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 14 },
});