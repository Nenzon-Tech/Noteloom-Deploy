import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft, FileText, Video, Download, Check, Circle, Lock, Unlock, FileDown, Loader2,
} from 'lucide-react-native';
import { Image } from 'react-native';
import { useTheme } from '../../../../contexts/ThemeContext';
import { API_BASE } from '../../../../lib/constants';
import { getSessionToken } from '../../../../lib/storage';
import GlassHeader from '../../../../components/ui/GlassHeader';
import CustomVideoPlayer from '../../../../components/ui/CustomVideoPlayer';
import ModernPDFViewer from '../../../../components/ui/ModernPDFViewer';

const { width } = Dimensions.get('window');

export default function ContentDetailScreen() {
  const { classId, contentId } = useLocalSearchParams<{ classId: string; contentId: string }>();
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
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
        fetch(`${API_BASE}/api/classrooms/${classId}/content/${contentId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/classrooms/${classId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/session/info`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (contentRes.ok) {
        const data = await contentRes.json();
        setContent(data);
        setIsCompleted(data.isCompleted || false);
        setAllowDownload(data.allowDownload !== false);
      }
      if (classRes.ok) setClassroom(await classRes.json());
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
      await fetch(`${API_BASE}/api/classrooms/${classId}/content/${contentId}/complete`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !isCompleted }),
      });
      setIsCompleted(!isCompleted);
    } catch (err) { console.error(err); }
  };

  const toggleDownloadPermission = async () => {
    try {
      const token = await getSessionToken();
      await fetch(`${API_BASE}/api/classrooms/${classId}/content/${contentId}/download`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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
      <View style={[styles.loadingContainer, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (!content) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
        <Text style={{ color: isDarkMode ? '#d1d5db' : '#4b5563' }}>Content not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
      <GlassHeader variant="dashboard">
        <View style={[styles.headerInner, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={isDarkMode ? 'white' : '#111827'} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : '#111827' }]} numberOfLines={1}>
              {content.title}
            </Text>
            <Text style={[styles.headerBreadcrumb, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]} numberOfLines={1}>
              {classroom?.name} / {content.moduleName || 'Content'}
            </Text>
          </View>
          {isFaculty && (
            <TouchableOpacity onPress={toggleDownloadPermission} style={[styles.permissionBtn, { backgroundColor: allowDownload ? 'rgba(5,150,105,0.2)' : 'rgba(239,68,68,0.2)' }]}>
              {allowDownload ? <Unlock size={16} color="#059669" /> : <Lock size={16} color="#ef4444" />}
              <Text style={[styles.permissionText, { color: allowDownload ? '#059669' : '#ef4444' }]}>
                {allowDownload ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </GlassHeader>

      <ScrollView style={[styles.scroll, { paddingTop: 80 }]} contentContainerStyle={{ paddingBottom: 40 }}>
        {isVideo && content.fileUrl && (
          <View style={styles.viewerContainer}>
            <CustomVideoPlayer videoUrl={content.fileUrl} title={content.title} allowDownload={allowDownload} />
          </View>
        )}

        {isPDF && content.fileUrl && (
          <View style={[styles.pdfContainer, { minHeight: 400 }]}>
            <ModernPDFViewer fileUrl={content.fileUrl} allowDownload={allowDownload} />
          </View>
        )}

        {isImage && content.fileUrl && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: content.fileUrl }} style={styles.image} resizeMode="contain" />
          </View>
        )}

        <View style={styles.detailsSection}>
          <Text style={[styles.contentTitle, { color: isDarkMode ? 'white' : '#111827' }]}>{content.title}</Text>
          {content.description && (
            <Text style={[styles.description, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>{content.description}</Text>
          )}

          {!isFaculty && (
            <TouchableOpacity onPress={toggleComplete} style={[styles.completeBtn, isCompleted && { backgroundColor: '#059669' }]}>
              {isCompleted ? (
                <><Check size={18} color="white" /><Text style={styles.completeText}>Completed</Text></>
              ) : (
                <><Circle size={18} color="white" /><Text style={styles.completeText}>Mark as Completed</Text></>
              )}
            </TouchableOpacity>
          )}

          {content.attachments && content.attachments.length > 0 && (
            <View style={styles.attachments}>
              <Text style={[styles.attachmentsTitle, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>Attachments</Text>
              {content.attachments.map((att: any, idx: number) => (
                <TouchableOpacity key={idx} style={[styles.attachmentItem, { backgroundColor: isDarkMode ? 'rgba(30,41,59,0.5)' : 'rgba(243,244,246,0.8)' }]}>
                  <FileText size={16} color="#3b82f6" />
                  <Text style={[styles.attachmentName, { color: isDarkMode ? '#e5e7eb' : '#374151' }]}>{att.name || `Attachment ${idx + 1}`}</Text>
                  <Download size={14} color="#6b7280" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {content.type === 'assignment' && (
            <View style={[styles.assignmentBox, { backgroundColor: isDarkMode ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.05)', borderColor: isDarkMode ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.2)' }]}>
              <FileDown size={24} color="#7c3aed" />
              <Text style={[styles.assignmentTitle, { color: isDarkMode ? '#e5e7eb' : '#374151' }]}>Submit Assignment</Text>
              <TouchableOpacity style={styles.submitBtn}>
                <Text style={styles.submitText}>Upload</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  headerInner: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 4, paddingBottom: 8 },
  backBtn: { padding: 8 },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 15, fontWeight: '700' },
  headerBreadcrumb: { fontSize: 11 },
  permissionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  permissionText: { fontSize: 11, fontWeight: '700' },
  viewerContainer: { width: width, height: (width * 9) / 16 },
  pdfContainer: { width: width, paddingHorizontal: 0 },
  imageContainer: { width: width, height: 300, padding: 16 },
  image: { width: '100%', height: '100%', borderRadius: 12 },
  detailsSection: { padding: 16, gap: 12 },
  contentTitle: { fontSize: 20, fontWeight: '800' },
  description: { fontSize: 14, lineHeight: 20 },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7c3aed',
    paddingVertical: 12,
    borderRadius: 12,
  },
  completeText: { color: 'white', fontSize: 14, fontWeight: '600' },
  attachments: { gap: 8 },
  attachmentsTitle: { fontSize: 14, fontWeight: '700' },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
  },
  attachmentName: { flex: 1, fontSize: 13, fontWeight: '500' },
  assignmentBox: {
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  assignmentTitle: { fontSize: 16, fontWeight: '700' },
  submitBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  submitText: { color: 'white', fontSize: 14, fontWeight: '600' },
});
