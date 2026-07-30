import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileText, Download, Share2, GraduationCap, User, Hash, Building, CalendarDays } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import GlassHeader from '../../../components/ui/GlassHeader';

export default function AdmitCard() {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [generating, setGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    setGenerating(true);
    // PDF generation logic would go here via expo-print
    setTimeout(() => setGenerating(false), 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
      <GlassHeader variant="dashboard">
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <FileText size={22} color="#7c3aed" />
          <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Admit Card</Text>
        </View>
      </GlassHeader>

      <ScrollView contentContainerStyle={{ paddingTop: 80, padding: 16 }}>
        <View style={[styles.card, { backgroundColor: isDarkMode ? 'rgba(30,41,59,0.4)' : 'white', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
          <View style={styles.cardHeader}>
            <GraduationCap size={32} color="#7c3aed" />
            <Text style={[styles.cardTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Digital Admit Card</Text>
          </View>

          <View style={[styles.qrPlaceholder, { borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
            <View style={[styles.qrBox, { backgroundColor: isDarkMode ? '#1e293b' : '#f3f4f6' }]}>
              <Hash size={48} color={isDarkMode ? '#6b7280' : '#9ca3af'} />
            </View>
            <Text style={[styles.qrLabel, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>QR Code</Text>
          </View>

          <View style={styles.infoSection}>
            <InfoRow icon={Building} label="Institution" value="Institute of Engineering Management Kolkata" isDarkMode={isDarkMode} />
            <InfoRow icon={GraduationCap} label="Program" value="B.Tech Computer Science" isDarkMode={isDarkMode} />
            <InfoRow icon={CalendarDays} label="Exam Cycle" value="Even Semester 2026" isDarkMode={isDarkMode} />
            <InfoRow icon={User} label="Student Name" value="John Doe" isDarkMode={isDarkMode} />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={handleGeneratePDF} disabled={generating} style={[styles.actionBtn, { opacity: generating ? 0.7 : 1 }]}>
              {generating ? <ActivityIndicator color="white" /> : <Download size={18} color="white" />}
              <Text style={styles.actionText}>{generating ? 'Generating...' : 'Download PDF'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.shareBtn, { backgroundColor: isDarkMode ? '#374151' : '#f3f4f6' }]}>
              <Share2 size={18} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
              <Text style={[styles.shareText, { color: isDarkMode ? '#e5e7eb' : '#374151' }]}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const InfoRow = ({ icon: Icon, label, value, isDarkMode }: any) => (
  <View style={infoStyles.row}>
    <Icon size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
    <View style={infoStyles.text}>
      <Text style={[infoStyles.label, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{label}</Text>
      <Text style={[infoStyles.value, { color: isDarkMode ? 'white' : '#111827' }]}>{value}</Text>
    </View>
  </View>
);

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 16 },
  text: { flex: 1 },
  label: { fontSize: 12, marginBottom: 2 },
  value: { fontSize: 15, fontWeight: '600' },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4, paddingBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  card: { padding: 24, borderRadius: 20, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
  cardTitle: { fontSize: 22, fontWeight: '700' },
  qrPlaceholder: { alignItems: 'center', marginBottom: 24, borderWidth: 1, borderRadius: 16, padding: 16, borderStyle: 'dashed' },
  qrBox: { width: 100, height: 100, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  qrLabel: { fontSize: 12 },
  infoSection: { marginBottom: 24 },
  actions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, backgroundColor: '#7c3aed', paddingVertical: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionText: { color: 'white', fontSize: 15, fontWeight: '600' },
  shareBtn: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  shareText: { fontSize: 15, fontWeight: '600' },
});
