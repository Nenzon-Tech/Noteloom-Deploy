import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, Pressable, StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BookOpen, FileText, Video, Image, Check, Circle, Download, FolderOpen } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { API_BASE } from '../../../lib/constants';
import { authHeaders } from '../../../lib/api';
import { getSessionToken } from '../../../lib/storage';
import { Screen } from '../../../components/ui/Screen';
import { SubHeader } from '../../../components/ui/SubHeader';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { FilterChips } from '../../../components/ui/FilterChips';
import { ListCard, LRow } from '../../../components/ui/ListCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Gradient } from '../../../components/ui/Gradient';

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
  const { theme } = useTheme();
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
        fetch(`${API_BASE}/api/classrooms/${id}`, { headers: authHeaders(token) }),
        fetch(`${API_BASE}/session/info`, { headers: authHeaders(token) }),
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
        headers: authHeaders(token),
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

  const getIcon = (fileType: string) => {
    if (fileType === 'video' || fileType === 'lecture') {
      return { icon: <Video size={20} color={theme.blue} />, color: theme.blue, bg: 'rgba(59,130,246,0.12)' };
    }
    if (fileType === 'pdf' || fileType === 'note') {
      return { icon: <FileText size={20} color={theme.amber} />, color: theme.amber, bg: 'rgba(245,158,11,0.12)' };
    }
    if (fileType === 'image') {
      return { icon: <Image size={20} color={theme.green} />, color: theme.green, bg: 'rgba(16,185,129,0.12)' };
    }
    return { icon: <FileText size={20} color={theme.violet} />, color: theme.violet, bg: 'rgba(124,58,237,0.12)' };
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.violet} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.violet} />}>
        <SubHeader title={classroom?.name || 'Classroom'} subtitle={classroom?.subjectCode} />

        <Gradient colors={theme.gradientBrand} angle={135} radius={20} style={styles.hero}>
          <View style={styles.heroHead}>
            <Text style={styles.heroTitle} numberOfLines={1}>{classroom?.name || 'Classroom'}</Text>
            {classroom?.subjectCode && (
              <View style={styles.pill}>
                <Text style={styles.pillText}>{classroom.subjectCode}</Text>
              </View>
            )}
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <FolderOpen size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.heroStatValue}>{modules.length}</Text>
              <Text style={styles.heroStatLabel}>Modules</Text>
            </View>
            <View style={styles.heroDot} />
            <View style={styles.heroStat}>
              <FileText size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.heroStatValue}>{contents.length}</Text>
              <Text style={styles.heroStatLabel}>Items</Text>
            </View>
          </View>
        </Gradient>

        {modules.length > 0 && (
          <>
            <SectionHeader title="Modules" />
            <FilterChips
              options={modules.map((m) => ({ value: m._id, label: m.name }))}
              value={activeModule || ''}
              onChange={(v) => setActiveModule(v)}
            />
          </>
        )}

        <SectionHeader title={activeModuleData ? `${activeModuleData.name}` : 'Content'} />
        <FilterChips options={tabs.map((t) => ({ value: t, label: t }))} value={filterTab} onChange={setFilterTab} />

        {filteredContents.length === 0 ? (
          <EmptyState icon={<BookOpen size={44} color={theme.faint} />} message="No content yet" />
        ) : (
          filteredContents.map((item) => {
            const { icon, color, bg } = getIcon(item.fileType);
            return (
              <ListCard key={item._id}>
                <LRow
                  icon={icon}
                  iconColor={color}
                  iconBg={bg}
                  title={item.title}
                  subtitle={item.description}
                  onPress={() => router.push(`/(app)/content/${id}/${item._id}` as any)}
                  trailing={
                    <View style={styles.trailing}>
                      <Pressable
                        onPress={() => toggleComplete(item._id, item.isCompleted)}
                        style={[styles.completeBtn, item.isCompleted && { backgroundColor: theme.green }]}
                      >
                        {item.isCompleted ? <Check size={16} color="#fff" /> : <Circle size={16} color={theme.faint} />}
                      </Pressable>
                      <Text style={[styles.date, { color: theme.faint }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                      {isFaculty && item.allowDownload && <Download size={13} color={theme.blue} />}
                    </View>
                  }
                  last
                />
              </ListCard>
            );
          })
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { padding: 18, marginBottom: 4 },
  heroHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: -0.4, flex: 1 },
  pill: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  pillText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  heroStats: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 14 },
  heroStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroStatValue: { color: '#fff', fontSize: 16, fontWeight: '800' },
  heroStatLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600' },
  heroDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)' },
  trailing: { alignItems: 'flex-end', gap: 6 },
  completeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,58,237,0.12)',
  },
  date: { fontSize: 10, fontWeight: '600' },
});
