import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft, BookOpen, FileText, Video, Image, MoreVertical, Check, Circle, Download, Upload, X,
} from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { API_BASE } from '../../../lib/constants';
import { getSessionToken } from '../../../lib/storage';
import GlassHeader from '../../../components/ui/GlassHeader';

const { width } = Dimensions.get('window');

interface ModuleItem {
  _id: string;
  name: string;
  description?: string;
}

interface ContentItem {
  _id: string;
  title: string;
  description?: string;
  fileType: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  isCompleted: boolean;
  allowDownload: boolean;
  moduleId: string;
  createdAt: string;
}

export default function ClassroomView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [classroom, setClassroom] = useState<any>(null);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [filterTab, setFilterTab] = useState('All');

  const tabs = ['All', 'Lectures', 'Notes', 'Assignment', 'Updates'];

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const token = await getSessionToken();
      const [classRes, infoRes] = await Promise.all([
        fetch(`${API_BASE}/api/classrooms/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/session/info`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (classRes.ok) {
        const data = await classRes.json();
        setClassroom(data);
        setModules(data.modules || []);
        setContents(data.contents || []);
        if (data.modules?.length > 0) setActiveModule(data.modules[0]._id);
      }
      if (infoRes.ok) {
        const info = await infoRes.json();
        setProfile(info);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [id]);

  const toggleComplete = async (contentId: string, currentStatus: boolean) => {
    try {
      const token = await getSessionToken();
      await fetch(`${API_BASE}/api/classrooms/${id}/content/${contentId}/complete`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !currentStatus }),
      });
      setContents((prev) => prev.map((c) => c._id === contentId ? { ...c, isCompleted: !currentStatus } : c));
    } catch (err) { console.error(err); }
  };

  const filteredContents = contents.filter((c) => {
    if (activeModule && c.moduleId !== activeModule) return false;
    if (filterTab === 'All') return true;
    if (filterTab === 'Lectures') return c.fileType === 'video' || c.fileType === 'lecture';
    if (filterTab === 'Notes') return c.fileType === 'pdf' || c.fileType === 'note';
    if (filterTab === 'Assignment') return c.fileType === 'assignment';
    if (filterTab === 'Updates') return c.fileType === 'announcement' || c.fileType === 'update';
    return true;
  });

  const isFaculty = profile?.role === 'faculty' || profile?.role === 'college_admin';
  const activeModuleData = modules.find((m) => m._id === activeModule);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
        <ActivityIndicator size="large" color="#7c3aed" />
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
              {classroom?.name || 'Classroom'}
            </Text>
            {classroom?.subjectCode && (
              <Text style={[styles.headerSub, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>
                {classroom.subjectCode}
              </Text>
            )}
          </View>
        </View>
      </GlassHeader>

      <View style={{ flex: 1, paddingTop: 80 }}>
        <View style={styles.body}>
          <ScrollView style={styles.sidebar} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sidebarTitle, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>Modules</Text>
            {modules.map((mod) => (
              <TouchableOpacity
                key={mod._id}
                onPress={() => setActiveModule(mod._id)}
                style={[
                  styles.moduleItem,
                  activeModule === mod._id && { backgroundColor: '#7c3aed' },
                ]}
              >
                <Text
                  style={[
                    styles.moduleText,
                    { color: isDarkMode ? '#e5e7eb' : '#374151' },
                    activeModule === mod._id && { color: 'white' },
                  ]}
                  numberOfLines={2}
                >
                  {mod.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.mainContent}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabBar}
              contentContainerStyle={{ gap: 8, paddingHorizontal: 12 }}
            >
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setFilterTab(tab)}
                  style={[styles.tab, filterTab === tab && { backgroundColor: '#7c3aed' }]}
                >
                  <Text style={[styles.tabText, filterTab === tab && { color: 'white' }]}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView
              style={styles.contentGrid}
              contentContainerStyle={{ padding: 12, gap: 12 }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
            >
              {filteredContents.length === 0 ? (
                <View style={styles.emptyState}>
                  <BookOpen size={48} color={isDarkMode ? '#6b7280' : '#9ca3af'} opacity={0.4} />
                  <Text style={[styles.emptyText, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>No content yet</Text>
                </View>
              ) : (
                filteredContents.map((item) => {
                  const getIcon = () => {
                    if (item.fileType === 'video' || item.fileType === 'lecture') return <Video size={20} color="#3b82f6" />;
                    if (item.fileType === 'pdf' || item.fileType === 'note') return <FileText size={20} color="#f59e0b" />;
                    if (item.fileType === 'image') return <Image size={20} color="#10b981" />;
                    return <FileText size={20} color="#6b7280" />;
                  };

                  return (
                    <TouchableOpacity
                      key={item._id}
                      style={[styles.contentCard, { backgroundColor: isDarkMode ? 'rgba(30,41,59,0.7)' : 'white', borderColor: isDarkMode ? 'rgba(55,65,81,0.5)' : 'rgba(229,231,235,0.5)' }]}
                      onPress={() => router.push(`/(app)/content/${id}/${item._id}` as any)}
                    >
                      <View style={styles.cardHeader}>
                        {getIcon()}
                        <TouchableOpacity
                          onPress={() => toggleComplete(item._id, item.isCompleted)}
                          style={[styles.completeBtn, item.isCompleted && { backgroundColor: '#059669' }]}
                        >
                          {item.isCompleted ? <Check size={16} color="white" /> : <Circle size={16} color={isDarkMode ? '#6b7280' : '#9ca3af'} />}
                        </TouchableOpacity>
                      </View>
                      <Text style={[styles.cardTitle, { color: isDarkMode ? 'white' : '#111827' }]} numberOfLines={2}>{item.title}</Text>
                      {item.description && (
                        <Text style={[styles.cardDesc, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]} numberOfLines={2}>{item.description}</Text>
                      )}
                      <View style={styles.cardFooter}>
                        <Text style={styles.cardDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                        {isFaculty && item.allowDownload && (
                          <Download size={14} color="#3b82f6" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerInner: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 4, paddingBottom: 8 },
  backBtn: { padding: 8 },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  headerSub: { fontSize: 12 },
  body: { flex: 1, flexDirection: 'row' },
  sidebar: { width: 80, paddingHorizontal: 8, paddingTop: 12 },
  sidebarTitle: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingHorizontal: 4 },
  moduleItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 4,
  },
  moduleText: { fontSize: 11, fontWeight: '600' },
  mainContent: { flex: 1 },
  tabBar: { maxHeight: 44, paddingVertical: 8 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tabText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  contentGrid: { flex: 1 },
  contentCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  completeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  cardDesc: { fontSize: 12, lineHeight: 17 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  cardDate: { fontSize: 10, color: '#6b7280' },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14 },
});
