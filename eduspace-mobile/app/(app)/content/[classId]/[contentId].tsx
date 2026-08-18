import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FileText, Download, Check, Circle, Lock, Unlock, FileDown } from 'lucide-react-native';
import { useTheme } from '../../../../contexts/ThemeContext';
import { API_BASE } from '../../../../lib/constants';
import { authHeaders } from '../../../../lib/api';
import { getSessionToken } from '../../../../lib/storage';
import { Screen } from '../../../../components/ui/Screen';
import { SubHeader } from '../../../../components/ui/SubHeader';
import { ListCard, LRow } from '../../../../components/ui/ListCard';
import { GradButton, GhostButton } from '../../../../components/ui/GradButton';
import CustomVideoPlayer from '../../../../components/ui/CustomVideoPlayer';
import ModernPDFViewer from '../../../../components/ui/ModernPDFViewer';

export default function ContentDetailScreen() {
  const { classId, contentId } = useLocalSearchParams<{ classId: string; contentId: string }>();
  const { theme } = useTheme();
  const router = useRouter();

  const [content, setContent] = useState<any>(null);
  const [classroom, setClassroom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [allowDownload, setAllowDownload] = useState(true);

  useEffect(() => { fetchContent(); }, [contentId]);

  const fetchContent = async () => {
    try {
      const token = await getSessionToken();
      const [contentRes, classRes, infoRes] = await Promise.all([
        fetch(`${API_BASE}/api/content/${contentId}`, { headers: authHeaders(token) }),
        fetch(`${API_BASE}/api/classrooms`, { headers: authHeaders(token) }),
        fetch(`${API_BASE}/session/info`, { headers: authHeaders(token) }),
      ]);
      if (contentRes.ok) {
        const data = await contentRes.json();
        setContent(data);
        setIsCompleted(data.isCompleted || false);
        setAllowDownload(data.allowDownload !== false);
      }
      if (classRes.ok) {
        const all = await classRes.json();
        const found = Array.isArray(all) ? all.find((c: any) => c._id === classId) : null;
        setClassroom(found || null);
      }
      if (infoRes.ok) setProfile(await infoRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async () => {
    try {
      const token = await getSessionToken();
      await fetch(`${API_BASE}/api/content/${contentId}/complete`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ isCompleted: !isCompleted }),
      });
      setIsCompleted(!isCompleted);
    } catch (err) { console.error(err); }
  };

  const toggleDownloadPermission = async () => {
    try {
      const token = await getSessionToken();
      await fetch(`${API_BASE}/api/content/${contentId}/toggle-download`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({ allowDownload: !allowDownload }),
      });
      setAllowDownload(!allowDownload);
    } catch (err) { console.error(err); }
  };

  const isFaculty = profile?.role === 'faculty' || profile?.role === 'college_admin';
  const isVideo = content?.fileType === 'video' || content?.fileType === 'lecture';
  const isPDF = content?.fileType === 'pdf' || content?.fileType === 'note' || content?.fileType === 'document';
  const isImage = content?.fileType === 'image';

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.violet} />
      </View>
    );
  }

  if (!content) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.bg }]}>
        <Text style={{ color: theme.muted }}>Content not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 40 }}>
        <View style={styles.headerPad}>
          <SubHeader title={content.title} subtitle={`${classroom?.name} / ${content.moduleName || 'Content'}`} />

          {isFaculty && (
            <Pressable
              onPress={toggleDownloadPermission}
              style={[styles.permissionRow, { backgroundColor: allowDownload ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', borderColor: allowDownload ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)' }]}
            >
              {allowDownload ? <Unlock size={16} color={theme.green} /> : <Lock size={16} color={theme.red} />}
              <Text style={[styles.permissionText, { color: allowDownload ? theme.green : theme.red }]}>
                Download {allowDownload ? 'Enabled' : 'Disabled'}
              </Text>
            </Pressable>
          )}
        </View>

        {isVideo && content.fileUrl && (
          <View style={styles.viewer}>
            <CustomVideoPlayer videoUrl={content.fileUrl} title={content.title} allowDownload={allowDownload} />
          </View>
        )}

        {isPDF && content.fileUrl && (
          <View style={styles.pdfContainer}>
            <ModernPDFViewer fileUrl={content.fileUrl} allowDownload={allowDownload} />
          </View>
        )}

        {isImage && content.fileUrl && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: content.fileUrl }} style={styles.image} resizeMode="contain" />
          </View>
        )}

        <View style={styles.details}>
          <Text style={[styles.contentTitle, { color: theme.fg }]}>{content.title}</Text>
          {content.description && (
            <Text style={[styles.description, { color: theme.muted }]}>{content.description}</Text>
          )}

          {!isFaculty && (
            <GradButton
              fullWidth
              size="lg"
              onPress={toggleComplete}
              icon={isCompleted ? <Check size={18} color="#fff" /> : <Circle size={18} color="#fff" />}
            >
              {isCompleted ? 'Completed' : 'Mark as Completed'}
            </GradButton>
          )}

          {content.attachments && content.attachments.length > 0 && (
            <View style={styles.attachments}>
              <Text style={[styles.attachmentsTitle, { color: theme.fg }]}>Attachments</Text>
              <ListCard>
                {content.attachments.map((att: any, idx: number) => (
                  <LRow
                    key={idx}
                    icon={<FileText size={18} color={theme.blue} />}
                    iconBg="rgba(59,130,246,0.12)"
                    title={att.name || att.originalName || `Attachment ${idx + 1}`}
                    subtitle="Attachment"
                    trailing={<Download size={16} color={theme.faint} />}
                    last={idx === content.attachments.length - 1}
                  />
                ))}
              </ListCard>
            </View>
          )}

          {content.type === 'assignment' && (
            <View style={[styles.assignmentBox, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
              <FileDown size={24} color={theme.violet} />
              <Text style={[styles.assignmentTitle, { color: theme.fg }]}>Submit Assignment</Text>
              <GhostButton style={styles.submitBtn}>Upload</GhostButton>
            </View>
          )}
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerPad: { paddingHorizontal: 16 },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 14,
  },
  permissionText: { fontSize: 12, fontWeight: '700' },
  viewer: { width: '100%', aspectRatio: 16 / 9 },
  pdfContainer: { width: '100%', minHeight: 400 },
  imageContainer: { width: '100%', height: 300, padding: 16 },
  image: { width: '100%', height: '100%', borderRadius: 12 },
  details: { padding: 16, gap: 14 },
  contentTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  description: { fontSize: 14, lineHeight: 21 },
  attachments: { gap: 8 },
  attachmentsTitle: { fontSize: 14, fontWeight: '700' },
  assignmentBox: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
  },
  assignmentTitle: { fontSize: 16, fontWeight: '700' },
  submitBtn: { paddingHorizontal: 28 },
});
