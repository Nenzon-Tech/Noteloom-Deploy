import React, { useState, useEffect } from 'react';
import { View, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { API_BASE } from '../lib/constants';
import { authHeaders } from '../lib/api';
import { publicHeaders } from '../lib/api';
import { setSecure } from '../lib/storage';
import { Screen } from '../components/ui/Screen';
import { GHeader } from '../components/ui/GHeader';
import { Avatar } from '../components/ui/Avatar';
import { SearchBar } from '../components/ui/SearchBar';
import { CollegeCard } from '../components/ui/CollegeCard';
import { EmptyState } from '../components/ui/EmptyState';

interface College {
  _id: string;
  name: string;
  collegeCode: string;
  location?: string;
  featured?: boolean;
}

export default function CollegeSelection() {
  const { theme } = useTheme();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchColleges(); }, []);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/auth/public/colleges`, { headers: publicHeaders() });
      if (response.ok) {
        const data = await response.json();
        const formatted = data.map((c: any) => ({
          _id: c._id,
          name: c.name,
          location: c.location || 'Location Not Set',
          collegeCode: c.collegeCode || '0000',
          featured: c.featured === true,
        }));
        setColleges(formatted);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const filteredColleges = colleges.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSelect = async (college: College) => {
    await setSecure('selectedCollegeCode', college.collegeCode);
    router.push(`/(auth)/login?code=${college.collegeCode}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <GHeader
        avatar={<Avatar label="NL" gradient={theme.gradientBrand} />}
        title="Select College"
        subtitle="Choose your institute"
        actions={
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
            <ArrowLeft size={18} color={theme.fg} />
          </Pressable>
        }
      />
      <Screen contentContainerStyle={{ paddingTop: 18 }}>
        <SearchBar value={searchTerm} onChangeText={setSearchTerm} placeholder="Search your college…" />
        {loading ? (
          <ActivityIndicator color={theme.violet} style={{ paddingVertical: 60 }} />
        ) : filteredColleges.length === 0 ? (
          <EmptyState message="No college found" />
        ) : (
          filteredColleges.map(c => (
            <CollegeCard
              key={c._id}
              name={c.name}
              meta={c.location}
              onPress={() => handleSelect(c)}
            />
          ))
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
