import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, MapPin, Star, ArrowLeft, GraduationCap } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { API_BASE } from '../lib/constants';
import GlassHeader from '../components/ui/GlassHeader';
import ThemeToggle from '../components/ui/ThemeToggle';

interface College {
  _id: string;
  name: string;
  collegeCode: string;
  logoUrl?: string;
  location?: string;
  category?: string;
  featured?: boolean;
}

const { width } = Dimensions.get('window');

export default function CollegeSelection() {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/it-auth/public/colleges`);
      if (response.ok) {
        const data = await response.json();
        const formatted = data.map((c: any) => ({
          _id: c._id,
          name: c.name,
          location: c.location || 'Location Not Set',
          category: c.category || (c.type === 'college' ? 'Engineering' : 'University'),
          collegeCode: c.collegeCode || '0000',
          logoUrl: c.logoUrl,
          featured: c.featured === true,
        }));
        setColleges(formatted);
      }
    } catch (error) {
      console.error('Error fetching colleges:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredColleges = colleges.filter(college => {
    const matchesSearch = college.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || college.name.charAt(0).toUpperCase() === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleSelect = (college: College) => {
    // @ts-ignore - AsyncStorage-like behavior
    try { localStorage.setItem('selectedCollegeCode', college.collegeCode); } catch {}
    router.push(`/(auth)/login?code=${college.collegeCode}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
      <GlassHeader>
        <View style={[styles.headerInner, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color={isDarkMode ? '#e5e7eb' : '#374151'} />
          </TouchableOpacity>
          <View style={styles.brandRow}>
            <Text style={[styles.brandText, { color: '#7c3aed' }]}>Note Loom</Text>
            <View style={styles.betaBadge}><Text style={styles.betaText}>Beta</Text></View>
          </View>
          <ThemeToggle />
        </View>
      </GlassHeader>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingTop: 100, paddingBottom: 40, paddingHorizontal: 16 }}>
        <View style={styles.hero}>
          <Text style={[styles.heroTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Select Your Institution</Text>
          <Text style={[styles.heroSubtitle, { color: isDarkMode ? '#d1d5db' : '#6b7280' }]}>
            Choose your college to access your personalized learning dashboard.
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <Search size={22} color={isDarkMode ? '#9ca3af' : '#9ca3af'} style={styles.searchIcon} />
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search institutions..."
            placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
            style={[styles.searchInput, { backgroundColor: isDarkMode ? 'rgba(31,41,55,0.4)' : 'rgba(255,255,255,0.7)', borderColor: isDarkMode ? '#374151' : '#e5e7eb', color: isDarkMode ? 'white' : '#111827' }]}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <TouchableOpacity onPress={() => setSelectedFilter('All')} style={[styles.filterChip, selectedFilter === 'All' ? styles.filterActive : {}]}>
            <Text style={[styles.filterText, selectedFilter === 'All' ? styles.filterTextActive : { color: isDarkMode ? '#d1d5db' : '#6b7280' }]}>All</Text>
          </TouchableOpacity>
          {alphabet.map(letter => (
            <TouchableOpacity key={letter} onPress={() => setSelectedFilter(letter)} style={[styles.filterLetter, selectedFilter === letter ? styles.filterLetterActive : {}]}>
              <Text style={[styles.filterLetterText, selectedFilter === letter ? styles.filterLetterTextActive : { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{letter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7c3aed" />
            <Text style={[styles.loadingText, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>Loading institutions...</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredColleges.map((college, index) => (
              <TouchableOpacity key={college._id} onPress={() => handleSelect(college)} activeOpacity={0.7} style={[styles.collegeCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'white', borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }]}>
                {college.featured && (
                  <View style={styles.featuredBadge}>
                    <Star size={14} color="white" fill="white" />
                  </View>
                )}
                <View style={styles.collegeHeader}>
                  <View style={[styles.logoPlaceholder, { backgroundColor: isDarkMode ? 'rgba(55,65,81,0.5)' : '#f3f4f6' }]}>
                    <GraduationCap size={28} color={isDarkMode ? '#7c3aed' : '#7c3aed'} />
                  </View>
                  <View style={styles.collegeMeta}>
                    <View style={[styles.categoryBadge, { backgroundColor: isDarkMode ? '#374151' : '#f3f4f6' }]}>
                      <Text style={[styles.categoryText, { color: isDarkMode ? '#d1d5db' : '#6b7280' }]}>{college.category || 'College'}</Text>
                    </View>
                    <Text style={[styles.codeText, { color: isDarkMode ? '#6b7280' : '#9ca3af' }]}>CODE: {college.collegeCode}</Text>
                  </View>
                </View>
                <Text style={[styles.collegeName, { color: isDarkMode ? 'white' : '#111827' }]} numberOfLines={2}>{college.name}</Text>
                <View style={styles.locationRow}>
                  <MapPin size={12} color={isDarkMode ? '#9ca3af' : '#9ca3af'} />
                  <Text style={[styles.locationText, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]} numberOfLines={1}>{college.location}</Text>
                </View>
                <View style={[styles.selectBtn, { backgroundColor: '#7c3aed' }]}>
                  <Text style={styles.selectBtnText}>Select Campus</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {filteredColleges.length === 0 && !loading && (
          <View style={styles.empty}>
            <GraduationCap size={64} color={isDarkMode ? '#6b7280' : '#9ca3af'} style={{ opacity: 0.3 }} />
            <Text style={[styles.emptyTitle, { color: isDarkMode ? 'white' : '#111827' }]}>No colleges found</Text>
            <Text style={[styles.emptySubtitle, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>We couldn't find any institution matching your search.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, paddingBottom: 8 },
  backBtn: { padding: 8 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandText: { fontSize: 20, fontWeight: '700' },
  betaBadge: { backgroundColor: '#16a34a', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  betaText: { color: 'white', fontSize: 10, fontWeight: '700' },
  scroll: { flex: 1 },
  hero: { alignItems: 'center', marginBottom: 32 },
  heroTitle: { fontSize: 32, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  heroSubtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24, paddingHorizontal: 16 },
  searchContainer: { position: 'relative', marginBottom: 24, maxWidth: 600, alignSelf: 'center', width: '100%' },
  searchIcon: { position: 'absolute', left: 16, top: 16, zIndex: 1 },
  searchInput: { borderRadius: 28, paddingVertical: 14, paddingLeft: 48, paddingRight: 20, fontSize: 16, borderWidth: 2, width: '100%' },
  filterRow: { marginBottom: 24, flexGrow: 0 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  filterActive: { backgroundColor: '#7c3aed' },
  filterText: { fontSize: 14, fontWeight: '600' },
  filterTextActive: { color: 'white' },
  filterLetter: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  filterLetterActive: { backgroundColor: '#7c3aed' },
  filterLetterTextActive: { color: 'white', fontWeight: '700' },
  filterLetterText: { fontSize: 12, fontWeight: '600' },
  loadingContainer: { alignItems: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 16, fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  collegeCard: { width: (width - 48) / 2, borderRadius: 20, padding: 16, borderWidth: 1, position: 'relative' },
  featuredBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#f59e0b', padding: 6, borderRadius: 12, zIndex: 10 },
  collegeHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  logoPlaceholder: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  collegeMeta: { flex: 1 },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 4 },
  categoryText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  codeText: { fontSize: 9, fontFamily: 'monospace' },
  collegeName: { fontSize: 14, fontWeight: '700', marginBottom: 8, lineHeight: 20 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  locationText: { fontSize: 12 },
  selectBtn: { borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  selectBtnText: { color: 'white', fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginTop: 16 },
  emptySubtitle: { fontSize: 14, marginTop: 8, textAlign: 'center' },
});
